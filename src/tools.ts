export interface Tool {
  path: string;
  title: string;
  description: string;
  emoji: string;
}

export const tools: Tool[] = [
  {
    path: "/slot-memo",
    title: "実戦メモ",
    description:
      "ホール・機種・収支・示唆を1画面で記録。タグ管理と検索で振り返りしやすいメモアプリです。",
    emoji: "📝",
  },
  {
    path: "/noriuchi",
    title: "ノリ打ち精算",
    description: "ノリ打ち精算を簡単にできるツール。再プレイ・貯玉対応。",
    emoji: "👥",
  },
];
