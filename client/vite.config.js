import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
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

    // Fast image optimization - minimal build time impact
    ViteImageOptimizer({
      webp: {
        quality: 60, // Reduced quality for smaller files
        method: 1, // Fastest method
      },
      jpg: {
        quality: 60, // Reduced quality for better compression
        progressive: true,
      },
      png: {
        quality: 60, // Reduced quality for better compression
        compressionLevel: 3, // Even faster compression
      },
      svg: {
        // Disable SVG optimization for speed (SVGs are already small)
        plugins: [],
      },
      cache: true,
      cacheLocation: "node_modules/.cache/vite-plugin-image-optimizer",
      include: /\.(webp|jpg|jpeg)$/i, // Exclude SVGs for speed
      exclude: /node_modules/,
      generateAVIF: false,
      // Add max file size limit to prevent overly large images
      maxSize: 1024 * 1024, // 1MB limit
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
    cssCodeSplit: true,
    target: "es2015",
    minify: "terser",
    sourcemap: false, // Disable sourcemaps for faster builds
    chunkSizeWarningLimit: 600, // Increase to reduce warnings

    // Manual chunk splitting for better performance
    rollupOptions: {
      output: {
        manualChunks: {
          // Core vendor chunks - critical for initial load
          "react-vendor": ["react", "react-dom", "react-is"],
          "react-router": ["react-router-dom"],
          "redux": ["@reduxjs/toolkit", "react-redux"],
          
          // UI libraries - commonly used
          "ui-libs": ["react-hot-toast", "react-icons", "lucide-react"],
          "forms": ["react-select"],
          
          // Heavy libraries - split and lazy loaded
          "maps": ["leaflet", "react-leaflet", "@react-google-maps/api"],
          "editors": ["@tiptap/react", "@tiptap/starter-kit", "@tinymce/tinymce-react"],
          "charts": ["recharts"],
          "documents": ["jspdf", "jspdf-autotable", "xlsx"],
          "animation": ["gsap"],
          "auth": ["@react-oauth/google"],
          
          // Split heavy utilities
          "html2canvas": ["html2canvas"],
          "dompurify": ["isomorphic-dompurify"],
          "date-utils": ["date-fns"],
          "query-string": ["query-string"],
          "socket": ["socket.io-client"],
          "axios": ["axios"],
          
          // Additional optimization chunks
          "framer-motion": ["framer-motion"],
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
