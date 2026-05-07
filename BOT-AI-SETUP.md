# Railway Bot AI Setup

Dieser Bot enthaelt jetzt:

- Ask-AI-Panel im Channel `1501914878716280833`
- Private AI-Channels pro User
- Token-Guthaben pro Discord-User
- Token-Gutschrift von Vercel nach Stripe-Zahlung
- OpenAI API Verbindung

## Railway Variables

Diese Variablen in Railway beim Bot setzen:

- `TOKEN`
  - dein Discord Bot Token
- `OPENAI_API_KEY`
  - dein OpenAI API Key
- `OPENAI_MODEL`
  - Empfehlung: `gpt-5.4-mini`
- `OPENAI_MAX_OUTPUT_TOKENS`
  - Empfehlung: `900`
- `AI_MIN_OUTPUT_TOKENS`
  - Empfehlung: `32`
  - Mindest-Spielraum fuer eine Antwort, damit sehr kleine Restguthaben nicht sofort eine teure Anfrage starten
- `AI_TOKEN_SAFETY_BUFFER`
  - Empfehlung: `16`
  - kleiner Puffer, weil der Bot die Eingabe vor der Anfrage nur schaetzen kann
- `BOT_SYNC_SECRET`
  - langer geheimer Text, exakt gleich wie in Vercel
- `AI_PANEL_CHANNEL_ID`
  - `1501914878716280833`
- `AI_BUY_TOKENS_URL`
  - `https://www.veloo.org/vip.html#ai-tokens`
- `AI_STARTING_TOKENS`
  - `0`

## Token-Abrechnung

Der Bot zieht nicht mehr pauschal 1 Token pro Frage ab.
Nach jeder OpenAI-Antwort wird `usage.total_tokens` aus der OpenAI API genutzt.
Das bedeutet: Eingabe + Antwort werden zusammen vom Guthaben abgezogen.

Beispiel:

- OpenAI meldet `input_tokens=120`
- OpenAI meldet `output_tokens=430`
- Der Bot zieht `550` AI Tokens ab

Wichtig: Wenn Website-Token exakt OpenAI-Token sind, sind Pakete wie 100 / 500 / 1000 Tokens sehr klein.
Eine normale Antwort kann schnell mehrere hundert bis ueber tausend Tokens verbrauchen.

Optional:

- `AI_CHANNEL_CATEGORY_ID`
  - Kategorie-ID, wenn die privaten AI-Channels in eine bestimmte Discord-Kategorie sollen
- `AI_TOKEN_STORE_PATH`
  - Standard ist `ai-token-store.json`

## Vercel Variables fuer Token Sync

Diese beiden muessen in Vercel bei der Website gesetzt werden:

- `BOT_SYNC_URL`
  - deine Railway Public URL, z.B. `https://dein-bot.up.railway.app`
- `BOT_SYNC_SECRET`
  - exakt derselbe Wert wie in Railway

## Preise

In Stripe als einmalige Produkte anlegen:

- `100 AI Tokens` fuer `4,99 EUR`
- `500 AI Tokens` fuer `14,99 EUR`
- `1000 AI Tokens` fuer `24,99 EUR`

Die Price IDs danach in Vercel setzen:

- `STRIPE_PRICE_ID_TOKENS_100`
- `STRIPE_PRICE_ID_TOKENS_500`
- `STRIPE_PRICE_ID_TOKENS_1000`

VIP-Abo Token-Bonus:

- Monatsabo: `VIP_TOKENS_MONTHLY=50`
- Jahresabo: `VIP_TOKENS_YEARLY=750`
