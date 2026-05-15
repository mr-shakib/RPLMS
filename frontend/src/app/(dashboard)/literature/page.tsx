"use client";

import { useState } from "react";
import { useLiterature, useDeleteLiteratureEntry } from "@/hooks/useLiterature";
import { usePapers } from "@/hooks/usePapers";
import { LiteratureEntryDialog } from "@/components/literature-entry-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  BookOpen, ExternalLink, Trash2, Pencil, ChevronDown, ChevronRight, Copy,
} from "lucide-react";
import { toast } from "sonner";
import type { LiteratureEntry } from "@/types";

// ── Citation formatters ───────────────────────────────────────────────────────
function formatAPA(e: LiteratureEntry): string {
  const authors = e.authors || "Unknown";
  const year = e.year ? `(${e.year})` : "(n.d.)";
  const journal = e.journal ? `. *${e.journal}*` : "";
  const doi = e.doi ? `. https://doi.org/${e.doi}` : e.source_url ? `. ${e.source_url}` : "";
  return `${authors} ${year}. ${e.title}${journal}${doi}`;
}

function formatIEEE(e: LiteratureEntry): string {
  const authors = e.authors || "Unknown";
  const year = e.year ? `, ${e.year}` : "";
  const journal = e.journal ? `, *${e.journal}*` : "";
  const doi = e.doi ? `, doi: ${e.doi}` : "";
  return `${authors}, "${e.title}"${journal}${year}${doi}.`;
}

function formatBibTeX(e: LiteratureEntry): string {
  const key = e.title.split(" ").slice(0, 2).join("").toLowerCase().replace(/[^a-z0-9]/g, "");
  const lines = [
    `@article{${key}${e.year ?? ""},`,
    `  title   = {${e.title}},`,
    e.authors ? `  author  = {${e.authors}},` : "",
    e.year ? `  year    = {${e.year}},` : "",
    e.journal ? `  journal = {${e.journal}},` : "",
    e.doi ? `  doi     = {${e.doi}},` : "",
    `}`,
  ].filter(Boolean);
  return lines.join("\n");
}

function formatMLA(e: LiteratureEntry): string {
  const authors = e.authors || "Unknown";
  const year = e.year ? ` ${e.year}` : "";
  const journal = e.journal ? ` *${e.journal}*,` : ",";
  const doi = e.doi ? ` https://doi.org/${e.doi}` : "";
  return `${authors}. "${e.title}."${journal}${year}.${doi}`;
}

type CitationFormat = "APA" | "IEEE" | "BibTeX" | "MLA";

const FORMATTERS: Record<CitationFormat, (e: LiteratureEntry) => string> = {
  APA: formatAPA,
  IEEE: formatIEEE,
  BibTeX: formatBibTeX,
  MLA: formatMLA,
};

