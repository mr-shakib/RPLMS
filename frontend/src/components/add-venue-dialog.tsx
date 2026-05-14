"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useCreateVenue } from "@/hooks/useSubmissions";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  publisher: z.string().optional(),
  venue_type: z.string().min(1, "Select a type"),
  quartile: z.string().min(1),
  impact_factor: z.string().optional(),
  submission_link: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  description: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const VENUE_TYPES = [
  { value: "journal", label: "Journal" },
  { value: "conference", label: "Conference" },
  { value: "workshop", label: "Workshop" },
  { value: "preprint", label: "Preprint" },
];
const QUARTILES = [
  { value: "Q1", label: "Q1" },
  { value: "Q2", label: "Q2" },
  { value: "Q3", label: "Q3" },
  { value: "Q4", label: "Q4" },
  { value: "unranked", label: "Unranked" },
];

export function AddVenueDialog() {
  const [open, setOpen] = useState(false);
  const [venueType, setVenueType] = useState("journal");
  const [quartile, setQuartile] = useState("unranked");
  const create = useCreateVenue();

  const { register, handleSubmit, setValue, reset, formState: { errors } } =
    useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: { venue_type: "journal", quartile: "unranked" },
    });

  const onSubmit = (values: FormValues) => {
    create.mutate(
      {
        name: values.name,
        publisher: values.publisher || "",
        venue_type: values.venue_type as "journal" | "conference" | "workshop" | "preprint",
        quartile: values.quartile as "Q1" | "Q2" | "Q3" | "Q4" | "unranked",
        impact_factor: values.impact_factor ? Number(values.impact_factor) : null,
        submission_link: values.submission_link || "",
        description: values.description || "",
      },
      {
        onSuccess: () => {
          toast.success("Venue added.");
          reset();
          setVenueType("journal");
          setQuartile("unranked");
          setOpen(false);
        },
        onError: () => toast.error("Failed to add venue."),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" className="gap-2" />}>
        <Plus className="h-4 w-4" />
        Add venue
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add venue</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Name <span className="text-destructive">*</span></Label>
            <Input placeholder="e.g. Nature Machine Intelligence" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Type <span className="text-destructive">*</span></Label>
              <Select value={venueType} onValueChange={(v) => { setVenueType(v as string); setValue("venue_type", v as string); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {VENUE_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Quartile</Label>
              <Select value={quartile} onValueChange={(v) => { setQuartile(v as string); setValue("quartile", v as string); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {QUARTILES.map((q) => <SelectItem key={q.value} value={q.value}>{q.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Publisher</Label>
              <Input placeholder="e.g. Springer Nature" {...register("publisher")} />
            </div>
            <div className="space-y-1.5">
              <Label>Impact Factor</Label>
              <Input type="number" step="0.001" min="0" placeholder="e.g. 4.2" {...register("impact_factor")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Submission link</Label>
            <Input placeholder="https://…" {...register("submission_link")} />
            {errors.submission_link && <p className="text-xs text-destructive">{errors.submission_link.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea rows={2} placeholder="Optional notes about this venue…" {...register("description")} />
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add venue
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
