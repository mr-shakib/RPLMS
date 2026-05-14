"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useSubmissions, useDeleteSubmission,
  useReviews, useDeleteReview,
  useVenues, useDeleteVenue,
} from "@/hooks/useSubmissions";
import { usePapers } from "@/hooks/usePapers";
import { AddSubmissionDialog } from "@/components/add-submission-dialog";
import { AddReviewDialog } from "@/components/add-review-dialog";
import { AddVenueDialog } from "@/components/add-venue-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, ChevronDown, ChevronRight, ExternalLink, Globe } from "lucide-react";
import { toast } from "sonner";
import type { Submission, Review, Venue } from "@/types";

const SUBMISSION_STATUS_COLOR: Record<string, string> = {
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
  major: "Major", minor: "Minor", camera_ready: "Camera Ready",
  accepted: "Accept", rejected: "Reject",
};

const QUARTILE_COLOR: Record<string, string> = {
  Q1: "bg-green-50 text-green-700",
  Q2: "bg-blue-50 text-blue-700",
  Q3: "bg-yellow-50 text-yellow-700",
  Q4: "bg-orange-50 text-orange-700",
  unranked: "bg-zinc-100 text-zinc-500",
};

const VENUE_TYPE_LABEL: Record<string, string> = {
  journal: "Journal", conference: "Conference", workshop: "Workshop", preprint: "Preprint",
};

