export interface Tool {
  path: string;
  title: string;
  description: string;
  emoji: string;
}

export const tools: Tool[] = [
  {
    path: "/noriuchi",
    title: "乗り打ち精算",
    description: "投資・回収を入力して精算額を自動計算",
    emoji: "👥",
  },
];
