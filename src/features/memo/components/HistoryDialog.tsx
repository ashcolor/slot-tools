import { Icon } from "@iconify/react";
import { useRef, useState } from "react";
import type { RefObject } from "react";
import { formatTemplateDate, getTemplateTitle, type MemoHistoryItem } from "../hooks/useMemoEditor";

interface MemoHistoryDialogProps {
  dialogRef: RefObject<HTMLDialogElement | null>;
  memoHistoryList: MemoHistoryItem[];
  isMemoLocked: boolean;
  onRestoreMemoHistory: (historyId: string) => void;
  onDeleteMemoHistory: (historyId: string) => void;
  onClearMemoHistory: () => void;
}

export function HistoryDialog({
  dialogRef,
  memoHistoryList,
  isMemoLocked,
  onRestoreMemoHistory,
  onDeleteMemoHistory,
  onClearMemoHistory,
}: MemoHistoryDialogProps) {
  const previewDialogRef = useRef<HTMLDialogElement>(null);
  const [previewTarget, setPreviewTarget] = useState<MemoHistoryItem | null>(null);

  const handleOpenPreview = (history: MemoHistoryItem) => {
    setPreviewTarget(history);
    requestAnimationFrame(() => {
      previewDialogRef.current?.showModal();
    });
  };

  const handleClosePreview = () => {
    previewDialogRef.current?.close();
    setPreviewTarget(null);
  };

  const handleDeleteMemoHistory = (historyId: string) => {
    if (previewTarget?.id === historyId) {
      handleClosePreview();
    }
    onDeleteMemoHistory(historyId);
  };

  const handleClearMemoHistory = () => {
    handleClosePreview();
    onClearMemoHistory();
  };

  return (
    <>
      <dialog ref={dialogRef} className="modal">
        <div className="modal-box">
          <h3 className="mb-3 text-lg font-bold">履歴</h3>
          <p className="mb-3 text-xs opacity-70">履歴は最新100件まで保存されます。</p>
          {memoHistoryList.length === 0 ? (
            <p className="text-sm opacity-70">履歴はありません。</p>
          ) : (
            <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto">
              {memoHistoryList.map((history) => (
                <div key={history.id} className="rounded-box bg-base-200/40 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold">{formatTemplateDate(history.createdAt)}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs btn-square text-error"
                        onClick={() => handleDeleteMemoHistory(history.id)}
                        aria-label="Delete history"
                        title="削除"
                      >
                        <Icon icon="mdi:trash-can-outline" className="size-4" />
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        onClick={() => handleOpenPreview(history)}
                      >
                        プレビュー
                      </button>
                      <button
                        type="button"
                        className={`btn btn-xs ${isMemoLocked ? "btn-disabled" : "btn-primary"}`}
                        onClick={() => {
                          if (isMemoLocked) return;
                          onRestoreMemoHistory(history.id);
                          dialogRef.current?.close();
                        }}
                      >
                        復元
                      </button>
                    </div>
                  </div>
                  <p className="mt-1 truncate text-xs opacity-70">
                    {history.memo.replace(/\r?\n/g, " ").trim()}
                  </p>
                </div>
              ))}
            </div>
          )}
          <div className="modal-action">
            <button
              type="button"
              className="btn btn-sm btn-outline btn-error mr-auto"
              onClick={handleClearMemoHistory}
              disabled={memoHistoryList.length === 0}
            >
              <Icon icon="mdi:trash-can-outline" className="size-4" />
              全削除
            </button>
            <form method="dialog">
              <button className="btn btn-sm">閉じる</button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      <dialog ref={previewDialogRef} className="modal">
        <div className="modal-box max-w-2xl">
          <h3 className="mb-1 text-lg font-bold">履歴プレビュー</h3>
          {previewTarget ? (
            <>
              <p className="mb-3 text-xs opacity-70">
                {formatTemplateDate(previewTarget.createdAt)}
              </p>
              <div className="max-h-[60vh] overflow-y-auto rounded-box bg-base-200/40 p-4">
                <p className="mb-3 text-sm font-semibold">{getTemplateTitle(previewTarget.memo)}</p>
                <div className="whitespace-pre-wrap break-words text-sm leading-7">
                  {previewTarget.memo}
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm opacity-70">表示できる履歴がありません。</p>
          )}
          <div className="modal-action">
            <button type="button" className="btn btn-sm" onClick={handleClosePreview}>
              閉じる
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop" onSubmit={handleClosePreview}>
          <button>close</button>
        </form>
      </dialog>
    </>
  );
}
