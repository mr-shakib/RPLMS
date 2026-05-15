from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Q
from .models import LiteratureEntry
from .serializers import LiteratureEntrySerializer


class LiteratureEntryViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = LiteratureEntrySerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["paper", "year"]
    search_fields = ["title", "authors", "journal", "doi"]
    ordering_fields = ["year", "title", "created_at"]

    def get_queryset(self):
        user = self.request.user
        if user.role in ("super_admin", "supervisor"):
            return LiteratureEntry.objects.select_related("added_by").all()
        return LiteratureEntry.objects.select_related("added_by").filter(
            Q(added_by=user) | Q(paper__authors__user=user) | Q(paper__created_by=user)
        ).distinct()

    def perform_create(self, serializer):
        serializer.save(added_by=self.request.user)
