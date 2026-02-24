import type { RefObject } from "react";
import { formatTemplateDate, getTemplateTitle, type MemoHistoryItem } from "../hooks/useMemoEditor";

interface MemoHistoryDialogProps {
  dialogRef: RefObject<HTMLDialogElement | null>;
  memoHistoryList: MemoHistoryItem[];
  isMemoLocked: boolean;
  onRestoreMemoHistory: (historyId: string) => void;
}

export function HistoryDialog({
  dialogRef,
  memoHistoryList,
  isMemoLocked,
  onRestoreMemoHistory,
}: MemoHistoryDialogProps) {
  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box">
        <h3 className="mb-3 text-lg font-bold">履歴</h3>
        {memoHistoryList.length === 0 ? (
          <p className="text-sm opacity-70">履歴はありません。</p>
        ) : (
          <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto">
            {memoHistoryList.map((history) => (
              <div key={history.id} className="p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{getTemplateTitle(history.memo)}</p>
                    <p className="text-xs opacity-70">{formatTemplateDate(history.createdAt)}</p>
                  </div>
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
                <p className="mt-1 truncate text-xs opacity-70">
                  {history.memo.replace(/\r?\n/g, " ").trim()}
                </p>
              </div>
            ))}
          </div>
        )}
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
