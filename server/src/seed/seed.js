/* eslint-disable no-console */
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Workspace from '../models/Workspace.js';
import Board, { DEFAULT_LABELS } from '../models/Board.js';
import List from '../models/List.js';
import Card from '../models/Card.js';
import Notification from '../models/Notification.js';
import { POSITION_GAP } from '../services/position.js';

const daysFromNow = (n) => new Date(Date.now() + n * 86400000);
const label = (board, name) => board.labels.find((l) => l.name === name)._id;

async function seed() {
  await connectDB();
  console.log('Clearing existing data');
  await Promise.all([
    User.deleteMany({}),
    Workspace.deleteMany({}),
    Board.deleteMany({}),
    List.deleteMany({}),
    Card.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  const password = env.seedPassword;
  const [ada, grace, linus, maya] = await User.create([
    { name: 'Ada Lovelace', email: 'ada@flowboard.dev', password, avatarColor: '#0F766E', title: 'Head of Product' },
    { name: 'Grace Hopper', email: 'grace@flowboard.dev', password, avatarColor: '#B45309', title: 'Engineering Lead' },
    { name: 'Linus Reyes', email: 'linus@flowboard.dev', password, avatarColor: '#7C3AED', title: 'Frontend Engineer' },
    { name: 'Maya Chen', email: 'maya@flowboard.dev', password, avatarColor: '#BE123C', title: 'Product Designer' },
  ]);

  const workspace = await Workspace.create({
    name: 'Northwind Studio',
    description: 'Product, design and engineering in one place',
    owner: ada._id,
    members: [
      { user: ada._id, role: 'admin' },
      { user: grace._id, role: 'admin' },
      { user: linus._id, role: 'member' },
      { user: maya._id, role: 'member' },
    ],
  });

  const personal = await Workspace.create({
    name: "Ada's workspace",
    description: 'Personal planning',
    owner: ada._id,
    members: [{ user: ada._id, role: 'admin' }],
  });

  // ---------------------------------------------------------------------
  // Board 1: Mobile App Launch — the flagship demo board
  // ---------------------------------------------------------------------
  const mobileBoard = await Board.create({
    title: 'Mobile App Launch',
    description: 'Ship v2.0 of the Flowboard companion app',
    workspace: workspace._id,
    background: 'teal',
    backgroundImage: 'https://images.unsplash.com/photo-1522199755839-a2bacb67c546?q=80&w=1600&auto=format&fit=crop',
    createdBy: ada._id,
    labels: DEFAULT_LABELS,
  });

  const listNames = ['Backlog', 'To Do', 'In Progress', 'Review', 'Done'];
  const mobileLists = await List.insertMany(
    listNames.map((title, i) => ({ title, board: mobileBoard._id, position: (i + 1) * POSITION_GAP }))
  );
  const L = Object.fromEntries(mobileLists.map((l) => [l.title, l]));
  const lb = (name) => label(mobileBoard, name);

  const mobileCardDefs = [
    {
      list: 'Backlog', title: 'Offline mode for saved boards', priority: 'medium',
      description: 'Cache the last-viewed board in IndexedDB so people can still read it without a connection.',
      labels: ['Feature'], assignees: [linus._id], due: 14,
      checklist: [['Cache board payload', false], ['Show an offline banner', false], ['Sync on reconnect', false]],
    },
    { list: 'Backlog', title: 'Audit empty states across the app', priority: 'low', labels: ['Design'], assignees: [maya._id] },
    { list: 'Backlog', title: 'Write the release notes template', priority: 'low', labels: ['Docs'], assignees: [grace._id] },
    { list: 'Backlog', title: 'Explore push notification provider', priority: 'medium', labels: ['Feature'], assignees: [] },

    {
      list: 'To Do', title: 'Design the onboarding carousel', priority: 'high',
      description: 'Three screens introducing boards, real-time sync and mobile drag & drop.',
      labels: ['Design'], assignees: [maya._id], due: 6,
      checklist: [['Wireframes', true], ['High-fidelity screens', false], ['Hand off to engineering', false]],
    },
    { list: 'To Do', title: 'Set up crash reporting', priority: 'medium', labels: ['Feature'], assignees: [grace._id], due: 9 },
    { list: 'To Do', title: 'Localise date formatting', priority: 'low', labels: ['Docs'], assignees: [] },

    {
      list: 'In Progress', title: 'Drag and drop on touch devices', priority: 'urgent',
      description: 'Pointer sensor needs an activation delay so scrolling still works on phones. Reproduced on Pixel 7 and iPhone 13.',
      labels: ['Bug', 'Urgent'], assignees: [ada._id, linus._id], due: 2,
      checklist: [['Reproduce on Android', true], ['Reproduce on iOS', true], ['Ship the fix', false], ['Add a regression test', false]],
      attachments: [['Touch drag recording', 'https://example.com/recordings/touch-drag.mp4']],
      comments: [
        [grace._id, 'Reproduced on a Pixel 7 — a 200ms activation delay fixes it.'],
        [linus._id, 'Adding the same constraint to list dragging too.'],
      ],
    },
    {
      list: 'In Progress', title: 'Card details bottom sheet on mobile', priority: 'high',
      labels: ['Feature', 'Design'], assignees: [maya._id, linus._id], due: 5,
      checklist: [['Layout pass', true], ['Wire up comments', false]],
    },
    { list: 'In Progress', title: 'Rate limit the auth endpoints', priority: 'high', labels: ['Urgent'], assignees: [ada._id], due: 1 },

    {
      list: 'Review', title: 'API docs for third-party integrations', priority: 'medium',
      labels: ['Docs'], assignees: [grace._id],
      attachments: [['OpenAPI spec draft', 'https://example.com/docs/openapi-draft.yaml']],
      comments: [[ada._id, 'Looks solid — flag the rate limit headers explicitly before we publish.']],
    },
    { list: 'Review', title: 'Accessibility pass on the board view', priority: 'medium', labels: ['Design'], assignees: [maya._id] },

    {
      list: 'Done', title: 'Set up CI for the API', priority: 'medium', labels: ['Feature'], assignees: [linus._id],
      completed: true, checklist: [['Lint on push', true], ['Run tests on PR', true]],
    },
    { list: 'Done', title: 'Pick the type scale and palette', priority: 'low', labels: ['Design'], assignees: [maya._id], completed: true },
    { list: 'Done', title: 'Ship the marketing landing page', priority: 'medium', labels: ['Feature'], assignees: [grace._id], completed: true, due: -3 },
  ];

  await createCards(mobileBoard, L, lb, mobileCardDefs, ada._id);

  // ---------------------------------------------------------------------
  // Board 2: Website Redesign
  // ---------------------------------------------------------------------
  const webBoard = await Board.create({
    title: 'Website Redesign',
    description: 'Refresh the marketing site ahead of the v2.0 launch',
    workspace: workspace._id,
    background: 'indigo',
    backgroundImage: 'https://images.unsplash.com/photo-1487014679447-9f8336841d58?q=80&w=1600&auto=format&fit=crop',
    createdBy: grace._id,
  });
  const webLists = await List.insertMany(
    listNames.map((title, i) => ({ title, board: webBoard._id, position: (i + 1) * POSITION_GAP }))
  );
  const LW = Object.fromEntries(webLists.map((l) => [l.title, l]));
  const wb = (name) => label(webBoard, name);

  await createCards(webBoard, LW, wb, [
    { list: 'Backlog', title: 'Competitor visual audit', priority: 'low', labels: ['Design'], assignees: [maya._id] },
    { list: 'Backlog', title: 'New pricing page copy', priority: 'medium', labels: ['Docs'], assignees: [] },
    { list: 'To Do', title: 'Homepage hero redesign', priority: 'high', labels: ['Design'], assignees: [maya._id], due: 8 },
    { list: 'To Do', title: 'Rebuild the docs navigation', priority: 'medium', labels: ['Feature'], assignees: [linus._id], due: 10 },
    {
      list: 'In Progress', title: 'Migrate blog to the new CMS', priority: 'high', labels: ['Feature'],
      assignees: [grace._id, linus._id], due: 4,
      checklist: [['Export old posts', true], ['Map fields', true], ['Redirect old URLs', false]],
    },
    { list: 'Review', title: 'Lighthouse performance pass', priority: 'medium', labels: ['Bug'], assignees: [linus._id] },
    { list: 'Done', title: 'New logo mark', priority: 'low', labels: ['Design'], assignees: [maya._id], completed: true },
  ], ada._id);

  // ---------------------------------------------------------------------
  // Board 3: Marketing Campaign Q4
  // ---------------------------------------------------------------------
  const mktBoard = await Board.create({
    title: 'Marketing Campaign Q4',
    description: 'Launch campaign across email, social and partners',
    workspace: workspace._id,
    background: 'rose',
    createdBy: maya._id,
  });
  const mktLists = await List.insertMany(
    listNames.map((title, i) => ({ title, board: mktBoard._id, position: (i + 1) * POSITION_GAP }))
  );
  const LM = Object.fromEntries(mktLists.map((l) => [l.title, l]));
  const mb = (name) => label(mktBoard, name);

  await createCards(mktBoard, LM, mb, [
    { list: 'Backlog', title: 'Partner co-marketing outreach list', priority: 'low', labels: ['Docs'], assignees: [] },
    { list: 'To Do', title: 'Draft launch announcement email', priority: 'high', labels: ['Docs'], assignees: [maya._id], due: 3 },
    { list: 'To Do', title: 'Social media asset pack', priority: 'medium', labels: ['Design'], assignees: [maya._id], due: 7 },
    { list: 'In Progress', title: 'Landing page A/B test setup', priority: 'medium', labels: ['Feature'], assignees: [grace._id] },
    { list: 'Review', title: 'Press kit review', priority: 'medium', labels: ['Docs'], assignees: [ada._id] },
    { list: 'Done', title: 'Book launch day webinar slot', priority: 'low', labels: [], assignees: [maya._id], completed: true },
  ], ada._id);

  // ---------------------------------------------------------------------
  // Personal workspace board
  // ---------------------------------------------------------------------
  const readingBoard = await Board.create({
    title: 'Reading List',
    description: 'Books and papers queued up for this quarter',
    workspace: personal._id,
    background: 'amber',
    createdBy: ada._id,
  });
  const readingLists = await List.insertMany(
    ['To Read', 'Reading', 'Finished'].map((title, i) => ({ title, board: readingBoard._id, position: (i + 1) * POSITION_GAP }))
  );
  const LR = Object.fromEntries(readingLists.map((l) => [l.title, l]));
  await createCards(readingBoard, LR, () => undefined, [
    { list: 'To Read', title: 'Designing Data-Intensive Applications', priority: 'low', assignees: [ada._id] },
    { list: 'To Read', title: 'The Staff Engineer\'s Path', priority: 'low', assignees: [ada._id] },
    { list: 'Reading', title: 'A Philosophy of Software Design', priority: 'medium', assignees: [ada._id], due: 12 },
    { list: 'Finished', title: 'Shape Up', priority: 'low', assignees: [ada._id], completed: true },
  ], ada._id);

  // ---------------------------------------------------------------------
  // Starred + recent boards, so the dashboard looks populated immediately
  // ---------------------------------------------------------------------
  ada.starredBoards = [mobileBoard._id, readingBoard._id];
  ada.recentBoards = [webBoard._id, mktBoard._id, mobileBoard._id];
  await ada.save();

  grace.starredBoards = [mobileBoard._id];
  grace.recentBoards = [mobileBoard._id, webBoard._id];
  await grace.save();

  linus.starredBoards = [webBoard._id];
  linus.recentBoards = [mobileBoard._id];
  await linus.save();

  // ---------------------------------------------------------------------
  // Notifications for ada, so the bell icon has content on first login
  // ---------------------------------------------------------------------
  await Notification.create([
    {
      user: ada._id, actor: linus._id, type: 'card_assigned',
      message: 'Linus Reyes assigned you to "Drag and drop on touch devices"', board: mobileBoard._id, read: false,
    },
    {
      user: ada._id, actor: grace._id, type: 'card_comment',
      message: 'Grace Hopper commented on "API docs for third-party integrations"', board: mobileBoard._id, read: false,
    },
    {
      user: ada._id, actor: maya._id, type: 'card_due_soon',
      message: '"Rate limit the auth endpoints" is due tomorrow', board: mobileBoard._id, read: false,
    },
    {
      user: ada._id, actor: grace._id, type: 'workspace_invite',
      message: 'Grace Hopper added Maya Chen to Northwind Studio', board: null, read: true,
    },
  ]);

  console.log('\nSeed complete. Demo accounts (password: %s):', password);
  console.log('  ada@flowboard.dev    admin of Northwind Studio, owner of the personal workspace');
  console.log('  grace@flowboard.dev  admin');
  console.log('  linus@flowboard.dev  member');
  console.log('  maya@flowboard.dev   member\n');

  await mongoose.disconnect();
}

/** Bulk-creates cards for a board from a compact definition array. */
async function createCards(board, listsByTitle, labelId, defs, defaultAuthor) {
  const docs = defs.map((d, i) => {
    return {
      title: d.title,
      description: d.description || '',
      board: board._id,
      list: listsByTitle[d.list]._id,
      position: (i + 1) * POSITION_GAP,
      priority: d.priority || 'medium',
      labels: (d.labels || []).map((name) => labelId(name)).filter(Boolean),
      assignees: d.assignees || [],
      dueDate: d.due !== undefined ? daysFromNow(d.due) : null,
      completed: !!d.completed,
      checklist: (d.checklist || []).map(([text, done]) => ({ text, done })),
      attachments: (d.attachments || []).map(([name, url]) => ({ name, url, addedBy: defaultAuthor })),
      comments: (d.comments || []).map(([author, text]) => ({ author, text })),
      createdBy: defaultAuthor,
    };
  });

  const created = await Card.insertMany(docs);

  // Give every card a "created" activity entry, and a couple of extra
  // entries where comments/checklist items exist, so the Activity tab isn't
  // empty on first look.
  await Promise.all(
    created.map((card, i) => {
      const def = defs[i];
      card.activity.push({ actor: defaultAuthor, type: 'created', meta: { listTitle: def.list } });
      (def.comments || []).forEach(([author]) => {
        card.activity.unshift({ actor: author, type: 'commented', meta: { preview: '' } });
      });
      if (def.completed) card.activity.unshift({ actor: defaultAuthor, type: 'completed', meta: {} });
      return card.save();
    })
  );

  return created;
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
