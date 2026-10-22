# Telegram webhook setup

1. Create the bot with [BotFather](https://t.me/BotFather).
2. In Cloudflare Worker **Settings → Variables and Secrets**, add encrypted secrets:
   - `TELEGRAM_BOT_TOKEN`: the BotFather token.
   - `TELEGRAM_WEBHOOK_SECRET`: a random 32+ character string using letters, digits, underscore and hyphen.
3. Register the webhook with Telegram's `setWebhook` method using an authenticated HTTPS POST request. Supply:
   - `url`: `https://salesforce-telegram-poc.tiziano-tammaro.workers.dev/webhook/telegram`
   - `secret_token`: the exact value of `TELEGRAM_WEBHOOK_SECRET`
   - `allowed_updates`: `["message"]`
4. Confirm registration using Telegram `getWebhookInfo`. Open the bot chat and send `/start`.

**Security:** Never commit or share bot tokens. Do not put the bot token in screenshots, shell history, or a public URL. The webhook is public, but verifies the `X-Telegram-Bot-Api-Secret-Token` header. This bootstrap has no durable update deduplication: a retried update may produce duplicate replies. Add deduplication before implementing Salesforce mutations.
