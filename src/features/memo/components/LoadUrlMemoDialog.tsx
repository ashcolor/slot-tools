import type { RefObject } from "react";

interface LoadUrlMemoDialogProps {
  dialogRef: RefObject<HTMLDialogElement | null>;
  pendingUrlMemo: string | null;
  onConfirmOverwrite: () => void;
  onKeepCurrentMemo: () => void;
}

export function LoadUrlMemoDialog({
  dialogRef,
  pendingUrlMemo,
  onConfirmOverwrite,
  onKeepCurrentMemo,
}: LoadUrlMemoDialogProps) {
  return (
    <dialog
      ref={dialogRef}
      className="modal"
      onCancel={(event) => {
        event.preventDefault();
        onKeepCurrentMemo();
      }}
    >
      <div className="modal-box">
        <h3 className="mb-2 text-lg font-bold">URLからメモを読み込みますか？</h3>
        <p className="text-sm opacity-70">
          既にメモが入力されています。URLに含まれる内容で上書きするか選択してください。
        </p>
        {pendingUrlMemo !== null ? (
          <div className="bg-base-200 mt-3 max-h-56 overflow-y-auto rounded px-3 py-2 text-xs opacity-80">
            <p className="break-words whitespace-pre-wrap">{pendingUrlMemo}</p>
          </div>
        ) : null}
        <div className="modal-action">
          <form method="dialog" className="flex gap-2">
            <button className="btn btn-sm" onClick={onKeepCurrentMemo}>
              現在のメモを保持
            </button>
            <button className="btn btn-sm btn-primary" onClick={onConfirmOverwrite}>
              URLの内容で上書き
            </button>
          </form>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onKeepCurrentMemo}>close</button>
      </form>
    </dialog>
  );
}
