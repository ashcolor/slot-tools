import { Icon } from "@iconify/react";
import type { RefObject } from "react";

interface MemoNotationDialogProps {
  dialogRef: RefObject<HTMLDialogElement | null>;
  isLlmGuideCopied: boolean;
  onOpenLlmGuide: () => void;
}

export function NotationDialog({
  dialogRef,
  isLlmGuideCopied,
  onOpenLlmGuide,
}: MemoNotationDialogProps) {
  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box relative">
        <button
          type="button"
          className="btn btn-ghost btn-circle absolute top-4 right-4"
          onClick={onOpenLlmGuide}
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
              <code>fmt</code> は表示形式の指定です（自動表示: <code>auto</code> / % 表示:{" "}
              <code>percent</code> / 1/〇〇表示: <code>odds</code>）
            </div>
            <div className="mt-2 text-xs opacity-70">使用可能関数</div>
            <div className="text-xs opacity-70">
              <code>
                abs, acos, acosh, asin, asinh, atan, atan2, atanh, cbrt, ceil, cos, cosh, exp,
                expm1, floor, gamma, hypot, if, lg, ln, log, log10, log1p, log2, max, min, pow, pyt,
                round, roundTo, sign, sin, sinh, sqrt, sum, tan, tanh, trunc
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
  );
}
