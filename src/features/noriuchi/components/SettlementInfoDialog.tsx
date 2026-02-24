import type { RefObject } from "react";

interface SettlementInfoDialogProps {
  dialogRef: RefObject<HTMLDialogElement | null>;
}

export function SettlementInfoDialog({ dialogRef }: SettlementInfoDialogProps) {
  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box">
        <h3 className="mb-2 text-lg font-bold">計算式について</h3>
        <div className="flex flex-col gap-3 text-sm opacity-70">
          <div>
            <div className="mb-1 font-bold">投資額</div>
            <div>現金投資 + (再プレイ × 貸出レート)</div>
          </div>
          <div>
            <div className="mb-1 font-bold">回収額</div>
            <div>出玉 × 交換レート</div>
          </div>
          <div>
            <div className="mb-1 font-bold">収支</div>
            <div className="flex flex-col gap-1">
              <div>換金枚数 = 出玉 − 貯メダル</div>
              <div>メダル差分 = 貯メダル − 再プレイ</div>
              <div>現金換算回収 = (換金枚数 × 交換レート) + (メダル増加分 × 交換レート)</div>
              <div>現金換算投資 = 現金投資 + (メダル減少分 × 貸出レート)</div>
              <div>収支 = 現金換算回収 − 現金換算投資</div>
            </div>
            <div className="mt-0.5 text-xs opacity-60">
              ※メダル差分が正なら「増加分」、負なら「減少分」として計算
            </div>
            <div className="mt-0.5 text-xs opacity-60">
              ※再プレイや貯メダルの増減を考慮しているため、上記の回収額 −
              投資額とは一致しない場合があります
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
