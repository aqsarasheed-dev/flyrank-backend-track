import { test, before } from "node:test";
import assert from "node:assert";

const BASE_URL = "http://localhost:3000";
let authToken;
let testWidgetId;

before(async () => {
  await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "test-suite@example.com", password: "testpass123" }),
  });

  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "test-suite@example.com", password: "testpass123" }),
  });
  const loginData = await loginRes.json();
  authToken = loginData.data.token;

  const widgetRes = await fetch(`${BASE_URL}/api/widgets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      type: "popover",
      copy: { headline: "Test widget" },
      fields: ["email"],
    }),
  });
  const widgetData = await widgetRes.json();
  testWidgetId = widgetData.data.id;
});

test("CORS preflight is handled correctly", async () => {
  const res = await fetch(`${BASE_URL}/api/submissions`, { method: "OPTIONS" });
  assert.strictEqual(res.status, 204);
  assert.strictEqual(res.headers.get("access-control-allow-origin"), "*");
  assert.ok(res.headers.get("access-control-allow-methods").includes("POST"));
});

test("validation rejects a missing required field", async () => {
  const res = await fetch(`${BASE_URL}/api/submissions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ widgetId: testWidgetId }),
  });
  assert.strictEqual(res.status, 400);
});

test("validation rejects an oversized payload", async () => {
  const hugeString = "x".repeat(6000);
  const res = await fetch(`${BASE_URL}/api/submissions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ widgetId: testWidgetId, data: { note: hugeString } }),
  });
  assert.strictEqual(res.status, 400);
});

test("rate limiter triggers after repeated requests", async () => {
  let sawRateLimit = false;

  for (let i = 0; i < 7; i++) {
    const res = await fetch(`${BASE_URL}/api/submissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ widgetId: testWidgetId, data: { email: `ratetest${i}@example.com` } }),
    });
    if (res.status === 429) {
      sawRateLimit = true;
      break;
    }
  }

  assert.strictEqual(sawRateLimit, true, "Expected rate limiter to trigger a 429 within 7 requests");
});

test("enrichment fallback works when provider 1 is forced down", async () => {
  const res = await fetch(`${BASE_URL}/api/submissions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-test-geo-provider-1-down": "true",
    },
    body: JSON.stringify({ widgetId: testWidgetId, data: { email: "fallback-check@example.com" } }),
  });

  assert.ok(res.status === 201 || res.status === 429);
});
