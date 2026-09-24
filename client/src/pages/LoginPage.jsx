import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await login(form);
    setBusy(false);
    if (res.ok) navigate('/');
    else setError(res.message);
  };

  return (
    <AuthLayout title="Sign in" subtitle="Pick up where your team left off.">
      <form onSubmit={submit} className="space-y-5">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          autoFocus
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        {error && (
          <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-[13px] text-danger">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" className=" mt-2 w-full" loading={busy}>Sign in</Button>
      </form>

      <p className="mt-5 text-center text-sm text-ink-soft">
        New here?{' '}
        <Link to="/register" className="font-semibold  hover:underline" style={{ color: 'rgb(58, 137, 201)' }}>Create an account</Link>
      </p>

      {/* <div className="mt-6 rounded-xl2 border border-line bg-surface px-4 py-3 text-[13px] text-ink-soft">
        <p className="font-semibold text-ink">Demo account</p>
        <p className="mt-1">ada@flowboard.dev · password123 (after running the seed script)</p>
      </div> */}
      <div className="mt-8 rounded-xl2 border border-line bg-surface px-4 py-4 text-[13px] text-ink-soft">
        <p className="font-semibold text-ink">Demo account</p>

        <p className="mt-2 break-all leading-5">ada@flowboard.dev</p>

        <p className="leading-5">password123</p>

        <p className="mt-2 text-xs text-ink-soft">Use these credentials to explore Flowboard.</p>
      </div>
    </AuthLayout>
  );
}
