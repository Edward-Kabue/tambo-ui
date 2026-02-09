import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { promptApiPlugin } from "./api-plugin";

export default defineConfig({
  plugins: [react(), promptApiPlugin()],
  resolve: {
    alias: {
      "@components": path.resolve(__dirname, "../generated_components"),
    },
    // Ensure Vite resolves deps from preview/node_modules for files
    // imported from ../generated_components (outside project root)
    dedupe: ["react", "react-dom", "three", "@react-three/fiber", "@react-three/drei", "gsap"],
  },
  // Allow Vite to serve files from parent directory (generated_components)
  server: {
    port: 5173,
    open: true,
    fs: {
      allow: [path.resolve(__dirname, "..")],
    },
  },
  // Ensure optimizeDeps covers all the libraries used by generated components
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "three",
      "@react-three/fiber",
      "@react-three/drei",
      "gsap",
      "gsap/ScrollTrigger",
    ],
  },
});
