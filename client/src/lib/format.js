import { format, formatDistanceToNowStrict, isPast, isToday, isTomorrow } from 'date-fns';

export const initials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');

export function dueLabel(date) {
  const d = new Date(date);
  if (isToday(d)) return 'Due today';
  if (isTomorrow(d)) return 'Due tomorrow';
  return `Due ${format(d, 'd MMM')}`;
}

export const dueTone = (date, completed) => {
  if (completed) return 'done';
  return isPast(new Date(date)) ? 'overdue' : 'upcoming';
};

export const timeAgo = (date) => `${formatDistanceToNowStrict(new Date(date))} ago`;

export const toDateInput = (date) => (date ? format(new Date(date), 'yyyy-MM-dd') : '');
