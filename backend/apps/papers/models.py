from django.db import models
from django_fsm import FSMField, transition
from django.conf import settings


class Paper(models.Model):
    class Status(models.TextChoices):
        # Planning
        IDEA_PROPOSED = "idea_proposed", "Idea Proposed"
        TOPIC_DISCUSSION = "topic_discussion", "Topic Discussion"
        LITERATURE_REVIEW = "literature_review", "Literature Review"
        GAP_ANALYSIS = "gap_analysis", "Research Gap Analysis"
        PROPOSAL_DRAFTING = "proposal_drafting", "Proposal Drafting"
        PROPOSAL_APPROVED = "proposal_approved", "Proposal Approved"
        # Development
        DATASET_COLLECTION = "dataset_collection", "Dataset Collection"
        DATASET_CLEANING = "dataset_cleaning", "Dataset Cleaning"
        MODEL_DEVELOPMENT = "model_development", "Model Development"
        EXPERIMENTATION = "experimentation", "Experimentation"
        EVALUATION = "evaluation", "Evaluation"
        RESULT_ANALYSIS = "result_analysis", "Result Analysis"
        # Writing
        INITIAL_DRAFT = "initial_draft", "Initial Draft"
        FIGURE_PREPARATION = "figure_preparation", "Figure Preparation"
        FORMATTING = "formatting", "Formatting"
        CITATION_CHECKING = "citation_checking", "Citation Checking"
        GRAMMAR_REVIEW = "grammar_review", "Grammar Review"
        INTERNAL_REVIEW = "internal_review", "Internal Review"
        SUPERVISOR_REVIEW = "supervisor_review", "Supervisor Review"
        # Submission
        JOURNAL_SELECTION = "journal_selection", "Journal Selection"
        SUBMISSION_READY = "submission_ready", "Submission Ready"
        SUBMITTED = "submitted", "Submitted"
        UNDER_REVIEW = "under_review", "Under Review"
        REVISION_REQUESTED = "revision_requested", "Revision Requested"
        RESUBMITTED = "resubmitted", "Resubmitted"
        ACCEPTED = "accepted", "Accepted"
        REJECTED = "rejected", "Rejected"
        WITHDRAWN = "withdrawn", "Withdrawn"
        PUBLISHED = "published", "Published"

    class Domain(models.TextChoices):
        ML = "ml", "Machine Learning"
        NLP = "nlp", "NLP"
        CV = "cv", "Computer Vision"
        HEALTHCARE = "healthcare", "Healthcare AI"
        SECURITY = "security", "Cybersecurity"
        OTHER = "other", "Other"

    paper_id = models.CharField(max_length=20, unique=True, editable=False)
    title = models.CharField(max_length=500)
    short_title = models.CharField(max_length=100, blank=True)
    abstract = models.TextField(blank=True)
    problem_statement = models.TextField(blank=True)
    research_gap = models.TextField(blank=True)
    objective = models.TextField(blank=True)
    methodology = models.TextField(blank=True)
    expected_contribution = models.TextField(blank=True)
    funding_source = models.CharField(max_length=255, blank=True)
    ethics_approval_number = models.CharField(max_length=100, blank=True)
    sdg_goals = models.JSONField(default=list, blank=True)
    domain = models.CharField(max_length=20, choices=Domain.choices, default=Domain.OTHER)
    keywords = models.JSONField(default=list, blank=True)
    tags = models.JSONField(default=list, blank=True)

    status = FSMField(default=Status.IDEA_PROPOSED, protected=True)

    supervisor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="supervised_papers",
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_papers",
    )

    # Progress tracking (0-100)
    literature_review_progress = models.PositiveSmallIntegerField(default=0)
    dataset_progress = models.PositiveSmallIntegerField(default=0)
    experiment_progress = models.PositiveSmallIntegerField(default=0)
    writing_progress = models.PositiveSmallIntegerField(default=0)
    revision_progress = models.PositiveSmallIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "papers"
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.paper_id:
            last = Paper.objects.order_by("-id").first()
            next_id = (last.id + 1) if last else 1
            self.paper_id = f"RPLMS-{next_id:04d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"[{self.paper_id}] {self.title}"

    # ── Planning ──────────────────────────────────────────────────────────────
    @transition(field=status, source=Status.IDEA_PROPOSED, target=Status.TOPIC_DISCUSSION)
    def to_topic_discussion(self):
        pass

    @transition(field=status, source=Status.TOPIC_DISCUSSION, target=Status.LITERATURE_REVIEW)
    def to_literature_review(self):
        pass

    @transition(field=status, source=Status.LITERATURE_REVIEW, target=Status.GAP_ANALYSIS)
    def to_gap_analysis(self):
        pass

    @transition(field=status, source=Status.GAP_ANALYSIS, target=Status.PROPOSAL_DRAFTING)
    def to_proposal_drafting(self):
        pass

    @transition(field=status, source=Status.PROPOSAL_DRAFTING, target=Status.PROPOSAL_APPROVED)
    def approve_proposal(self):
        pass

    # ── Development ───────────────────────────────────────────────────────────
    @transition(field=status, source=Status.PROPOSAL_APPROVED, target=Status.DATASET_COLLECTION)
    def to_dataset_collection(self):
        pass

    @transition(field=status, source=Status.DATASET_COLLECTION, target=Status.DATASET_CLEANING)
    def to_dataset_cleaning(self):
        pass

    @transition(field=status, source=Status.DATASET_CLEANING, target=Status.MODEL_DEVELOPMENT)
    def to_model_development(self):
        pass

    @transition(field=status, source=Status.MODEL_DEVELOPMENT, target=Status.EXPERIMENTATION)
    def to_experimentation(self):
        pass

    @transition(field=status, source=Status.EXPERIMENTATION, target=Status.EVALUATION)
    def to_evaluation(self):
        pass

    @transition(field=status, source=Status.EVALUATION, target=Status.RESULT_ANALYSIS)
    def to_result_analysis(self):
        pass

    # ── Writing ───────────────────────────────────────────────────────────────
    @transition(field=status, source=Status.RESULT_ANALYSIS, target=Status.INITIAL_DRAFT)
    def to_initial_draft(self):
        pass

    @transition(field=status, source=Status.INITIAL_DRAFT, target=Status.FIGURE_PREPARATION)
    def to_figure_preparation(self):
        pass

    @transition(field=status, source=Status.FIGURE_PREPARATION, target=Status.FORMATTING)
    def to_formatting(self):
        pass

    @transition(field=status, source=Status.FORMATTING, target=Status.CITATION_CHECKING)
    def to_citation_checking(self):
        pass

    @transition(field=status, source=Status.CITATION_CHECKING, target=Status.GRAMMAR_REVIEW)
    def to_grammar_review(self):
        pass

    @transition(field=status, source=Status.GRAMMAR_REVIEW, target=Status.INTERNAL_REVIEW)
    def to_internal_review(self):
        pass

    @transition(field=status, source=Status.INTERNAL_REVIEW, target=Status.SUPERVISOR_REVIEW)
    def to_supervisor_review(self):
        pass

    # ── Submission ────────────────────────────────────────────────────────────
    @transition(field=status, source=Status.SUPERVISOR_REVIEW, target=Status.JOURNAL_SELECTION)
    def to_journal_selection(self):
        pass

    @transition(field=status, source=Status.JOURNAL_SELECTION, target=Status.SUBMISSION_READY)
    def to_submission_ready(self):
        pass

    @transition(field=status, source=Status.SUBMISSION_READY, target=Status.SUBMITTED)
    def submit(self):
        pass

    @transition(field=status, source=Status.SUBMITTED, target=Status.UNDER_REVIEW)
    def to_under_review(self):
        pass

    @transition(field=status, source=Status.UNDER_REVIEW, target=Status.REVISION_REQUESTED)
    def request_revision(self):
        pass

    @transition(field=status, source=Status.REVISION_REQUESTED, target=Status.RESUBMITTED)
    def resubmit(self):
        pass

    @transition(field=status, source=Status.RESUBMITTED, target=Status.UNDER_REVIEW)
    def back_to_under_review(self):
        pass

    @transition(
        field=status,
        source=[Status.UNDER_REVIEW, Status.REVISION_REQUESTED, Status.RESUBMITTED],
        target=Status.ACCEPTED,
    )
    def accept(self):
        pass

    @transition(field=status, source=Status.ACCEPTED, target=Status.PUBLISHED)
    def publish(self):
        pass

    # ── Terminal ──────────────────────────────────────────────────────────────
    @transition(field=status, source="*", target=Status.REJECTED)
    def reject(self):
        pass

    @transition(
        field=status,
        source=[
            Status.IDEA_PROPOSED, Status.TOPIC_DISCUSSION, Status.LITERATURE_REVIEW,
            Status.GAP_ANALYSIS, Status.PROPOSAL_DRAFTING, Status.PROPOSAL_APPROVED,
            Status.DATASET_COLLECTION, Status.DATASET_CLEANING, Status.MODEL_DEVELOPMENT,
            Status.EXPERIMENTATION, Status.EVALUATION, Status.RESULT_ANALYSIS,
            Status.INITIAL_DRAFT, Status.FIGURE_PREPARATION, Status.FORMATTING,
            Status.CITATION_CHECKING, Status.GRAMMAR_REVIEW, Status.INTERNAL_REVIEW,
            Status.SUPERVISOR_REVIEW, Status.JOURNAL_SELECTION, Status.SUBMISSION_READY,
            Status.SUBMITTED, Status.UNDER_REVIEW, Status.REVISION_REQUESTED,
            Status.RESUBMITTED,
        ],
        target=Status.WITHDRAWN,
    )
    def withdraw(self):
        pass


