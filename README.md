React hooks for create controls under the [draft.js](https://draftjs.org) editor

## How to use

`yarn add draft-hooks`

## Example blocks (headers, aligns, unordered list item, ordered list item)

```tsx
type HeaderOneControlProps = {
  editorState: EditorState;
  setEditorState: React.Dispatch<React.SetStateAction<EditorState>>;
};

export const HeaderOneControl: React.FC<ControlsProps> = React.memo<HeaderOneControlProps>(
  ({ editorState, setEditorState }) => {
    const [toggleBlock, selectedBlockType] = useBlock(
      editorState,
      setEditorState,
    );

    const toggleHeaderOne = useCallback(() => {
      toggleBlock('header-one');
    }, []);

    const isSelectedHeaderOne = 'header-one' === selectedBlockType;

    return (
      <button type="button" onClick={toggleHeaderOne}>
        H1
      </button>
    );
  },
);
```

## Example inlines (text color, text size, bold, italic, underline, strikethrough)

```tsx
enum TextColorInlineType {
  color1 = 'red',
  color2 = 'green',
  color3 = 'blue',
}

type TextColorControlProps = {
  editorState: EditorState;
  setEditorState: React.Dispatch<React.SetStateAction<EditorState>>;
};

const TEXT_COLOR_STYLES: StyleItem<TextColorInlineType>[] = [
  { label: 'Red', style: TextColorInlineType.color1 },
  { label: 'Green', style: TextColorInlineType.color2 },
  { label: 'Blue', style: TextColorInlineType.color3 },
];

const inlineList = Object.values<TextColorInlineType>(TextColorInlineType);

export const TextColorControl: React.FC<ControlsProps> = React.memo<TextColorControlProps>(
  ({ editorState, setEditorState }) => {
    const [toggleTextColor, currentStyle] = useInline<TextColorInlineType>(
      editorState,
      setEditorState,
      inlineList,
    );

    const active = TEXT_COLOR_STYLES.find(({ style }) => currentStyle.has(style));

    return (
      <>
        {TEXT_COLOR_STYLES.map(({ label, style }) => (
          <button type="button" onClick={() => toggleTextColor(style)}>
            {label} {active}
          </button>
        ))}
      </>
    );
  },
);
```
