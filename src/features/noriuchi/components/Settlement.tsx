import { useRef } from "react";
import { Icon } from "@iconify/react";
import type { CalcResult } from "../../../types";
import { SettlementInfoDialog } from "./SettlementInfoDialog";

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

      <SettlementInfoDialog dialogRef={modalRef} />
    </div>
  );
}
