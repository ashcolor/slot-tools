import { useRef } from "react";
import { Icon } from "@iconify/react";
import type { CalcResult } from "../types";

interface Props {
  result: CalcResult;
  exchangeRate: number;
}

export function SettlementView({ result, exchangeRate }: Props) {
  const modalRef = useRef<HTMLDialogElement>(null);
  const fmt = (n: number) => Math.round(n).toLocaleString();

  const toMedalByExchange = (n: number) => Math.round(n / exchangeRate).toLocaleString();

  const memberCount = result.members.length;
  const perPerson = memberCount > 0 ? result.totalProfit / memberCount : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="relative bg-base-100 border border-base-300 rounded-lg p-2">
        <button type="button" className="absolute top-1 right-1 opacity-50" onClick={() => modalRef.current?.showModal()} aria-label="分配方式について">
          <Icon icon="bi:info-circle" className="size-4" />
        </button>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-center gap-8 text-center">
            <div>
              <div className="text-xs opacity-60">総投資</div>
              <div className="text-lg font-bold text-red-900 dark:text-red-400">{fmt(result.totalInvest)} 円</div>
              <div className="text-xs opacity-50">（再プレイ{result.totalInvestMedals.toLocaleString()}枚 含む）</div>
            </div>
            <div>
              <div className="text-xs opacity-60">総回収</div>
              <div className="text-lg font-bold text-blue-900 dark:text-blue-400">{fmt(result.totalCollect)} 円</div>
              <div className="text-xs opacity-50">={toMedalByExchange(result.totalCollect)} 枚</div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs opacity-60">収支</div>
            <div className={`text-xl font-bold ${result.totalProfit >= 0 ? "text-blue-500" : "text-red-500"}`}>
              {result.totalProfit >= 0 ? "+" : ""}{fmt(result.totalProfit)} 円
            </div>
            <div className={`text-sm ${result.totalProfit >= 0 ? "text-blue-500" : "text-red-500"} opacity-70`}>
              {result.totalProfit >= 0 ? "+" : ""}{toMedalByExchange(result.totalProfit)} 枚
            </div>
            <div className="text-sm mt-1 opacity-60">
              {perPerson >= 0 ? "+" : ""}{fmt(Math.round(perPerson))} 円 / 人
            </div>
          </div>
        </div>
      </div>

      <dialog ref={modalRef} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-2">分配方式について</h3>
          <p className="text-sm opacity-70">
            全体の損益を均等に分配します。各メンバーの取り分 = 自分の投資額 + (全体損益 / 人数) となり、全員の収支が同じになります。
          </p>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-sm">閉じる</button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop"><button>close</button></form>
      </dialog>
    </div>
  );
}
