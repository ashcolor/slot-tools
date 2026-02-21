import { Icon } from "@iconify/react";
import type { MouseEvent as ReactMouseEvent } from "react";
import type { InlineControlSize, MemoPart } from "./useSlotMemo";

type CounterPart = Extract<MemoPart, { type: "counter" }>;

interface SlotMemoInlineCounterProps {
  part: CounterPart;
  inlineControlSize: InlineControlSize;
  onStepInlineCounter: (targetIndex: number, delta: number) => void;
  onOpenCounterPopup: (
    event: ReactMouseEvent<HTMLButtonElement>,
    targetIndex: number,
    current: number,
  ) => void;
}

export function SlotMemoInlineCounter({
  part,
  inlineControlSize,
  onStepInlineCounter,
  onOpenCounterPopup,
}: SlotMemoInlineCounterProps) {
  return (
    <span className="join join-horizontal align-middle mx-1">
      <button
        type="button"
        className={`join-item btn ${inlineControlSize.buttonClass} btn-outline px-2 text-minus`}
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
          onOpenCounterPopup(event, part.index, part.value);
        }}
      >
        {part.value}
      </button>
      <button
        type="button"
        className={`join-item btn ${inlineControlSize.buttonClass} btn-outline px-2 text-plus`}
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
