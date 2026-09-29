# Flowboard

A feature-rich, real-time project-management platform :
workspaces → boards → lists → cards, live multi-user sync,
checklists, priorities, attachments, activity history, notifications, project
templates, and dark mode.

Stack: **React 18 + Vite + Tailwind + dnd-kit + Zustand** on the front end,
**Node/Express + MongoDB (Mongoose) + Socket.io + JWT** on the back end.

The design, copy and colour system are original. No third-party product's
assets, icons or branding are used.

---

## Features

- **Auth** — register, sign in, sign out with JWT; passwords hashed with bcrypt.
- **Navbar** — global search (boards + cards), notifications bell with a live
  panel, help menu, a Create menu (board/workspace), and a profile menu with
  a light/dark/system theme switch.
- **Sidebar** — Dashboard, My Tasks, Starred, Recent, your Workspaces
  (expandable, showing boards), Templates and Settings.
- **Dashboard** — greeting banner, stat tiles, starred boards, recently viewed
  boards, tasks assigned to you, upcoming deadlines, and a cross-board
  activity feed.
- **Workspaces** — gradient header, member avatars, boards grid, member role
  management (admin/member), and a workspace-scoped activity feed.
- **Boards** — optional photo backdrop or gradient background, star/unstar,
  inline rename, invite button, search, and a filter panel (status, priority,
  label, assignee). A "More" menu covers background and automation (stubbed).
- **Lists & cards** — full CRUD, 5-list realistic seed data (Backlog → To Do →
  In Progress → Review → Done), drag-and-drop reordering and cross-list moves
  that persist to MongoDB.
- **Card details modal** — description, members, labels, priority, due date,
  a checklist with a progress bar, link attachments, comments, and an
  Activity tab showing the card's full history.
- **Real-time** — every create/edit/move/delete broadcasts over Socket.io;
  live presence avatars; a personal notification channel per user.
- **Notifications** — assigned-to-you, comment, and due-soon style
  notifications, delivered live and readable from the bell panel.
- **Templates** — Software Development, Marketing Campaign, College Project,
  Product Launch and Content Planning — each creates a fully-populated board
  through the existing board/list/card APIs.
- **Profile & settings** — edit name, title and avatar colour; theme switch.
- **Dark / light mode** — a third "system" option follows the OS preference.
- **States** — skeleton loaders, empty states, error states with retry,
  confirm-before-delete dialogs, and toast notifications throughout.
- **Responsive** — sidebar collapses to a slide-over; boards scroll
  horizontally; touch drag uses a hold-to-drag delay.

---

## Getting started

