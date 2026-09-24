import { ArrowDown, ArrowUp, ChevronsUp, Minus } from 'lucide-react';

export const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

export const PRIORITY_META = {
  low: { label: 'Low', icon: ArrowDown, color: '#2563EB', bg: '#EFF4FE' },
  medium: { label: 'Medium', icon: Minus, color: '#B45309', bg: '#FCF1DF' },
  high: { label: 'High', icon: ArrowUp, color: '#C2410C', bg: '#FDEEE6' },
  urgent: { label: 'Urgent', icon: ChevronsUp, color: '#C0392B', bg: '#FDECEA' },
};
