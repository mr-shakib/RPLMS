from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django.core.files.storage import default_storage
from .models import ResearchFile
from .serializers import ResearchFileSerializer


class ResearchFileViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ResearchFileSerializer
    filterset_fields = ["paper", "category", "file_type"]
    http_method_names = ["get", "post", "delete", "head", "options"]

    def get_queryset(self):
        user = self.request.user
        if user.role in ("super_admin", "supervisor"):
            return ResearchFile.objects.all()
        return ResearchFile.objects.filter(paper__authors__user=user).distinct()

    def perform_create(self, serializer):
        file = self.request.FILES.get("file")
        if file:
            path = default_storage.save(f"uploads/{file.name}", file)
            # default_storage.url() works for both local dev and Cloudinary in prod
            file_url = default_storage.url(path)
            # For local storage, make it absolute if it's a relative path
            if file_url.startswith("/"):
                file_url = self.request.build_absolute_uri(file_url)
            serializer.save(
                uploaded_by=self.request.user,
                file_url=file_url,
                original_filename=file.name,
                file_type=file.name.rsplit(".", 1)[-1].lower() if "." in file.name else "bin",
                size_bytes=file.size,
            )
        else:
            serializer.save(uploaded_by=self.request.user)
