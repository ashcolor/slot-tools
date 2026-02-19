import { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import { StepInput } from "./StepInput";
import { pickRandomEmoji } from "../types";
import type { Member } from "../types";

interface Props {
  member: Member;

  medalSteps: number[];
  onChange: (updated: Member) => void;
  onShare?: () => void;
}

const CASH_STEPS = [1000, 10000];
const fmtCash = (v: number) => v.toLocaleString();

export function MemberForm({ member, medalSteps, onChange, onShare }: Props) {
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
    onChange({ ...member, investMedals: 0, investCash: 0, collectMedals: 0, collectCash: 0 });
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
          {/* 投資 */}
          <div>
            <div className="text-xs font-bold text-red-900 mb-1">投資</div>
            <div className="flex flex-col gap-2">
              <StepInput
                icon="fa6-solid:coins"
                iconClass="text-base text-gray-900 shrink-0 w-8"
                value={member.investMedals}
                unit="枚"
                steps={medalSteps}
                onChange={(v) => update("investMedals", v)}
                onAdd={(v) => addTo("investMedals", v)}
              />
              <StepInput
                icon="fa6-solid:money-bill"
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
          </div>

          {/* 回収 */}
          <div>
            <div className="text-xs font-bold text-blue-900 mb-1">回収</div>
            <div className="flex flex-col gap-2">
              <StepInput
                icon="fa6-solid:coins"
                iconClass="text-base text-gray-900 shrink-0 w-8"
                value={member.collectMedals}
                unit="枚"
                steps={medalSteps}
                onChange={(v) => update("collectMedals", v)}
                onAdd={(v) => addTo("collectMedals", v)}
              />
              <StepInput
                icon="fa6-solid:money-bill"
                iconClass="text-base text-amber-900 shrink-0 w-8"
                value={member.collectCash}
                unit="円"
                step={1000}
                steps={CASH_STEPS}
                onChange={(v) => update("collectCash", v)}
                onAdd={(v) => addTo("collectCash", v)}
                formatStep={fmtCash}
              />
            </div>
          </div>

        {onShare && (
          <button type="button" className="btn btn-xs w-full" onClick={onShare}>
            <Icon icon="fa6-solid:share-nodes" className="size-3" />
            共有
          </button>
        )}
        </div>

      </div>
    </div>
  );
}
