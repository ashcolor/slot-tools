import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { Icon } from "@iconify/react";
import { tools } from "../tools";
import { usePwaInstallPrompt } from "../utils/usePwaInstallPrompt";

function isMobileDevice() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.matchMedia("(max-width: 768px)").matches;
}

function isIosSafariBrowser() {
  const ua = navigator.userAgent;
  const isIos = /iPhone|iPad|iPod/i.test(ua);
  const isSafari = /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua);

  return isIos && isSafari;
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(() => document.documentElement.dataset.theme === "dracula");
  const [isMobile, setIsMobile] = useState(() => isMobileDevice());
  const [isIosSafari, setIsIosSafari] = useState(() => isIosSafariBrowser());
  const [showIosInstallHelp, setShowIosInstallHelp] = useState(false);
  const { canInstall, isInstalled, promptInstall } = usePwaInstallPrompt();
  const navigate = useNavigate();
  const location = useLocation();
  const currentTool = tools.find((t) => t.path === location.pathname);
  const installLabel = isMobile ? "ホーム画面に追加" : "アプリをインストール";
  const isInstallActionAvailable = canInstall || isIosSafari;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const updateDeviceState = () => {
      setIsMobile(isMobileDevice());
      setIsIosSafari(isIosSafariBrowser());
    };

    updateDeviceState();
    mediaQuery.addEventListener("change", updateDeviceState);

    return () => {
      mediaQuery.removeEventListener("change", updateDeviceState);
    };
  }, []);

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const installApp = async () => {
    if (!canInstall) {
      if (isIosSafari) {
        setShowIosInstallHelp((current) => !current);
      }
      return;
    }

    await promptInstall();
    setShowIosInstallHelp(false);
    setOpen(false);
  };

  return (
    <>
      <header className="navbar bg-base-100 shadow-sm">
        <div className="flex-none">
          <button
            type="button"
            className="btn btn-square btn-ghost"
            onClick={() => setOpen(!open)}
            aria-label="メニュー"
          >
            <Icon icon="fa6-solid:bars" className="size-4" />
          </button>
        </div>
        <div className="flex-1">
          <Link to="/" className="text-lg font-extrabold">
            スロツール+{currentTool ? ` ${currentTool.title}` : ""}
          </Link>
        </div>
        <div className="flex-none flex items-center gap-1">
          <a
            href="https://www.buymeacoffee.com/ashcolor"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary rounded-full"
            title="🍺奢る"
          >
            🍻奢る
          </a>
          <button
            type="button"
            className="btn btn-square btn-ghost"
            onClick={() => {
              const next = dark ? "corporate" : "dracula";
              document.documentElement.dataset.theme = next;
              localStorage.setItem("theme", next);
              setDark(!dark);
            }}
            aria-label="テーマ切替"
          >
            {dark ? (
              <Icon icon="bi:moon" className="size-5" />
            ) : (
              <Icon icon="bi:sun" className="size-5" />
            )}
          </button>
        </div>
      </header>

      {open && <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setOpen(false)} />}

      <div
        className={`fixed top-0 left-0 h-full w-64 bg-base-100 shadow-xl z-50 transition-transform duration-200 flex flex-col ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="px-4 py-3 border-b border-base-300 flex items-center gap-2">
          <img src="/logo.png" alt="ロゴ" className="size-10" />
          <span className="text-lg font-extrabold">スロツール+</span>
        </div>
        <div>
          <ul className="menu w-full">
            <li>
              <button type="button" onClick={() => go("/")} className="font-semibold">
                TOP
              </button>
            </li>
            {tools.map((t) => (
              <li key={t.path}>
                <button type="button" onClick={() => go(t.path)} className="font-semibold">
                  <span>{t.emoji}</span>
                  <span>{t.title}</span>
                </button>
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
              {isIosSafari && !canInstall && showIosInstallHelp && (
                <p className="mt-2 text-xs leading-relaxed opacity-80">
                  Safari下部の共有ボタンから「ホーム画面に追加」を選んで追加してください。
                </p>
              )}
            </div>
          )}
          <div className="border-t border-base-300" />
          <div className="p-4 flex items-center justify-center">
            <a
              href="https://x.com/ashcolor06"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-ghost btn-square"
              title="X (Twitter)"
            >
              <Icon icon="fa6-brands:x-twitter" className="size-4" />
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
