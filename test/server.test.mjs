import assert from "node:assert/strict";
import { after, before, test } from "node:test";

process.env.NODE_ENV = "test";
const { createAppServer } = await import("../server.mjs");

let baseUrl;
let server;

before(async () => {
  server = createAppServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
});

test("serves the visualizer", async () => {
  const response = await fetch(`${baseUrl}/`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /^text\/html/);
  assert.match(await response.text(), /KubeScope/i);
});

test("exposes an uncached health endpoint", async () => {
  const response = await fetch(`${baseUrl}/healthz`);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-cache, no-store, must-revalidate");
  assert.equal(await response.text(), "ok\n");
});

test("supports client-side routes and rejects missing assets", async () => {
  assert.equal((await fetch(`${baseUrl}/learn/beginner`)).status, 200);
  assert.equal((await fetch(`${baseUrl}/missing.js`)).status, 404);
});
