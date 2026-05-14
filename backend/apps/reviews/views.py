from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Review
from .serializers import ReviewSerializer


class ReviewViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ReviewSerializer
    filterset_fields = ["submission", "revision_type"]

    def get_queryset(self):
        user = self.request.user
        if user.role in ("super_admin", "supervisor"):
            return Review.objects.select_related("submission").all()
        return Review.objects.select_related("submission").filter(
            submission__paper__authors__user=user
        ).distinct()
