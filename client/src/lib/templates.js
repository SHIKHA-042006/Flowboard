import { Code2, Megaphone, GraduationCap, Rocket, PenSquare } from 'lucide-react';

/**
 * Templates are plain data, not a server concept — "using" one just calls the
 * existing board/list/card APIs in sequence (see TemplatesPage), which keeps
 * the backend surface small and reuses everything that already exists.
 */
export const TEMPLATES = [
  {
    id: 'software',
    name: 'Software Development',
    icon: Code2,
    background: 'indigo',
    backgroundImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1600&auto=format&fit=crop',
    description: 'Sprint planning with a backlog, in-progress work and code review.',
    lists: [
      { title: 'Backlog', cards: ['Set up CI pipeline', 'Define API contracts', 'Provision staging environment'] },
      { title: 'To Do', cards: ['Implement authentication', 'Design database schema'] },
      { title: 'In Progress', cards: ['Build the REST API', 'Set up the component library'] },
      { title: 'Code Review', cards: ['Review pull request #142'] },
      { title: 'Done', cards: ['Project kickoff'] },
    ],
  },
  {
    id: 'marketing',
    name: 'Marketing Campaign',
    icon: Megaphone,
    background: 'rose',
    backgroundImage: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?q=80&w=1600&auto=format&fit=crop',
    description: 'Plan and launch a campaign across email, social and paid.',
    lists: [
      { title: 'Ideas', cards: ['Competitor campaign audit', 'Brainstorm campaign themes'] },
      { title: 'Planning', cards: ['Define target audience', 'Set campaign budget'] },
      { title: 'In Production', cards: ['Design social assets', 'Write email sequence'] },
      { title: 'Scheduled', cards: ['Schedule launch posts'] },
      { title: 'Live', cards: [] },
    ],
  },
  {
    id: 'college',
    name: 'College Project',
    icon: GraduationCap,
    background: 'forest',
    backgroundImage: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1600&auto=format&fit=crop',
    description: 'Track research, writing and presentation prep for a group project.',
    lists: [
      { title: 'Research', cards: ['Find 10 academic sources', 'Summarise key papers'] },
      { title: 'Writing', cards: ['Draft introduction', 'Draft methodology section'] },
      { title: 'Review', cards: ['Peer review with group'] },
      { title: 'Presentation', cards: ['Build slide deck', 'Rehearse presentation'] },
      { title: 'Submitted', cards: [] },
    ],
  },
  {
    id: 'product-launch',
    name: 'Product Launch',
    icon: Rocket,
    background: 'amber',
    backgroundImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600&auto=format&fit=crop',
    description: 'Coordinate everything that has to happen before launch day.',
    lists: [
      { title: 'Backlog', cards: ['Finalise pricing', 'Prepare support documentation'] },
      { title: 'To Do', cards: ['Build landing page', 'Brief the sales team'] },
      { title: 'In Progress', cards: ['QA the checkout flow'] },
      { title: 'Launch Week', cards: ['Send launch announcement', 'Monitor system status'] },
      { title: 'Post-Launch', cards: ['Collect early feedback'] },
    ],
  },
  {
    id: 'content',
    name: 'Content Planning',
    icon: PenSquare,
    background: 'slate',
    backgroundImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1600&auto=format&fit=crop',
    description: 'An editorial calendar from idea to published piece.',
    lists: [
      { title: 'Ideas', cards: ['List blog topics for the quarter'] },
      { title: 'Outlining', cards: ['Outline "Getting started" guide'] },
      { title: 'Drafting', cards: ['Draft the changelog post'] },
      { title: 'Editing', cards: [] },
      { title: 'Published', cards: [] },
    ],
  },
];
