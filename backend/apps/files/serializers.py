from rest_framework import serializers
from .models import ResearchFile


class ResearchFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResearchFile
        fields = "__all__"
        read_only_fields = ["uploaded_by", "uploaded_at"]
