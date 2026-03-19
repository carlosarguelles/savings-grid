import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Set VITE_BASE_URL to /<repo-name> for GitHub Pages.
// Leave unset for local dev (defaults to "/").
const base = process.env.VITE_BASE_URL ?? "/";

export default defineConfig({
  plugins: [react()],
  base,
});
