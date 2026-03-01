import { DEFAULT_FONT_SIZE_LEVEL } from "../../constants";

export interface TemplateCategory {
  key: "koyaku" | "game" | "cz" | "bonus" | "color" | "state" | "calc";
  label: string;
  items: string[];
}

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  {
    key: "koyaku",
    label: "小役",
    items: [
      "はずれ",
      "リプレイ",
      "🔔",
      "🍒",
      "🍉",
      "チャンス目",
      "弱",
      "強",
      "中段",
      "上段",
      "下段",
      "平行",
      "斜め",
    ],
  },
  {
    key: "color",
    label: "色",
    items: ["⬜️", "🟦", "🟨", "🟩", "🟥", "🟪", "🥉", "🥈", "🥇", "🦒", "🌈"],
  },
  {
    key: "bonus",
    label: "BONUS/CZ",
    items: ["BONUS", "BIG", "REG", "AT", "ART", "CZ", "◯", "×"],
  },
  {
    key: "state",
    label: "状態",
    items: ["天国", "天井", "低確率", "通常", "高確率", "超高確率"],
  },
  {
    key: "calc",
    label: "ウィジェット",
    items: ["カウンター", "数式"],
  },
];

export const TEMPLATE_COUNTER_ITEM_LABEL = "カウンター";
export const TEMPLATE_FORMULA_ITEM_LABEL = "数式";

export const EMPTY_MEMO_PLACEHOLDER = `🗓️：ヘッダー表示
🔒: 編集のロック
⋮：メニュー
`;

const SAMPLE_TEMPLATE_MEMO = `■ゲーム数
ゲーム数：[[c:game=0]]
BIG：[[c:big=0]] [[f:big / game]]
REG：[[c:reg=0]] [[f:reg / game]]

■小役カウント
🔔：[[c:bell=0]] [[f:bell / game]]
🍒：[[c:cherry=0]] [[f:cherry / game]]
🍉：[[c:suika=0]] [[f:suika / game]]

■終了画面
偶数：[[c:even=0]] [[f:even / (even + odd + high)]]
奇数：[[c:odd=0]] [[f:odd / (even + odd + high)]]
高設定：[[c:high=0]] [[f:high / (even + odd + high)]]`;

export const INITIAL_TEMPLATES = [
  {
    id: "default-slot-sample-template-v1",
    memo: SAMPLE_TEMPLATE_MEMO,
    fontSizeLevel: DEFAULT_FONT_SIZE_LEVEL,
    createdAt: "2026-02-21T00:00:00.000Z",
  },
];