// ── Reviews section ──────────────────────────────────────────────────────────
function ReviewsSection({ submissionId }: { submissionId: number }) {
  const { data: reviews = [] } = useReviews(submissionId);
  const deleteReview = useDeleteReview(submissionId);

  if (reviews.length === 0)
    return <p className="text-xs text-muted-foreground px-6 py-3">No reviewer feedback yet.</p>;

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
          <button
            className="h-7 w-7 shrink-0 flex items-center justify-center rounded text-red-400 hover:text-red-600 hover:bg-red-50"
            onClick={() => deleteReview.mutate(rev.id, {
              onSuccess: () => toast.success("Review removed."),
              onError: () => toast.error("Failed to remove review."),
            })}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Single submission row ─────────────────────────────────────────────────────
function SubmissionRow({ sub, onDelete }: { sub: Submission; onDelete: (id: number) => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border bg-white">
      <div className="flex items-start gap-3 px-5 py-4">
        <button
          className="mt-0.5 shrink-0 text-muted-foreground hover:text-zinc-700"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded
            ? <ChevronDown className="h-4 w-4" />
            : <ChevronRight className="h-4 w-4" />}
        </button>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold">{sub.venue_detail?.name ?? `Venue #${sub.venue}`}</span>
            {sub.venue_detail?.quartile && sub.venue_detail.quartile !== "unranked" && (
              <Badge className={`text-xs px-1.5 py-0 border-0 ${QUARTILE_COLOR[sub.venue_detail.quartile]}`}>
                {sub.venue_detail.quartile}
              </Badge>
            )}
            <Badge className={`text-xs px-2 py-0.5 border-0 capitalize ${SUBMISSION_STATUS_COLOR[sub.status] ?? ""}`}>
              {sub.status.replace(/_/g, " ")}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            <span>Attempt #{sub.attempt_number}</span>
            {sub.submitted_at && <span>Submitted {new Date(sub.submitted_at).toLocaleDateString()}</span>}
            {sub.venue_detail?.submission_link && (
              <a href={sub.venue_detail.submission_link} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 hover:underline">
                Portal <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
          {sub.notes && <p className="text-xs text-muted-foreground">{sub.notes}</p>}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <AddReviewDialog submissionId={sub.id} />
          <button
            className="h-7 w-7 flex items-center justify-center rounded text-red-400 hover:text-red-600 hover:bg-red-50"
            onClick={() => onDelete(sub.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {expanded && <ReviewsSection submissionId={sub.id} />}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SubmissionsPage() {
  const [paperFilter, setPaperFilter] = useState<string>("all");

  const { data: submissions = [], isLoading: subsLoading } = useSubmissions(
    paperFilter !== "all" ? paperFilter : undefined
  );
  const { data: venues = [], isLoading: venuesLoading } = useVenues();
  const { data: papersData } = usePapers();

  const deleteSub = useDeleteSubmission(paperFilter !== "all" ? paperFilter : undefined);
  const deleteVenue = useDeleteVenue();

  const papers = papersData?.results ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Submissions</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track journal/conference submissions and manage your venue database
        </p>
      </div>

      <Tabs defaultValue="submissions">
        <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0 gap-0">
          {[
            { value: "submissions", label: "Submissions", count: submissions.length },
            { value: "venues", label: "Venues", count: venues.length },
          ].map(({ value, label, count }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 data-[state=active]:bg-transparent pb-2 px-4 text-sm"
            >
              {label}
              {count > 0 && (
                <span className="ml-1.5 rounded-full bg-zinc-100 px-1.5 py-0.5 text-xs tabular-nums">
                  {count}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── Submissions tab ── */}
        <TabsContent value="submissions" className="mt-6 space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Select value={paperFilter} onValueChange={(v) => setPaperFilter(v as string)}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="All papers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All papers</SelectItem>
                {papers.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.short_title || p.title.slice(0, 40)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {paperFilter !== "all" && <AddSubmissionDialog paperId={paperFilter} />}
          </div>

          {subsLoading ? (
            <div className="text-center py-12 text-sm text-muted-foreground">Loading…</div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-16 text-sm text-muted-foreground">
              {paperFilter === "all"
                ? "Select a paper above to view or add its submissions."
                : "No submissions for this paper yet."}
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((sub: Submission) => {
                const paper = papers.find((p) => p.id === sub.paper);
                return (
                  <div key={sub.id} className="space-y-1">
                    {paperFilter === "all" && paper && (
                      <Link href={`/papers/${paper.id}`}
                        className="text-xs font-medium text-muted-foreground hover:text-zinc-900 ml-8">
                        {paper.short_title || paper.title.slice(0, 60)}
                      </Link>
                    )}
                    <SubmissionRow
                      sub={sub}
                      onDelete={(id) => deleteSub.mutate(id, {
                        onSuccess: () => toast.success("Submission removed."),
                        onError: () => toast.error("Failed to remove submission."),
                      })}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ── Venues tab ── */}
        <TabsContent value="venues" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {venues.length} venue{venues.length !== 1 ? "s" : ""} in database
            </p>
            <AddVenueDialog />
          </div>

          {venuesLoading ? (
            <div className="text-center py-12 text-sm text-muted-foreground">Loading…</div>
          ) : venues.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16">
              <Globe className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No venues yet — add journals and conferences here.</p>
              <AddVenueDialog />
            </div>
          ) : (
            <div className="rounded-xl border bg-white overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-zinc-50/80">
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Name</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide w-28">Type</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide w-20">Quartile</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide w-24 hidden md:table-cell">IF</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Publisher</th>
                    <th className="px-4 py-2.5 w-20" />
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {venues.map((v: Venue, idx) => (
                    <tr key={v.id} className={idx % 2 === 1 ? "bg-zinc-50/40" : ""}>
                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          <span className="font-medium">{v.name}</span>
                          {v.description && (
                            <p className="text-xs text-muted-foreground truncate max-w-xs">{v.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-xs capitalize">
                          {VENUE_TYPE_LABEL[v.venue_type] ?? v.venue_type}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {v.quartile && (
                          <Badge className={`text-xs px-1.5 py-0 border-0 ${QUARTILE_COLOR[v.quartile]}`}>
                            {v.quartile}
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-sm tabular-nums text-muted-foreground">
                          {v.impact_factor ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-sm text-muted-foreground">{v.publisher || "—"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {v.submission_link && (
                            <a href={v.submission_link} target="_blank" rel="noopener noreferrer"
                              className="h-7 w-7 flex items-center justify-center rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
                              title="Open submission portal">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                          <button
                            className="h-7 w-7 flex items-center justify-center rounded text-red-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => deleteVenue.mutate(v.id, {
                              onSuccess: () => toast.success("Venue removed."),
                              onError: () => toast.error("Failed to remove venue."),
                            })}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
