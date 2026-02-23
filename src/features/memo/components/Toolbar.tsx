import { Icon } from "@iconify/react";
import { useEffect, useRef, useState } from "react";
import { ShareDialog } from "./ShareDialog";

interface MemoToolbarProps {
  isMemoLocked: boolean;
  lockFeedbackNonce: number;
  onCopyRawMemo: () => Promise<void>;
  onCopyResolvedMemo: () => Promise<void>;
  onCopyTemplateMemo: () => Promise<void>;
  onCopyResolvedMemoImage: () => Promise<void>;
  onDownloadResolvedMemoImage: () => Promise<void>;
  onToggleMemoLock: () => void;
  onOpenTemplate: () => void;
  onOpenConfig: () => void;
  onOpenClear: () => void;
}

const LLM_MEMO_GUIDE_TEXT = `パチスロ用メモアプリのためのメモを出力して。

## メモ記法
- カウンター: [[c:name=0]]
  - name は英字または _ で開始し、以降は英数字と _ を使用
- 数式: [[f:big / game]]
- 数式の表示形式: [[f:big / game;fmt=percent]]
  - auto: 自動表示
  - percent: %表示
  - odds: 1/〇〇表示

## メモ例
\`\`\`
【機種名】
■ゲーム数
ゲーム数：[[c:game=0]]
BIG：[[c:big=0]] [[f:big / game;fmt=odds]]
REG：[[c:reg=0]] [[f:reg / game;fmt=odds]]

■小役カウント
ベル：[[c:bell=0]] [[f:bell / game;fmt=odds]]
チェリー：[[c:cherry=0]] [[f:cherry / game;fmt=odds]]
\`\`\`

## 作成するメモの内容
URLが記載されている場合はURL先の設定推測ポイントを反映したメモを作成して。
[設定差のある要素を直接記載するか、URLを記載]
`

