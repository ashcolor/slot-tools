export const FORMULA_TOKEN = "[[f:1+1]]";
export const COUNTER_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;
export const MAX_COUNTER_VALUE = 99999;
export const DEFAULT_FONT_SIZE_LEVEL = 2 as const;

export const COUNTER_DIGIT_STEPS = [10000, 1000, 100, 10, 1] as const;
export const FONT_SIZE_OPTIONS = [
  { level: 1, label: "XS", className: "text-xs" },
  { level: 2, label: "S", className: "text-sm" },
  { level: 3, label: "M", className: "text-base" },
  { level: 4, label: "L", className: "text-lg" },
  { level: 5, label: "XL", className: "text-xl" },
] as const;
