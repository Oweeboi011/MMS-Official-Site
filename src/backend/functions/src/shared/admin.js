// Admin SDK + global options for every function. Imported first by index.js
// so initializeApp() runs before any getAuth()/getFirestore().
import { setGlobalOptions } from "firebase-functions/v2";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

initializeApp();

// A club-sized app never needs more than a handful of concurrent instances;
// the cap bounds what a runaway trigger loop or a flood of calls can bill.
// No minInstances — idle warm instances are charged around the clock.
setGlobalOptions({ region: "asia-southeast1", maxInstances: 5, memory: "256MiB" });

const adminAuth = getAuth();
const db = getFirestore("openclimbs");

export { db, adminAuth };