export function Toolbar({
  isMemoLocked,
  lockFeedbackNonce,
  onCopyRawMemo,
  onCopyResolvedMemo,
  onCopyTemplateMemo,
  onCopyResolvedMemoImage,
  onDownloadResolvedMemoImage,
  onToggleMemoLock,
  onOpenTemplate,
  onOpenConfig,
  onOpenClear,
}: MemoToolbarProps) {
  const shareDialogRef = useRef<HTMLDialogElement>(null);
  const notationDialogRef = useRef<HTMLDialogElement>(null);
  const llmGuideDialogRef = useRef<HTMLDialogElement>(null);
  const llmCopiedTimerRef = useRef<number | null>(null);
  const [isLlmGuideCopied, setIsLlmGuideCopied] = useState(false);

  useEffect(() => {
    return () => {
      if (llmCopiedTimerRef.current !== null) {
        window.clearTimeout(llmCopiedTimerRef.current);
      }
    };
  }, []);

  const copyLlmGuide = async () => {
    try {
      if (typeof navigator === "undefined" || typeof navigator.clipboard?.writeText !== "function") {
        throw new Error("このブラウザではクリップボードへのコピーに対応していません。");
      }
      await navigator.clipboard.writeText(LLM_MEMO_GUIDE_TEXT);
      setIsLlmGuideCopied(true);
      if (llmCopiedTimerRef.current !== null) {
        window.clearTimeout(llmCopiedTimerRef.current);
      }
      llmCopiedTimerRef.current = window.setTimeout(() => {
        setIsLlmGuideCopied(false);
        llmCopiedTimerRef.current = null;
      }, 1400);
    } catch (error) {
      const message =
        error instanceof Error && error.message.length > 0
          ? error.message
          : "LLM向け説明のコピーに失敗しました。";
      window.alert(message);
    }
  };

  const handleLlmGuideClick = () => {
    notationDialogRef.current?.close();
    requestAnimationFrame(() => {
      llmGuideDialogRef.current?.showModal();
    });
  };

  return (
    <div className="flex items-center justify-end">
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-square"
          onClick={() => notationDialogRef.current?.showModal()}
          aria-label="Memo notation help"
          title="メモ記法"
        >
          <Icon icon="bi:info-circle" className="size-4" />
        </button>
        <button
          key={`memo-lock-feedback-${lockFeedbackNonce}`}
          type="button"
          className={`btn btn-ghost btn-sm btn-square transition ${isMemoLocked ? "text-primary" : ""} ${lockFeedbackNonce > 0 ? "memo-lock-shake" : ""}`}
          onClick={onToggleMemoLock}
          aria-label={isMemoLocked ? "Unlock memo editing" : "Lock memo editing"}
          title={isMemoLocked ? "Unlock memo editing" : "Lock memo editing"}
        >
          <Icon
            icon={isMemoLocked ? "mdi:lock" : "mdi:lock-open-variant-outline"}
            className="size-4"
          />
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-square"
          onClick={() => shareDialogRef.current?.showModal()}
          aria-label="Share"
        >
          <Icon icon="lucide:share" className="size-4" />
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-square"
          onClick={onOpenTemplate}
          aria-label="Template"
        >
          <Icon icon="mdi:text-box-multiple-outline" className="size-4" />
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-square"
          onClick={onOpenConfig}
          aria-label="Config"
        >
          <Icon icon="fa6-solid:gear" className="size-4" />
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-square"
          onClick={onOpenClear}
          aria-label="Clear"
        >
          <Icon icon="fa6-regular:trash-can" className="size-4" />
        </button>
      </div>

      <ShareDialog
        dialogRef={shareDialogRef}
        onCopyRawMemo={onCopyRawMemo}
        onCopyResolvedMemo={onCopyResolvedMemo}
        onCopyTemplateMemo={onCopyTemplateMemo}
        onCopyResolvedMemoImage={onCopyResolvedMemoImage}
        onDownloadResolvedMemoImage={onDownloadResolvedMemoImage}
      />

      <dialog ref={notationDialogRef} className="modal">
        <div className="modal-box relative">
          <button
            type="button"
            className="btn btn-ghost btn-circle absolute top-4 right-4"
            onClick={handleLlmGuideClick}
            aria-label="LLM向け説明をコピー"
            title="LLM向け説明をコピー"
          >
            <Icon icon={isLlmGuideCopied ? "fa6-solid:check" : "mdi:brain"} className="size-4" />
          </button>
          <h3 className="mb-2 text-lg font-bold">メモ記法</h3>
          <div className="flex flex-col gap-3 text-sm opacity-80">
            <div>
              <div className="mb-1 font-bold">カウンター</div>
              <div>
                <code>[[c:name=0]]</code>
              </div>
              <div className="text-xs opacity-70">
                変数名は英字または<code>_</code>開始、以降は英数字と<code>_</code>
                を使用できます
              </div>
            </div>
            <div>
              <div className="mb-1 font-bold">数式</div>
              <div>
                <code>[[f:big / game]]</code>
              </div>
              <div className="mt-2 text-xs opacity-70">表示形式オプション</div>
              <div className="mt-0.5">
                <code>[[f:big / game;fmt=percent]]</code>
              </div>
              <div className="text-xs opacity-70">
                <code>fmt</code> は表示形式の指定です（自動表示: <code>auto</code> / %
                表示: <code>percent</code> / 1/〇〇表示: <code>odds</code>）
              </div>
              <div className="mt-2 text-xs opacity-70">使用可能関数</div>
              <div className="text-xs opacity-70">
                <code>
                  abs, acos, acosh, asin, asinh, atan, atan2, atanh, cbrt, ceil, cos, cosh, exp,
                  expm1, floor, gamma, hypot, if, lg, ln, log, log10, log1p, log2, max, min, pow,
                  pyt, round, roundTo, sign, sin, sinh, sqrt, sum, tan, tanh, trunc
                </code>
              </div>
            </div>
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

      <dialog ref={llmGuideDialogRef} className="modal">
        <div className="modal-box">
          <h3 className="mb-2 text-lg font-bold">LLM向けコピー内容</h3>
          <div className="mb-2 text-xs opacity-80 flex flex-col gap-1">
            <span>このテキストをLLMに渡すと、メモ記法に沿ったメモを作成できます。</span>
            <span>テキスト下部に設定推測要素やURLを記載すると、その内容を反映したメモを生成できます。</span>
          </div>
          <textarea
            className="textarea textarea-bordered font-mono text-xs"
            style={{ width: "100%", minHeight: "13rem" }}
            value={LLM_MEMO_GUIDE_TEXT}
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
            <button type="button" className="btn btn-sm btn-primary" onClick={() => void copyLlmGuide()}>
              <Icon icon={isLlmGuideCopied ? "fa6-solid:check" : "fa6-regular:clipboard"} />
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
    </div>
  );
}
