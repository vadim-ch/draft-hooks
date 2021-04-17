import {
  ContentBlock,
  ContentState,
  EditorState,
  EntityInstance,
  Modifier,
  RichUtils,
} from 'draft-js';

export const toggleInlineStyle = <T extends string>(
  style: T,
  editorState: EditorState,
): EditorState => {
  return RichUtils.toggleInlineStyle(editorState, style);
};

export const toggleInlineStyles = <T extends string>(
  styles: T[],
  editorState: EditorState,
): EditorState => {
  return styles.reduce((editorState, style) => {
    return RichUtils.toggleInlineStyle(editorState, style);
  }, editorState);
};

export const removeInlineStyles = <T extends string>(
  styles: T[],
  editorState: EditorState,
): EditorState => {
  const selection = editorState.getSelection();
  const nextContentState = styles.reduce<ContentState>(
    (contentState, style) => {
      return Modifier.removeInlineStyle(contentState, selection, style);
    },
    editorState.getCurrentContent(),
  );
  return EditorState.push(editorState, nextContentState, 'change-inline-style');
};

export const findEntities = <T extends string>(entityType: T) => (
  contentBlock: ContentBlock,
  callback: (start: number, end: number) => void,
  contentState: ContentState,
) => {
  contentBlock.findEntityRanges((character) => {
    const entityKey = character.getEntity();
    return (
      entityKey !== null &&
      contentState.getEntity(entityKey).getType() === entityType
    );
  }, callback);
};

export const isSelectionContainOnlyEntity = (
  editorState: EditorState,
): boolean => {
  const startKey = editorState.getSelection().getStartKey();
  const startOffset = editorState.getSelection().getStartOffset();
  const endOffset = editorState.getSelection().getEndOffset();
  const contentState = editorState.getCurrentContent();
  const blockWithEntityAtBeginning = contentState.getBlockForKey(startKey);
  let isExist = true;
  for (let i = startOffset; i < endOffset; i += 1) {
    if (!blockWithEntityAtBeginning.getEntityAt(i)) {
      isExist = false;
      break;
    }
  }
  return isExist;
};

export const getSelectedEntityKey = (editorState: EditorState): string => {
  const contentState = editorState.getCurrentContent();
  const startKey = editorState.getSelection().getStartKey();
  const startOffset = editorState.getSelection().getStartOffset();
  const blockWithEntityAtBeginning = contentState.getBlockForKey(startKey);
  return blockWithEntityAtBeginning.getEntityAt(startOffset);
};

export const getExistEntityByType = (
  editorState: EditorState,
  selectedEntityKey: string,
  entityType: string,
): EntityInstance | undefined => {
  const selection = editorState.getSelection();
  const contentState = editorState.getCurrentContent();

  // isSelectionContainOnlyEntity(editorState)

  return selectedEntityKey &&
    contentState.getEntity(selectedEntityKey).getType() === entityType &&
    !selection.isCollapsed()
    ? contentState.getEntity(selectedEntityKey)
    : undefined;
};
