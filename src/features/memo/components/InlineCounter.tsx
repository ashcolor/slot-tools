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
        className={`join-item btn ${inlineControlSize.buttonClass} btn-outline text-minus px-2 opacity-40`}
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
        className={`join-item btn btn-outline z-1 border-neutral-500 ${inlineControlSize.buttonClass} ${inlineControlSize.valueWidthClass} gap-1 px-2`}
        onPointerDown={(event) => event.preventDefault()}
        onClick={(event) => {
          event.stopPropagation();
          onOpenCounterPopup(event, part.index, part.value, part.name);
        }}
      >
        <span className="text-[1.2em] leading-none">{part.value}</span>
      </button>
      <button
        type="button"
        className={`join-item btn ${inlineControlSize.buttonClass} btn-outline text-plus px-2 opacity-40`}
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
