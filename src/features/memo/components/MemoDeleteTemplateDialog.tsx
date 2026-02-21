import type { RefObject } from "react";
import { getTemplateTitle, type MemoTemplate } from "../hooks/useMemoEditor";

interface MemoDeleteTemplateDialogProps {
  deleteTemplateModalRef: RefObject<HTMLDialogElement | null>;
  pendingDeleteTemplate: MemoTemplate | null;
  onDeleteTemplate: () => void;
  onClearPendingDeleteTemplate: () => void;
}

export function MemoDeleteTemplateDialog({
  deleteTemplateModalRef,
  pendingDeleteTemplate,
  onDeleteTemplate,
  onClearPendingDeleteTemplate,
}: MemoDeleteTemplateDialogProps) {
  return (
    <dialog ref={deleteTemplateModalRef} className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-2">テンプレート削除</h3>
        <p className="text-sm opacity-70">
          {pendingDeleteTemplate
            ? `「${getTemplateTitle(pendingDeleteTemplate.memo)}」を削除しますか？`
            : "このテンプレートを削除しますか？"}
        </p>
        <div className="modal-action">
          <form method="dialog" className="flex gap-2">
            <button className="btn btn-sm" onClick={onClearPendingDeleteTemplate}>
              キャンセル
            </button>
            <button className="btn btn-sm btn-error" onClick={onDeleteTemplate}>
              削除
            </button>
          </form>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClearPendingDeleteTemplate}>close</button>
      </form>
    </dialog>
  );
}
