import {
  DraftBlockType,
  DraftEntityMutability,
  DraftEntityType,
  DraftInlineStyle,
  DraftInlineStyleType,
  EditorState,
  EntityInstance,
  Modifier,
  RichUtils,
} from 'draft-js';
import { useCallback, useMemo } from 'react';
import {
  getExistEntityByType,
  getSelectedEntityKey,
  removeInlineStyles,
  toggleInlineStyle,
} from '../utils';

/**
 * Hook for toggle inline style - https://draftjs.org/docs/quickstart-rich-styling/#styling-controls-in-ui
 * To add styles to the editor itself - https://draftjs.org/docs/advanced-topics-inline-styles/#mapping-a-style-string-to-css
 * The InlineList parameter is a list of inline styles to remove these styles when the handler is called
 * Returns a memoized handler for a style switch and current(selected) inline style
 */
export const useInline = <T extends string = DraftInlineStyleType>(
  editorState: EditorState,
  setEditorState: (
    state: EditorState | ((prevState: EditorState) => EditorState),
  ) => void,
  inlineList?: T[],
): [(style: T) => void, DraftInlineStyle] => {
  const toggleStyle = useCallback(
    (toggledStyle: T) => {
      setEditorState((prevState) => {
        const removedStylesEditorState =
          inlineList && inlineList.length
            ? removeInlineStyles<T>(
                inlineList.filter(
                  (inlineStyle) => inlineStyle !== toggledStyle,
                ),
                prevState,
              )
            : prevState;
        return toggledStyle && toggledStyle.length
          ? toggleInlineStyle(toggledStyle, removedStylesEditorState)
          : prevState;
      });
    },
    [setEditorState],
  );

  const currentStyle = useMemo(() => editorState.getCurrentInlineStyle(), [
    editorState,
  ]);

  return [toggleStyle, currentStyle];
};

/**
 * Hook for toggle content block - https://draftjs.org/docs/api-reference-content-block/
 * To add styles to the editor itself - https://draftjs.org/docs/advanced-topics-block-styling/#blockstylefn
 * Returns a memoized handler for a content block switch and current(selected) content block type
 */
export const useBlock = <T extends string = DraftBlockType>(
  editorState: EditorState,
  setEditorState: (
    state: EditorState | ((prevState: EditorState) => EditorState),
  ) => void,
): [(blockStyle: T) => void, T] => {
  const selection = editorState.getSelection();

  const handleChange = useCallback(
    (blockStyle: T) => {
      setEditorState((prevState) =>
        RichUtils.toggleBlockType(prevState, blockStyle),
      );
    },
    [setEditorState],
  );

  const blockType = useMemo(
    () =>
      editorState
        .getCurrentContent()
        .getBlockForKey(selection.getStartKey())
        .getType(),
    [editorState, selection],
  );

  return [handleChange, blockType as T];
};

export const useEntity = <
  T extends Record<string, unknown> = Record<string, unknown>,
  E extends DraftEntityType = DraftEntityType
>(
  editorState: EditorState,
  setEditorState: (
    state: EditorState | ((prevState: EditorState) => EditorState),
  ) => void,
  entityType: E,
  mutability: DraftEntityMutability = 'MUTABLE',
): [
  (data: T, insertContent?: string) => void,
  () => void,
  T | undefined,
  boolean,
] => {
  const selectedEntityKey = useMemo((): string => {
    return getSelectedEntityKey(editorState);
  }, [editorState]);

  const existEntity = useMemo<EntityInstance | undefined>(() => {
    return getExistEntityByType(editorState, selectedEntityKey, entityType);
  }, [editorState, selectedEntityKey]);

  const existEntityData = useMemo<T | undefined>(() => {
    return existEntity ? existEntity.getData() : undefined;
  }, [existEntity]);

  const isSelectedEntity = useMemo<boolean>(() => {
    const selection = editorState.getSelection();
    return !selection.isCollapsed();
  }, [editorState]);

  const addEntity = useCallback(
    (data: T, insertContent?: string) => {
      setEditorState((prevState) => {
        const contentState = prevState.getCurrentContent();
        const selection = prevState.getSelection();
        const contentStateWithEntity = contentState.createEntity(
          entityType,
          mutability,
          data,
        );

        const createdEntityKey = contentStateWithEntity.getLastCreatedEntityKey();

        let newEditorState;

        if (!selection.isCollapsed()) {
          const contentStateWithAppliedEntity = Modifier.applyEntity(
            contentStateWithEntity,
            prevState.getSelection(),
            createdEntityKey,
          );
          newEditorState = EditorState.push(
            prevState,
            contentStateWithAppliedEntity,
            'apply-entity',
          );
        } else {
          newEditorState = prevState;
          if (typeof insertContent === 'string') {
            const newContentState = Modifier.insertText(
              contentState,
              selection,
              insertContent,
              undefined,
              createdEntityKey,
            );
            newEditorState = EditorState.push(
              newEditorState,
              newContentState,
              'insert-characters',
            );
          }
        }
        return newEditorState;
      });
    },
    [setEditorState],
  );

  const editEntity = useCallback(
    (data: Partial<T>) => {
      setEditorState((prevState) => {
        const contentState = prevState.getCurrentContent();
        const editSelectedEntityKey = getSelectedEntityKey(editorState);
        const editExistEntity = getExistEntityByType(
          prevState,
          editSelectedEntityKey,
          entityType,
        );

        const contentStateWithAppliedEntity = contentState.mergeEntityData(
          editSelectedEntityKey,
          {
            ...editExistEntity?.getData(),
            ...data,
          },
        );

        return EditorState.push(
          prevState,
          contentStateWithAppliedEntity,
          'apply-entity',
        );
      });
    },
    [setEditorState],
  );

  const removeEntity = useCallback(() => {
    setEditorState((prevState) => {
      const removeSelectedEntityKey = getSelectedEntityKey(editorState);
      const removeExistEntity = getExistEntityByType(
        prevState,
        removeSelectedEntityKey,
        entityType,
      );
      if (removeExistEntity) {
        const currentContentState = prevState.getCurrentContent();

        const newContentState = Modifier.applyEntity(
          currentContentState,
          prevState.getSelection(),
          null,
        );
        return EditorState.push(prevState, newContentState, 'apply-entity');
      }
      return prevState;
    });
  }, [setEditorState]);

  const changeEntity = useCallback(
    (data: T, insertEntity?: string) => {
      if (existEntity) {
        editEntity(data);
      } else {
        addEntity(data, insertEntity);
      }
    },
    [editEntity, addEntity, existEntity],
  );

  return [changeEntity, removeEntity, existEntityData, isSelectedEntity];
};
