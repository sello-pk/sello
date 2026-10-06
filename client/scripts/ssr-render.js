import path from "node:path";
import { fileURLToPath } from "node:url";
import { Writable } from "node:stream";
import { createServer as createViteServer } from "vite";
import react from "@vitejs/plugin-react";
import { renderToPipeableStream } from "react-dom/server";

const CLIENT_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function createStorageStub() {
  const data = new Map();
  return {
    getItem: (key) => (data.has(String(key)) ? data.get(String(key)) : null),
    setItem: (key, value) => void data.set(String(key), String(value)),
    removeItem: (key) => void data.delete(String(key)),
    clear: () => data.clear(),
    key: () => null,
    get length() {
      return data.size;
    },
  };
}

/**
 * A few components read localStorage at render time (Navbar token,
 * ThemeContext theme, token helpers). Stub them out minifies the surface:
 * window/document stay undefined so existing `typeof document === "undefined"`
 * guards keep working.
 */
function installClientGlobals() {
  if (globalThis.localStorage === undefined) {
    globalThis.localStorage = createStorageStub();
  }
  if (globalThis.sessionStorage === undefined) {
    globalThis.sessionStorage = createStorageStub();
  }
}

function streamToString(pipe) {
  return new Promise((resolve, reject) => {
    let html = "";
    const writable = new Writable({
      write(chunk, _encoding, callback) {
        html += chunk.toString();
        callback();
      },
      final(callback) {
        resolve(html);
        callback();
      },
    });
    writable.on("error", reject);
    pipe(writable);
  });
}

/**
 * Render the React tree to static markup. During render, globalThis.fetch is
 * swapped for a never-resolving stub: components refetch on mount
 * (refetchOnMountOrArgChange: true) and would otherwise hit the network and
 * overwrite (or fail) the store we seeded from real API data.
 */
function renderTreeToString(tree, timeoutMs = 60_000) {
  return new Promise((resolve, reject) => {
    const realFetch = globalThis.fetch;
    globalThis.fetch = () => new Promise(() => {});
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        reject(new Error("SSR render timed out"));
        try {
          stream.abort();
        } catch {
          /* noop */
        }
      }
    }, timeoutMs);

    let stream;
    const finish = (promise) => {
      promise.then(
        (html) => {
          if (!settled) {
            settled = true;
            clearTimeout(timer);
            globalThis.fetch = realFetch;
            resolve(html);
          }
        },
        (error) => {
          if (!settled) {
            settled = true;
            clearTimeout(timer);
            globalThis.fetch = realFetch;
            reject(error);
          }
        },
      );
    };

    try {
      stream = renderToPipeableStream(tree, {
        onAllReady() {
          finish(streamToString(stream.pipe));
        },
        onError(error) {
          finish(Promise.reject(error));
        },
      });
    } catch (error) {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        globalThis.fetch = realFetch;
        reject(error);
      }
    }
  });
}

export async function createRenderer() {
  const server = await createViteServer({
    root: CLIENT_ROOT,
    logLevel: "error",
    appType: "custom",
    server: {
      middlewareMode: true,
      hmr: false,
      watch: { ignored: ["**/dist/**"] },
    },
    plugins: [react()],
    resolve: {
      dedupe: ["react", "react-dom", "react-is", "react-redux"],
      alias: [
        // Project aliases (must be repeated here; inline config replaces the vite.config.js aliases)
        { find: "@", replacement: path.join(CLIENT_ROOT, "src") },
        {
          find: "@components",
          replacement: path.join(CLIENT_ROOT, "src/components"),
        },
        { find: "@pages", replacement: path.join(CLIENT_ROOT, "src/pages") },
        { find: "@utils", replacement: path.join(CLIENT_ROOT, "src/utils") },
        {
          find: "@assets",
          replacement: path.join(CLIENT_ROOT, "src/assets"),
        },
        { find: "@hooks", replacement: path.join(CLIENT_ROOT, "src/hooks") },
        { find: "@redux", replacement: path.join(CLIENT_ROOT, "src/redux") },
        {
          find: "@contexts",
          replacement: path.join(CLIENT_ROOT, "src/contexts"),
        },
        // react-router v7 ships dual builds; Node ESM resolves to the CJS dist and
        // crashes on named exports (StaticRouter etc). Pin every router import to
        // the bundled ESM dists (react-router-dom imports "react-router/dom").
        {
          find: /^react-router-dom$/,
          replacement: path.join(
            CLIENT_ROOT,
            "node_modules/react-router-dom/dist/index.mjs",
          ),
        },
        {
          find: /^react-router\/dom$/,
          replacement: path.join(
            CLIENT_ROOT,
            "node_modules/react-router/dist/development/dom-export.mjs",
          ),
        },
        {
          find: /^react-router$/,
          replacement: path.join(
            CLIENT_ROOT,
            "node_modules/react-router/dist/development/index.mjs",
          ),
        },
      ],
    },
  });

  installClientGlobals();
  const entry = await server.ssrLoadModule("/scripts/ssr-entry.jsx");

  return {
    entry,
    async renderRoute(location, store) {
      const resolvedStore = store || entry.createAppStore();
      const tree = entry.createTree(resolvedStore, location || "/");
      return renderTreeToString(tree);
    },
    async close() {
      await server.close();
    },
  };
}