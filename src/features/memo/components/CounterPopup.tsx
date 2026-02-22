import { Icon } from "@iconify/react";
import { flip, offset, shift, useFloating, type VirtualElement } from "@floating-ui/react";
import { useLayoutEffect, useMemo } from "react";
import { COUNTER_DIGIT_STEPS } from "../../../constants";
import { toCounterDigits } from "../hooks/useMemoEditor";

interface MemoCounterPopupProps {
  value: number;
  anchorX: number;
  anchorY: number;
  onClose: () => void;
  onStepDigit: (digitStep: number, delta: 1 | -1) => void;
}

export function CounterPopup({
  value,
  anchorX,
  anchorY,
  onClose,
  onStepDigit,
}: MemoCounterPopupProps) {
  const { refs, floatingStyles } = useFloating({
    open: true,
    strategy: "fixed",
    placement: "bottom",
    middleware: [offset(8), flip({ padding: 8 }), shift({ padding: 8 })],
  });
  const { setReference, setFloating } = refs;
  const virtualReference = useMemo<VirtualElement>(
    () => ({
      getBoundingClientRect: () => new DOMRect(anchorX, anchorY, 0, 0),
    }),
    [anchorX, anchorY],
  );

  useLayoutEffect(() => {
    setReference(virtualReference);
  }, [setReference, virtualReference]);

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        ref={(node) => {
          setFloating(node);
        }}
        className="z-50"
        style={floatingStyles}
      >
        <div
          className="card bg-base-100 border-base-300 border shadow-lg"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="card-body min-w-64 gap-3 p-4">
            <div className="grid grid-cols-5 gap-2">
              {COUNTER_DIGIT_STEPS.map((digitStep, index) => {
                const digit = toCounterDigits(value)[index];
                return (
                  <div key={digitStep} className="join join-vertical">
                    <button
                      type="button"
                      className="join-item btn btn-square border-neutral bg-base-100 text-plus hover:bg-base-200"
                      aria-label={`Increase ${digitStep}`}
                      onClick={() => onStepDigit(digitStep, 1)}
                    >
                      <Icon icon="mdi:plus-circle-outline" className="size-5" />
                    </button>
                    <div className="join-item border-neutral bg-base-100 flex items-center justify-center border font-mono text-lg">
                      {digit}
                    </div>
                    <button
                      type="button"
                      className="join-item btn btn-square border-neutral bg-base-100 text-minus hover:bg-base-200"
                      aria-label={`Decrease ${digitStep}`}
                      onClick={() => onStepDigit(digitStep, -1)}
                    >
                      <Icon icon="mdi:minus-circle-outline" className="size-5" />
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-2 items-center">
              <button
                type="button"
                className="btn btn-xs btn-circle btn-error btn-soft justify-self-start"
                aria-label="Cancel"
                onClick={onClose}
              >
                <Icon icon="mdi:close" className="size-4" />
              </button>
              <button
                type="button"
                className="btn btn-xs btn-circle btn-primary justify-self-end"
                aria-label="Confirm"
                onClick={onClose}
              >
                <Icon icon="mdi:check" className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
