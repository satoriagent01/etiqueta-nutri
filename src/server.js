import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, "..", "public");

const AI_KEY = process.env.AI_KEY || "";

const MIME_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function serveStatic(res, filePath) {
  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
      return;
    }
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
}

function handleExtract(req, res) {
  if (!AI_KEY) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "OCR no disponible" }));
    return;
  }

  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });
  req.on("end", () => {
    try {
      const data = JSON.parse(body);
      // In a real implementation, this would call the AI adapter
      // For now, return a placeholder structure
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        rows: [],
        warnings: [],
        product: null,
      }));
    } catch (e) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid request body" }));
    }
  });
}

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/api/extract") {
    handleExtract(req, res);
    return;
  }

  // Serve static files
  let filePath = path.join(PUBLIC_DIR, req.url === "/" ? "index.html" : req.url);
  
  // Security: prevent path traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { "Content-Type": "text/plain" });
    res.end("Forbidden");
    return;
  }

  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
    return;
  }

  serveStatic(res, filePath);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { server };