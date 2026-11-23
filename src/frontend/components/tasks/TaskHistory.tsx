import { useEffect, useState } from 'react';
import { loadHistory, type TaskEvent } from '../../services/tasks';

const when = (ms: number) => (ms ? new Date(ms).toLocaleString('en-PH', { timeZone: 'Asia/Manila', dateStyle: 'medium', timeStyle: 'short' }) : '');

// What changed and who did it, newest first. Mount it with key={taskId}: a new task starts from an empty list. Shown in the edit form; nothing renders until there is something to show.
export default function TaskHistory({ taskId }: { taskId: string }) {
  const [events, setEvents] = useState<TaskEvent[]>([]);
  useEffect(() => {
    let current = true;
    void loadHistory(taskId).then((list) => { if (current) setEvents(list); }, () => { if (current) setEvents([]); });
    return () => { current = false; };
  }, [taskId]);
  if (!events.length) return null;
  return (
    <section aria-label="History">
      <h2>History</h2>
      <ul>
        {events.map((e) => <li key={e.id}>{[when(e.at), e.byName].filter(Boolean).join(' · ')}: {e.summary}</li>)}
      </ul>
    </section>
  );
}
