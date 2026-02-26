import type { RefObject } from "react";
import type { CollectCalculationMode } from "../../../types";

interface SettlementInfoDialogProps {
  dialogRef: RefObject<HTMLDialogElement | null>;
  collectCalculationMode: CollectCalculationMode;
}

export function SettlementInfoDialog({
  dialogRef,
  collectCalculationMode,
}: SettlementInfoDialogProps) {
  const collectFormulaText =
    collectCalculationMode === "lending"
      ? "出玉 × 貸玉レート"
      : collectCalculationMode === "exchange"
        ? "出玉 × 交換レート"
        : "min(出玉, 再プレイ) × 貸玉レート + max(出玉 - 再プレイ, 0) × 交換レート";

  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box">
        <h3 className="mb-2 text-lg font-bold">計算式について</h3>
        <div className="mb-2 text-xs opacity-60">※貸出レート・交換レートは設定から変更できます</div>
        <div className="flex flex-col gap-3 text-sm opacity-70">
          <div>
            <div className="mb-1 font-bold">投資額</div>
            <div>現金投資 + (再プレイ × 貸出レート)</div>
          </div>
          <div>
            <div className="mb-1 font-bold">回収額</div>
            <div>{collectFormulaText}</div>
            <div className="mt-1 text-xs opacity-60">※回収額の計算式は設定から変更できます</div>
          </div>
          <div>
            <div className="mb-1 font-bold">収支</div>
            <div className="flex flex-col gap-1">
              <div>投資額 = 現金投資 + (再プレイ × 貸出レート)</div>
              <div>収支 = 回収額 − 投資額</div>
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
