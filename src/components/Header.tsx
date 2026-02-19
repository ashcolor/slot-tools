import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { tools } from "../tools";

export function Header() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const currentTool = tools.find((t) => t.path === location.pathname);

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <>
      <header className="navbar bg-base-100 border-b border-base-300 px-0 min-h-0 py-2">
        <div className="flex-none">
          <button
            type="button"
            className="btn btn-ghost btn-square btn-sm"
            onClick={() => setOpen(!open)}
            aria-label="メニュー"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        <div className="flex-1">
          <Link to="/" className="text-lg font-extrabold">
            パチスロツール{currentTool ? ` ${currentTool.title}` : ""}
          </Link>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setOpen(false)} />
      )}

      <div className={`fixed top-0 left-0 h-full w-64 bg-base-100 shadow-xl z-50 transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="pt-14">
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
      </div>
    </>
  );
}
