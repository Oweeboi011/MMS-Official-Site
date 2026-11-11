// Admins publish a member's climb rating as a public review (rules: admins write reviews; feedback is read-only).
import { Timestamp, collection, doc, getDocs, limit, query, setDoc, where } from 'firebase/firestore/lite';
import { reviewFields, toFeedbackRow, type FeedbackRow } from '../data/feedbackReviews';
import { firebase } from './firebase';
import { readOnlyMessage, writesEnabled } from './firebaseEnv';
import { forgetPublicData } from './publicData';

export async function climbFeedback(climbId: string): Promise<FeedbackRow[]> {
  const { db } = firebase();
  const [feedback, reviews] = await Promise.all([
    getDocs(query(collection(db, 'feedback'), where('climbId', '==', climbId), limit(200))),
    getDocs(query(collection(db, 'reviews'), where('climbId', '==', climbId), limit(200))),
  ]);
  const live = new Set(reviews.docs.filter((d) => d.data().published === true).map((d) => d.id));
  return feedback.docs.map((d) => toFeedbackRow(d.id, d.data(), live.has(d.id)));
}

export async function setReviewPublished(f: FeedbackRow, climbId: string, climbTitle: string, published: boolean): Promise<void> {
  if (!writesEnabled) throw new Error(readOnlyMessage);
  await setDoc(doc(firebase().db, 'reviews', f.id), { ...reviewFields(f, climbId, climbTitle), published, publishedAt: Timestamp.now() }, { merge: true });
  forgetPublicData();
}
