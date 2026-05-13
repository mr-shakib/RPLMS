import type { User, PaperStatus } from "./index";

export interface PaperAuthor {
  id: number;
  paper: number;
  user: number | null;
  name: string;
  email: string;
  affiliation: string;
  department: string;
  orcid: string;
  google_scholar_link: string;
  author_order: number;
  contribution_percentage: number;
  is_corresponding: boolean;
}

export interface PaperMetadata {
  doi: string;
  issn: string;
  isbn: string;
  conference_name: string;
  publisher: string;
  journal_quartile: string;
  impact_factor: number | null;
  indexing: string[];
  apc_fee: number | null;
  acceptance_rate: number | null;
  submission_deadline: string | null;
}

export interface Milestone {
  id: number;
  paper: number;
  title: string;
  description: string;
  deadline: string;
  responsible_person: number | null;
  status: "pending" | "in_progress" | "completed" | "overdue";
  comments: string;
  created_at: string;
}

export interface PaperDetail {
  id: number;
  paper_id: string;
  title: string;
  short_title: string;
  abstract: string;
  problem_statement: string;
  research_gap: string;
  objective: string;
  methodology: string;
  expected_contribution: string;
  funding_source: string;
  ethics_approval_number: string;
  sdg_goals: number[];
  domain: string;
  keywords: string[];
  tags: string[];
  status: PaperStatus;
  supervisor: User | null;
  created_by: User | null;
  literature_review_progress: number;
  dataset_progress: number;
  experiment_progress: number;
  writing_progress: number;
  revision_progress: number;
  overall_progress: number;
  authors: PaperAuthor[];
  metadata: PaperMetadata | null;
  milestones: Milestone[];
  created_at: string;
  updated_at: string;
}

export const PAPER_STATUS_LABEL: Record<PaperStatus, string> = {
  idea_proposed: "Idea Proposed",
  topic_discussion: "Topic Discussion",
  literature_review: "Literature Review",
  gap_analysis: "Gap Analysis",
  proposal_drafting: "Proposal Drafting",
  proposal_approved: "Proposal Approved",
  dataset_collection: "Dataset Collection",
  dataset_cleaning: "Dataset Cleaning",
  model_development: "Model Development",
  experimentation: "Experimentation",
  evaluation: "Evaluation",
  result_analysis: "Result Analysis",
  initial_draft: "Initial Draft",
  figure_preparation: "Figure Preparation",
  formatting: "Formatting",
  citation_checking: "Citation Checking",
  grammar_review: "Grammar Review",
  internal_review: "Internal Review",
  supervisor_review: "Supervisor Review",
  journal_selection: "Journal Selection",
  submission_ready: "Submission Ready",
  submitted: "Submitted",
  under_review: "Under Review",
  revision_requested: "Revision Requested",
  resubmitted: "Resubmitted",
  accepted: "Accepted",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
  published: "Published",
};

export const STATUS_TRANSITIONS: Partial<Record<PaperStatus, { label: string; transition: string; variant?: "default" | "destructive" | "outline" }[]>> = {
  idea_proposed: [{ label: "Start Topic Discussion", transition: "start_topic_discussion" }],
  proposal_approved: [{ label: "Begin Development", transition: "begin_development" }],
  supervisor_review: [{ label: "Move to Submission", transition: "move_to_submission" }],
  submission_ready: [{ label: "Submit", transition: "submit" }],
  under_review: [
    { label: "Revision Requested", transition: "request_revision" },
    { label: "Accept", transition: "accept" },
    { label: "Reject", transition: "reject", variant: "destructive" },
  ],
  revision_requested: [{ label: "Accept", transition: "accept" }],
  accepted: [{ label: "Mark Published", transition: "publish" }],
};

export const STATUS_PHASE_COLOR: Record<string, string> = {
  idea_proposed: "bg-zinc-100 text-zinc-700",
  topic_discussion: "bg-zinc-100 text-zinc-700",
  literature_review: "bg-blue-50 text-blue-700",
  gap_analysis: "bg-blue-50 text-blue-700",
  proposal_drafting: "bg-blue-50 text-blue-700",
  proposal_approved: "bg-blue-100 text-blue-800",
  dataset_collection: "bg-yellow-50 text-yellow-700",
  dataset_cleaning: "bg-yellow-50 text-yellow-700",
  model_development: "bg-yellow-50 text-yellow-700",
  experimentation: "bg-yellow-50 text-yellow-700",
  evaluation: "bg-yellow-50 text-yellow-700",
  result_analysis: "bg-yellow-100 text-yellow-800",
  initial_draft: "bg-purple-50 text-purple-700",
  figure_preparation: "bg-purple-50 text-purple-700",
  formatting: "bg-purple-50 text-purple-700",
  citation_checking: "bg-purple-50 text-purple-700",
  grammar_review: "bg-purple-50 text-purple-700",
  internal_review: "bg-purple-50 text-purple-700",
  supervisor_review: "bg-purple-100 text-purple-800",
  journal_selection: "bg-orange-50 text-orange-700",
  submission_ready: "bg-orange-50 text-orange-700",
  submitted: "bg-orange-50 text-orange-700",
  under_review: "bg-orange-100 text-orange-800",
  revision_requested: "bg-red-50 text-red-700",
  resubmitted: "bg-orange-50 text-orange-700",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  withdrawn: "bg-zinc-100 text-zinc-600",
  published: "bg-green-200 text-green-900",
};
