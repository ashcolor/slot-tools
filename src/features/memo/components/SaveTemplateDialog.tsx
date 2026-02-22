import type { RefObject } from "react";

interface MemoSaveTemplateDialogProps {
  saveTemplateModalRef: RefObject<HTMLDialogElement | null>;
  onSaveCurrentAsTemplate: () => void;
}

export function SaveTemplateDialog({
  saveTemplateModalRef,
  onSaveCurrentAsTemplate,
}: MemoSaveTemplateDialogProps) {
  return (
    <dialog ref={saveTemplateModalRef} className="modal">
      <div className="modal-box">
        <h3 className="mb-2 text-lg font-bold">テンプレート保存</h3>
        <p className="text-sm opacity-70">カウンタを0にして現在の画面を保存しますか？</p>
        <div className="modal-action">
          <form method="dialog" className="flex gap-2">
            <button className="btn btn-sm">キャンセル</button>
            <button className="btn btn-sm btn-primary" onClick={onSaveCurrentAsTemplate}>
              保存
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
