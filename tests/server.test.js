import { test, describe } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";

// We test the server's HTTP behavior by starting it on a random port,
// making requests, and checking responses.
// The server is expected to be at server.js in the repo root.

describe("server.js - HTTP server", () => {
  let server;
  let baseUrl;

  function startServer(env = {}) {
    // We need to start the server. Since server.js is the entry point,
    // we'll use a child process or require it.
    // For simplicity in tests, we'll assume server.js exports a function
    // or we can use a child process.
    // Let's use a child process approach for isolation.
    return new Promise((resolve, reject) => {
      const { spawn } = require("child_process");
      const child = spawn("node", ["server.js"], {
        env: { ...process.env, ...env },
        stdio: ["pipe", "pipe", "pipe"],
      });

      let output = "";
      child.stdout.on("data", (data) => {
        output += data.toString();
        // Look for "Server running on port XXXX"
        const match = data.toString().match(/Server running on port (\d+)/);
        if (match) {
          const port = match[1];
          baseUrl = `http://localhost:${port}`;
          resolve({ child, port });
        }
      });

      child.stderr.on("data", (data) => {
        // Ignore stderr for now
      });

      child.on("error", reject);

      // Timeout in case server doesn't start
      setTimeout(() => {
        reject(new Error("Server failed to start within 5 seconds"));
      }, 5000);
    });
  }

  function makeRequest(path, method = "GET", body = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, baseUrl);
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method,
        headers: {},
      };

      if (body) {
        options.headers["Content-Type"] = "application/json";
        options.headers["Content-Length"] = Buffer.byteLength(body);
      }

      const req = http.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
          });
        });
      });

      req.on("error", reject);

      if (body) {
        req.write(body);
      }

      req.end();
    });
  }

  test("REQ-01: serves index.html on GET /", async () => {
    const { child } = await startServer();
    try {
      const res = await makeRequest("/");
      assert.strictEqual(res.statusCode, 200);
      assert.ok(res.body.includes("<!DOCTYPE html>"));
      assert.ok(res.body.includes("etiqueta-nutri"));
    } finally {
      child.kill();
    }
  });

  test("REQ-02: POST /api/extract returns OCR unavailable when no AI key", async () => {
    const { child } = await startServer({});
    try {
      const res = await makeRequest("/api/extract", "POST", JSON.stringify({}));
      assert.strictEqual(res.statusCode, 200);
      const json = JSON.parse(res.body);
      assert.strictEqual(json.error, "OCR no disponible");
    } finally {
      child.kill();
    }
  });

  test("REQ-03: POST /api/extract with AI key returns structured data", async () => {
    const { child } = await startServer({ AI_KEY: "test-key" });
    try {
      // Use the Schär fixture from fixtures.js - but we can't import it here easily
      // Let's send a minimal valid request
      const res = await makeRequest(
        "/api/extract",
        "POST",
        JSON.stringify({
          image: "base64data",
        })
      );
      assert.strictEqual(res.statusCode, 200);
      const json = JSON.parse(res.body);
      // The server should call the AI adapter and return parsed data
      // Since we don't have the actual AI, we expect a structure
      assert.ok(json.rows || json.warnings || json.product);
    } finally {
      child.kill();
    }
  });

  test("REQ-04: 404 for unknown paths", async () => {
    const { child } = await startServer({});
    try {
      const res = await makeRequest("/unknown");
      assert.strictEqual(res.statusCode, 404);
    } finally {
      child.kill();
    }
  });
});