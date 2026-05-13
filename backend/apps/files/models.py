from django.db import models
from django.conf import settings


class ResearchFile(models.Model):
    class Category(models.TextChoices):
        MANUSCRIPT = "manuscript", "Manuscript"
        DATASET = "dataset", "Dataset"
        SOURCE_CODE = "source_code", "Source Code"
        FIGURES = "figures", "Figures"
        ETHICS = "ethics", "Ethics Documents"
        REVIEWER_RESPONSE = "reviewer_response", "Reviewer Response"
        SUPPLEMENTARY = "supplementary", "Supplementary Files"
        OTHER = "other", "Other"

    paper = models.ForeignKey(
        "papers.Paper", on_delete=models.CASCADE, related_name="files"
    )
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True
    )
    file_url = models.URLField(max_length=1000)
    original_filename = models.CharField(max_length=255)
    file_type = models.CharField(max_length=20)
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.OTHER)
    version = models.PositiveSmallIntegerField(default=1)
    size_bytes = models.BigIntegerField(default=0)
    is_locked = models.BooleanField(default=False)
    locked_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="locked_files",
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "research_files"
        ordering = ["-uploaded_at"]

    def __str__(self):
        return f"{self.original_filename} v{self.version}"
