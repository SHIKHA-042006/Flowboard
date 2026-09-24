import { useState } from 'react';
import { Moon, Save, Sun, SunMoon, User } from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import api, { errorMessage } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const AVATAR_COLORS = ['#0F766E', '#B45309', '#7C3AED', '#BE123C', '#1D4ED8', '#047857', '#C2410C', '#4338CA'];
const THEME_OPTIONS = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'Match system', icon: SunMoon },
];

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { preference, setTheme } = useTheme();
  const toast = useToast();

  const [form, setForm] = useState({ name: user?.name || '', title: user?.title || '', avatarColor: user?.avatarColor });
  const [busy, setBusy] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.patch('/auth/me', form);
      toast.success('Profile updated');
      window.location.reload(); // simplest way to refresh the cached user everywhere
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="scrollbar-thin h-full overflow-y-auto">
      <div className="mx-auto max-w-2xl px-5 py-8 sm:px-8">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <User size={22} className="text-accent" /> Profile & settings
        </h1>
        <p className="mt-1 text-sm text-ink-soft dark:text-dink-soft">Manage how you appear across Flowboard.</p>

        <form onSubmit={save} className="mt-6 space-y-5 rounded-xl2 border border-line bg-panel p-5 shadow-card dark:border-dline dark:bg-dpanel">
          <div className="flex items-center gap-4">
            <Avatar user={{ ...user, ...form }} size={56} />
            <div>
              <p className="font-bold">{user?.email}</p>
              <p className="text-[13px] text-ink-soft dark:text-dink-soft">Your account email can't be changed</p>
            </div>
          </div>

          <Input label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input
            label="Role / title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Product Designer"
          />

          <div>
            <span className="mb-1.5 block text-[13px] font-semibold text-ink-soft dark:text-dink-soft">Avatar colour</span>
            <div className="flex flex-wrap gap-2">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, avatarColor: c })}
                  aria-label={c}
                  style={{ backgroundColor: c }}
                  className={`h-8 w-8 rounded-full transition-transform ${form.avatarColor === c ? 'ring-2 ring-ink ring-offset-2 dark:ring-offset-dpanel' : 'hover:scale-110'}`}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" loading={busy}>
              <Save size={15} /> Save changes
            </Button>
          </div>
        </form>

        <section className="mt-6 rounded-xl2 border border-line bg-panel p-5 shadow-card dark:border-dline dark:bg-dpanel">
          <h2 className="font-bold">Appearance</h2>
          <p className="mt-1 text-[13px] text-ink-soft dark:text-dink-soft">Choose how Flowboard looks on this device.</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                aria-pressed={preference === value}
                className={`flex flex-col items-center gap-1.5 rounded-lg border py-3 text-[13px] font-semibold transition-colors ${
                  preference === value
                    ? 'border-accent bg-accent-soft text-accent dark:bg-accent/15'
                    : 'border-line text-ink-soft hover:bg-surface dark:border-dline dark:text-dink-soft dark:hover:bg-white/5'
                }`}
              >
                <Icon size={18} /> {label}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-xl2 border border-danger/30 bg-danger-soft p-5 dark:border-danger/30 dark:bg-danger/10">
          <h2 className="font-bold text-danger">Session</h2>
          <p className="mt-1 text-[13px] text-ink-soft dark:text-dink-soft">Sign out of Flowboard on this device.</p>
          <Button variant="danger" className="mt-3" onClick={logout}>Sign out</Button>
        </section>
      </div>
    </div>
  );
}
