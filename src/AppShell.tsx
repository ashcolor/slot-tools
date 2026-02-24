import { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router";
import { Header } from "./components/Header";
import { Home } from "./routes/Home";
import { Memo } from "./routes/Memo";
import { Noriuchi } from "./routes/Noriuchi";
import { OperatorInfo } from "./routes/OperatorInfo";
import { Contact } from "./routes/Contact";
import { PrivacyPolicy } from "./routes/PrivacyPolicy";

const CANONICAL_ORIGIN = "https://pachi-slot.ashcolor.jp";

function getCanonicalHref(pathname: string) {
  const normalizedPath = pathname === "/" ? "/" : pathname.replace(/\/+$/, "");
  return new URL(normalizedPath, `${CANONICAL_ORIGIN}/`).toString();
}

function syncCanonicalHref(pathname: string) {
  const canonicalHref = getCanonicalHref(pathname);
  const existing = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (existing) {
    existing.setAttribute("href", canonicalHref);
    return;
  }

  const link = document.createElement("link");
  link.setAttribute("rel", "canonical");
  link.setAttribute("href", canonicalHref);
  document.head.append(link);
}

export function AppShell() {
  const location = useLocation();
  const [isMemoEditing, setIsMemoEditing] = useState(false);
  const shouldHideHeader = location.pathname === "/memo" && isMemoEditing;
  const routeContainerClass = shouldHideHeader ? "p-0" : "max-w-4xl mx-auto p-2 sm:p-4";

  useEffect(() => {
    syncCanonicalHref(location.pathname);
  }, [location.pathname]);

  return (
    <>
      {!shouldHideHeader ? <Header /> : null}
      <div className={routeContainerClass}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/memo" element={<Memo onEditingChange={setIsMemoEditing} />} />
          <Route path="/noriuchi" element={<Noriuchi />} />
          <Route path="/operator" element={<OperatorInfo />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
        </Routes>
      </div>
    </>
  );
}
