import { useState } from 'react';
import { Search, MoreHorizontal, Trash2, Filter, X, Star, UserPlus, Image as ImageIcon, Zap } from 'lucide-react';
import clsx from 'clsx';
import Dropdown, { MenuItem } from '../ui/Dropdown.jsx';
import Avatar, { AvatarGroup } from '../ui/Avatar.jsx';
import LabelChip from './LabelChip.jsx';
import PriorityBadge from './PriorityBadge.jsx';
import Button from '../ui/Button.jsx';
import InviteMemberModal from '../layout/InviteMemberModal.jsx';
import { PRIORITIES } from '../../lib/priority.js';

const BACKGROUNDS = ['slate', 'teal', 'indigo', 'amber', 'rose', 'forest'];
const STATUS_OPTIONS = [
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
];

export default function BoardHeader({
  board, members, presence, filter, setFilter, starred, onToggleStar,
  onRename, onChangeBackground, onChangeBackgroundImage, onDelete, workspaceId, workspaceName, onInvited,
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(board.title);
  const [inviting, setInviting] = useState(false);
  const [imageUrl, setImageUrl] = useState(board.backgroundImage || '');

  const activeFilters =
    (filter.labelId ? 1 : 0) + (filter.memberId ? 1 : 0) + (filter.status ? 1 : 0) + (filter.priority ? 1 : 0);
  const memberUsers = members.map((m) => m.user);
  const onlineIds = new Set(presence.map((p) => p._id));

  const save = () => {
    const value = title.trim();
    setEditing(false);
    if (value && value !== board.title) onRename(value);
    else setTitle(board.title);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 bg-ink/30 px-4 py-2.5 backdrop-blur-sm">
      {editing ? (
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === 'Enter') save();
            if (e.key === 'Escape') { setTitle(board.title); setEditing(false); }
          }}
          className="h-8 rounded-lg border border-white/40 bg-white/95 px-2 text-base font-bold"
        />
      ) : (
        <h1
          onClick={() => setEditing(true)}
          className="cursor-text rounded px-1.5 py-0.5 text-base font-bold text-white hover:bg-white/15"
          title="Click to rename"
        >
          {board.title}
        </h1>
      )}

      <button
        onClick={onToggleStar}
        aria-pressed={starred}
        aria-label={starred ? 'Unstar this board' : 'Star this board'}
        className={clsx('rounded-lg p-1.5 transition-colors', starred ? 'text-amber-300' : 'text-white/70 hover:bg-white/15 hover:text-white')}
      >
        <Star size={17} fill={starred ? 'currentColor' : 'none'} />
      </button>

      <div className="ml-1 hidden items-center gap-1.5 sm:flex" title="People viewing this board now">
        <AvatarGroup users={memberUsers.filter((u) => onlineIds.has(u._id))} size={26} max={5} />
      </div>

      <button
        onClick={() => setInviting(true)}
        className="hidden items-center gap-1.5 rounded-lg bg-white/20 px-2.5 py-1.5 text-[13px] font-semibold text-white hover:bg-white/30 sm:flex"
      >
        <UserPlus size={14} /> Invite
      </button>

      <div className="flex-1" />

      <div className="relative">
        <Search size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-faint" />
        <input
          value={filter.text}
          onChange={(e) => setFilter({ ...filter, text: e.target.value })}
          placeholder="Search cards"
          aria-label="Search cards on this board"
          className="h-8 w-40 rounded-lg border-0 bg-white/95 pl-8 pr-2 text-[13px] focus:w-52"
        />
      </div>

      <Dropdown
        width="w-72"
        trigger={({ toggle }) => (
          <button
            onClick={toggle}
            className={clsx(
              'inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-semibold',
              activeFilters ? 'bg-white text-ink' : 'bg-white/20 text-white hover:bg-white/30'
            )}
          >
            <Filter size={15} /> Filter{activeFilters ? ` (${activeFilters})` : ''}
          </button>
        )}
      >
        {() => (
          <div className="space-y-3 p-1">
            <div>
              <p className="mb-1.5 text-[12px] font-bold text-ink-faint dark:text-dink-faint">Status</p>
              <div className="flex flex-wrap gap-1.5">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setFilter({ ...filter, status: filter.status === s.id ? null : s.id })}
                    className={clsx(
                      'rounded-full px-2.5 py-1 text-[12.5px] font-semibold',
                      filter.status === s.id ? 'bg-accent text-white' : 'bg-surface text-ink-soft dark:bg-white/10 dark:text-dink-soft'
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-1.5 text-[12px] font-bold text-ink-faint dark:text-dink-faint">Priority</p>
              <div className="flex flex-wrap gap-1.5">
                {PRIORITIES.map((p) => (
                  <button
                    key={p}
                    onClick={() => setFilter({ ...filter, priority: filter.priority === p ? null : p })}
                    className={clsx('rounded-full', filter.priority === p && 'ring-2 ring-accent ring-offset-1')}
                  >
                    <PriorityBadge priority={p} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-1.5 text-[12px] font-bold text-ink-faint dark:text-dink-faint">Label</p>
              <div className="flex flex-wrap gap-1.5">
                {board.labels.map((l) => (
                  <LabelChip
                    key={l._id}
                    label={l}
                    size="md"
                    selected={filter.labelId === l._id}
                    onClick={() => setFilter({ ...filter, labelId: filter.labelId === l._id ? null : l._id })}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="mb-1.5 text-[12px] font-bold text-ink-faint dark:text-dink-faint">Assignee</p>
              <div className="flex flex-wrap gap-1.5">
                {memberUsers.map((u) => (
                  <button
                    key={u._id}
                    onClick={() => setFilter({ ...filter, memberId: filter.memberId === u._id ? null : u._id })}
                    className={clsx('rounded-full', filter.memberId === u._id && 'ring-2 ring-accent ring-offset-1')}
                  >
                    <Avatar user={u} size={28} />
                  </button>
                ))}
              </div>
            </div>

            {(activeFilters > 0 || filter.text) && (
              <button
                onClick={() => setFilter({ text: '', labelId: null, memberId: null, status: null, priority: null })}
                className="flex items-center gap-1 text-[13px] font-semibold text-accent hover:underline"
              >
                <X size={14} /> Clear filters
              </button>
            )}
          </div>
        )}
      </Dropdown>

      <Dropdown
        width="w-64"
        trigger={({ toggle }) => (
          <button onClick={toggle} className="rounded-lg bg-white/20 p-1.5 text-white hover:bg-white/30" aria-label="Board actions">
            <MoreHorizontal size={17} />
          </button>
        )}
      >
        {({ close }) => (
          <div className="p-1">
            <p className="px-1.5 pb-1.5 text-[12px] font-bold text-ink-faint dark:text-dink-faint">Background</p>
            <div className="mb-2 grid grid-cols-6 gap-1.5 px-1.5">
              {BACKGROUNDS.map((bg) => (
                <button
                  key={bg}
                  onClick={() => { onChangeBackground(bg); onChangeBackgroundImage(''); setImageUrl(''); }}
                  aria-label={bg}
                  className={clsx(
                    `h-7 rounded bg-board-${bg}`,
                    board.background === bg && !board.backgroundImage && 'ring-2 ring-ink ring-offset-1 dark:ring-offset-dpanel'
                  )}
                />
              ))}
            </div>

            <div className="px-1.5 pb-2">
              <p className="mb-1 flex items-center gap-1 text-[12px] font-bold text-ink-faint dark:text-dink-faint">
                <ImageIcon size={12} /> Cover image URL
              </p>
              <div className="flex gap-1.5">
                <input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://…"
                  className="h-8 flex-1 rounded-lg border border-line bg-white px-2 text-[12.5px] dark:border-dline dark:bg-dpanel"
                />
                <Button size="sm" variant="subtle" onClick={() => onChangeBackgroundImage(imageUrl)}>Set</Button>
              </div>
            </div>

            <div className="my-1 h-px bg-line dark:bg-dline" />
            <MenuItem icon={UserPlus} onClick={() => { close(); setInviting(true); }}>Invite people</MenuItem>
            <MenuItem icon={Zap} onClick={() => close()}>Automation (coming soon)</MenuItem>
            <div className="my-1 h-px bg-line dark:bg-dline" />
            <MenuItem icon={Trash2} tone="danger" onClick={() => { close(); onDelete(); }}>
              Delete board
            </MenuItem>
          </div>
        )}
      </Dropdown>

      <InviteMemberModal
        open={inviting}
        onClose={() => setInviting(false)}
        workspaceId={workspaceId}
        workspaceName={workspaceName}
        onDone={onInvited}
      />
    </div>
  );
}
