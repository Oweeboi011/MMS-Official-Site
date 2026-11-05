// Pure decision logic for the billing hard stop (ADR 0005). No I/O, so it is unit-tested.

// Budget notifications (Cloud Billing → Pub/Sub) carry costAmount and budgetAmount in the budget's currency.
export function shouldDisableBilling(notification) {
  const cost = Number(notification?.costAmount);
  const budget = Number(notification?.budgetAmount);
  if (!Number.isFinite(cost) || !Number.isFinite(budget) || budget <= 0) return false;
  return cost >= budget;
}
