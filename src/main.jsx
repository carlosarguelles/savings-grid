import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import SavingsGrid from "./savings-grid.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SavingsGrid />
  </StrictMode>
);
