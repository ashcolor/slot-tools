export interface TemplateCategory {
  key: "koyaku" | "game" | "type" | "color" | "state";
  label: string;
  items: string[];
}

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  {
    key: "koyaku",
    label: "小役",
    items: ["はずれ","リプレイ", "🔔", "🍒", "🍉", "チャンス目", "強", "弱"],
  },
  {
    key: "game",
    label: "ゲーム数",
    items: ["天国", "天井", "100刻み"],
  },
  {
    key: "type",
    label: "種別",
    items: ["CZ", "BONUS（REGULAR）", "BONUS（BIG）", "AT", "ART"],
  },
  {
    key: "color",
    label: "色",
    items: ["⬜️", "🟦", "🟨", "🟩", "🟥", "🟪", "🌈", "🥉", "🥈", "🥇", "🦒"],
  },
  {
    key: "state",
    label: "状態",
    items: ["低確率", "通常", "高確率", "超高確率"],
  },
];
