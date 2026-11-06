// Cloud Functions for project mms-official-site-513809 (ADR 0005): billing hard stop + Open Climbs (ported).
import './shared/admin.js';
import { onMessagePublished } from 'firebase-functions/v2/pubsub';
import { logger } from 'firebase-functions';
import { CloudBillingClient } from '@google-cloud/billing';
import { shouldDisableBilling } from './budget.js';

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

// Open Climbs (ported from mms-open-climbs). Not ported: ogPrerender, cspReport (Firebase Hosting rewrites).
export { onRegistrationCreated, onRegistrationUpdated, onRegistrationDeleted } from './triggers/registrations.js';
export { onRegistrationDetailsWritten } from './triggers/memberDetails.js';
export { onClimbUpdated } from './triggers/climbs.js';
export { sendReminderNotifications } from './scheduled/reminders.js';
export { syncAdminClaim } from './triggers/adminClaim.js';
export { ensureAdminClaim, createUser, updateUserProfile, deleteUserAccount } from './callables/users.js';
export { sendReleaseNoteEmail, previewReleaseNoteEmail, getReleaseNoteCommitOptions, generateReleaseNoteDraft } from './callables/releaseNotes.js';
export { onReleaseNoteEmailJobCreated } from './triggers/releaseNoteEmailJobs.js';
export { getEmailStats, getStorageUsage, getFunctionHealth, getBillingCost } from './callables/insights.js';
