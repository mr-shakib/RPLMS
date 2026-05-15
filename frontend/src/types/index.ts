export type UserRole = "super_admin" | "supervisor" | "researcher" | "external";

export interface User {
  id: number;
  email: string;
  full_name: string;
  institution: string;
  department: string;
  orcid: string;
  profile_image: string | null;
  role: UserRole;
  is_email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export type PaperStatus =
  | "idea_proposed" | "topic_discussion" | "literature_review" | "gap_analysis"
  | "proposal_drafting" | "proposal_approved" | "dataset_collection" | "dataset_cleaning"
  | "model_development" | "experimentation" | "evaluation" | "result_analysis"
  | "initial_draft" | "figure_preparation" | "formatting" | "citation_checking"
  | "grammar_review" | "internal_review" | "supervisor_review" | "journal_selection"
  | "submission_ready" | "submitted" | "under_review" | "revision_requested"
  | "resubmitted" | "accepted" | "rejected" | "withdrawn" | "published";

export interface Paper {
  id: number;
  paper_id: string;
  title: string;
  short_title: string;
  abstract: string;
  status: PaperStatus;
  domain: string;
  keywords: string[];
  tags: string[];
  supervisor: User | null;
  created_by: User | null;
  literature_review_progress: number;
  dataset_progress: number;
  experiment_progress: number;
  writing_progress: number;
  revision_progress: number;
  overall_progress: number;
  created_at: string;
  updated_at: string;
}

export type TaskStatus = "todo" | "in_progress" | "waiting_review" | "completed" | "blocked";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Task {
  id: number;
  paper: number;
  title: string;
  description: string;
  assigned_to: number | null;
  priority: TaskPriority;
  status: TaskStatus;
  deadline: string | null;
  estimated_hours: number | null;
  parent_task: number | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: number;
  notification_type: string;
  title: string;
  message: string;
  is_read: boolean;
  link: string;
  created_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type VenueType = "journal" | "conference" | "workshop" | "preprint";
export type Quartile = "Q1" | "Q2" | "Q3" | "Q4" | "unranked";

export interface Venue {
  id: number;
  name: string;
  publisher: string;
  venue_type: VenueType;
  quartile: Quartile;
  impact_factor: number | null;
  submission_link: string;
  description: string;
  created_at: string;
}

export type SubmissionStatus =
  | "draft" | "submitted" | "under_review" | "revision_required"
  | "accepted" | "rejected" | "withdrawn" | "published";

export interface Submission {
  id: number;
  paper: number;
  venue: number;
  venue_detail: {
    id: number;
    name: string;
    venue_type: VenueType;
    quartile: Quartile;
    impact_factor: number | null;
    submission_link: string;
  };
  status: SubmissionStatus;
  attempt_number: number;
  submitted_at: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

export type RevisionType = "major" | "minor" | "camera_ready" | "accepted" | "rejected";

export interface ReviewerResponse {
  id: number;
  review: number;
  response_document_url: string;
  change_log: string;
  submitted_at: string;
}

export interface Review {
  id: number;
  submission: number;
  reviewer_label: string;
  comments: string;
  revision_type: RevisionType;
  received_at: string | null;
  created_at: string;
  response: ReviewerResponse | null;
}

export interface LiteratureEntry {
  id: number;
  paper: number | null;
  title: string;
  authors: string;
  year: number | null;
  doi: string;
  journal: string;
  source_url: string;
  summary: string;
  method: string;
  dataset: string;
  limitations: string;
  notes: string;
  tags: string[];
  added_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface Meeting {
  id: number;
  paper: number | null;
  title: string;
  meeting_date: string;
  location: string;
  agenda: string;
  notes: string;
  decisions: string;
  action_items: string;
  participant_ids: number[];
  participant_names: string[];
  created_by: number | null;
  created_at: string;
  updated_at: string;
}
