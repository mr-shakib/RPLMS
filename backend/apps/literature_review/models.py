from django.db import models
from django.conf import settings


class LiteratureEntry(models.Model):
    paper = models.ForeignKey(
        "papers.Paper", on_delete=models.CASCADE, related_name="literature_entries",
        null=True, blank=True,
    )
    title = models.CharField(max_length=512)
    authors = models.TextField(blank=True, help_text="Comma-separated author names")
    year = models.PositiveSmallIntegerField(null=True, blank=True)
    doi = models.CharField(max_length=255, blank=True)
    journal = models.CharField(max_length=255, blank=True)
    source_url = models.URLField(blank=True)
    summary = models.TextField(blank=True)
    method = models.TextField(blank=True)
    dataset = models.TextField(blank=True)
    limitations = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    tags = models.JSONField(default=list, blank=True)
    added_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name="literature_entries",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "literature_entries"
        ordering = ["-year", "title"]

    def __str__(self):
        return self.title
