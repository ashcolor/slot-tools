import type { RefObject } from "react";
import { FONT_SIZE_OPTIONS } from "./useSlotMemo";

interface SlotMemoConfigDialogProps {
  configModalRef: RefObject<HTMLDialogElement | null>;
  memoFontSizeLevel: number;
  onChangeFontSizeLevel: (level: number) => void;
}

export function SlotMemoConfigDialog({
  configModalRef,
  memoFontSizeLevel,
  onChangeFontSizeLevel,
}: SlotMemoConfigDialogProps) {
  return (
    <dialog ref={configModalRef} className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-3">設定</h3>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span>文字サイズ</span>
            <div className="join">
              {FONT_SIZE_OPTIONS.map((option) => (
                <input
                  key={option.level}
                  type="radio"
                  name="font-size-options"
                  className="join-item btn btn-xs"
                  aria-label={option.label}
                  checked={memoFontSizeLevel === option.level}
                  onChange={() => onChangeFontSizeLevel(option.level)}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="modal-action">
          <form method="dialog">
            <button className="btn btn-sm">閉じる</button>
          </form>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
