import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import { Header } from "./components/Header";
import { Home } from "./routes/Home";
import { Noriuchi } from "./routes/Noriuchi";
import { Memo } from "./routes/Memo";
import "./index.css";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Header />
      <div className="max-w-4xl mx-auto p-2 sm:p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/slot-memo" element={<Memo />} />
          <Route path="/noriuchi" element={<Noriuchi />} />
        </Routes>
      </div>
    </BrowserRouter>
  </StrictMode>,
);
