const themeColors: Record<string, string> = {
  corporate: "#ffffff",
  dark: "#1d232a",
};

export function initThemeColor() {
  const root = document.documentElement;
  const themeMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  const applyThemeColor = (theme: string) => {
    if (!themeMeta) return;
    themeMeta.setAttribute("content", themeColors[theme] || themeColors.corporate);
  };

  const initialTheme = localStorage.getItem("theme") || "corporate";
  root.dataset.theme = initialTheme;
  applyThemeColor(initialTheme);

  const observer = new MutationObserver(() => {
    applyThemeColor(root.dataset.theme || "corporate");
  });

  observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
}
