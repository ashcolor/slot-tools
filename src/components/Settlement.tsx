import { useRef, useState } from "react";
import type { CalcResult } from "../types";

interface Props {
  result: CalcResult;
  rate: number;
}

export function SettlementView({ result, rate }: Props) {
  const [showSettlement, setShowSettlement] = useState(false);
  const [tab, setTab] = useState<"cash" | "medal">("cash");
  const modalRef = useRef<HTMLDialogElement>(null);
  const fmt = (n: number) => n.toLocaleString();
  const fmtMedal = (n: number) => Math.round(n / rate).toLocaleString();

  const isCash = tab === "cash";
  const unit = isCash ? "円" : "枚";
  const display = (n: number) => (isCash ? fmt(n) : fmtMedal(n));

  const memberCount = result.members.length;
  const perPerson = memberCount > 0 ? result.totalProfit / memberCount : 0;

  const summaryContent = (
    <div className="flex flex-col gap-3 py-3">
      <div className="flex items-center justify-center gap-2 text-center">
        <div>
          <div className="text-xs opacity-60">総投資</div>
          <div className="text-lg font-bold">{display(result.totalInvest)} {unit}</div>
        </div>
        <span className="text-lg opacity-40 mt-4">-</span>
        <div>
          <div className="text-xs opacity-60">総回収</div>
          <div className="text-lg font-bold">{display(result.totalCollect)} {unit}</div>
        </div>
      </div>
      <div className="text-center">
        <div className="text-xs opacity-60">収支</div>
        <div className={`text-xl font-bold ${result.totalProfit >= 0 ? "text-info" : "text-error"}`}>
          {result.totalProfit >= 0 ? "+" : ""}{display(result.totalProfit)} {unit}
        </div>
        <div className="text-xs opacity-50 mt-1">
          {perPerson >= 0 ? "+" : ""}{display(Math.round(perPerson))} {unit} / 人
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {/* タブ + インフォ */}
      <div role="tablist" className="tabs tabs-lift tabs-xs">
        <input
          type="radio"
          name="result-tab"
          role="tab"
          className="tab"
          aria-label="💴 現金"
          checked={tab === "cash"}
          onChange={() => setTab("cash")}
        />
        <div role="tabpanel" className="tab-content bg-base-100 border-base-300 p-4">
          {summaryContent}
        </div>

        <input
          type="radio"
          name="result-tab"
          role="tab"
          className="tab"
          aria-label="🪙 メダル"
          checked={tab === "medal"}
          onChange={() => setTab("medal")}
        />
        <div role="tabpanel" className="tab-content bg-base-100 border-base-300 p-4">
          {summaryContent}
        </div>

        <div className="tab ml-auto flex items-center justify-center cursor-pointer opacity-40 hover:opacity-100" onClick={() => modalRef.current?.showModal()}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      {/* 精算トグル */}
      <button
        type="button"
        className="btn btn-sm w-full"
        onClick={() => setShowSettlement(!showSettlement)}
      >
        精算 {showSettlement ? "▲" : "▼"}
      </button>

      {showSettlement && (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-4">
            {result.settlements.length === 0 ? (
              <p className="text-center opacity-60">精算不要です</p>
            ) : (
              <div className="flex flex-col gap-2">
                {result.settlements.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 bg-base-200 rounded-lg p-3 font-semibold">
                    <span className="text-error">{s.from}</span>
                    <span className="opacity-40">→</span>
                    <span className="text-success">{s.to}</span>
                    <span className="ml-auto text-lg">{display(s.amount)} {unit}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
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
