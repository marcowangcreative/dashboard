# Wang Work Brain

Jordan + Marco's project dashboard. Next.js 15 + Supabase, deployable to `dashboard.marcowang.com`.

Ported from the single-file HTML prototype. Same design (Fraunces + Instrument Sans, paper palette, category tints), same views (cards + force-directed graph), now backed by a real database so edits persist across devices and can be shared between two people.

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Set up Supabase
#    - Create a new Supabase project at https://supabase.com/dashboard
#    - In the SQL editor, paste and run: supabase/schema.sql
#    - Then paste and run: supabase/seed.sql (loads all 11 projects)
#    - Copy your project URL + anon key from Settings -> API

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local and fill in the three Supabase values.

# 4. Run locally
npm run dev
# Open http://localhost:3000
```

## Deploy to `dashboard.marcowang.com`

1. **Push to GitHub.** Create `marcowangcreative/dashboard` and push this folder.
2. **Import into Vercel.** In the MWP Projects Vercel org, "Add New... > Project" → select the repo. Keep defaults.
3. **Add env vars.** In the Vercel project settings → Environment Variables, add the same three keys from `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. **Deploy.** Vercel builds automatically.
5. **Wire the domain.** In the Vercel project → Settings → Domains, add `dashboard.marcowang.com`. Vercel shows you the CNAME target; add that to your DNS provider for `marcowang.com`. Propagation is usually under 10 minutes.

That's it — you're live.

## What's in the box

```
dashboard/
├── README.md
├── package.json
├── tsconfig.json, next.config.mjs, tailwind.config.ts, postcss.config.mjs
├── .env.example
├── supabase/
│   ├── schema.sql            # Creates `projects` table + RLS
│   └── seed.sql              # 11 seed projects (Photo, Hair, Weddings, Misc)
└── src/
    ├── app/
    │   ├── layout.tsx        # Fonts, global shell
    │   ├── page.tsx          # Server-rendered root, fetches initial data
    │   └── globals.css       # Paper grain, vignette, category washes
    ├── components/
    │   ├── Masthead.tsx      # "Wang Work Brain" header
    │   ├── Dashboard.tsx     # Main client component: toolbar, filters, cards
    │   ├── ProjectModal.tsx  # Add/edit form (title, tagline, category, status, stack, links, related, notes)
    │   └── GraphView.tsx     # D3 force-directed graph
    └── lib/
        ├── supabase.ts       # Supabase client (anon + server-role)
        ├── actions.ts        # Server actions: fetch, upsert, delete, sync reciprocal relationships
        ├── types.ts          # Project, Category, Status, Links
        ├── constants.ts      # CATEGORIES, STATUSES, LINK_TYPES
        └── utils.ts          # uid, splitUrls, deriveLinkLabel, timeAgo, linkify
```

## The data model

One table: `public.projects`. Keys on `id` (stable slug like `seed/photobox` for seed projects, `user/xxxxxxxx` random for new ones you create).

| column       | type         | notes |
|--------------|--------------|-------|
| id           | text PK      | stable |
| title        | text         | required |
| tagline      | text         | one-line description |
| category     | text         | photo / hair / weddings / misc |
| status       | text         | idea / building / live / shelved |
| stack        | text[]       | tech tags |
| links        | jsonb        | `{ live, repo, admin, host, design, docs }` — comma-separate values for multi-URL |
| related      | text[]       | IDs of other projects this one connects to |
| next_action  | text         | the single next move |
| notes        | text         | free-form; URLs auto-link in the UI |
| sort_order   | integer      | for stable ordering |
| updated_at   | timestamptz  | auto-bumped on write |

## Current state of things

**Works:** Cards view · Graph view (force-directed with category bands) · add/edit/delete · filters by status and category · cycle status · reciprocal relationship sync · link-slot auto-labeling (Repo · App / Repo · Backend / Host · Web / Host · Backend) · hover-to-highlight in graph · click node → edit modal.

**Not yet wired (intentionally deferred):**

- **Auth.** Anyone who knows the URL can read and write. For MVP that's fine while it's just you two and the URL is unguessed. To add auth, turn on Supabase Email magic-link, gate the app behind a middleware check, and replace the `anon` RLS policies in `schema.sql` with an allowlist like `auth.email() in ('jordan@…', 'marco@…')`.
- **Real-time sync.** Currently the page fetches on load. To get live updates when Marco edits from his laptop, add a Supabase `postgres_changes` subscription in `Dashboard.tsx` that updates the `projects` state on change.
- **Claude context export.** The prototype HTML had a "Copy Claude context" button that builds a markdown digest. Port that function from the HTML file (it's a pure function of the projects array) into a component.
- **Import/Export JSON.** Same — in the prototype, not in this yet.
- **GitHub last-commit integration.** Could hit the GitHub API for each project with a repo link and show "last commit 3d ago" as a more accurate freshness signal than `updated_at`.

None are hard; the scaffolding is set up to accept them.

## Design notes

Type pairing: [Fraunces](https://fonts.google.com/specimen/Fraunces) (display serif, warm italic via the SOFT axis) + [Instrument Sans](https://fonts.google.com/specimen/Instrument+Sans) (UI) + [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) (labels, index numbers). All three loaded via `next/font/google` so they're zero-request on production.

Palette is warm paper (`#F1EAD9` base, `#E7DEC8` cards) with four category hues that tint the card backgrounds subtly rather than shouting on the edge:

- **Photo** — deep teal-slate `#2E5568`
- **Weddings** — dusty plum `#8E5378` (the bridge between the two businesses)
- **Hair** — terracotta-rose `#A8574E`
- **Misc** — warm stone `#7F7869`

Accent for primary actions is terracotta `#B0451F`. Sage green `#3E5B44` for "live" status.

## License

Private. Not for redistribution.