// ── Entry card ────────────────────────────────────────────────────────────────
function EntryCard({
  entry,
  paperTitle,
  onDelete,
  citationFormat,
}: {
  entry: LiteratureEntry;
  paperTitle?: string;
  onDelete: (id: number) => void;
  citationFormat: CitationFormat;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const citation = FORMATTERS[citationFormat](entry);

  const copycitation = () => {
    navigator.clipboard.writeText(citation);
    toast.success("Citation copied.");
  };

  const hasDetail = entry.summary || entry.method || entry.dataset || entry.limitations || entry.notes;

  return (
    <div className="rounded-xl border bg-white overflow-hidden">
      <div className="flex items-start gap-3 px-5 py-4">
        <button
          className="mt-0.5 shrink-0 text-muted-foreground hover:text-zinc-700"
          onClick={() => setExpanded((v) => !v)}
          disabled={!hasDetail}
        >
          {expanded
            ? <ChevronDown className="h-4 w-4" />
            : <ChevronRight className={`h-4 w-4 ${!hasDetail ? "opacity-20" : ""}`} />}
        </button>

        <div className="flex-1 min-w-0 space-y-1.5">
          <p className="text-sm font-semibold leading-snug">{entry.title}</p>

          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            {entry.authors && <span>{entry.authors}</span>}
            {entry.year && (
              <span className="rounded bg-zinc-100 px-1.5 py-0.5 tabular-nums font-medium">
                {entry.year}
              </span>
            )}
            {entry.journal && <span className="italic">{entry.journal}</span>}
            {entry.doi && (
              <a
                href={`https://doi.org/${entry.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-0.5"
              >
                DOI <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {!entry.doi && entry.source_url && (
              <a
                href={entry.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-0.5"
              >
                Source <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {paperTitle && (
              <span className="text-muted-foreground/60">· {paperTitle}</span>
            )}
          </div>

          {entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {entry.tags.map((t) => (
                <Badge key={t} variant="outline" className="text-xs px-1.5 py-0">{t}</Badge>
              ))}
            </div>
          )}

          {/* Citation strip */}
          <div className="flex items-start gap-2 rounded-md bg-zinc-50 border px-3 py-2 text-xs text-muted-foreground font-mono">
            <span className="flex-1 min-w-0 whitespace-pre-wrap break-words">{citation}</span>
            <button onClick={copycitation} className="shrink-0 hover:text-zinc-700 mt-0.5" title="Copy citation">
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            className="h-7 w-7 flex items-center justify-center rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
            onClick={() => setEditOpen(true)}
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            className="h-7 w-7 flex items-center justify-center rounded text-red-400 hover:text-red-600 hover:bg-red-50"
            onClick={() => onDelete(entry.id)}
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Detail section */}
      {expanded && hasDetail && (
        <div className="border-t px-5 py-4 space-y-4 bg-zinc-50/40">
          {entry.summary && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Summary</p>
              <p className="text-sm whitespace-pre-wrap">{entry.summary}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-6">
            {entry.method && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Method</p>
                <p className="text-sm whitespace-pre-wrap">{entry.method}</p>
              </div>
            )}
            {entry.dataset && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Dataset</p>
                <p className="text-sm whitespace-pre-wrap">{entry.dataset}</p>
              </div>
            )}
            {entry.limitations && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Limitations</p>
                <p className="text-sm whitespace-pre-wrap">{entry.limitations}</p>
              </div>
            )}
            {entry.notes && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Notes</p>
                <p className="text-sm whitespace-pre-wrap">{entry.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <LiteratureEntryDialog
        entry={entry}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function LiteraturePage() {
  const [paperFilter, setPaperFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [citationFormat, setCitationFormat] = useState<CitationFormat>("APA");

  const params: Record<string, unknown> = {};
  if (paperFilter !== "all") params.paper = paperFilter;
  if (yearFilter !== "all") params.year = yearFilter;
  if (search) params.search = search;

  const { data, isLoading } = useLiterature(Object.keys(params).length ? params : undefined);
  const { data: papersData } = usePapers();
  const deleteEntry = useDeleteLiteratureEntry();

  const entries = data?.results ?? [];
  const papers = papersData?.results ?? [];

  // Unique years from all entries for the year filter
  const years = Array.from(
    new Set(entries.map((e) => e.year).filter(Boolean) as number[])
  ).sort((a, b) => b - a);

  const paperMap = Object.fromEntries(papers.map((p) => [p.id, p.short_title || p.title.slice(0, 50)]));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Literature Review</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your paper repository, notes, and citation library
          </p>
        </div>
        <LiteratureEntryDialog paperId={paperFilter !== "all" ? Number(paperFilter) : undefined} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total entries", value: data?.count ?? 0 },
          { label: "This page", value: entries.length },
          { label: "Papers linked", value: new Set(entries.map((e) => e.paper).filter(Boolean)).size },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border bg-white px-5 py-4">
            <p className="text-xs text-muted-foreground font-medium">{label}</p>
            <p className="text-2xl font-bold tabular-nums mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Input
          placeholder="Search title, author, journal…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />

        <Select value={paperFilter} onValueChange={(v) => setPaperFilter(v ?? "all")}>
          <SelectTrigger className="w-52">
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

        <Select value={yearFilter} onValueChange={(v) => setYearFilter(v ?? "all")}>
          <SelectTrigger className="w-28">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All years</SelectItem>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Citation format selector */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Citation:</span>
          <div className="flex rounded-md border overflow-hidden text-xs">
            {(["APA", "IEEE", "BibTeX", "MLA"] as CitationFormat[]).map((f) => (
              <button
                key={f}
                onClick={() => setCitationFormat(f)}
                className={`px-2.5 py-1.5 transition-colors ${
                  citationFormat === f
                    ? "bg-zinc-900 text-white"
                    : "bg-white text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="text-center py-16 text-sm text-muted-foreground">Loading…</div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-20">
          <BookOpen className="h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            {data?.count === 0
              ? "No literature entries yet — start building your reference library."
              : "No entries match your filters."}
          </p>
          {data?.count === 0 && <LiteratureEntryDialog />}
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              paperTitle={entry.paper ? paperMap[entry.paper] : undefined}
              citationFormat={citationFormat}
              onDelete={(id) =>
                deleteEntry.mutate(id, {
                  onSuccess: () => toast.success("Entry removed."),
                  onError: () => toast.error("Failed to remove entry."),
                })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
