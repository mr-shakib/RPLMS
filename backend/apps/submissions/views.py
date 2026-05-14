from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Venue, Submission
from .serializers import VenueSerializer, SubmissionSerializer


class VenueViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = VenueSerializer
    queryset = Venue.objects.all().order_by("name")
    search_fields = ["name", "publisher"]
    filterset_fields = ["venue_type", "quartile"]


class SubmissionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = SubmissionSerializer
    filterset_fields = ["paper", "status"]

    def get_queryset(self):
        user = self.request.user
        if user.role in ("super_admin", "supervisor"):
            return Submission.objects.select_related("venue", "paper").all()
        return (
            Submission.objects.select_related("venue", "paper")
            .filter(paper__authors__user=user)
            .distinct()
        )

    def perform_create(self, serializer):
        paper = serializer.validated_data.get("paper")
        attempt = Submission.objects.filter(paper=paper).count() + 1
        serializer.save(attempt_number=attempt)
