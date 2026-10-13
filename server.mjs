import { createReadStream } from "node:fs";
import { access, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const host = process.env.HOST || "0.0.0.0";
const parsedPort = Number.parseInt(process.env.PORT || "8080", 10);
const port = Number.isInteger(parsedPort) && parsedPort > 0 && parsedPort < 65536
  ? parsedPort
  : 8080;

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".gif", "image/gif"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml; charset=utf-8"],
  [".webp", "image/webp"]
]);

function setSecurityHeaders(response) {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "SAMEORIGIN");
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
}

function localPath(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }

  const relative = normalize(decoded).replace(/^([/\\])+/, "");
  const candidate = join(root, relative);
  return candidate.startsWith(root) ? candidate : null;
}

async function readableFile(path) {
  try {
    await access(path);
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

export function createAppServer() {
  return createServer(async (request, response) => {
    setSecurityHeaders(response);

    if (!request.url || !["GET", "HEAD"].includes(request.method || "")) {
      response.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Method not allowed\n");
      return;
    }

    const url = new URL(request.url, "http://localhost");

    if (url.pathname === "/healthz") {
      response.writeHead(200, {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Content-Type": "text/plain; charset=utf-8"
      });
      response.end(request.method === "HEAD" ? undefined : "ok\n");
      return;
    }

    const requested = url.pathname === "/" ? "/index.html" : url.pathname;
    let filePath = localPath(requested);
    if (!filePath) {
      response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Bad request\n");
      return;
    }

    if (!(await readableFile(filePath))) {
      const looksLikeAsset = extname(url.pathname) !== "";
      if (looksLikeAsset) {
        response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Not found\n");
        return;
      }
      filePath = join(root, "index.html");
    }

    const extension = extname(filePath).toLowerCase();
    const isAsset = !["", ".html"].includes(extension);
    response.writeHead(200, {
      "Cache-Control": isAsset
        ? "public, max-age=604800, immutable"
        : "no-cache, no-store, must-revalidate",
      "Content-Type": contentTypes.get(extension) || "application/octet-stream"
    });

    if (request.method === "HEAD") {
      response.end();
      return;
    }

    createReadStream(filePath).pipe(response);
  });
}

if (process.env.NODE_ENV !== "test") {
  const server = createAppServer();
  server.listen(port, host, () => {
    console.log(`KubeScope listening on http://${host}:${port}`);
  });

  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.on(signal, () => {
      server.close(() => process.exit(0));
    });
  }
}