### Prerequisites
- Node 18+
- MongoDB running locally (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas URI

### 1. Install

```bash
git clone <your-repo> flowboard && cd flowboard
npm run install:all          # installs server/ and client/
```

### 2. Configure

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Then edit `server/.env` — at minimum set `JWT_SECRET` to a long random string
and point `MONGO_URI` at your database.

| Variable | Where | What it does |
| --- | --- | --- |
| `PORT` | server | API port (default 4000) |
| `MONGO_URI` | server | MongoDB connection string |
| `JWT_SECRET` | server | Signing key for access tokens |
| `JWT_EXPIRES_IN` | server | Token lifetime, e.g. `7d` |
| `CLIENT_URL` | server | Allowed CORS origin(s), comma separated |
| `SEED_PASSWORD` | server | Password given to the demo accounts |
| `VITE_API_URL` | client | Leave blank in dev (Vite proxies `/api`) |
| `VITE_SOCKET_URL` | client | Leave blank in dev (Vite proxies the socket) |

### 3. Seed demo data

```bash
npm run seed
```

Creates 2 workspaces, 4 fully-populated boards (5 lists each, realistic cards
with priorities, checklists, attachments, comments and activity), starred and
recently-viewed boards, and a few unread notifications — so the app looks
complete the moment you log in.

| Account | Role |
| --- | --- |
| `ada@flowboard.dev` | admin (workspace owner) |
| `grace@flowboard.dev` | admin |
| `linus@flowboard.dev` | member |
| `maya@flowboard.dev` | member |

Password for all four: whatever `SEED_PASSWORD` is set to (`password123` by default).

### 4. Run

```bash
npm run dev     # API on :4000, client on :5173
```

Open http://localhost:5173. To see the real-time sync, open the same board in
two browsers signed in as different people and drag a card, add a comment, or
check off a checklist item.

---

## Project structure

```
server/
  src/
    config/       env validation, mongo connection
    models/       User, Workspace, Board, List, Card, Notification
    middleware/   auth (JWT), access (authorisation), validate (zod), error
    controllers/  request handling per resource, + dashboard & search
    routes/       route tables + which guards run
    services/     position.js (ordering maths), notify.js (notifications)
    sockets/      io setup, room membership, presence, per-user room, emit helper
    seed/         demo data
client/
  src/
    lib/          axios instance, formatting, position maths, priority meta, templates
    context/      auth, socket, toasts, theme (light/dark/system)
    store/        zustand board store (lists + cards + presence + starred)
    hooks/        useBoardSocket, useWorkspaces, useDashboard, useNotifications
    components/
      ui/         Button, Input, Modal, ConfirmDialog, Avatar, Dropdown, States, Skeleton, ProgressBar
      layout/     AppShell, Sidebar, Topbar, GlobalSearch, NotificationsPanel, CreateMenu, InviteMemberModal
      board/      ListColumn, SortableCard, CardTile, CardModal, BoardHeader, ChecklistSection, AttachmentsSection, ActivityFeedItem, PriorityBadge…
      dashboard/  StatCard, BoardRow, TaskRow
    pages/        Login, Register, Dashboard, Workspace, Board, MyTasks, Starred, Recent, Templates, Settings, NotFound
```

---

## Architecture decisions

### 1. Ordering: sparse float positions, computed on the server

Lists and cards store a `position` float. Inserting between two neighbours means
writing `(before + after) / 2` — **one document write per drag**, instead of
renumbering a whole column. When a gap gets too small to split (after many
inserts in the same spot), that one column is rebalanced back to even spacing.

The client sends `{ listId, index }`, not a position. The server owns the
coordinate space, so two people dragging into the same slot at the same time
cannot write conflicting numbers.

### 2. Optimistic UI with a snapshot rollback

Drags apply instantly using the same midpoint rule as the server; a snapshot
taken at drag-start is restored if the request fails or the drag is cancelled.

### 3. Socket echo suppression via socket id

Each write carries an `x-socket-id` header. The server includes that id as
`origin` in the broadcast, and the originating tab ignores events where
`origin === its own socket id`. Checklist, attachment and priority changes all
reuse the existing `card:updated` event rather than adding new ones — the
payload shape (a full, populated card) already covers them, so the client's
existing `upsertCard` reducer handles them for free.

### 4. Notifications ride a second, per-user socket room

Board updates broadcast to `board:<id>` rooms; notifications need to reach a
person regardless of which board (if any) they have open, so every socket
also joins `user:<id>` on connect. `services/notify.js` writes the
`Notification` document and, if the recipient is online, emits straight into
that room — no polling required for the bell to update live.

### 5. Templates are data, not a new backend concept

`lib/templates.js` on the client is a plain array of `{ name, background,
lists: [{ title, cards: [...] }] }`. "Using" a template calls the existing
board/list/card creation endpoints in sequence — no template model, no
template API. This keeps the backend surface exactly as large as it needs to
be, per the brief's instruction to reuse existing APIs wherever possible.

### 6. Authorisation derived from data, never from the request body

`middleware/access.js` resolves `card → list → board → workspace → your role`
before any controller runs. Socket rooms are access-checked on join too.

### 7. One hydration request per board

`GET /boards/:id` returns the board, its lists, its cards (each fully
populated with assignees, comments, attachments and activity), the workspace
members, the caller's role, and whether they've starred it — one round trip,
one consistent snapshot to start applying socket events to.

### 8. Dashboard/My Tasks/Starred/Recent are server-side aggregations

Rather than have the client stitch together "my cards" from every board it
can see, `GET /dashboard` and `GET /dashboard/my-tasks` do that server-side in
a couple of indexed queries. The same data (starred/recent board ids) lives on
the `User` document, updated in `toggleStar` and, fire-and-forget, on every
`GET /boards/:id` view — so the dashboard is accurate without an extra
write on every page load blocking the response.

### 9. State: zustand for board state, context for session/UI state

Board state changes on every keystroke of a drag, so it lives in a zustand
store with selector-based reads. Auth, socket, toasts and theme change rarely
and are plain React contexts.

---

## API reference

All routes are prefixed `/api` and, apart from register/login, require
`Authorization: Bearer <token>`.

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/auth/register` | Create an account (+ a starter workspace) |
| POST | `/auth/login` | Sign in |
| POST | `/auth/logout` | Client drops the token |
| GET | `/auth/me` | Current user |
| PATCH | `/auth/me` | Update name / title / avatar colour / theme |
| GET | `/auth/users?q=` | Search people to invite |
| GET | `/workspaces` | Your workspaces with their boards |
| POST | `/workspaces` | Create a workspace |
| GET · PATCH · DELETE | `/workspaces/:id` | Read, rename, delete |
| GET | `/workspaces/:id/activity` | Cross-board activity feed for one workspace |
| POST | `/workspaces/:id/members` | Add someone by email (admin) |
| PATCH · DELETE | `/workspaces/:id/members/:userId` | Change role, remove or leave |
| POST | `/boards` | Create a board (seeded with three lists) |
| GET · PATCH · DELETE | `/boards/:id` | Hydrate, update, delete |
| POST | `/boards/:id/star` | Toggle starred for the current user |
| POST · PATCH · DELETE | `/boards/:id/labels[/:labelId]` | Manage board labels |
| POST | `/lists` | Create a list |
| PATCH · DELETE | `/lists/:id` | Rename, archive, delete |
| PATCH | `/lists/:id/move` | Reorder — body `{ index }` |
| POST | `/cards` | Create a card |
| GET · PATCH · DELETE | `/cards/:id` | Read, update (incl. priority), delete |
| PATCH | `/cards/:id/move` | Move — body `{ listId, index }` |
| POST · DELETE | `/cards/:id/comments[/:commentId]` | Comment, delete comment |
| POST | `/cards/:id/checklist` | Add a checklist item |
| PATCH | `/cards/:id/checklist/:itemId/toggle` | Toggle done |
| DELETE | `/cards/:id/checklist/:itemId` | Remove an item |
| POST | `/cards/:id/attachments` | Attach a link |
| DELETE | `/cards/:id/attachments/:attachmentId` | Remove an attachment |
| GET | `/dashboard` | Stats, starred/recent boards, assigned cards, upcoming, activity |
| GET | `/dashboard/my-tasks` | Every card assigned to you |
| GET | `/search?q=` | Boards and cards matching a query |
| GET | `/notifications` | Recent notifications + unread count |
| PATCH | `/notifications/:id/read` | Mark one read |
| PATCH | `/notifications/read-all` | Mark all read |

### Socket.io events

Client → server: `board:join(boardId)`, `board:leave(boardId)`.

Server → clients in `board:<id>`:

| Event | Payload |
| --- | --- |
| `list:created` / `list:updated` | `{ list, origin, actor }` |
| `list:moved` | `{ lists, origin, actor }` |
| `list:deleted` | `{ listId, origin, actor }` |
| `card:created` / `card:updated` | `{ card, origin, actor }` — covers title, description, priority, labels, assignees, checklist, attachments, comments |
| `card:moved` | `{ card, fromListId, toListId, index, origin, actor }` |
| `card:deleted` | `{ cardId, listId, origin, actor }` |
| `board:updated` / `board:deleted` | `{ board }` / `{ boardId }` |
| `presence:update` | array of users currently viewing the board |

Server → the calling user's personal room `user:<id>`:

| Event | Payload |
| --- | --- |
| `notification:new` | a populated `Notification` document |

---

## Security notes

- Passwords hashed with bcrypt (cost 12) and `select: false` on the field.
- JWT verified on every request and on the socket handshake.
- Login and register are rate limited; the whole API has a ceiling too.
- `helmet` for headers, CORS restricted to `CLIENT_URL`, 1 MB JSON body cap.
- Login failures return one message for both causes, so the endpoint cannot be
  used to discover which emails have accounts.
- Notification and dashboard queries are scoped to workspaces the caller is a
  member of; nothing is inferred from client-supplied ids alone.

## Possible next steps

- Refresh tokens in httpOnly cookies instead of a localStorage access token.
- @mentions in comments that create a `card_mentioned` notification.
- Real file uploads for attachments (currently link-based).
- Per-board membership instead of workspace-wide.
- Tests: Jest + Supertest for the API, Playwright for a two-browser drag test.
