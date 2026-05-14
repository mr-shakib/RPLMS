"use client";

import { useState } from "react";
import Link from "next/link";
import { useSubmissions, useDeleteSubmission, useReviews, useDeleteReview } from "@/hooks/useSubmissions";
import { usePapers } from "@/hooks/usePapers";
import { AddSubmissionDialog } from "@/components/add-submission-dialog";
import { AddReviewDialog } from "@/components/add-review-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import type { Submission, Review } from "@/types";

const STATUS_COLOR: Record<string, string> = {
  draft: "bg-zinc-100 text-zinc-700",
  submitted: "bg-blue-50 text-blue-700",
  under_review: "bg-yellow-50 text-yellow-700",
  revision_required: "bg-orange-50 text-orange-700",
  accepted: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
  withdrawn: "bg-zinc-100 text-zinc-500",
  published: "bg-purple-50 text-purple-700",
};

const REVISION_TYPE_LABEL: Record<string, string> = {
  major: "Major",
  minor: "Minor",
  camera_ready: "Camera Ready",
  accepted: "Accept",
  rejected: "Reject",
};

function ReviewsSection({ submissionId }: { submissionId: number }) {
  const { data: reviews = [] } = useReviews(submissionId);
  const deleteReview = useDeleteReview(submissionId);

  if (reviews.length === 0) {
    return <p className="text-xs text-muted-foreground px-4 py-2">No reviews yet.</p>;
  }

  return (
    <div className="divide-y border-t bg-zinc-50/50">
      {reviews.map((rev: Review) => (
        <div key={rev.id} className="flex gap-4 px-6 py-3">
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-muted-foreground">{rev.reviewer_label}</span>
              {rev.revision_type && (
                <Badge variant="outline" className="text-xs px-1.5 py-0">
                  {REVISION_TYPE_LABEL[rev.revision_type] ?? rev.revision_type}
                </Badge>
              )}
              {rev.received_at && (
                <span className="text-xs text-muted-foreground">
                  {new Date(rev.received_at).toLocaleDateString()}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{rev.comments}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-red-400 hover:text-red-600 hover:bg-red-50"
            onClick={() =>
              deleteReview.mutate(rev.id, {
                onSuccess: () => toast.success("Review removed."),
                onError: () => toast.error("Failed to remove review."),
              })
            }
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
    </div>
  );
}

function SubmissionRow({ sub, onDelete }: { sub: Submission; onDelete: (id: number) => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border bg-white">
      <div className="flex items-start gap-3 px-5 py-4">
        <button
          className="mt-1 shrink-0 text-muted-foreground hover:text-zinc-700"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold">{sub.venue_detail?.name ?? `Venue #${sub.venue}`}</span>
            {sub.venue_detail?.quartile && sub.venue_detail.quartile !== "unranked" && (
              <Badge variant="outline" className="text-xs">{sub.venue_detail.quartile}</Badge>
            )}
            <Badge className={`text-xs px-2 py-0.5 border-0 capitalize ${STATUS_COLOR[sub.status] ?? ""}`}>
              {sub.status.replace(/_/g, " ")}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            <span>Attempt #{sub.attempt_number}</span>
            {sub.submitted_at && (
              <span>Submitted {new Date(sub.submitted_at).toLocaleDateString()}</span>
            )}
            {sub.venue_detail?.submission_link && (
              <a
                href={sub.venue_detail.submission_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 hover:underline"
              >
                Submission portal <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
          {sub.notes && <p className="text-xs text-muted-foreground mt-1">{sub.notes}</p>}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <AddReviewDialog submissionId={sub.id} />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50"
            onClick={() => onDelete(sub.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {expanded && <ReviewsSection submissionId={sub.id} />}
    </div>
  );
}

export default function SubmissionsPage() {
  const [paperFilter, setPaperFilter] = useState<string>("all");
  const { data: submissions = [], isLoading } = useSubmissions(
    paperFilter !== "all" ? paperFilter : undefined
  );
  const { data: papersData } = usePapers();
  const deleteSub = useDeleteSubmission(paperFilter !== "all" ? paperFilter : undefined);

  const handleDelete = (id: number) => {
    deleteSub.mutate(id, {
      onSuccess: () => toast.success("Submission removed."),
      onError: () => toast.error("Failed to remove submission."),
    });
  };

  const papers = papersData?.results ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Submissions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track venue submissions and reviewer feedback
          </p>
        </div>
        {paperFilter !== "all" && <AddSubmissionDialog paperId={paperFilter} />}
      </div>

      <div className="flex items-center gap-3">
        <Select value={paperFilter} onValueChange={(v) => setPaperFilter(v as string)}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="All papers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All papers</SelectItem>
            {papers.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>
                {p.short_title || p.title.slice(0, 35)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-sm text-muted-foreground">Loading…</div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-20 text-sm text-muted-foreground">
          {paperFilter === "all"
            ? "No submissions yet. Select a paper to add one."
            : "No submissions for this paper yet."}
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub: Submission) => {
            const paper = papers.find((p) => p.id === sub.paper);
            return (
              <div key={sub.id} className="space-y-1">
                {paperFilter === "all" && paper && (
                  <Link
                    href={`/papers/${paper.id}`}
                    className="text-xs font-medium text-muted-foreground hover:text-zinc-900 ml-8"
                  >
                    {paper.short_title || paper.title.slice(0, 60)}
                  </Link>
                )}
                <SubmissionRow sub={sub} onDelete={handleDelete} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
