import assert from "node:assert/strict";
import { test } from "node:test";
import { fetchSession } from "./session";

test("session lookup distinguishes signed-out users from backend failures", async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });

  globalThis.fetch = async (_url, options) => {
    assert.equal(options?.credentials, "include");
    assert.ok(options?.signal instanceof AbortSignal);
    return Response.json({ id: 12, username: "researcher" });
  };
  assert.deepEqual(await fetchSession("/api/user"), { id: 12, username: "researcher" });

  globalThis.fetch = async () => new Response(null, { status: 401 });
  assert.equal(await fetchSession("/api/user"), null);

  globalThis.fetch = async () => new Response("<html>Site access required</html>", {
    status: 401,
    headers: { "content-type": "text/html" },
  });
  await assert.rejects(fetchSession("/api/user"), /Unable to connect/);

  for (const status of [404, 502, 503]) {
    globalThis.fetch = async () => new Response("Unavailable", { status });
    await assert.rejects(fetchSession("/api/user"), /Unable to connect/);
  }

  globalThis.fetch = async () => new Response("<html>SPA fallback</html>", {
    headers: { "content-type": "text/html" },
  });
  await assert.rejects(fetchSession("/api/user"), /unexpected response/);

  const controller = new AbortController();
  controller.abort();
  globalThis.fetch = async (_url, options) => {
    options?.signal?.throwIfAborted();
    throw new Error("Expected an aborted request");
  };
  await assert.rejects(fetchSession("/api/user", controller.signal), { name: "AbortError" });
});
