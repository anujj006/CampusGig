export type GigCategory =
  | "assignments"
  | "coding"
  | "design"
  | "presentations"
  | "tutoring"
  | "errands"
  | "events"
  | "other";

export type GigStatus =
  | "open"
  | "locked"
  | "submitted"
  | "completed"
  | "cancelled"
  | "expired";

export interface Profile {
  id: string;
  name: string;
  email: string;
  college?: string | null;
  branch?: string | null;
  year?: number | null;
  phone?: string | null;
  avatar_url?: string | null;
  rating_as_poster?: number | null;
  count_as_poster?: number;
  rating_as_worker?: number | null;
  count_as_worker?: number;
  created_at?: string;
}

export interface Gig {
  id: string;
  poster_id: string;
  worker_id?: string | null;
  title: string;
  description: string;
  category: GigCategory;
  amount: number;
  deadline: string;
  status: GigStatus;
  created_at: string;
  accepted_at?: string | null;
  submitted_at?: string | null;
  completed_at?: string | null;
  cancelled_at?: string | null;
  cancel_reason?: string | null;
  // Joined relation fields
  poster?: Profile | null;
  worker?: Profile | null;
}

export interface Message {
  id: string;
  gig_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_at?: string | null;
  sender?: Profile | null;
}

export interface Review {
  id: string;
  gig_id: string;
  reviewer_id: string;
  reviewee_id: string;
  reviewee_role: "poster" | "worker";
  rating: number;
  comment?: string | null;
  created_at: string;
}
