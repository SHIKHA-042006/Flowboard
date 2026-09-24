import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) return setError('Use at least 8 characters for your password');

    setBusy(true);
    setError(null);
    const res = await register(form);
    setBusy(false);
    if (res.ok) navigate('/');
    else setError(res.message);
  };

  return (
    <AuthLayout title="Create your account" subtitle="You get a personal workspace to start with.">
      <form onSubmit={submit} className="space-y-3">
        <Input
          label="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          autoFocus
        />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        {error && (
          <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-[13px] text-danger">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" loading={busy}>Create account</Button>
      </form>

      <p className="mt-5 text-center text-sm text-ink-soft">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold  hover:underline" style={{ color: 'rgb(58, 137, 201)' }}>Sign in</Link>
      </p>
    </AuthLayout>
  );
}
