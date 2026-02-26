export interface Tool {
  path: string;
  title: string;
  description: string;
  sidebarIcon: string;
}

export const tools: Tool[] = [
  {
    path: "/memo",
    title: "実戦メモ",
    description: "実戦内容の記録に特化したメモアプリ。カウンターや数式が置ける機能付き。",
    sidebarIcon: "fa7-regular:file-text",
  },
  {
    path: "/noriuchi",
    title: "ノリ打ち精算",
    description: "ノリ打ち精算を簡単にできるツール。再プレイ・貯玉対応。",
    sidebarIcon: "fa6-solid:users",
  },
];
