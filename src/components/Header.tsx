import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { Icon } from "@iconify/react";
import { tools } from "../tools";

export function Header() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(
    () => document.documentElement.dataset.theme === "dark"
  );
  const navigate = useNavigate();
  const location = useLocation();
  const currentTool = tools.find((t) => t.path === location.pathname);

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
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
            パチスロツール{currentTool ? ` ${currentTool.title}` : ""}
          </Link>
        </div>
        <div className="flex-none">
          <button
            type="button"
            className="btn btn-square btn-ghost"
            onClick={() => {
              const next = dark ? "light" : "dark";
              document.documentElement.dataset.theme = next;
              localStorage.setItem("theme", next);
              setDark(!dark);
            }}
            aria-label="テーマ切替"
          >
            {dark ? (
              <Icon icon="bi:moon" className="h-5 w-5" />
            ) : (
              <Icon icon="bi:sun" className="h-5 w-5" />
            )}
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setOpen(false)} />
      )}

      <div className={`fixed top-0 left-0 h-full w-64 bg-base-100 shadow-xl z-50 transition-transform duration-200 flex flex-col ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="px-4 py-3 border-b border-base-300 flex items-center gap-2">
          <img src="/logo.png" alt="ロゴ" className="h-10 w-10" />
          <span className="text-lg font-extrabold">パチスロツール</span>
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
          <div className="border-t border-base-300" />
          <div className="p-4 flex justify-center">
            <a
              href="https://www.buymeacoffee.com/ashcolor"
              target="_blank"
              rel="noopener noreferrer"
              title="Buy me a coffee"
            >
              <img
                src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
                alt="Buy Me A Coffee"
                className="h-8"
              />
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
