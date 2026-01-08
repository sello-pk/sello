import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";
import path from "path";
import { fileURLToPath } from "url";

// Fix for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  base: "/",
  plugins: [
    react(),

    // Copy _redirects for Netlify/Vercel
    viteStaticCopy({
      targets: [{ src: "public/_redirects", dest: "." }],
    }),
  ],

  resolve: {
    dedupe: ["react", "react-dom"], // ensure single React instance
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@redux": path.resolve(__dirname, "./src/redux"),
      "@contexts": path.resolve(__dirname, "./src/contexts"),
    },
  },

  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
    cors: true,
    headers: {
      "Cross-Origin-Opener-Policy": "unsafe-none",
      "Cross-Origin-Embedder-Policy": "unsafe-none",
    },
  },

  build: {
    target: "es2015",
    minify: "terser",
    sourcemap: true,
    chunkSizeWarningLimit: 800,

    // Manual chunk splitting for better performance
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          "react-vendor": ["react", "react-dom", "react-is"],
          "react-router": ["react-router-dom"],
          redux: ["@reduxjs/toolkit", "react-redux"],
          "ui-libs": ["react-hot-toast", "react-icons"],

          // Maps and location
          maps: ["leaflet", "react-leaflet", "@react-google-maps/api"],

          // Rich text and editors
          editors: [
            "@tiptap/react",
            "@tiptap/starter-kit",
            "@tiptap/extension-image",
            "@tiptap/extension-link",
            "@tiptap/extension-text-align",
            "@tiptap/extension-underline",
            "@tinymce/tinymce-react",
          ],

          // Charts and data visualization
          charts: ["recharts"],

          // PDF and document generation
          documents: ["jspdf", "jspdf-autotable", "xlsx"],

          // Utils and helpers
          utils: [
            "date-fns",
            "query-string",
            "js-cookie",
            "isomorphic-dompurify",
            "gsap",
          ],

          // Authentication
          auth: ["@react-oauth/google"],

          // Styling
          styling: ["styled-components"],
        },
      },
    },

    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },

  optimizeDeps: {
    include: [
      "@tiptap/react",
      "@tiptap/starter-kit",
      "@tiptap/extension-image",
      "@tiptap/extension-link",
      "@tiptap/extension-text-align",
      "@tiptap/extension-underline",
    ],
  },
});
