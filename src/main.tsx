import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import { Header } from "./components/Header";
import { Dashboard } from "./routes/Dashboard";
import { Home } from "./routes/Home";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <Header />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/noridachi" element={<Home />} />
        </Routes>
      </div>
    </BrowserRouter>
  </StrictMode>
);
