export const FORMULA_TOKEN = "[[f:1+1]]";
export const COUNTER_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;
export const MAX_COUNTER_VALUE = 9999;
export const DEFAULT_FONT_SIZE_LEVEL = 3 as const;

export const COUNTER_DIGIT_STEPS = [1000, 100, 10, 1] as const;
export const FONT_SIZE_OPTIONS = [
  { level: 1, label: "S", className: "text-sm" },
  { level: 2, label: "M", className: "text-base" },
  { level: 3, label: "L", className: "text-lg" },
  { level: 4, label: "XL", className: "text-xl" },
  { level: 5, label: "2XL", className: "text-2xl" },
] as const;

