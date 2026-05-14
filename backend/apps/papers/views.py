from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q

from .models import Paper, PaperAuthor, Milestone
from .serializers import PaperSerializer, PaperAuthorSerializer, MilestoneSerializer


class PaperViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = PaperSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role in ("super_admin", "supervisor"):
            return Paper.objects.select_related("supervisor", "created_by").all()
        return Paper.objects.filter(
            Q(authors__user=user) | Q(created_by=user)
        ).distinct()

    def perform_create(self, serializer):
        user = self.request.user
        paper = serializer.save(created_by=user)
        PaperAuthor.objects.create(
            paper=paper,
            user=user,
            name=user.full_name,
            email=user.email,
            author_order=1,
            is_corresponding=True,
            contribution_percentage=100,
        )


class PaperTransitionView(APIView):
    permission_classes = [IsAuthenticated]

    TRANSITIONS = {
        # Planning
        "to_topic_discussion": "to_topic_discussion",
        "to_literature_review": "to_literature_review",
        "to_gap_analysis": "to_gap_analysis",
        "to_proposal_drafting": "to_proposal_drafting",
        "approve_proposal": "approve_proposal",
        # Development
        "to_dataset_collection": "to_dataset_collection",
        "to_dataset_cleaning": "to_dataset_cleaning",
        "to_model_development": "to_model_development",
        "to_experimentation": "to_experimentation",
        "to_evaluation": "to_evaluation",
        "to_result_analysis": "to_result_analysis",
        # Writing
        "to_initial_draft": "to_initial_draft",
        "to_figure_preparation": "to_figure_preparation",
        "to_formatting": "to_formatting",
        "to_citation_checking": "to_citation_checking",
        "to_grammar_review": "to_grammar_review",
        "to_internal_review": "to_internal_review",
        "to_supervisor_review": "to_supervisor_review",
        # Submission
        "to_journal_selection": "to_journal_selection",
        "to_submission_ready": "to_submission_ready",
        "submit": "submit",
        "to_under_review": "to_under_review",
        "request_revision": "request_revision",
        "resubmit": "resubmit",
        "back_to_under_review": "back_to_under_review",
        "accept": "accept",
        "publish": "publish",
        # Terminal
        "reject": "reject",
        "withdraw": "withdraw",
    }

    def post(self, request, paper_pk):
        paper = Paper.objects.get(pk=paper_pk)
        transition_name = request.data.get("transition")
        method = self.TRANSITIONS.get(transition_name)
        if not method:
            return Response({"detail": "Invalid transition."}, status=status.HTTP_400_BAD_REQUEST)
        getattr(paper, method)()
        paper.save()
        return Response({"status": paper.status})


class PaperAuthorViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = PaperAuthorSerializer

    def get_queryset(self):
        return PaperAuthor.objects.filter(paper_id=self.kwargs["paper_pk"])

    def perform_create(self, serializer):
        serializer.save(paper_id=self.kwargs["paper_pk"])


class MilestoneViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = MilestoneSerializer

    def get_queryset(self):
        return Milestone.objects.filter(paper_id=self.kwargs["paper_pk"])

    def perform_create(self, serializer):
        serializer.save(paper_id=self.kwargs["paper_pk"])
