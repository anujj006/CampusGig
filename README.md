# CampusGig — College Student Marketplace App

A modern peer-to-peer campus marketplace built for college students. Students can raise gig requests (assignments, coding, tutoring, design, errands) with a description, deadline, and bounty in ₹. When a student worker accepts the gig, it instantly locks and opens a dedicated real-time conversation gateway where both parties can coordinate, share progress, submit deliverables, and complete payments.

---

## Live Supabase Integration

Connected directly to the user's Supabase project **CampusGig** (`goaktsldqbdpboppujdm`):
- **Authentication**: Email/password signup, login, session persistence via `@supabase/ssr` cookies and Next.js middleware.
- **Database Schema**:
  - `public.profiles`: College affiliation, branch, year of study, verified `.ac.in` status, and separate poster/worker reputation scores.
  - `public.gigs`: Status lifecycle (`open` ➔ `locked` ➔ `submitted` ➔ `completed` / `cancelled`), categories, deadlines, and bounty amounts in ₹.
  - `public.messages`: Real-time chat messages between student and worker.
  - `public.reviews`: Dual-role ratings (1–5 stars) and feedback comments.
- **Database Stored Procedures**:
  - `accept_gig(p_gig_id)`: Atomically locks an open gig, sets `worker_id`, and unlocks the messaging gateway.
  - `submit_gig(p_gig_id)`: Allows assigned worker to mark work as submitted.
  - `complete_gig(p_gig_id)`: Allows student poster to approve work and release escrow hold.
  - `request_rework(p_gig_id)`: Reopens work for revision if needed.
  - `cancel_gig(p_gig_id, p_reason)`: Cancels gig with reason.
- **Supabase Realtime**: Live WebSocket subscriptions for instant incoming messages and marketplace feed updates.

---

## CampPulse Direct Design System (Stitch)

Styled to match the **CampPulse Direct** theme from the Stitch project **Campus Gig Marketplace App**:
- **Electric Violet (`#6C47FF`)**: Primary brand actions, floating center action dock, active tab states.
- **Campus Emerald (`#10B981`)**: Verified badges, accepted status, completed state, earner highlights.
- **Quick Amber (`#F59E0B`)**: Deadline urgency pills (`Due in 2h`, `Due tomorrow`).
- **Typography**: Plus Jakarta Sans with rupee formatting (`₹450`).
- **Tactile UI**: Smooth rounded corners (`rounded-tactile`), ambient drop shadows, category filter pills, and sticky mobile navigation.

---

## Quick Start

### 1. Start Development Server
```bash
cd C:\Users\ASUS\.gemini\antigravity\scratch\campus-gig
npm run dev
```
Open **http://localhost:3000** in your browser.

### 2. Pre-Configured Test Accounts

You can log in immediately or sign up fresh accounts:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Student (Poster)** | `aarav.student@gmail.com` | `CampusPassword123!` |
| **Worker (Earner)** | `priya.worker@gmail.com` | `CampusPassword123!` |

---

## Application Structure

```
campus-gig/
├── src/
│   ├── app/
│   │   ├── page.tsx            # Marketplace feed with category pills, search & sorting
│   │   ├── login/page.tsx      # Student / Worker tabbed login
│   │   ├── signup/page.tsx     # Student / Worker registration with college & branch details
│   │   ├── gigs/
│   │   │   ├── new/page.tsx    # Post Gig form (bounty presets, deadline picker, category)
│   │   │   └── [id]/page.tsx   # Gig detail page with Accept Gig CTA
│   │   ├── chat/
│   │   │   ├── page.tsx        # Conversation list for all active locked gigs
│   │   │   └── [gigId]/page.tsx# Direct Conversation Gateway with Supabase Realtime
│   │   └── profile/page.tsx    # Profile management, reputation ratings & gig history
│   ├── components/
│   │   ├── Navbar.tsx          # Campus brand header, role switcher & profile dropdown
│   │   ├── BottomNav.tsx       # Sticky mobile bottom bar with elevated Post button
│   │   ├── GigCard.tsx         # Marketplace card (₹ bounty, category pill, poster badge)
│   │   ├── CategoryPills.tsx   # Category filter chips
│   │   ├── StatusBadge.tsx     # Status pills (Open, Locked, Submitted, Completed)
│   │   └── RealtimeChat.tsx    # Live WebSocket messaging thread + workflow actions
│   ├── context/
│   │   └── AuthContext.tsx     # Supabase auth session, profile & role switcher
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts       # Browser-side createClient (@supabase/ssr)
│   │   │   ├── server.ts       # Server-side createClient (@supabase/ssr)
│   │   │   ├── middleware.ts   # Session refresh helper
│   │   │   └── types.ts        # Full database types & enums
│   │   └── utils.ts            # Formatting helpers (₹ Rupees, dates, initials, categories)
│   └── middleware.ts           # Next.js route middleware for cookie session sync
└── tailwind.config.ts          # CampPulse Direct colors & tactile shadow configuration
```
