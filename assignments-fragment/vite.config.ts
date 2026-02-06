import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs/promises";
import path from "node:path";
import mkcert from "vite-plugin-mkcert";

// https://vite.dev/config/
export default defineConfig({
  // base is required for asset paths when called via gateway
  base: "/assignments/",
  plugins: [
    react(),
    mkcert(),
    {
      name: "serve-assignments-fragment-spa-route",
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          const url = req.url ?? "/";

          if (url === "/assignments") {
            res.statusCode = 302;
            res.setHeader("Location", "/assignments/");
            res.end();
            return;
          }

          if (!url.startsWith("/assignments/")) {
            next();
            return;
          }

          const acceptHeader = req.headers.accept ?? "";
          const wantsHtml = acceptHeader.includes("text/html");

          const isAssetRequest =
            url.includes(".") ||
            url.startsWith("/assignments/@") ||
            url.startsWith("/assignments/src") ||
            url.startsWith("/assignments/node_modules");

          if (!wantsHtml || isAssetRequest) {
            next();
            return;
          }

          try {
            const indexPath = path.resolve(server.config.root, "index.html");
            let html = await fs.readFile(indexPath, "utf-8");
            html = await server.transformIndexHtml(url, html);
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/html");
            res.end(html);
          } catch (error) {
            next(error);
          }
        });
      },
    },
  ],
  server: {
    port: 5175,
    strictPort: true,
  },
});
