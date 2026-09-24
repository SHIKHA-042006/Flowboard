import { Link } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';

export default function NotFoundPage() {
  return (
    <div className="grid h-full place-items-center px-6 text-center">
      <div>
        <p className="text-sm font-semibold text-accent">404</p>
        <h1 className="mt-2 text-2xl font-bold">This page does not exist</h1>
        <p className="mt-2 text-ink-soft">The link may be out of date, or the board was deleted.</p>
        <Link to="/" className="mt-5 inline-block">
          <Button>Back to dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
