import { useRef } from "react";
import { Icon } from "@iconify/react";
import type { CalcResult } from "../../../types";

interface Props {
  result: CalcResult;
}

export function SettlementView({ result }: Props) {
  const modalRef = useRef<HTMLDialogElement>(null);
  const fmt = (n: number) => Math.round(n).toLocaleString();

  const memberCount = result.members.length;
  const perPerson = memberCount > 0 ? result.totalProfit / memberCount : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-base-100 border-base-300 relative rounded-lg border p-2">
        <button
          type="button"
          className="absolute top-2 right-2 opacity-50"
          onClick={() => modalRef.current?.showModal()}
          aria-label="分配方式について"
        >
          <Icon icon="bi:info-circle" className="size-4" />
        </button>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-center gap-8 text-center">
            <div>
              <div className="text-xs opacity-60">全体投資</div>
              <div className="text-invest text-lg font-bold">{fmt(result.displayInvest)} 円</div>
              <div className="text-xs opacity-50">
                再プレイ{" "}
                <span className="font-bold">{result.totalInvestMedals.toLocaleString()}</span>枚
                込み
              </div>
            </div>
            <div>
              <div className="text-xs opacity-60">全体回収</div>
              <div className="text-collect text-lg font-bold">{fmt(result.displayCollect)} 円</div>
              <div className="text-xs opacity-50">
                出玉 <span className="font-bold">{result.totalCollectMedals.toLocaleString()}</span>
                枚
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs opacity-60">収支 / 人</div>
            <div className={`text-xl font-bold ${perPerson >= 0 ? "text-plus" : "text-minus"}`}>
              {perPerson >= 0 ? "+" : ""}
              {fmt(Math.round(perPerson))} 円
            </div>
            <div className="mt-1 text-xs opacity-60">
              全体合計 {result.totalProfit >= 0 ? "+" : ""}
              {fmt(result.totalProfit)} 円
            </div>
          </div>
        </div>
      </div>

      <dialog ref={modalRef} className="modal">
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
    </div>
  );
}
