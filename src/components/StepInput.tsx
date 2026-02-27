import { Icon } from "@iconify/react";

interface Props {
  icon: string;
  iconClass: string;
  value: number;
  unit: string;
  steps: number[];
  onChange: (value: number) => void;
  onAdd: (amount: number) => void;
  formatStep?: (v: number) => string;
  stepColors?: Partial<Record<number, string>>;
  error?: boolean;
  readOnly?: boolean;
}

export function StepInput({
  icon,
  iconClass,
  value,
  unit,
  steps,
  onChange,
  onAdd,
  formatStep,
  stepColors,
  error,
  readOnly,
}: Props) {
  const fmt = (v: number) => (formatStep ? formatStep(v) : String(v));
  const getStepTextStyle = (v: number) => {
    const color = stepColors?.[v];
    if (!color) return undefined;
    return {
      color,
    };
  };
  return (
    <div>
      <div className="flex items-center gap-1">
        <Icon icon={icon} className={iconClass} />
        {readOnly ? (
          <div className="flex min-w-0 flex-1 items-center justify-end gap-1">
            <span className="text-xl font-bold">{value.toLocaleString()}</span>
            <span className="text-xs opacity-50">{unit}</span>
          </div>
        ) : (
          <label
            className={`input input-bordered input-md flex min-w-0 flex-1 items-center gap-1${error ? " input-error" : ""}`}
          >
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              className="w-0 min-w-0 grow text-right"
              value={value ? value.toLocaleString() : ""}
              onChange={(e) => onChange(Number(e.target.value.replace(/,/g, "")) || 0)}
            />
            <span className="text-xs opacity-50">{unit}</span>
          </label>
        )}
      </div>
      {steps.length > 0 && (
        <div className="mt-1 flex flex-col gap-1">
          <div className="flex gap-1">
            {steps.map((v) => (
              <button
                key={v}
                type="button"
                className="btn btn-primary btn-soft min-w-0 flex-1"
                onClick={() => onAdd(v)}
              >
                <Icon icon="mdi:plus-circle-outline" className="size-4 shrink-0" />
                <span style={getStepTextStyle(v)}>{fmt(v)}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {steps.map((v) => (
              <button
                key={-v}
                type="button"
                className="btn btn-xs btn-error btn-soft min-w-0 flex-1"
                onClick={() => onAdd(-v)}
              >
                <Icon icon="mdi:minus-circle-outline" className="size-3.5 shrink-0" />
                <span style={getStepTextStyle(v)}>{fmt(v)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
