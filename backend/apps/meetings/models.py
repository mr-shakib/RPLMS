from django.db import models
from django.conf import settings


class Meeting(models.Model):
    paper = models.ForeignKey(
        "papers.Paper", on_delete=models.CASCADE, related_name="meetings",
        null=True, blank=True,
    )
    title = models.CharField(max_length=255)
    meeting_date = models.DateTimeField()
    location = models.CharField(max_length=255, blank=True)
    agenda = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    decisions = models.TextField(blank=True)
    action_items = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name="created_meetings",
    )
    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL, blank=True, related_name="meetings",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "meetings"
        ordering = ["-meeting_date"]
