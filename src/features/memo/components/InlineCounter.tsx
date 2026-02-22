import { Icon } from "@iconify/react";
import type { MouseEvent as ReactMouseEvent } from "react";
import type { InlineControlSize, MemoPart } from "../hooks/useMemoEditor";

type CounterPart = Extract<MemoPart, { type: "counter" }>;

interface MemoInlineCounterProps {
  part: CounterPart;
  inlineControlSize: InlineControlSize;
  onStepInlineCounter: (targetIndex: number, delta: number) => void;
  onOpenCounterPopup: (
    event: ReactMouseEvent<HTMLButtonElement>,
    targetIndex: number,
    current: number,
    name: string | null,
  ) => void;
}

export function InlineCounter({
  part,
  inlineControlSize,
  onStepInlineCounter,
  onOpenCounterPopup,
}: MemoInlineCounterProps) {
  return (
    <span className="join join-horizontal mx-1 align-middle">
      <button
        type="button"
        className={`join-item btn ${inlineControlSize.buttonClass} btn-outline text-minus px-2`}
        aria-label="減らす"
        onPointerDown={(event) => event.preventDefault()}
        onClick={(event) => {
          event.stopPropagation();
          onStepInlineCounter(part.index, -1);
        }}
      >
        <Icon icon="mdi:minus-circle-outline" className={inlineControlSize.iconClass} />
      </button>
      <button
        type="button"
        className={`join-item btn border-neutral z-1 ${inlineControlSize.buttonClass} ${inlineControlSize.valueWidthClass} px-2`}
        onPointerDown={(event) => event.preventDefault()}
        onClick={(event) => {
          event.stopPropagation();
          onOpenCounterPopup(event, part.index, part.value, part.name);
        }}
      >
        {part.value}
      </button>
      <button
        type="button"
        className={`join-item btn ${inlineControlSize.buttonClass} btn-outline text-plus px-2`}
        aria-label="増やす"
        onPointerDown={(event) => event.preventDefault()}
        onClick={(event) => {
          event.stopPropagation();
          onStepInlineCounter(part.index, 1);
        }}
      >
        <Icon icon="mdi:plus-circle-outline" className={inlineControlSize.iconClass} />
      </button>
    </span>
  );
}
