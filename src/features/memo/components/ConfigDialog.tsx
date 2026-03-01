import type { ChangeEvent, RefObject } from "react";
import { FONT_SIZE_OPTIONS } from "../../../constants";
import type { MemoHistoryAutoSaveIntervalMinutes } from "../hooks/useMemoEditor";

const HISTORY_AUTO_SAVE_OPTIONS: Array<{
  value: MemoHistoryAutoSaveIntervalMinutes;
  label: string;
}> = [
  { value: 5, label: "5分" },
  { value: 30, label: "30分" },
  { value: 60, label: "1時間" },
  { value: 0, label: "自動保存なし" },
];

interface MemoConfigDialogProps {
  configModalRef: RefObject<HTMLDialogElement | null>;
  memoFontSizeLevel: number;
  formulaRoundDecimalPlaces: number;
  memoHistoryAutoSaveIntervalMinutes: MemoHistoryAutoSaveIntervalMinutes;
  onChangeFontSizeLevel: (level: number) => void;
  onChangeFormulaRoundDecimalPlaces: (decimalPlaces: number) => void;
  onChangeMemoHistoryAutoSaveIntervalMinutes: (
    interval: MemoHistoryAutoSaveIntervalMinutes,
  ) => void;
}

export function ConfigDialog({
  configModalRef,
  memoFontSizeLevel,
  formulaRoundDecimalPlaces,
  memoHistoryAutoSaveIntervalMinutes,
  onChangeFontSizeLevel,
  onChangeFormulaRoundDecimalPlaces,
  onChangeMemoHistoryAutoSaveIntervalMinutes,
}: MemoConfigDialogProps) {
  const handleFormulaRoundDecimalPlacesChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const parsed = Number.parseInt(event.target.value, 10);
    if (!Number.isFinite(parsed)) return;
    onChangeFormulaRoundDecimalPlaces(parsed);
  };

  const handleMemoHistoryAutoSaveIntervalChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const parsed = Number.parseInt(event.target.value, 10);
    if (!Number.isFinite(parsed)) return;
    if (parsed !== 0 && parsed !== 5 && parsed !== 30 && parsed !== 60) return;
    onChangeMemoHistoryAutoSaveIntervalMinutes(parsed);
  };

  return (
    <dialog ref={configModalRef} className="modal">
      <div className="modal-box">
        <h3 className="mb-3 text-lg font-bold">設定</h3>
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span>文字サイズ</span>
            <div className="join">
              {FONT_SIZE_OPTIONS.map((option) => (
                <input
                  key={option.level}
                  type="radio"
                  name="font-size-options"
                  className="join-item btn btn-sm"
                  aria-label={option.label}
                  checked={memoFontSizeLevel === option.level}
                  onChange={() => onChangeFontSizeLevel(option.level)}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <label htmlFor="formula-round-decimals">計算結果の小数桁数</label>
            <select
              id="formula-round-decimals"
              className="select select-bordered select-sm w-24"
              value={formulaRoundDecimalPlaces}
              onChange={handleFormulaRoundDecimalPlacesChange}
            >
              <option value={0}>0</option>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
            </select>
          </div>

          <div className="flex items-center justify-between gap-3">
            <label htmlFor="history-auto-save-interval">履歴の自動保存</label>
            <select
              id="history-auto-save-interval"
              className="select select-bordered select-sm w-32"
              value={memoHistoryAutoSaveIntervalMinutes}
              onChange={handleMemoHistoryAutoSaveIntervalChange}
            >
              {HISTORY_AUTO_SAVE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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
