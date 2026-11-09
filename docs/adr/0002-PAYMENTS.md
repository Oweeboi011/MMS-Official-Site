# ADR 0002 — Payments: QR Ph via PayMongo, manual transfer as fallback

> - **Purpose:** A recorded decision: what was chosen and why. Changing it needs a new decision record.
> - **For:** Officers and leads · Owner (accounts, billing) · Developers
> - **In short:** **Replaced by ADR 0007.** The earlier choice of PayMongo for online payments, kept for history.

- **Status:** Superseded by [ADR 0007](0007-PAYMENTS-MANUAL.md) (2026-11-08): no PayMongo.
- **Date:** 2026-10-29

## Context

Officers chase balances and advance their own money for transport and LGU fees. Payments need to be collected before the climb and tracked automatically.

## Decision

- Default **PayMongo QR Ph** (1.34% + VAT). It's the cheapest automated method and works with GCash, Maya, and every bank app.
- Fallback **manual transfer + receipt upload**, verified by a climb officer (₱0).
- Show the convenience fee before payment. Cards off unless asked for (3.125% + ₱13.39).

## Consequences

- No monthly fee, so this doesn't touch the ₱54–₱100 monthly cap ([ADR 0001](0001-HOSTING.md)).
- Needs PayMongo KYC with SEC documents and an MMS bank account.
- Needs a server function (webhook), which drives the phase 2 host choice ([ADR 0001](0001-HOSTING.md)).
