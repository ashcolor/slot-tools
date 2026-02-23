import type { RefObject } from "react";

interface MemoApplyTemplateDialogProps {
  applyTemplateModalRef: RefObject<HTMLDialogElement | null>;
  onConfirmApplyTemplate: () => void;
  onCancelApplyTemplate: () => void;
}

export function ApplyTemplateDialog({
  applyTemplateModalRef,
  onConfirmApplyTemplate,
  onCancelApplyTemplate,
}: MemoApplyTemplateDialogProps) {
  return (
    <dialog
      ref={applyTemplateModalRef}
      className="modal"
      onCancel={(event) => {
        event.preventDefault();
        onCancelApplyTemplate();
      }}
    >
      <div className="modal-box">
        <h3 className="mb-2 text-lg font-bold">テンプレート呼び出し</h3>
        <p className="text-sm opacity-70">
          現在のメモは上書きされ、未保存の内容は失われます。呼び出しますか？
        </p>
        <div className="modal-action">
          <form method="dialog" className="flex gap-2">
            <button className="btn btn-sm" onClick={onCancelApplyTemplate}>
              キャンセル
            </button>
            <button className="btn btn-sm btn-primary" onClick={onConfirmApplyTemplate}>
              上書き
            </button>
          </form>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onCancelApplyTemplate}>close</button>
      </form>
    </dialog>
  );
}
