import { useRef, useState } from "react";
import { Icon } from "@iconify/react";
import type { CalcResult } from "../types";

interface Props {
  result: CalcResult;
  exchangeRate: number;
}

export function SettlementView({ result, exchangeRate }: Props) {
  const [tab, setTab] = useState<"cash" | "medal">("cash");
  const [settlementOpen, setSettlementOpen] = useState(false);
  const modalRef = useRef<HTMLDialogElement>(null);
  const fmt = (n: number) => Math.round(n).toLocaleString();
  const fmtMedal = (n: number) => Math.round(n / exchangeRate).toLocaleString();

  const isCash = tab === "cash";
  const unit = isCash ? "円" : "枚";
  const display = (n: number) => (isCash ? fmt(n) : fmtMedal(n));

  const memberCount = result.members.length;
  const perPerson = memberCount > 0 ? result.totalProfit / memberCount : 0;

  const summaryContent = (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-center gap-8 text-center">
        <div>
          <div className="text-xs opacity-60">総投資</div>
          <div className="text-lg font-bold text-red-900">{display(result.totalInvest)} {unit}</div>
        </div>
        <div>
          <div className="text-xs opacity-60">総回収</div>
          <div className="text-lg font-bold text-blue-900">{display(result.totalCollect)} {unit}</div>
        </div>
      </div>
      <div className="text-center">
        <div className="text-xs opacity-60">収支</div>
        <div className={`text-xl font-bold ${result.totalProfit >= 0 ? "text-blue-500" : "text-red-500"}`}>
          {result.totalProfit >= 0 ? "+" : ""}{display(result.totalProfit)} {unit}
        </div>
        <div className="text-sm mt-1">
          {perPerson >= 0 ? "+" : ""}{display(Math.round(perPerson))} {unit} / 人
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {/* タブ + インフォ */}
      <div role="tablist" className="tabs tabs-lift tabs-sm">
        <button type="button" role="tab" className={`tab gap-1 ${tab === "medal" ? "tab-active" : ""}`} onClick={() => setTab("medal")}>
          <Icon icon="fa6-solid:coins" className="size-3.5 text-gray-900" />
          メダル
        </button>
        <button type="button" role="tab" className={`tab gap-1 ${tab === "cash" ? "tab-active" : ""}`} onClick={() => setTab("cash")}>
          <Icon icon="fa6-solid:money-bill" className="size-3.5 text-amber-900" />
          現金
        </button>
      </div>
      <div className="relative bg-base-100 border border-base-300 border-t-0 rounded-b-lg p-2">
        <button type="button" className="absolute top-1 right-1 opacity-50" onClick={() => modalRef.current?.showModal()} aria-label="分配方式について">
          <Icon icon="bi:info-circle" className="size-4" />
        </button>
        {summaryContent}
      </div>

      {/* 精算アコーディオン */}
      <div className="collapse bg-base-100 shadow-sm">
        <input type="checkbox" onChange={(e) => setSettlementOpen(e.target.checked)} />
        <div className="collapse-title font-bold text-sm text-center min-h-0 py-2 pe-4 relative">
          精算
          <Icon icon="fa6-solid:chevron-down" className={`size-3 absolute right-3 top-1/2 -translate-y-1/2 opacity-50 transition-transform ${settlementOpen ? "rotate-180" : ""}`} />
        </div>
        <div className="collapse-content">
          {result.settlements.length === 0 ? (
            <p className="text-center">精算不要</p>
          ) : (
            <div className="flex flex-col gap-1">
              {result.settlements.map((s, i) => (
                <div key={i} className="flex items-center gap-2 bg-base-200 rounded p-2">
                  <span>{s.from}</span>
                  <span><Icon icon="fa6-solid:arrow-right" className="size-3" /></span>
                  <span>{s.to}</span>
                  <span className="ml-auto">{display(s.amount)} {unit}</span>
                </div>
              ))}
            </div>
          )}
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
