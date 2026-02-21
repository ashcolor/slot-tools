import type { InlineControlSize, MemoPart } from "./useSlotMemo";

type FormulaPart = Extract<MemoPart, { type: "formula" }>;

interface SlotMemoInlineFormulaProps {
  part: FormulaPart;
  result: string;
  inlineControlSize: InlineControlSize;
  onFocusEditor: () => void;
}

export function SlotMemoInlineFormula({
  part,
  result,
  inlineControlSize,
  onFocusEditor,
}: SlotMemoInlineFormulaProps) {
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
