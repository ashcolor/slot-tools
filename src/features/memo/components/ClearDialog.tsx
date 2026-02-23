import type { RefObject } from "react";

interface MemoClearDialogProps {
  clearModalRef: RefObject<HTMLDialogElement | null>;
  onClearDraft: () => void;
}

export function ClearDialog({ clearModalRef, onClearDraft }: MemoClearDialogProps) {
  return (
    <dialog ref={clearModalRef} className="modal">
      <div className="modal-box">
        <h3 className="mb-2 text-lg font-bold">クリア</h3>
        <p className="text-sm opacity-70">現在のメモを消去しますか？</p>
        <div className="modal-action">
          <form method="dialog" className="flex gap-2">
            <button className="btn btn-sm">キャンセル</button>
            <button className="btn btn-sm btn-error" onClick={onClearDraft}>
              クリア
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
