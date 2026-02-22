import type { RefObject } from "react";
import { formatTemplateDate, getTemplateTitle, type MemoTemplate } from "../hooks/useMemoEditor";

interface MemoTemplateDialogProps {
  templateModalRef: RefObject<HTMLDialogElement | null>;
  templateList: MemoTemplate[];
  onOpenSaveTemplateModal: () => void;
  onApplyTemplate: (template: MemoTemplate) => void;
  onRequestDeleteTemplate: (templateId: string) => void;
}

export function TemplateDialog({
  templateModalRef,
  templateList,
  onOpenSaveTemplateModal,
  onApplyTemplate,
  onRequestDeleteTemplate,
}: MemoTemplateDialogProps) {
  return (
    <dialog ref={templateModalRef} className="modal">
      <div className="modal-box max-w-xl">
        <h3 className="mb-3 text-lg font-bold">テンプレート</h3>
        <div className="flex flex-col gap-2">
          <button type="button" className="btn btn-sm btn-primary self-start" onClick={onOpenSaveTemplateModal}>
            今の画面をテンプレートに登録
          </button>
          {templateList.length === 0 ? (
            <p className="text-sm opacity-70">保存済みテンプレートはありません。</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {templateList.map((template) => (
                <li key={template.id} className="border-base-300 rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{getTemplateTitle(template.memo)}</p>
                      <p className="text-xs opacity-70">{formatTemplateDate(template.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" className="btn btn-xs btn-primary" onClick={() => onApplyTemplate(template)}>
                        呼び出し
                      </button>
                      <button
                        type="button"
                        className="btn btn-xs btn-error btn-outline"
                        onClick={() => onRequestDeleteTemplate(template.id)}
                      >
                        削除
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
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
