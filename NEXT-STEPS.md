# Bot Growth Suite Status

## 9. Payment Safety

- Eingebaut: Token-Gutschriften unterstuetzen Idempotency Keys.
- Eingebaut: doppelte Grants mit demselben Key werden ignoriert.
- Website v6 sendet Stripe Checkout Session IDs als Idempotency Key.
- Noch offen fuer spaeter: Refunds, Chargebacks und Event-ID-History in einer richtigen Datenbank speichern.
- Noch offen fuer spaeter: Admin-Ansicht/API, um einen User manuell zu pruefen.

## 10. Analytics

- Eingebaut: woechentlicher Staff-Report per `ANALYTICS_WEEKLY_CRON`.
- Eingebaut: aktive VIP Accounts, offene Tickets, Token-Gutschriften, Token-Verbrauch, aktive AI User, Seller Reviews und Top-Aktivitaet.
- Standard-Channel ist `STAFF_LOG_CHANNEL_ID`, kann mit `ANALYTICS_CHANNEL_ID` getrennt werden.
- Noch offen fuer spaeter: Website-Admin-Dashboard mit Login und Langzeit-Charts.
- Noch offen fuer spaeter: automatische Warnungen bei auffaellig vielen kritischen Reviews oder ungewoehnlichem Token-Verbrauch.
