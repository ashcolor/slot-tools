import type { RefObject } from "react";
import type { RateOption } from "../../../types";
import { PACHINKO_LENDING_OPTIONS, PACHISLOT_LENDING_OPTIONS } from "../constants";
import { RateSelector } from "./RateSelector";

interface NoriuchiConfigDialogProps {
  dialogRef: RefObject<HTMLDialogElement | null>;
  lendingRate: number;
  exchangeRate: number;
  slotSize: 46 | 50 | 125;
  memberCount: number;
  exchangeOptions: RateOption[];
  onSwitchToSlot: () => void;
  onSwitchToPachinko: () => void;
  onChangeLendingRate: (rate: number) => void;
  onChangeExchangeRate: (rate: number) => void;
  onChangeSlotSize: (slotSize: 46 | 50 | 125) => void;
  onChangeMemberCount: (count: number) => void;
}

export function NoriuchiConfigDialog({
  dialogRef,
  lendingRate,
  exchangeRate,
  slotSize,
  memberCount,
  exchangeOptions,
  onSwitchToSlot,
  onSwitchToPachinko,
  onChangeLendingRate,
  onChangeExchangeRate,
  onChangeSlotSize,
  onChangeMemberCount,
}: NoriuchiConfigDialogProps) {
  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box">
        <h3 className="mb-4 text-lg font-bold">設定</h3>
        <div className="flex flex-col gap-4">
          <div className="tabs tabs-box mx-auto w-fit">
            <input
              type="radio"
              name="game_type"
              className="tab"
              aria-label="スロット"
              checked={lendingRate !== 4}
              onChange={onSwitchToSlot}
            />
            <input
              type="radio"
              name="game_type"
              className="tab"
              aria-label="パチンコ"
              checked={lendingRate === 4}
              onChange={onSwitchToPachinko}
            />
          </div>
          <div>
            <div className="mb-2 text-xs font-bold opacity-50">レート</div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold">貸出</label>
                <RateSelector
                  rate={lendingRate}
                  options={lendingRate === 4 ? PACHINKO_LENDING_OPTIONS : PACHISLOT_LENDING_OPTIONS}
                  onChange={onChangeLendingRate}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold">交換</label>
                <RateSelector
                  rate={exchangeRate}
                  options={exchangeOptions}
                  onChange={onChangeExchangeRate}
                />
              </div>
            </div>
          </div>
          <div className="divider my-0" />
          <div>
            <div className="mb-2 text-xs font-bold opacity-50">入力設定</div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold">再プレイ単位</label>
                {lendingRate === 4 ? (
                  <select
                    className="select select-bordered select-sm w-auto"
                    value={slotSize}
                    onChange={(event) => onChangeSlotSize(Number(event.target.value) as 125)}
                  >
                    <option value={125}>125玉</option>
                  </select>
                ) : (
                  <select
                    className="select select-bordered select-sm w-auto"
                    value={slotSize}
                    onChange={(event) => onChangeSlotSize(Number(event.target.value) as 46 | 50)}
                  >
                    <option value={46}>46枚</option>
                    <option value={50}>50枚</option>
                  </select>
                )}
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold">メンバー数</label>
                <select
                  className="select select-bordered select-sm w-auto"
                  value={memberCount}
                  onChange={(event) => onChangeMemberCount(Number(event.target.value))}
                >
                  {[1, 2, 3, 4].map((count) => (
                    <option key={count} value={count}>
                      {count}人
                    </option>
                  ))}
                </select>
              </div>
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
