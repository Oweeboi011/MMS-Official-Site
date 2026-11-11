// Sportfest scoreboard data (rules: signed-in members read; admins write). Games and scores are separate collections.
import { addDoc, collection, doc, getDocs, limit, query, updateDoc, where, writeBatch } from 'firebase/firestore/lite';
import { scoreRows, toGame, toScore, type Game, type Placements, type Score } from '../data/sportfest';
import { firebase } from './firebase';
import { readOnlyMessage, writesEnabled } from './firebaseEnv';

const games = () => collection(firebase().db, 'sportfestGames');
const scores = () => collection(firebase().db, 'sportfestScores');
const assertWritable = () => { if (!writesEnabled) throw new Error(readOnlyMessage); };

export async function loadGames(): Promise<Game[]> {
  return (await getDocs(query(games(), limit(300)))).docs.map((d) => toGame(d.id, d.data()));
}

export async function loadScores(): Promise<Score[]> {
  return (await getDocs(query(scores(), limit(2000)))).docs.flatMap((d) => toScore(d.id, d.data()) ?? []);
}

export type GameInput = Pick<Game, 'name' | 'category' | 'date' | 'status' | 'gameClass' | 'maxPoints' | 'year'>;

export async function saveGame(id: string | null, input: GameInput): Promise<void> {
  assertWritable();
  const data = { ...input, name: input.name.trim().slice(0, 120), category: input.category.trim().slice(0, 60), date: input.date.trim().slice(0, 30) };
  if (id) await updateDoc(doc(firebase().db, 'sportfestGames', id), data);
  else await addDoc(games(), data);
}

// A game's results are replaced as a whole (and re-priced if the game's class or points changed): one batch.
export async function saveResults(game: Game, placements: Placements): Promise<void> {
  assertWritable();
  const { db } = firebase();
  const batch = writeBatch(db);
  (await getDocs(query(scores(), where('gameId', '==', game.id), limit(10)))).docs.forEach((d) => batch.delete(d.ref));
  for (const row of scoreRows(game, placements)) batch.set(doc(scores()), { gameId: game.id, year: game.year, ...row });
  await batch.commit();
}

export async function removeGame(game: Game): Promise<void> {
  assertWritable();
  const batch = writeBatch(firebase().db);
  (await getDocs(query(scores(), where('gameId', '==', game.id), limit(10)))).docs.forEach((d) => batch.delete(d.ref));
  batch.delete(doc(firebase().db, 'sportfestGames', game.id));
  await batch.commit();
}