class PaperAuthor(models.Model):
    paper = models.ForeignKey(Paper, on_delete=models.CASCADE, related_name="authors")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    name = models.CharField(max_length=255)
    email = models.EmailField(blank=True)
    affiliation = models.CharField(max_length=255, blank=True)
    department = models.CharField(max_length=255, blank=True)
    orcid = models.CharField(max_length=50, blank=True)
    google_scholar_link = models.URLField(blank=True)
    author_order = models.PositiveSmallIntegerField(default=1)
    contribution_percentage = models.PositiveSmallIntegerField(default=0)
    is_corresponding = models.BooleanField(default=False)

    class Meta:
        db_table = "paper_authors"
        ordering = ["author_order"]


class PaperMetadata(models.Model):
    paper = models.OneToOneField(Paper, on_delete=models.CASCADE, related_name="metadata")
    doi = models.CharField(max_length=255, blank=True)
    issn = models.CharField(max_length=20, blank=True)
    isbn = models.CharField(max_length=20, blank=True)
    conference_name = models.CharField(max_length=255, blank=True)
    publisher = models.CharField(max_length=255, blank=True)
    journal_quartile = models.CharField(max_length=5, blank=True)
    impact_factor = models.DecimalField(max_digits=6, decimal_places=3, null=True, blank=True)
    indexing = models.JSONField(default=list, blank=True)
    apc_fee = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    acceptance_rate = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    submission_deadline = models.DateField(null=True, blank=True)

    class Meta:
        db_table = "paper_metadata"


class Milestone(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        IN_PROGRESS = "in_progress", "In Progress"
        COMPLETED = "completed", "Completed"
        OVERDUE = "overdue", "Overdue"

    paper = models.ForeignKey(Paper, on_delete=models.CASCADE, related_name="milestones")
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    deadline = models.DateField()
    responsible_person = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    comments = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "milestones"
        ordering = ["deadline"]
