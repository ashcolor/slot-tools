import { Icon } from "@iconify/react";
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
      className={`btn border-neutral z-1 ${inlineControlSize.formulaClass} ${inlineControlSize.valueWidthClass} align-middle mx-1 px-2 gap-1`}
      title={part.expression}
      onPointerDown={(event) => event.preventDefault()}
      onClick={(event) => {
        event.stopPropagation();
        onFocusEditor();
      }}
    >
      <Icon icon="mdi:calculator" className="size-4" />
      <span>{result}</span>
    </button>
  );
}
