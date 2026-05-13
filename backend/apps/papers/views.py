from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Paper, PaperAuthor, Milestone
from .serializers import PaperSerializer, PaperAuthorSerializer, MilestoneSerializer


class PaperViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = PaperSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role in ("super_admin", "supervisor"):
            return Paper.objects.select_related("supervisor", "created_by").all()
        return Paper.objects.filter(authors__user=user).distinct()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class PaperTransitionView(APIView):
    permission_classes = [IsAuthenticated]

    TRANSITIONS = {
        "start_topic_discussion": "start_topic_discussion",
        "begin_development": "begin_development",
        "move_to_submission": "move_to_submission",
        "submit": "submit",
        "request_revision": "request_revision",
        "accept": "accept",
        "reject": "reject",
        "publish": "publish",
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
