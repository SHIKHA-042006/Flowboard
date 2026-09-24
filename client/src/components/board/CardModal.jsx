import { useEffect, useState } from 'react';
import {
  AlignLeft, CalendarClock, Check, Clock3, MessageSquare, Tag, Trash2, Users, X, Flag,
} from 'lucide-react';
import clsx from 'clsx';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import Avatar from '../ui/Avatar.jsx';
import ConfirmDialog from '../ui/ConfirmDialog.jsx';
import Dropdown from '../ui/Dropdown.jsx';
import LabelChip from './LabelChip.jsx';
import PriorityBadge from './PriorityBadge.jsx';
import ChecklistSection from './ChecklistSection.jsx';
import AttachmentsSection from './AttachmentsSection.jsx';
import ActivityFeedItem from './ActivityFeedItem.jsx';
import { timeAgo, toDateInput } from '../../lib/format.js';
import { PRIORITIES, PRIORITY_META } from '../../lib/priority.js';
import { useAuth } from '../../context/AuthContext.jsx';

/**
 * Card details. Every field patches the card through the same `onUpdate`
 * callback the board page also uses for socket-driven refreshes, so a local
 * edit and a remote edit always end up rendering the same object shape.
 */
export default function CardModal({
  card, list, board, members, open, onClose, onUpdate, onDelete, onComment, onDeleteComment,
  onChecklistAdd, onChecklistToggle, onChecklistDelete, onAttachmentAdd, onAttachmentDelete,
}) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingDesc, setEditingDesc] = useState(false);
  const [comment, setComment] = useState('');
  const [tab, setTab] = useState('comments');
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!card) return;
    setTitle(card.title);
    setDescription(card.description || '');
    setTab('comments');
  }, [card?._id, card?.title, card?.description]);

  if (!card) return null;

  const cardLabels = (card.labels || []).map((id) => board.labels.find((l) => l._id === id)).filter(Boolean);
  const assigneeIds = (card.assignees || []).map((a) => a._id || a);
  const priorityMeta = PRIORITY_META[card.priority] || PRIORITY_META.medium;

  const toggleLabel = (labelId) => {
    const next = card.labels.includes(labelId)
      ? card.labels.filter((id) => id !== labelId)
      : [...card.labels, labelId];
    onUpdate({ labels: next });
  };

  const toggleAssignee = (userId) => {
    const next = assigneeIds.includes(userId)
      ? assigneeIds.filter((id) => id !== userId)
      : [...assigneeIds, userId];
    onUpdate({ assignees: next });
  };

  const submitComment = async (e) => {
    e.preventDefault();
    const text = comment.trim();
    if (!text) return;
    setBusy(true);
    await onComment(text);
    setBusy(false);
    setComment('');
  };

  return (
    <>
      <Modal open={open} onClose={onClose} size="lg" title={list?.title ? `In list ${list.title}` : 'Card'}>
        <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_170px]">
          <div className="min-w-0">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => title.trim() && title !== card.title && onUpdate({ title: title.trim() })}
              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
              className="w-full rounded-lg border border-transparent px-1.5 py-1 text-xl font-bold hover:border-line focus:border-accent dark:hover:border-dline dark:bg-transparent"
              aria-label="Card title"
            />

            <div className="mt-3 flex flex-wrap items-center gap-1.5 px-1.5">
              {cardLabels.map((l) => <LabelChip key={l._id} label={l} size="md" />)}
              <PriorityBadge priority={card.priority} size="md" />
            </div>

            {card.dueDate && (
              <div className="mt-3 flex items-center gap-2 px-1.5">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={card.completed}
                    onChange={(e) => onUpdate({ completed: e.target.checked })}
                    className="h-4 w-4 rounded border-line text-accent"
                  />
                  <span className={clsx(card.completed && 'text-ink-soft line-through dark:text-dink-soft')}>
                    {new Date(card.dueDate).toDateString()}
                  </span>
                </label>
              </div>
            )}

            <section className="mt-6">
              <h3 className="mb-2 flex items-center gap-2 px-1.5 text-sm font-bold">
                <AlignLeft size={16} /> Description
              </h3>
              {editingDesc ? (
                <div className="px-1.5">
                  <textarea
                    autoFocus
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-lg border border-line p-2.5 text-sm leading-relaxed focus:border-accent dark:border-dline dark:bg-dpanel"
                    placeholder="Add more detail, links or acceptance criteria"
                  />
                  <div className="mt-2 flex gap-2">
                    <Button
                      size="sm"
                      onClick={async () => { await onUpdate({ description }); setEditingDesc(false); }}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => { setDescription(card.description || ''); setEditingDesc(false); }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setEditingDesc(true)}
                  className="w-full rounded-lg px-1.5 py-2 text-left text-sm leading-relaxed hover:bg-surface dark:hover:bg-white/5"
                >
                  {card.description || <span className="text-ink-faint dark:text-dink-faint">Add a description</span>}
                </button>
              )}
            </section>

            <ChecklistSection
              checklist={card.checklist}
              onAdd={onChecklistAdd}
              onToggle={onChecklistToggle}
              onDelete={onChecklistDelete}
            />

            <AttachmentsSection
              attachments={card.attachments}
              onAdd={onAttachmentAdd}
              onDelete={onAttachmentDelete}
            />

            <section className="mt-6">
              <div className="flex items-center gap-1 border-b border-line px-1.5 dark:border-dline">
                <button
                  onClick={() => setTab('comments')}
                  className={clsx(
                    'flex items-center gap-1.5 border-b-2 px-2 py-2 text-[13px] font-bold',
                    tab === 'comments' ? 'border-accent text-accent' : 'border-transparent text-ink-soft dark:text-dink-soft'
                  )}
                >
                  <MessageSquare size={15} /> Comments {card.comments?.length > 0 && `(${card.comments.length})`}
                </button>
                <button
                  onClick={() => setTab('activity')}
                  className={clsx(
                    'flex items-center gap-1.5 border-b-2 px-2 py-2 text-[13px] font-bold',
                    tab === 'activity' ? 'border-accent text-accent' : 'border-transparent text-ink-soft dark:text-dink-soft'
                  )}
                >
                  <Clock3 size={15} /> Activity
                </button>
              </div>

              {tab === 'comments' ? (
                <>
                  <form onSubmit={submitComment} className="mt-4 flex gap-2 px-1.5">
                    <Avatar user={user} size={30} />
                    <div className="flex-1">
                      <textarea
                        rows={2}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Write a comment"
                        className="w-full rounded-lg border border-line p-2.5 text-sm focus:border-accent dark:border-dline dark:bg-dpanel"
                      />
                      {comment.trim() && (
                        <Button size="sm" type="submit" className="mt-2" loading={busy}>Comment</Button>
                      )}
                    </div>
                  </form>

                  <ul className="mt-4 space-y-3 px-1.5">
                    {card.comments?.slice().reverse().map((c) => (
                      <li key={c._id} className="flex gap-2">
                        <Avatar user={c.author} size={30} />
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px]">
                            <span className="font-semibold">{c.author?.name}</span>{' '}
                            <span className="text-ink-faint dark:text-dink-faint">{timeAgo(c.createdAt)}</span>
                          </p>
                          <p className="mt-1 whitespace-pre-wrap rounded-lg bg-surface px-3 py-2 text-sm dark:bg-white/5">{c.text}</p>
                          {c.author?._id === user._id && (
                            <button
                              onClick={() => onDeleteComment(c._id)}
                              className="mt-1 text-[12px] text-ink-faint hover:text-danger hover:underline dark:text-dink-faint"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                    {!card.comments?.length && (
                      <li className="text-[13px] text-ink-faint dark:text-dink-faint">No comments yet.</li>
                    )}
                  </ul>
                </>
              ) : (
                <ul className="mt-4 px-1.5">
                  {(card.activity || []).map((entry) => <ActivityFeedItem key={entry._id} entry={entry} />)}
                  {!card.activity?.length && (
                    <li className="text-[13px] text-ink-faint dark:text-dink-faint">No activity recorded yet.</li>
                  )}
                </ul>
              )}
            </section>
          </div>

          <aside className="space-y-2">
            <p className="text-[12px] font-bold text-ink-faint dark:text-dink-faint">Add to card</p>

            <Dropdown
              align="left"
              width="w-56"
              trigger={({ toggle }) => (
                <SideButton icon={Users} onClick={toggle}>Members</SideButton>
              )}
            >
              {() => (
                <div className="space-y-1">
                  {members.map(({ user: u }) => (
                    <button
                      key={u._id}
                      onClick={() => toggleAssignee(u._id)}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-surface dark:hover:bg-white/5"
                    >
                      <Avatar user={u} size={26} />
                      <span className="flex-1 truncate">{u.name}</span>
                      {assigneeIds.includes(u._id) && <Check size={16} className="text-accent" />}
                    </button>
                  ))}
                </div>
              )}
            </Dropdown>

            <Dropdown
              align="left"
              width="w-56"
              trigger={({ toggle }) => <SideButton icon={Tag} onClick={toggle}>Labels</SideButton>}
            >
              {() => (
                <div className="space-y-1">
                  {board.labels.map((l) => (
                    <button
                      key={l._id}
                      onClick={() => toggleLabel(l._id)}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-surface dark:hover:bg-white/5"
                    >
                      <span className="h-5 w-8 rounded" style={{ backgroundColor: l.color }} />
                      <span className="flex-1 truncate">{l.name}</span>
                      {card.labels.includes(l._id) && <Check size={16} className="text-accent" />}
                    </button>
                  ))}
                </div>
              )}
            </Dropdown>

            <Dropdown
              align="left"
              width="w-48"
              trigger={({ toggle }) => (
                <SideButton icon={Flag} onClick={toggle} style={{ color: priorityMeta.color, backgroundColor: priorityMeta.bg }}>
                  Priority
                </SideButton>
              )}
            >
              {() => (
                <div className="space-y-1">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p}
                      onClick={() => onUpdate({ priority: p })}
                      className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm hover:bg-surface dark:hover:bg-white/5"
                    >
                      <PriorityBadge priority={p} size="md" />
                      {card.priority === p && <Check size={16} className="text-accent" />}
                    </button>
                  ))}
                </div>
              )}
            </Dropdown>

            <div className="rounded-lg border border-line p-2 dark:border-dline">
              <label className="flex items-center gap-2 text-[13px] font-semibold text-ink-soft dark:text-dink-soft">
                <CalendarClock size={16} /> Due date
              </label>
              <input
                type="date"
                value={toDateInput(card.dueDate)}
                onChange={(e) =>
                  onUpdate({ dueDate: e.target.value ? new Date(e.target.value).toISOString() : null })
                }
                className="mt-1.5 h-8 w-full rounded border border-line px-2 text-[13px] dark:border-dline dark:bg-dpanel"
              />
              {card.dueDate && (
                <button
                  onClick={() => onUpdate({ dueDate: null, completed: false })}
                  className="mt-1.5 flex items-center gap-1 text-[12px] text-ink-faint hover:text-danger dark:text-dink-faint"
                >
                  <X size={13} /> Remove date
                </button>
              )}
            </div>

            <div className="pt-2">
              <SideButton icon={Trash2} tone="danger" onClick={() => setConfirming(true)}>
                Delete card
              </SideButton>
            </div>
          </aside>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Delete this card?"
        onConfirm={async () => { await onDelete(); onClose(); }}
      />
    </>
  );
}

function SideButton({ icon: Icon, children, tone, style, ...props }) {
  return (
    <button
      {...props}
      style={style}
      className={clsx(
        'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] font-semibold',
        !style && (tone === 'danger'
          ? 'bg-danger-soft text-danger hover:brightness-95'
          : 'bg-surface text-ink hover:bg-line/60 dark:bg-white/5 dark:text-dink dark:hover:bg-white/10')
      )}
    >
      <Icon size={16} /> {children}
    </button>
  );
}
