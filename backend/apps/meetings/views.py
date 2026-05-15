from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import Meeting
from .serializers import MeetingSerializer


class MeetingViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = MeetingSerializer
    filterset_fields = ["paper"]

    def get_queryset(self):
        user = self.request.user
        if user.role in ("super_admin", "supervisor"):
            return Meeting.objects.prefetch_related("participants").all()
        return Meeting.objects.prefetch_related("participants").filter(
            Q(created_by=user) | Q(participants=user)
        ).distinct()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
