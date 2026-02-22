import { Icon } from "@iconify/react";
import type { MouseEvent as ReactMouseEvent } from "react";
import type { InlineControlSize, MemoPart } from "../hooks/useMemoEditor";

type FormulaPart = Extract<MemoPart, { type: "formula" }>;

interface MemoInlineFormulaProps {
  part: FormulaPart;
  result: string;
  inlineControlSize: InlineControlSize;
  onOpenFormulaPopup: (
    event: ReactMouseEvent<HTMLButtonElement>,
    targetIndex: number,
    expression: string,
  ) => void;
}

export function InlineFormula({
  part,
  result,
  inlineControlSize,
  onOpenFormulaPopup,
}: MemoInlineFormulaProps) {
  return (
    <button
      type="button"
      className={`btn border-neutral z-1 ${inlineControlSize.formulaClass} ${inlineControlSize.valueWidthClass} mx-1 gap-1 px-2 align-middle`}
      title={part.expression}
      onPointerDown={(event) => event.preventDefault()}
      onClick={(event) => {
        event.stopPropagation();
        onOpenFormulaPopup(event, part.index, part.expression);
      }}
    >
      <Icon icon="mdi:calculator" className="size-4" />
      <span>{result}</span>
    </button>
  );
}
