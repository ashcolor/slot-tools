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
  error?: boolean;
  readOnly?: boolean;
}

export function StepInput({ icon, iconClass, value, unit, step, steps, onChange, onAdd, formatStep, error, readOnly }: Props) {
  const fmt = (v: number) => formatStep ? formatStep(v) : String(v);
  return (
    <div>
      <div className="flex items-center gap-1">
        <Icon icon={icon} className={iconClass} />
        {readOnly ? (
          <div className={`input input-md flex items-center gap-1 flex-1 min-w-0 bg-base-200${error ? " input-error" : ""}`}>
            <span className="flex-1 text-right font-bold">{value.toLocaleString()}</span>
            <span className="text-xs opacity-50">{unit}</span>
          </div>
        ) : (
          <label className={`input input-bordered input-md flex items-center gap-1 flex-1 min-w-0${error ? " input-error" : ""}`}>
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
        )}
      </div>
      {steps.length > 0 && (
        <div className="flex flex-col gap-1 mt-1">
          <div className="flex gap-1">
            {steps.map((v) => (
              <button
                key={v}
                type="button"
                className="btn  btn-success btn-soft flex-1 min-w-0"
                onClick={() => onAdd(v)}
              >
                <Icon icon="mdi:plus-circle-outline" className="size-3 shrink-0" />{fmt(v)}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {steps.map((v) => (
              <button
                key={-v}
                type="button"
                className="btn btn-xs btn-error btn-soft flex-1 min-w-0"
                onClick={() => onAdd(-v)}
              >
                <Icon icon="mdi:minus-circle-outline" className="size-3" />{fmt(v)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
