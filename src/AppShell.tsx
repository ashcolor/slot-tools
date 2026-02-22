import { useState } from "react";
import { Route, Routes, useLocation } from "react-router";
import { Header } from "./components/Header";
import { Home } from "./routes/Home";
import { Memo } from "./routes/Memo";
import { Noriuchi } from "./routes/Noriuchi";

export function AppShell() {
  const location = useLocation();
  const [isMemoEditing, setIsMemoEditing] = useState(false);
  const shouldHideHeader = location.pathname === "/slot-memo" && isMemoEditing;
  const routeContainerClass = shouldHideHeader ? "p-0" : "max-w-4xl mx-auto p-2 sm:p-4";

  return (
    <>
      {!shouldHideHeader ? <Header /> : null}
      <div className={routeContainerClass}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/slot-memo" element={<Memo onEditingChange={setIsMemoEditing} />} />
          <Route path="/noriuchi" element={<Noriuchi />} />
        </Routes>
      </div>
    </>
  );
}
