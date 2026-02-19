import { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import { StepInput } from "./StepInput";
import { pickRandomEmoji } from "../types";
import type { Member } from "../types";

interface Props {
  member: Member;
  exchangeRate: number;
  medalSteps: number[];
  mode: "playing" | "settlement";
  onChange: (updated: Member) => void;
}

const CASH_STEPS = [1000, 10000];
const fmtCash = (v: number) => v.toLocaleString();

export function MemberForm({ member, exchangeRate, medalSteps, mode, onChange }: Props) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const update = (field: keyof Member, value: string | number) => {
    onChange({ ...member, [field]: value });
  };

  const addTo = (field: keyof Member, amount: number) => {
    update(field, (member[field] as number) + amount);
  };

  const handleReset = () => {
    onChange({ ...member, investMedals: 0, investCash: 0, collectMedals: 0, storedMedals: 0 });
  };

  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body p-3">
        <div className="relative">
          <button
            type="button"
            className="absolute -top-1 -left-1 opacity-30 hover:opacity-100 transition-opacity"
            onClick={handleReset}
            aria-label="リセット"
          >
            <Icon icon="fa6-solid:trash-can" className="size-2.5" />
          </button>
        {editing ? (
          <input
            ref={inputRef}
            type="text"
            className="input input-bordered input-sm w-full font-semibold text-center"
            value={member.name}
            onChange={(e) => update("name", e.target.value)}
            onBlur={() => { if (!member.name.trim()) update("name", pickRandomEmoji()); setEditing(false); }}
            onKeyDown={(e) => e.key === "Enter" && setEditing(false)}
          />
        ) : (
          <div
            className="text-lg text-center cursor-pointer py-1 hover:opacity-70 transition-opacity"
            onClick={() => setEditing(true)}
          >
            {member.name}
          </div>
        )}
        </div>

        <div className="flex flex-col gap-6">
          {mode === "playing" && (
            <>
              {/* 再プレイ */}
              <div>
                <div className="text-xs font-bold text-red-900 mb-1">再プレイ</div>
                <StepInput
                  icon="material-symbols:replay"
                  iconClass="text-base text-gray-900 shrink-0 w-8"
                  value={member.investMedals}
                  unit="枚"
                  steps={medalSteps}
                  onChange={(v) => update("investMedals", v)}
                  onAdd={(v) => addTo("investMedals", v)}
                />
              </div>

              {/* 現金投資 */}
              <div>
                <div className="text-xs font-bold text-amber-900 mb-1">現金投資</div>
                <StepInput
                  icon="akar-icons:money"
                  iconClass="text-base text-amber-900 shrink-0 w-8"
                  value={member.investCash}
                  unit="円"
                  step={1000}
                  steps={CASH_STEPS}
                  onChange={(v) => update("investCash", v)}
                  onAdd={(v) => addTo("investCash", v)}
                  formatStep={fmtCash}
                />
              </div>

              {/* 出玉 */}
              <div>
                <div className="text-xs font-bold text-blue-900 mb-1">出玉</div>
                <StepInput
                  icon="akar-icons:coin"
                  iconClass="text-base text-gray-900 shrink-0 w-8"
                  value={member.collectMedals}
                  unit="枚"
                  steps={[]}
                  onChange={(v) => update("collectMedals", v)}
                  onAdd={() => {}}
                />
              </div>
            </>
          )}

          {mode === "settlement" && (
            <>
              {/* 遊技中の入力値 */}
              <div className="flex flex-col gap-0.5 text-sm opacity-60">
                <div>
                  <span className="text-xs font-bold text-red-900">再プレイ</span>{" "}
                  {member.investMedals.toLocaleString()} 枚
                </div>
                <div>
                  <span className="text-xs font-bold text-amber-900">現金投資</span>{" "}
                  {member.investCash.toLocaleString()} 円
                </div>
                <div>
                  <span className="text-xs font-bold text-blue-900">出玉</span>{" "}
                  {member.collectMedals.toLocaleString()} 枚
                </div>
              </div>

              {/* 貯メダル */}
              <div>
                <div className="text-xs font-bold text-pink-600 mb-1">貯メダル</div>
                <StepInput
                  icon="bi:piggy-bank"
                  iconClass="text-base text-pink-600 shrink-0 w-8"
                  value={member.storedMedals}
                  unit="枚"
                  steps={[]}
                  onChange={(v) => update("storedMedals", v)}
                  onAdd={() => {}}
                  error={member.storedMedals > member.collectMedals}
                />
                <div className="flex gap-1 mt-1">
                  <button
                    type="button"
                    className="btn btn-xs flex-1 min-w-0"
                    onClick={() => update("storedMedals", member.investMedals)}
                  >
                    投資枚数分を入力
                  </button>
                </div>
                {member.storedMedals > member.collectMedals ? (
                  <div className="text-xs text-right mt-1 text-error">
                    貯メダルが出玉を超えています
                  </div>
                ) : (
                  <div className="text-xs text-right mt-1 opacity-60">
                    換金 {Math.max(member.collectMedals - member.storedMedals, 0).toLocaleString()}枚→{Math.round(Math.max(member.collectMedals - member.storedMedals, 0) * exchangeRate).toLocaleString()}円
                  </div>
                )}
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
}
