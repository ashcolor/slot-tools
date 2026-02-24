import type { RefObject } from "react";

interface NoriuchiResetDialogProps {
  dialogRef: RefObject<HTMLDialogElement | null>;
  onConfirmReset: () => void;
}

export function NoriuchiResetDialog({ dialogRef, onConfirmReset }: NoriuchiResetDialogProps) {
  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box">
        <h3 className="mb-2 text-lg font-bold">リセット</h3>
        <p className="text-sm opacity-70">全メンバーの入力内容をリセットしますか？</p>
        <div className="modal-action">
          <form method="dialog" className="flex gap-2">
            <button className="btn btn-sm">キャンセル</button>
            <button className="btn btn-sm btn-error" onClick={onConfirmReset}>
              リセット
            </button>
          </form>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
