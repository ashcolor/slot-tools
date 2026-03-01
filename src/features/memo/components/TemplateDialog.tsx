import { Icon } from "@iconify/react";
import type { RefObject } from "react";
import { getTemplatePreview, getTemplateTitle, type MemoTemplate } from "../hooks/useMemoEditor";

interface MemoTemplateDialogProps {
  templateModalRef: RefObject<HTMLDialogElement | null>;
  templateList: MemoTemplate[];
  isLlmGuideCopied: boolean;
  onSaveCurrentAsTemplate: () => void;
  onOpenLlmGuide: () => void;
  onApplyTemplate: (template: MemoTemplate) => void;
  onRequestDeleteTemplate: (templateId: string) => void;
}

export function TemplateDialog({
  templateModalRef,
  templateList,
  isLlmGuideCopied,
  onSaveCurrentAsTemplate,
  onOpenLlmGuide,
  onApplyTemplate,
  onRequestDeleteTemplate,
}: MemoTemplateDialogProps) {
  return (
    <dialog ref={templateModalRef} className="modal">
      <div className="modal-box relative max-w-xl">
        <h3 className="mb-3 pr-12 text-lg font-bold">テンプレート</h3>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              className="btn btn-sm self-start"
              onClick={onSaveCurrentAsTemplate}
            >
              <Icon icon="mdi:content-save-outline" className="size-4 shrink-0" aria-hidden />
              現在のメモをテンプレート保存
            </button>
            <button
              type="button"
              className="btn btn-circle btn-secondary"
              onClick={onOpenLlmGuide}
              aria-label="LLM向け説明を表示"
              title="LLM向け説明を表示"
            >
              <Icon icon={isLlmGuideCopied ? "fa6-solid:check" : "mdi:brain"} className="size-4" />
            </button>
          </div>
          {templateList.length === 0 ? (
            <p className="text-sm opacity-70">保存済みテンプレートはありません。</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {templateList.map((template) => (
                <li key={template.id} className="border-base-300 rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{getTemplateTitle(template.memo)}</p>
                      <p className="truncate text-xs opacity-70">
                        {getTemplatePreview(template.memo)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-error btn-ghost btn-circle"
                        onClick={() => onRequestDeleteTemplate(template.id)}
                      >
                        <Icon icon="mdi:trash-can-outline" className="size-4" />
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-primary"
                        onClick={() => onApplyTemplate(template)}
                      >
                        読込
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
