import type { RefObject } from "react";

interface MemoNotationDialogProps {
  dialogRef: RefObject<HTMLDialogElement | null>;
}

export function NotationDialog({ dialogRef }: MemoNotationDialogProps) {
  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box">
        <h3 className="mb-2 text-lg font-bold">メモ記法</h3>
        <div className="flex flex-col gap-3 text-sm opacity-80">
          <div>
            <div className="mb-1 font-bold">カウンター</div>
            <div>
              <code>[[c:name=0]]</code>
            </div>
            <div className="text-xs opacity-70">
              複数単語の名前は <code>_</code> でつなぎます。
            </div>
          </div>
          <div>
            <div className="mb-1 font-bold">数式</div>
            <div>
              <code>[[f:big / game]]</code>
            </div>
            <div className="mt-2 text-xs opacity-70">表示形式付き</div>
            <div className="mt-0.5">
              <code>[[f:big / game;fmt=percent]]</code>
            </div>
            <div className="text-xs opacity-70">
              <code>fmt</code> は <code>auto</code> / <code>percent</code> / <code>odds</code>
              を指定できます。
            </div>
            <div className="mt-2 text-xs opacity-70">使用可能な主な関数</div>
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
