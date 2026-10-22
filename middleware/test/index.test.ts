import { describe, expect, it, vi, afterEach } from "vitest";
import { handleRequest, type Env } from "../src/index";

const env: Env = { TELEGRAM_BOT_TOKEN: "test-token", TELEGRAM_WEBHOOK_SECRET: "test-secret" };
const endpoint = "https://example.workers.dev/webhook/telegram";
function webhook(body: unknown, secret = "test-secret") {
  return new Request(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Telegram-Bot-Api-Secret-Token": secret },
    body: JSON.stringify(body),
  });
}
afterEach(() => vi.unstubAllGlobals());

describe("HTTP routes", () => {
  it("returns health status", async () => {
    const response = await handleRequest(new Request("https://example.workers.dev/health"), env);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok", service: "salesforce-telegram-poc" });
  });
  it("returns 404 for unknown routes", async () => {
    expect((await handleRequest(new Request("https://example.workers.dev/unknown"), env)).status).toBe(404);
  });
  it("rejects webhook without matching secret", async () => {
    expect((await handleRequest(webhook({ message: { text: "/start", chat: { id: 1 } } }, "wrong"), env)).status).toBe(401);
  });
  it("replies to /start through Telegram API", async () => {
    const send = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal("fetch", send);
    const response = await handleRequest(webhook({ message: { text: "/start", chat: { id: 42 } } }), env);
    expect(response.status).toBe(200);
    expect(send).toHaveBeenCalledOnce();
    expect(JSON.parse(send.mock.calls[0][1].body)).toEqual({
      chat_id: 42, text: "Benvenuto nella POC Salesforce + Telegram!",
    });
  });
  it("ignores unsupported updates", async () => {
    const send = vi.fn();
    vi.stubGlobal("fetch", send);
    expect((await handleRequest(webhook({ update_id: 1 }), env)).status).toBe(200);
    expect(send).not.toHaveBeenCalled();
  });
  it("returns 502 when Telegram rejects the reply", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("error", { status: 429 })));
    expect((await handleRequest(webhook({ message: { text: "hello", chat: { id: 42 } } }), env)).status).toBe(502);
  });
});
