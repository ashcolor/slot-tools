import type { ChangeEvent, RefObject } from "react";
import { FONT_SIZE_OPTIONS } from "../../../constants";

interface MemoConfigDialogProps {
  configModalRef: RefObject<HTMLDialogElement | null>;
  memoFontSizeLevel: number;
  formulaRoundDecimalPlaces: number;
  onChangeFontSizeLevel: (level: number) => void;
  onChangeFormulaRoundDecimalPlaces: (decimalPlaces: number) => void;
}

export function ConfigDialog({
  configModalRef,
  memoFontSizeLevel,
  formulaRoundDecimalPlaces,
  onChangeFontSizeLevel,
  onChangeFormulaRoundDecimalPlaces,
}: MemoConfigDialogProps) {
  const handleFormulaRoundDecimalPlacesChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const parsed = Number.parseInt(event.target.value, 10);
    if (!Number.isFinite(parsed)) return;
    onChangeFormulaRoundDecimalPlaces(parsed);
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
                  className="join-item btn btn-xs"
                  aria-label={option.label}
                  checked={memoFontSizeLevel === option.level}
                  onChange={() => onChangeFontSizeLevel(option.level)}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <label htmlFor="formula-round-decimals">小数点四捨五入桁数</label>
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
