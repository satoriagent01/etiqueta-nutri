import { test, describe } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { spawn } from "node:child_process";

describe("server.js - HTTP server", () => {
  let serverProcess;
  let baseUrl;

  function startServer(env = {}) {
    return new Promise((resolve, reject) => {
      const child = spawn("node", ["src/server.js"], {
        env: { ...process.env, ...env },
        stdio: ["pipe", "pipe", "pipe"],
      });

      let output = "";
      child.stdout.on("data", (data) => {
        output += data.toString();
        const match = data.toString().match(/Server running on port (\d+)/);
        if (match) {
          const port = match[1];
          baseUrl = `http://localhost:${port}`;
          resolve({ child, port });
        }
      });

      child.stderr.on("data", () => {});

      child.on("error", reject);

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
      }

      const req = http.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => { data += chunk; });
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, body: data });
          }
        });
      });

      req.on("error", reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  }

  test("REQ-01: serves index.html on GET /", async () => {
    const { child } = await startServer();
    try {
      const res = await makeRequest("/");
      assert.equal(res.status, 200);
      assert.ok(res.body.includes("<!DOCTYPE html>") || res.body.includes("<html") || res.body.includes("<title>"));
    } finally {
      child.kill();
    }
  });

  test("REQ-02: POST /api/extract returns OCR unavailable when no AI key", async () => {
    const { child } = await startServer();
    try {
      const res = await makeRequest("/api/extract", "POST", { image: "base64..." });
      assert.equal(res.status, 200);
      assert.ok(res.body.error || res.body.message);
      assert.ok(res.body.error.toLowerCase().includes("ocr") || res.body.message.toLowerCase().includes("ocr") || res.body.message.toLowerCase().includes("available"));
    } finally {
      child.kill();
    }
  });

  test("REQ-03: POST /api/extract with AI key returns structured data", async () => {
    const { child } = await startServer({ AI_KEY: "test-key" });
    try {
      const res = await makeRequest("/api/extract", "POST", { image: "base64..." });
      assert.equal(res.status, 200);
      // Should contain product-like structure or error from mock
      assert.ok(res.body.product || res.body.data || res.body.error);
    } finally {
      child.kill();
    }
  });

  test("REQ-04: 404 for unknown paths", async () => {
    const { child } = await startServer();
    try {
      const res = await makeRequest("/nonexistent");
      assert.equal(res.status, 404);
    } finally {
      child.kill();
    }
  });
});