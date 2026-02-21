export interface Tool {
  path: string;
  title: string;
  description: string;
  emoji: string;
}

export const tools: Tool[] = [
  {
    path: "/noriuchi",
    title: "ノリ打ち精算",
    description: "ノリ打ち精算を簡単にできるツール。再プレイ・貯玉対応。",
    emoji: "👥",
  },
];
