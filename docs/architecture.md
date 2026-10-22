# Architecture

Telegram Bot API ↔ Cloudflare Worker ↔ Salesforce REST API.

The initial bootstrap exposes only `GET /health`. Telegram webhook, Salesforce OAuth and outbound messaging will be implemented in separate reviewed changes.

## Security

Never commit Telegram tokens, Salesforce credentials or Cloudflare API tokens. Use Cloudflare Worker secrets and GitHub Actions secrets. Verify Telegram webhook secret headers and authorize Salesforce operations before processing messages.
