from django.db import models
from django.conf import settings


class Notification(models.Model):
    class Type(models.TextChoices):
        TASK_ASSIGNED = "task_assigned", "Task Assigned"
        DEADLINE_REMINDER = "deadline_reminder", "Deadline Reminder"
        SUBMISSION_UPDATE = "submission_update", "Submission Update"
        REVIEW_COMMENT = "review_comment", "Review Comment"
        FILE_UPLOADED = "file_uploaded", "File Uploaded"
        STATUS_CHANGED = "status_changed", "Status Changed"
        MENTION = "mention", "Mention"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications"
    )
    notification_type = models.CharField(max_length=30, choices=Type.choices)
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    link = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "notifications"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user} — {self.title}"
