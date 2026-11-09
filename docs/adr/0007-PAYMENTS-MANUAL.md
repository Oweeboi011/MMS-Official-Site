# ADR 0007 — Payments: GCash / QR Ph transfer + receipt upload, no PayMongo

- **Status:** Accepted (owner, 2026-11-08). Supersedes [ADR 0002](0002-PAYMENTS.md).
- **Date:** 2026-11-08

## Context

ADR 0002 picked PayMongo QR Ph (1.34% + VAT per payment, SEC KYC, webhook function). Open Climbs already collects money without a gateway: a GCash QR shown on the page, participant pays in their own app, uploads proof, a climb officer verifies. Firebase stores and secures that flow; it does not process payments itself.

## Decision

- **No payment gateway.** Participant pays the MMS GCash / bank account by QR (QR Ph works from GCash, Maya, any bank app), uploads the receipt (`payment-proofs/`), officer marks it verified. Pay now or later, instalments: as in the old app.
- QR images in Storage (`gcash-qr/`, public read, admin write); amounts and balances computed by functions (`paymentMath.js`), never trusted from the browser.
- Reminders for unpaid balances: existing `sendReminderNotifications`.

## Consequences

- ₱0 per payment, no KYC, no webhook, no extra account or secret. One less vendor.
- Officers verify every receipt by hand; payment status is only as fast as they are. Fake or edited screenshots are possible: officers match reference numbers against the MMS account statement.
- Needs an MMS-owned receiving account (not an officer's personal wallet) and its QR ([open items](../solution-plan/SOLUTION-PLAN.md#open-items)).
- Revisit if receipt checking becomes the bottleneck (many climbs, many joiners): a gateway can be added later behind the same `registrations` payment fields.
