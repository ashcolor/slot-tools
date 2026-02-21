export interface TemplateCategory {
  key: "koyaku" | "game" | "type" | "color" | "state" | "calc";
  label: string;
  items: string[];
}

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  {
    key: "koyaku",
    label: "小役",
    items: ["はずれ","リプレイ", "🔔", "🍒", "🍉", "チャンス目", "弱", "強","中段","上段","下段","平行","斜め","シングル","ダブル"],
  },
  {
    key: "game",
    label: "ゲーム数",
    items: ["天国", "天井", "100", "200", "300", "500", "1000"],
  },
  {
    key: "type",
    label: "種別",
    items: ["CZ", "BONUS", "REG","BIG", "AT", "ART"],
  },
  {
    key: "color",
    label: "色",
    items: ["⬜️", "🟦", "🟨", "🟩", "🟥", "🟪", "🥉", "🥈", "🥇", "🦒", "🌈"],
  },
  {
    key: "state",
    label: "状態",
    items: ["低確率", "通常", "高確率", "超高確率"],
  },
  {
    key: "calc",
    label: "計算",
    items: ["カウンター", "数式"],
  },
];
