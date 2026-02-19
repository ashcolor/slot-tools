import { RATE_OPTIONS } from "../types";

interface Props {
  rate: number;
  onChange: (rate: number) => void;
}

export function RateSelector({ rate, onChange }: Props) {
  return (
    <select
      className="select select-bordered select-sm w-auto"
      value={rate}
      onChange={(e) => onChange(Number(e.target.value))}
    >
      {RATE_OPTIONS.map((opt) => (
        <option key={opt.label} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
