export interface Env {
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_WEBHOOK_SECRET: string;
}

interface TelegramUpdate {
  message?: { text?: string; chat?: { id?: number } };
}

export async function handleRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  if (request.method === "GET" && url.pathname === "/health") {
    return Response.json({ status: "ok", service: "salesforce-telegram-poc" });
  }
  if (url.pathname !== "/webhook/telegram" || request.method !== "POST") {
    return new Response("Not found", { status: 404 });
  }

  const secret = request.headers.get("X-Telegram-Bot-Api-Secret-Token");
  if (!env.TELEGRAM_WEBHOOK_SECRET || secret !== env.TELEGRAM_WEBHOOK_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }
  if (!env.TELEGRAM_BOT_TOKEN) {
    return new Response("Missing bot configuration", { status: 503 });
  }

  let update: TelegramUpdate;
  try {
    update = (await request.json()) as TelegramUpdate;
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const chatId = update.message?.chat?.id;
  const message = update.message?.text;
  if (chatId === undefined || !message) return new Response("OK");

  const reply = message.split(/\s+/)[0].split("@")[0] === "/start"
    ? "Benvenuto nella POC Salesforce + Telegram!"
    : `Hai scritto: ${message}`;

  try {
    const result = await fetch(
      `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: reply }),
      },
    );
    if (!result.ok) return new Response("Telegram API error", { status: 502 });
  } catch {
    return new Response("Telegram unavailable", { status: 502 });
  }
  return new Response("OK");
}

export default {
  fetch(request: Request, env: Env): Promise<Response> {
    return handleRequest(request, env);
  },
};
