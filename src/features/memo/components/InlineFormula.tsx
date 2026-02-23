import { Icon } from "@iconify/react";
import type { MouseEvent as ReactMouseEvent } from "react";
import type { InlineControlSize, MemoPart } from "../hooks/useMemoEditor";

type FormulaPart = Extract<MemoPart, { type: "formula" }>;

interface MemoInlineFormulaProps {
  part: FormulaPart;
  result: string;
  inlineControlSize: InlineControlSize;
  disabled?: boolean;
  onDisabledClick?: () => void;
  onOpenFormulaPopup: (
    event: ReactMouseEvent<HTMLButtonElement>,
    targetIndex: number,
    expression: string,
    displayMode: FormulaPart["displayMode"],
  ) => void;
}

export function InlineFormula({
  part,
  result,
  inlineControlSize,
  disabled = false,
  onDisabledClick,
  onOpenFormulaPopup,
}: MemoInlineFormulaProps) {
  return (
    <button
      type="button"
      className={`btn border-neutral z-1 ${inlineControlSize.formulaClass} ${inlineControlSize.valueWidthClass} mx-1 gap-1 px-2 align-middle ${disabled ? "cursor-not-allowed" : ""}`}
      title={part.expression}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : undefined}
      onPointerDown={(event) => event.preventDefault()}
      onClick={(event) => {
        event.stopPropagation();
        if (disabled) {
          onDisabledClick?.();
          return;
        }
        onOpenFormulaPopup(event, part.index, part.expression, part.displayMode);
      }}
    >
      <Icon icon="mdi:calculator" className="size-4" />
      <span>{result}</span>
    </button>
  );
}
