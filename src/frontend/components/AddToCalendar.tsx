import type { ClimbDetail } from '../data/climbDetail';
import { calendarFileName, climbCalendar } from '../data/calendar';

// Downloads a .ics the phone or desktop calendar opens. Hidden for climbs without a date.
export default function AddToCalendar({ climb }: { climb: ClimbDetail }) {
  const ics = climbCalendar(climb, window.location.origin, new Date());
  if (!ics) return null;
  const download = () => {
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = calendarFileName(climb.title);
    link.click();
    URL.revokeObjectURL(url);
  };
  return <p><button type="button" className="btn" onClick={download}>Add to calendar</button></p>;
}
