import { dueNote, type Task } from '../../data/tasks';

// "Due today / tomorrow / in N days" for an unfinished task due within two weeks; one place for table and timeline.
export default function DueNote({ task, today }: { task: Task; today: string }) {
  const note = dueNote(task, today);
  return note ? <> <span className="climb-muted">{note}</span></> : null;
}
