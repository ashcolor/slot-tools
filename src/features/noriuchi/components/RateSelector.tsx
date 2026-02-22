import type { RateOption } from "../../../types";

interface Props {
  rate: number;
  options: RateOption[];
  onChange: (rate: number) => void;
}

export function RateSelector({ rate, options, onChange }: Props) {
  return (
    <select
      className="select select-bordered select-sm w-auto"
      value={rate}
      onChange={(e) => onChange(Number(e.target.value))}
    >
      {options.map((opt) => (
        <option key={opt.label} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
