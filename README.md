# CampusGig 🎓

A student-to-student marketplace for posting, discovering, and accepting small gigs within a college community.

CampusGig helps students find peer support for tasks such as coding, design, presentations, tutoring, assignments, and event work. Posters can publish a gig with a description, category, deadline, and budget; other students can browse and filter available work.

## ✨ Features

- **Authentication:** Sign up and sign in with Supabase Auth.
- **Student profiles:** Add and edit college, branch, year of study, and contact details.
- **Post gigs:** Create a gig with a title, category, description, deadline, and budget.
- **Browse the marketplace:** Search gigs, filter by category, and sort by newest, budget, or deadline.
- **Track your work:** View gigs you posted and gigs you accepted.
- **Gig acceptance:** The app calls a Supabase `accept_gig` database function when a worker accepts a gig. The database function must enforce the one-worker-per-gig rule.
- **Live marketplace updates:** The feed subscribes to Supabase Realtime changes on the `gigs` table.
- **Responsive interface:** Built with Next.js, React, Tailwind CSS, and Lucide icons.

> **Project status:** CampusGig is under active development. Features that depend on Supabase configuration—such as the database schema, Row Level Security policies, the `accept_gig` function, and chat—must be configured and tested in your own Supabase project before deployment.

## 🧰 Tech Stack

| Technology | Purpose |
| --- | --- |
| [Next.js](https://nextjs.org/) (App Router) | React framework and application routes |
| [React](https://react.dev/) | User interface |
| [TypeScript](https://www.typescriptlang.org/) | Typed application code |
| [Tailwind CSS](https://tailwindcss.com/) | Styling |
| [Supabase](https://supabase.com/) | Authentication, PostgreSQL database, and Realtime |
| [Lucide React](https://lucide.dev/) | Icons |
| [Vercel](https://vercel.com/) | Deployment platform |

## 🗂️ Project Structure

The main application code lives in `src/`.

```text
CampusGig/
├── src/
│   ├── app/
│   │   ├── gigs/
│   │   │   ├── [id]/
│   │   │   └── new/
│   │   ├── login/
│   │   ├── profile/
│   │   ├── signup/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   ├── context/
│   │   └── AuthContext.tsx
│   └── lib/
│       └── supabase/
│           ├── client.ts
│           ├── server.ts
│           └── types.ts
├── package.json
└── README.md
```

## 🚀 Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (a current LTS release is recommended)
- npm
- A [Supabase](https://supabase.com/) project

### 2. Clone the repository

```bash
git clone https://github.com/anujj006/CampusGig.git
cd CampusGig
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a file named `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
```

Replace the example values with the URL and publishable/anon key from your Supabase project settings. These variable names are used by the app's Supabase client.

**Security notes**
- Never commit `.env.local` or any secret keys to GitHub.
- Do not put a Supabase `service_role` key in a `NEXT_PUBLIC_*` variable or expose it in browser code.
- Keep Row Level Security (RLS) enabled and configure policies for every table accessed by the client.

### 5. Configure Supabase

CampusGig expects Supabase tables and relationships for profiles and gigs. Gig acceptance calls a PostgreSQL function named `accept_gig` with a `p_gig_id` argument.

Before using the app, make sure your Supabase project has the required schema, foreign keys, RLS policies, and database function. The `accept_gig` function should perform acceptance atomically so two workers cannot claim the same gig, and policies should restrict users to actions and records they are authorized to access.

Do not assume the backend is configured automatically by adding the environment variables; verify it against your Supabase database setup.

### 6. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Build for production

```bash
npm run build
npm run start
```

## 🔐 Security Checklist

Before deploying or inviting real users, verify that:

- [ ] RLS is enabled on all tables exposed through the Supabase API.
- [ ] Users can only update their own profile.
- [ ] Only authorized users can create, edit, or cancel gigs.
- [ ] Gig acceptance is enforced atomically in the database, not only in the UI.
- [ ] Only the gig poster and assigned worker can access its private messages.
- [ ] Message read/write policies validate conversation participants.
- [ ] No service-role key or other server secret is exposed to the browser.
- [ ] Authentication, authorization, and concurrent gig acceptance have been tested.

## 🛣️ Roadmap

Potential improvements for future iterations:

- Complete and test the private messaging flow.
- Add gig completion and cancellation workflows.
- Add ratings and reviews after completed gigs.
- Add notifications for gig acceptance, messages, and deadlines.
- Add stronger college verification and optional search/filter enhancements.

## 🤝 Contributing

Contributions and suggestions are welcome.

1. Fork the repository.
2. Create a branch: `git checkout -b feature/your-feature`.
3. Commit your changes: `git commit -m "Describe your change"`.
4. Push the branch and open a pull request.

## 📄 License

No open-source license has been specified yet. Unless a license is added, you should not assume that the repository is licensed for unrestricted reuse.

---

Built for campus communities. 🎓
