import { describe, expect, it } from "vitest";
import { handleRequest } from "../src/index";

describe("HTTP routes", () => {
  it("returns health status", async () => {
    const response = handleRequest(new Request("https://example.workers.dev/health"));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok", service: "salesforce-telegram-poc" });
  });
  it("returns 404 for unknown routes", () => {
    const response = handleRequest(new Request("https://example.workers.dev/unknown"));
    expect(response.status).toBe(404);
  });
});
