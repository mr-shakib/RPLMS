from django.db import models


class Review(models.Model):
    class RevisionType(models.TextChoices):
        MAJOR = "major", "Major Revision"
        MINOR = "minor", "Minor Revision"
        CAMERA_READY = "camera_ready", "Camera Ready"
        ACCEPTED = "accepted", "Accepted"
        REJECTED = "rejected", "Rejected"

    submission = models.ForeignKey(
        "submissions.Submission", on_delete=models.CASCADE, related_name="reviews"
    )
    reviewer_label = models.CharField(max_length=50, default="Reviewer 1")
    comments = models.TextField()
    revision_type = models.CharField(
        max_length=20, choices=RevisionType.choices, null=True, blank=True
    )
    received_at = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "reviews"


class ReviewerResponse(models.Model):
    review = models.OneToOneField(Review, on_delete=models.CASCADE, related_name="response")
    response_document_url = models.URLField(blank=True)
    change_log = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "reviewer_responses"
