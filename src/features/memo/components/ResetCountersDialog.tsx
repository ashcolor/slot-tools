import type { RefObject } from "react";

interface ResetCountersDialogProps {
  dialogRef: RefObject<HTMLDialogElement | null>;
  onConfirm: () => void;
}

export function ResetCountersDialog({ dialogRef, onConfirm }: ResetCountersDialogProps) {
  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box">
        <h3 className="mb-2 text-lg font-bold">カウンター初期化</h3>
        <p className="text-sm opacity-70">
          メモ内のすべてのカウンター値を 0 に戻します。実行しますか？
        </p>
        <div className="modal-action">
          <form method="dialog" className="flex gap-2">
            <button className="btn btn-sm">キャンセル</button>
            <button className="btn btn-sm btn-error" onClick={onConfirm}>
              初期化する
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
