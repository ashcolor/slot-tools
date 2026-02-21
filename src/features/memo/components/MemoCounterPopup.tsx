import { Icon } from "@iconify/react";
import { COUNTER_DIGIT_STEPS, toCounterDigits } from "../hooks/useMemoEditor";

interface MemoCounterPopupProps {
  value: number;
  anchorX: number;
  anchorY: number;
  onClose: () => void;
  onStepDigit: (digitStep: number, delta: 1 | -1) => void;
  onResetToZero: () => void;
}

export function MemoCounterPopup({
  value,
  anchorX,
  anchorY,
  onClose,
  onStepDigit,
  onResetToZero,
}: MemoCounterPopupProps) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="fixed z-50 -translate-x-1/2" style={{ left: `${anchorX}px`, top: `${anchorY}px` }}>
        <div className="card bg-base-100 border border-base-300 shadow-lg" onClick={(event) => event.stopPropagation()}>
          <div className="card-body p-3 min-w-52 gap-2">
            <div className="text-xs font-semibold opacity-70">4桁カウンター</div>
            <div className="grid grid-cols-4 gap-1">
              {COUNTER_DIGIT_STEPS.map((digitStep, index) => {
                const digit = toCounterDigits(value)[index];
                return (
                  <div key={digitStep} className="join join-vertical">
                    <button
                      type="button"
                      className="join-item btn btn-xs btn-ghost btn-square text-plus"
                      aria-label={`${digitStep}増やす`}
                      onClick={() => onStepDigit(digitStep, 1)}
                    >
                      <Icon icon="mdi:plus-circle-outline" className="size-4" />
                    </button>
                    <div className="join-item w-10 h-10 border border-base-300 flex items-center justify-center font-mono text-lg">
                      {digit}
                    </div>
                    <button
                      type="button"
                      className="join-item btn btn-xs btn-ghost btn-square text-minus"
                      aria-label={`${digitStep}減らす`}
                      onClick={() => onStepDigit(digitStep, -1)}
                    >
                      <Icon icon="mdi:minus-circle-outline" className="size-4" />
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between gap-1">
              <button type="button" className="btn btn-xs btn-ghost" onClick={onResetToZero}>
                0000
              </button>
              <div className="font-mono text-sm opacity-70">{toCounterDigits(value).join("")}</div>
              <button type="button" className="btn btn-xs btn-ghost" onClick={onClose}>
                閉じる
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

