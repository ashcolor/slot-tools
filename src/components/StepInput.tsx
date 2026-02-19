import { Icon } from "@iconify/react";

interface Props {
  icon: string;
  iconClass: string;
  value: number;
  unit: string;
  step?: number;
  steps: number[];
  onChange: (value: number) => void;
  onAdd: (amount: number) => void;
  formatStep?: (v: number) => string;
}

export function StepInput({ icon, iconClass, value, unit, step, steps, onChange, onAdd, formatStep }: Props) {
  return (
    <div>
      <div className="flex items-center gap-1">
        <Icon icon={icon} className={iconClass} />
        <label className="input input-bordered input-md flex items-center gap-1 flex-1 min-w-0">
          <input
            type="number"
            min={0}
            step={step}
            placeholder="0"
            className="grow w-0 min-w-0 text-right"
            value={value || ""}
            onChange={(e) => onChange(Number(e.target.value) || 0)}
          />
          <span className="text-xs opacity-50">{unit}</span>
        </label>
      </div>
      <div className="flex gap-1 mt-1">
        {steps.map((v) => (
          <button
            key={v}
            type="button"
            className="btn btn-xs flex-1 min-w-0"
            onClick={() => onAdd(v)}
          >
            +{formatStep ? formatStep(v) : v}
          </button>
        ))}
      </div>
    </div>
  );
}
