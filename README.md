# Board — Checklist & Calendar

A task checklist with auto-completing subtasks, a Done archive grouped by
category/subject, and a Notion-style calendar (3‑day / week / month).

## Tech stack

- **Next.js 14** (App Router) + **TypeScript**
- **Prisma** ORM + **PostgreSQL**
- **Tailwind CSS** (plus a small set of hand-written component classes in
  `globals.css` for the sidebar/task/calendar look)
- **date-fns** for calendar date math
- Plain `fetch` calls from a client hook (`useBoard`) — no extra data-fetching
  library

## Folder structure

```
checklist-app/
├── prisma/
│   ├── schema.prisma        # Category, Task, Subtask models
│   └── seed.ts               # seeds the 5 default categories
├── src/
│   ├── app/
│   │   ├── layout.tsx         # fonts + global shell
│   │   ├── page.tsx           # main client page (wires everything together)
│   │   ├── globals.css        # design tokens + component classes
│   │   └── api/
│   │       ├── categories/
│   │       │   ├── route.ts        # GET, POST
│   │       │   └── [id]/route.ts   # PATCH, DELETE
│   │       ├── tasks/
│   │       │   ├── route.ts        # GET (filters), POST
│   │       │   └── [id]/
│   │       │       ├── route.ts        # PATCH, DELETE
│   │       │       └── subtasks/route.ts  # PUT — replace subtask list
│   │       └── subtasks/
│   │           └── [id]/route.ts   # PATCH — toggle done, auto-completes parent
│   ├── components/
│   │   ├── Sidebar.tsx
│   │   ├── TaskCard.tsx
│   │   ├── TaskList.tsx        # Active / Done views
│   │   ├── TaskModal.tsx       # add/edit form with subtask rows
│   │   └── Calendar/
│   │       ├── CalendarView.tsx    # mode switch + nav
│   │       ├── MonthGrid.tsx
│   │       └── ColumnsView.tsx     # shared by 3-day and week modes
│   ├── hooks/
│   │   └── useBoard.ts         # fetches + mutates categories/tasks
│   └── lib/
│       ├── prisma.ts           # Prisma client singleton
│       ├── types.ts            # Category / Task / Subtask types
│       └── dates.ts            # date-fns helpers
├── .env.example
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

## How it works

- **Categories** carry a name, a color, and a `subjectLabel` (what the
  "subject/tag" field is called for that category — e.g. *Subject* for
  School, *Project* for Nexora). Seeded defaults: School, Nexora Solutions,
  LG Esports, Rental Management, Personal — edit `prisma/seed.ts` to change
  them.
- **Tasks** belong to a category, optionally carry a subject/tag and a due
  date, and can have any number of **subtasks**.
- **Auto-completion**: a task with subtasks can't be checked off by hand —
  it's marked `completed` automatically the moment every one of its
  subtasks is done (and un-marked if you re-open one). This logic lives in
  the API routes (`/api/subtasks/[id]` and `/api/tasks/[id]/subtasks`), not
  just the UI, so it stays correct no matter what calls it.
- **Done view** groups completed tasks by category, then by subject, most
  recently completed first, and shows each task's full subtask list inline.
- **Calendar** reads every task's `due` date and buckets them by day; the
  3‑day and week modes share one column-based renderer, month uses a 6‑week
  grid. Clicking a day's `+` opens the add-task modal pre-filled with that
  date.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up PostgreSQL** — either a local install or a hosted instance
   (Supabase, Neon, Railway, etc. all work). Copy the env file and fill in
   your connection string:
   ```bash
   cp .env.example .env
   ```
   ```
   DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/checklist_board?schema=public"
   ```

3. **Create the database schema**
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Seed the default categories** (skip this if you'd rather start empty)
   ```bash
   npx prisma db seed
   ```

5. **Run it**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000.

## Other useful commands

- `npm run prisma:studio` — a GUI to browse/edit the database directly
- `npm run build && npm start` — production build
- `npx prisma migrate dev --name <change>` — after editing `schema.prisma`

## Extending it

- **Auth**: there's no login yet — everyone who can reach the app shares one
  board. If you deploy this somewhere others can access, add NextAuth (or
  similar) and scope `Category`/`Task` rows to a `userId`.
- **Reordering / priorities**: `Subtask.order` already exists for drag-reorder
  if you want to wire up a drag library later.
- **Notifications/reminders**: nothing polls due dates yet; a cron job or a
  scheduled Vercel function reading tasks with `due <= now` is the natural
  next step.
