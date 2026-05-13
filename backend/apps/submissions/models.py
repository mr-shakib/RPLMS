from django.db import models


class Venue(models.Model):
    class Type(models.TextChoices):
        JOURNAL = "journal", "Journal"
        CONFERENCE = "conference", "Conference"
        WORKSHOP = "workshop", "Workshop"

    name = models.CharField(max_length=255)
    venue_type = models.CharField(max_length=20, choices=Type.choices, default=Type.JOURNAL)
    website = models.URLField(blank=True)
    publisher = models.CharField(max_length=255, blank=True)
    quartile = models.CharField(max_length=5, blank=True)
    impact_factor = models.DecimalField(max_digits=6, decimal_places=3, null=True, blank=True)
    submission_link = models.URLField(blank=True)
    review_duration_days = models.PositiveIntegerField(null=True, blank=True)
    acceptance_rate = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    formatting_template_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "venues"

    def __str__(self):
        return self.name


class Submission(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        SUBMITTED = "submitted", "Submitted"
        UNDER_REVIEW = "under_review", "Under Review"
        REVISION_REQUESTED = "revision_requested", "Revision Requested"
        RESUBMITTED = "resubmitted", "Resubmitted"
        ACCEPTED = "accepted", "Accepted"
        REJECTED = "rejected", "Rejected"
        WITHDRAWN = "withdrawn", "Withdrawn"

    paper = models.ForeignKey(
        "papers.Paper", on_delete=models.CASCADE, related_name="submissions"
    )
    venue = models.ForeignKey(Venue, on_delete=models.SET_NULL, null=True)
    submission_date = models.DateField(null=True, blank=True)
    submission_id = models.CharField(max_length=100, blank=True)
    manuscript_version = models.CharField(max_length=50, blank=True)
    status = models.CharField(max_length=25, choices=Status.choices, default=Status.DRAFT)
    decision_date = models.DateField(null=True, blank=True)
    review_deadline = models.DateField(null=True, blank=True)
    attempt_number = models.PositiveSmallIntegerField(default=1)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "submissions"
        ordering = ["-created_at"]
