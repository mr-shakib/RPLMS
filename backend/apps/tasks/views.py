from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Task
from .serializers import TaskSerializer


class TaskViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = TaskSerializer
    filterset_fields = ["status", "priority", "paper", "assigned_to"]
    search_fields = ["title", "description"]
    ordering_fields = ["deadline", "priority", "created_at"]

    def get_queryset(self):
        user = self.request.user
        if user.role in ("super_admin", "supervisor"):
            return Task.objects.select_related("assigned_to", "paper").all()
        return Task.objects.filter(assigned_to=user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
