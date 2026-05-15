from rest_framework import serializers
from .models import LiteratureEntry


class LiteratureEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = LiteratureEntry
        fields = [
            "id", "paper", "title", "authors", "year", "doi", "journal",
            "source_url", "summary", "method", "dataset", "limitations",
            "notes", "tags", "added_by", "created_at", "updated_at",
        ]
        read_only_fields = ["added_by", "created_at", "updated_at"]
