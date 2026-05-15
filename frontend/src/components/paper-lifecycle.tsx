"use client";

import { Check, Circle, Lock, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { PaperStatus } from "@/types";

const PHASES: { label: string; color: string; statuses: { key: PaperStatus; label: string }[] }[] = [
  {
    label: "Planning",
    color: "blue",
    statuses: [
      { key: "idea_proposed", label: "Idea Proposed" },
      { key: "topic_discussion", label: "Topic Discussion" },
      { key: "literature_review", label: "Literature Review" },
      { key: "gap_analysis", label: "Gap Analysis" },
      { key: "proposal_drafting", label: "Proposal Drafting" },
      { key: "proposal_approved", label: "Proposal Approved" },
    ],
  },
  {
    label: "Development",
    color: "yellow",
    statuses: [
      { key: "dataset_collection", label: "Dataset Collection" },
      { key: "dataset_cleaning", label: "Dataset Cleaning" },
      { key: "model_development", label: "Model Development" },
      { key: "experimentation", label: "Experimentation" },
      { key: "evaluation", label: "Evaluation" },
      { key: "result_analysis", label: "Result Analysis" },
    ],
  },
  {
    label: "Writing",
    color: "purple",
    statuses: [
      { key: "initial_draft", label: "Initial Draft" },
      { key: "figure_preparation", label: "Figure Prep" },
      { key: "formatting", label: "Formatting" },
      { key: "citation_checking", label: "Citation Check" },
      { key: "grammar_review", label: "Grammar Review" },
      { key: "internal_review", label: "Internal Review" },
      { key: "supervisor_review", label: "Supervisor Review" },
    ],
  },
  {
    label: "Submission",
    color: "orange",
    statuses: [
      { key: "journal_selection", label: "Journal Selection" },
      { key: "submission_ready", label: "Submission Ready" },
      { key: "submitted", label: "Submitted" },
      { key: "under_review", label: "Under Review" },
      { key: "revision_requested", label: "Revision Requested" },
      { key: "resubmitted", label: "Resubmitted" },
    ],
  },
  {
    label: "Outcome",
    color: "green",
    statuses: [
      { key: "accepted", label: "Accepted" },
      { key: "published", label: "Published" },
    ],
  },
];

const TERMINAL: PaperStatus[] = ["rejected", "withdrawn"];
const ORDERED: PaperStatus[] = PHASES.flatMap((p) => p.statuses.map((s) => s.key));

const PHASE_HEADER: Record<string, string> = {
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
  purple: "bg-purple-50 text-purple-700 border-purple-200",
  orange: "bg-orange-50 text-orange-700 border-orange-200",
  green: "bg-green-50 text-green-700 border-green-200",
};

const PHASE_DOT_DONE: Record<string, string> = {
  blue: "bg-blue-500 border-blue-500",
  yellow: "bg-yellow-500 border-yellow-500",
  purple: "bg-purple-500 border-purple-500",
  orange: "bg-orange-500 border-orange-500",
  green: "bg-green-500 border-green-500",
};

const PHASE_DOT_CURRENT: Record<string, string> = {
  blue: "border-blue-500 bg-white",
  yellow: "border-yellow-500 bg-white",
  purple: "border-purple-500 bg-white",
  orange: "border-orange-500 bg-white",
  green: "border-green-500 bg-white",
};

const PHASE_DOT_CURRENT_INNER: Record<string, string> = {
  blue: "bg-blue-500",
  yellow: "bg-yellow-500",
  purple: "bg-purple-500",
  orange: "bg-orange-500",
  green: "bg-green-500",
};

const PHASE_LINE_DONE: Record<string, string> = {
  blue: "bg-blue-300",
  yellow: "bg-yellow-300",
  purple: "bg-purple-300",
  orange: "bg-orange-300",
  green: "bg-green-300",
};

const PHASE_NEXT_BTN: Record<string, string> = {
  blue: "border-blue-300 text-blue-700 hover:bg-blue-50",
  yellow: "border-yellow-300 text-yellow-700 hover:bg-yellow-50",
  purple: "border-purple-300 text-purple-700 hover:bg-purple-50",
  orange: "border-orange-300 text-orange-700 hover:bg-orange-50",
  green: "border-green-300 text-green-700 hover:bg-green-50",
};

export interface LifecycleTransition {
  label: string;
  transition: string;
  variant?: "default" | "destructive" | "outline";
}

interface Props {
  currentStatus: PaperStatus;
  availableTransitions?: LifecycleTransition[];
  onTransition?: (transition: string, label: string) => void;
  isPending?: boolean;
}

export function PaperLifecycle({ currentStatus, availableTransitions = [], onTransition, isPending }: Props) {
  const isTerminal = TERMINAL.includes(currentStatus);
  const currentIdx = ORDERED.indexOf(currentStatus);

  return (
    <div className="space-y-6">
      {isTerminal && (
        <div className={cn(
          "rounded-lg border px-4 py-3 text-sm font-medium",
          currentStatus === "rejected"
            ? "bg-red-50 border-red-200 text-red-700"
            : "bg-zinc-100 border-zinc-200 text-zinc-600"
        )}>
          {currentStatus === "rejected" ? "Paper has been rejected." : "Paper has been withdrawn."}
        </div>
      )}

      {/* Transition controls */}
      {availableTransitions.length > 0 && onTransition && (
        <div className="rounded-xl border bg-white px-5 py-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Advance status
          </p>
          <div className="flex flex-wrap gap-2">
            {availableTransitions.map(({ label, transition, variant = "default" }) => (
              <Button
                key={transition}
                size="sm"
                variant={variant}
                disabled={isPending}
                onClick={() => onTransition(transition, label)}
                className="gap-2"
              >
                {isPending
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <ArrowRight className="h-3.5 w-3.5" />}
                {label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Visual pipeline */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {PHASES.map((phase) => {
          const phaseIdx = phase.statuses.findIndex((s) => s.key === currentStatus);
          const lastStatusInPhase = phase.statuses[phase.statuses.length - 1].key;
          const phaseIsDone = phaseIdx === -1 && currentIdx > ORDERED.indexOf(lastStatusInPhase);

          return (
            <div key={phase.label} className="space-y-2">
              {/* Phase header */}
              <div className={cn(
                "rounded-md border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-center",
                PHASE_HEADER[phase.color],
                phaseIsDone && "opacity-60",
              )}>
                {phase.label}
                {phaseIsDone && " ✓"}
              </div>

              {/* Steps */}
              <div className="space-y-0">
                {phase.statuses.map((s, i) => {
                  const globalIdx = ORDERED.indexOf(s.key);
                  const isDone = !isTerminal && globalIdx < currentIdx;
                  const isCurrent = s.key === currentStatus;
                  const isFuture = isTerminal || globalIdx > currentIdx;
                  const isLast = i === phase.statuses.length - 1;

                  // Is there a transition that targets this status?
                  const transitionToThis = availableTransitions.find((t) => {
                    // The transition brings us to globalIdx = currentIdx + 1 ideally
                    return globalIdx === currentIdx + 1;
                  });
                  const isNextStep = globalIdx === currentIdx + 1 && !isTerminal;

                  return (
                    <div key={s.key} className="flex flex-col items-center">
                      <div className="flex items-center gap-2 w-full">
                        {/* Dot */}
                        <div className={cn(
                          "h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center",
                          isDone ? PHASE_DOT_DONE[phase.color] : "",
                          isCurrent ? PHASE_DOT_CURRENT[phase.color] : "",
                          isFuture && !isNextStep ? "border-zinc-200 bg-white" : "",
                          isNextStep ? `border-dashed ${PHASE_DOT_CURRENT[phase.color]} opacity-60` : "",
                        )}>
                          {isDone && <Check className="h-3 w-3 text-white" />}
                          {isCurrent && (
                            <span className={cn("h-2 w-2 rounded-full", PHASE_DOT_CURRENT_INNER[phase.color])} />
                          )}
                          {isFuture && !isNextStep && <Circle className="h-2.5 w-2.5 text-zinc-300" />}
                          {isNextStep && <Circle className={cn("h-2.5 w-2.5 opacity-50", PHASE_DOT_CURRENT_INNER[phase.color].replace("bg-", "text-"))} />}
                        </div>

                        {/* Label */}
                        <span className={cn(
                          "text-xs leading-tight flex-1",
                          isDone ? "text-zinc-500" : "",
                          isCurrent ? "font-semibold text-zinc-900" : "",
                          isFuture && !isNextStep ? "text-zinc-400" : "",
                          isNextStep ? "text-zinc-500 italic" : "",
                        )}>
                          {s.label}
                          {isCurrent && " ←"}
                        </span>

                        {isFuture && !isNextStep && (
                          <Lock className="ml-auto h-3 w-3 text-zinc-300 shrink-0" />
                        )}
                      </div>

                      {/* Connector line */}
                      {!isLast && (
                        <div className={cn(
                          "ml-2.5 w-0.5 h-3 -translate-x-[9px]",
                          isDone ? PHASE_LINE_DONE[phase.color] : "bg-zinc-100"
                        )} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
