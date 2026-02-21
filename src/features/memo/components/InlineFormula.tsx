import type { InlineControlSize, MemoPart } from "../hooks/useMemoEditor";

type FormulaPart = Extract<MemoPart, { type: "formula" }>;

interface MemoInlineFormulaProps {
  part: FormulaPart;
  result: string;
  inlineControlSize: InlineControlSize;
  onFocusEditor: () => void;
}

export function InlineFormula({
  part,
  result,
  inlineControlSize,
  onFocusEditor,
}: MemoInlineFormulaProps) {
  return (
    <button
      type="button"
      className={`btn ${inlineControlSize.formulaClass} btn-outline align-middle mx-1`}
      title={part.expression}
      onPointerDown={(event) => event.preventDefault()}
      onClick={(event) => {
        event.stopPropagation();
        onFocusEditor();
      }}
    >
      = {result}
    </button>
  );
}
