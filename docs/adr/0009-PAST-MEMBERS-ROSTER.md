# ADR 0009 — Past members roster

> - **Purpose:** A recorded decision: what was chosen and why. Changing it needs a new decision record.
> - **For:** Owner · Data privacy officer (DPO) · Officers and leads · Developers
> - **In short:** Many past members never had a site account, so they can't live in the user list. Proposal: keep them in a private officers-only roster (name and batch only); the public site shows counts, never names, unless a person agreed.

- **Status:** **Proposed**, waiting for the owner and DPO ([#195](https://github.com/Oweeboi011/MMS-Official-Site/issues/195)). Nothing is loaded until this is accepted.
- **Date:** 2026-11-10

## Problem

Past members (name, batch, status) feed member stats (#122), climb history (item 35) and the "active members" number (item 14). `users` can't hold them: a record there needs a sign-in account, and most past members have none. `memberDetails` can't either: it holds private health and contact details per account.

## Proposal

A new `members` collection, one record per person:

| Field | Meaning |
|---|---|
| `name` | as confirmed by MMS |
| `batch` | BMC batch, free text (e.g. a mountain name and year, as MMS writes it) |
| `yearJoined` | optional |
| `status` | `active` or `past` |
| `uid` | optional; set when the person signs up and an officer links the record |

- **Access:** admins read and write; nobody else. No public read in the rules.
- **Public site:** aggregate counts only (extends `siteStats`). A public list of names needs each person's written consent, which stays a separate decision for the DPO.
- **Minimal data (RA 10173):** no contact details, health or dates of birth here. Deletion on request: an admin deletes the record.
- **Entry:** officers or the owner enter records in `/admin` once a members editor exists (same pattern as officers); until then, collect them in a sheet.
- **Linking:** when a past member signs up, an officer sets `uid`; their old climbs then count towards the member's climb history (item 35).

## Why not the alternatives

- **Everything in `users`:** forces fake sign-in accounts, or wipes the line between people who can log in and people who are only on record.
- **A spreadsheet only:** nothing feeds stats or climb history, and the data stays outside the access rules and the audit log.
- **Public roster of names:** needs per-person consent we don't have.

## Decide before building

1. Owner: approve the admin-only roster and counts-only public use.
2. DPO: confirm the field list and retention (keep while the person is on the club record; delete on request).
3. Owner: who supplies the records, and what counts as `active` (item 14).

## Then

Rules + emulator tests, a members editor in `/admin`, stats counts, a loading pass.
