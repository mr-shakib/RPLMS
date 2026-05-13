from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Venue, Submission
from .serializers import VenueSerializer, SubmissionSerializer


class VenueViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = VenueSerializer
    queryset = Venue.objects.all()
    search_fields = ["name", "publisher"]
    filterset_fields = ["venue_type", "quartile"]


class SubmissionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = SubmissionSerializer
    filterset_fields = ["paper", "status"]

    def get_queryset(self):
        return Submission.objects.filter(paper__authors__user=self.request.user).distinct()
