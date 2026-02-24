import { Icon } from "@iconify/react";
import type { RefObject } from "react";

interface MemoLlmGuideDialogProps {
  dialogRef: RefObject<HTMLDialogElement | null>;
  guideText: string;
  isCopied: boolean;
  onCopyGuide: () => void;
}

export function LlmGuideDialog({
  dialogRef,
  guideText,
  isCopied,
  onCopyGuide,
}: MemoLlmGuideDialogProps) {
  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box">
        <h3 className="mb-2 text-lg font-bold">LLM向けコピー内容</h3>
        <div className="mb-2 flex flex-col gap-1 text-xs opacity-80">
          <span>このテキストをLLMに渡すと、メモ記法に沿ったメモを作成できます。</span>
          <span>
            テキスト下部に設定推測要素やURLを記載すると、その内容を反映したメモを生成できます。
          </span>
        </div>
        <textarea
          className="textarea textarea-bordered font-mono text-xs"
          style={{ width: "100%", minHeight: "13rem" }}
          value={guideText}
          readOnly
        />
        <div className="mt-2 text-xs opacity-80">LLMリンク</div>
        <div className="mt-1 flex flex-wrap gap-2 text-xs">
          <a
            href="https://chatgpt.com/"
            target="_blank"
            rel="noreferrer"
            className="link link-primary"
          >
            ChatGPT
          </a>
          <a
            href="https://gemini.google.com/"
            target="_blank"
            rel="noreferrer"
            className="link link-primary"
          >
            Gemini
          </a>
          <a
            href="https://claude.ai/"
            target="_blank"
            rel="noreferrer"
            className="link link-primary"
          >
            Claude
          </a>
        </div>
        <div className="modal-action">
          <button type="button" className="btn btn-sm btn-primary" onClick={onCopyGuide}>
            <Icon icon={isCopied ? "fa6-solid:check" : "fa6-regular:clipboard"} />
            コピー
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
  );
}
