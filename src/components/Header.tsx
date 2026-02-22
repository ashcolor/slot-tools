import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { Icon } from "@iconify/react";
import { tools } from "../tools";
import { usePwaInstallPrompt } from "../utils/usePwaInstallPrompt";
import { IosInstallGuideModal } from "./IosInstallGuideModal";

function isMobileDevice() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.matchMedia("(max-width: 768px)").matches;
}

function isIosBrowser() {
  const ua = navigator.userAgent;
  const isIosDevice = /iPhone|iPad|iPod/i.test(ua);
  const isIpadOsDesktopMode = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;

  return isIosDevice || isIpadOsDesktopMode;
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(() => document.documentElement.dataset.theme === "dark");
  const [isMobile, setIsMobile] = useState(() => isMobileDevice());
  const [isIos, setIsIos] = useState(() => isIosBrowser());
  const [showIosInstallHelp, setShowIosInstallHelp] = useState(false);
  const { canInstall, isInstalled, promptInstall } = usePwaInstallPrompt();
  const location = useLocation();
  const currentTool = tools.find((t) => t.path === location.pathname);
  const sidebarTools = tools.filter((t) => t.path !== "/memo");
  const brandText = "スロツール";
  const installLabel = isMobile ? "ホーム画面に追加" : "アプリをインストール";
  const isInstallActionAvailable = canInstall || isIos;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const updateDeviceState = () => {
      setIsMobile(isMobileDevice());
      setIsIos(isIosBrowser());
    };

    updateDeviceState();
    mediaQuery.addEventListener("change", updateDeviceState);

    return () => {
      mediaQuery.removeEventListener("change", updateDeviceState);
    };
  }, []);

  const installApp = async () => {
    if (!canInstall) {
      if (isIos) {
        setShowIosInstallHelp(true);
      }
      return;
    }

    await promptInstall();
    setShowIosInstallHelp(false);
    setOpen(false);
  };

  const toggleTheme = () => {
    const next = dark ? "corporate" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("theme", next);
    setDark(!dark);
  };

  return (
    <>
      <header className="navbar bg-base-100 shadow-sm">
        <div className="flex-none">
          <button type="button" className="btn btn-square btn-ghost" onClick={() => setOpen(!open)} aria-label="メニュー">
            <Icon icon="fa6-solid:bars" className="size-4" />
          </button>
        </div>
        <div className="flex-1">
          <Link to="/" className="inline-flex items-center text-lg font-bold">
            <span>{brandText}</span>
            <Icon icon="bi:plus-lg" className="size-4" aria-hidden />
            {currentTool ? <span>{currentTool.title}</span> : null}
          </Link>
        </div>
        <div className="flex flex-none items-center gap-1">
          <a
            href="https://www.buymeacoffee.com/ashcolor"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary rounded-full"
            title="🍺おごる"
          >
            🍻おごる
          </a>
        </div>
      </header>

      {open && <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setOpen(false)} />}

      <div
        className={`bg-base-100 fixed top-0 left-0 z-50 flex h-full w-64 flex-col shadow-xl transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="border-base-300 flex items-center gap-2 border-b px-4 py-3">
          <img src="/logo.png" alt="ロゴ" className="size-10" />
          <span className="inline-flex items-center text-lg font-bold">
            <span>{brandText}</span>
            <Icon icon="bi:plus-lg" className="size-4" aria-hidden />
          </span>
          <button type="button" className="btn btn-square btn-ghost btn-sm ml-auto" onClick={toggleTheme} aria-label="テーマ切替">
            {dark ? <Icon icon="bi:moon" className="size-5" /> : <Icon icon="bi:sun" className="size-5" />}
          </button>
        </div>

        <div>
          <ul className="menu bg-base-100 w-full">
            <li>
              <Link to="/" onClick={() => setOpen(false)} className={location.pathname === "/" ? "bg-base-200" : undefined}>
                HOME
              </Link>
            </li>
            {sidebarTools.map((t) => (
              <li key={t.path}>
                <Link
                  to={t.path}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-4 ${location.pathname === t.path ? "bg-base-200" : ""}`}
                >
                  {t.sidebarIcon ? (
                    <Icon icon={t.sidebarIcon} className="size-5 shrink-0" />
                  ) : (
                    <span>{t.emoji}</span>
                  )}
                  <span>{t.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto">
          {!isInstalled && (
            <div className="p-4">
              <button
                type="button"
                onClick={installApp}
                disabled={!isInstallActionAvailable}
                className="btn btn-primary w-full"
              >
                <Icon icon="fa6-solid:download" className="size-4" />
                <span>{installLabel}</span>
              </button>
            </div>
          )}

          <div className="border-base-300 border-t" />
          <div className="p-4 text-xs">
            <div className="flex flex-col gap-1">
              <Link to="/operator" onClick={() => setOpen(false)} className="link link-hover">
                運営者情報
              </Link>
              <Link to="/contact" onClick={() => setOpen(false)} className="link link-hover">
                お問い合わせ
              </Link>
              <Link to="/privacy" onClick={() => setOpen(false)} className="link link-hover">
                プライバシーポリシー
              </Link>
            </div>
            <div className="mt-3 opacity-60">© {new Date().getFullYear()} スロツール+</div>
          </div>
        </div>
      </div>

      <IosInstallGuideModal open={showIosInstallHelp} onClose={() => setShowIosInstallHelp(false)} />
    </>
  );
}
