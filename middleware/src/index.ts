export interface Env {
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_WEBHOOK_SECRET: string;
}

export function handleRequest(request: Request): Response {
  const url = new URL(request.url);
  if (request.method === "GET" && url.pathname === "/health") {
    return Response.json({ status: "ok", service: "salesforce-telegram-poc" });
  }
  return new Response("Not found", { status: 404 });
}

export default {
  fetch(request: Request, _env: Env): Response {
    return handleRequest(request);
  },
};
