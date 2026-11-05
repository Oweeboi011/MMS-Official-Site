// Cloud Functions for project mms-official-site-513809 (ADR 0005).
import { setGlobalOptions } from 'firebase-functions/v2';
import { onMessagePublished } from 'firebase-functions/v2/pubsub';
import { logger } from 'firebase-functions';
import { CloudBillingClient } from '@google-cloud/billing';
import { shouldDisableBilling } from './budget.js';

setGlobalOptions({ region: 'asia-southeast1', maxInstances: 2, memory: '256MiB' });

const billing = new CloudBillingClient();

// Billing hard stop: the US$1.70/month budget publishes to `billing-budget`; at or over budget, unlink billing.
// Functions and other Blaze-only services stop until an Owner re-links billing (Firebase console → Usage and billing).
export const billingHardStop = onMessagePublished('billing-budget', async (event) => {
  let notification;
  try {
    notification = event.data.message.json;
  } catch {
    notification = undefined; // non-JSON test publish → treated as malformed, no-op
  }
  if (!shouldDisableBilling(notification)) {
    logger.info('Budget OK', { cost: notification?.costAmount, budget: notification?.budgetAmount });
    return;
  }
  const project = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT;
  if (!project) {
    logger.error('Billing hard stop: project id missing, cannot unlink billing', { cost: notification.costAmount });
    throw new Error('project id missing'); // fail loudly: retried + visible in error reporting
  }
  const name = `projects/${project}`;
  const [info] = await billing.getProjectBillingInfo({ name });
  if (!info.billingEnabled) {
    logger.info('Billing already disabled', { name });
    return;
  }
  await billing.updateProjectBillingInfo({ name, projectBillingInfo: { billingAccountName: '' } });
  logger.warn('Billing DISABLED: budget reached', { name, cost: notification.costAmount, budget: notification.budgetAmount });
});
