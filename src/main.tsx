import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import { Header } from "./components/Header";
import { Home } from "./routes/Home";
import { Noriuchi } from "./routes/Noriuchi";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Header />
      <div className="max-w-4xl mx-auto px-4 pb-8 pt-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/noriuchi" element={<Noriuchi />} />
        </Routes>
      </div>
    </BrowserRouter>
  </StrictMode>
);
