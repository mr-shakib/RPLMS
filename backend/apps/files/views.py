from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import ResearchFile
from .serializers import ResearchFileSerializer


class ResearchFileViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ResearchFileSerializer
    filterset_fields = ["paper", "category", "file_type"]
    http_method_names = ["get", "post", "delete", "head", "options"]

    def get_queryset(self):
        return ResearchFile.objects.filter(paper__authors__user=self.request.user).distinct()

    def perform_create(self, serializer):
        # TODO: upload to Cloudinary and store URL
        serializer.save(uploaded_by=self.request.user)
