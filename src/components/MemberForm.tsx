import { useState, useRef, useEffect } from "react";
import type { Member } from "../types";

interface Props {
  member: Member;
  index: number;
  medalSteps: number[];
  onChange: (updated: Member) => void;
  onShare?: () => void;
}

const CASH_STEPS = [1000, 10000];

export function MemberForm({ member, index, medalSteps, onChange, onShare }: Props) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const update = (field: keyof Member, value: string | number) => {
    onChange({ ...member, [field]: value });
  };

  const numChange = (field: keyof Member) => (e: React.ChangeEvent<HTMLInputElement>) => {
    update(field, Number(e.target.value) || 0);
  };

  const addTo = (field: keyof Member, amount: number) => {
    update(field, (member[field] as number) + amount);
  };

  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body p-3 gap-2">
        {editing ? (
          <input
            ref={inputRef}
            type="text"
            className="input input-bordered input-sm w-full font-semibold text-center"
            value={member.name}
            onChange={(e) => update("name", e.target.value)}
            onBlur={() => setEditing(false)}
            onKeyDown={(e) => e.key === "Enter" && setEditing(false)}
          />
        ) : (
          <div
            className="text-lg text-center cursor-pointer py-1 hover:opacity-70 transition-opacity"
            onClick={() => setEditing(true)}
          >
            {member.name || `メンバー${index + 1}`}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {/* 投資 */}
          <div>
            <div className="text-xs font-bold opacity-80 mb-1">投資</div>
            <div className="flex flex-col gap-2">
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-xs opacity-50 shrink-0 w-8">メダル</span>
                  <label className="input input-bordered input-sm flex items-center gap-1 flex-1 min-w-0">
                    <input
                      type="number"
                      min={0}
                      placeholder="0"
                      className="grow w-0 min-w-0 text-right"
                      value={member.investMedals || ""}
                      onChange={numChange("investMedals")}
                    />
                    <span className="text-xs opacity-50">枚</span>
                  </label>
                </div>
                <div className="flex gap-1 mt-1">
                  {medalSteps.map((v) => (
                    <button
                      key={v}
                      type="button"
                      className="btn btn-xs flex-1 min-w-0"
                      onClick={() => addTo("investMedals", v)}
                    >
                      +{v}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-xs opacity-50 shrink-0 w-8">現金</span>
                  <label className="input input-bordered input-sm flex items-center gap-1 flex-1 min-w-0">
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      placeholder="0"
                      className="grow w-0 min-w-0 text-right"
                      value={member.investCash || ""}
                      onChange={numChange("investCash")}
                    />
                    <span className="text-xs opacity-50">円</span>
                  </label>
                </div>
                <div className="flex gap-1 mt-1">
                  {CASH_STEPS.map((v) => (
                    <button
                      key={v}
                      type="button"
                      className="btn btn-xs flex-1 min-w-0"
                      onClick={() => addTo("investCash", v)}
                    >
                      +{v.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 回収 */}
          <div>
            <div className="text-xs font-bold opacity-80 mb-1">回収</div>
            <div className="flex flex-col gap-2">
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-xs opacity-50 shrink-0 w-8">メダル</span>
                  <label className="input input-bordered input-sm flex items-center gap-1 flex-1 min-w-0">
                    <input
                      type="number"
                      min={0}
                      placeholder="0"
                      className="grow w-0 min-w-0 text-right"
                      value={member.collectMedals || ""}
                      onChange={numChange("collectMedals")}
                    />
                    <span className="text-xs opacity-50">枚</span>
                  </label>
                </div>
                <div className="flex gap-1 mt-1">
                  {medalSteps.map((v) => (
                    <button
                      key={v}
                      type="button"
                      className="btn btn-xs flex-1 min-w-0"
                      onClick={() => addTo("collectMedals", v)}
                    >
                      +{v}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-xs opacity-50 shrink-0 w-8">現金</span>
                  <label className="input input-bordered input-sm flex items-center gap-1 flex-1 min-w-0">
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      placeholder="0"
                      className="grow w-0 min-w-0 text-right"
                      value={member.collectCash || ""}
                      onChange={numChange("collectCash")}
                    />
                    <span className="text-xs opacity-50">円</span>
                  </label>
                </div>
                <div className="flex gap-1 mt-1">
                  {CASH_STEPS.map((v) => (
                    <button
                      key={v}
                      type="button"
                      className="btn btn-xs flex-1 min-w-0"
                      onClick={() => addTo("collectCash", v)}
                    >
                      +{v.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {onShare && (
          <button type="button" className="btn btn-xs w-full" onClick={onShare}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            共有
          </button>
        )}
      </div>
    </div>
  );
}
