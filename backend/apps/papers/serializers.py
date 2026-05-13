from rest_framework import serializers
from .models import Paper, PaperAuthor, PaperMetadata, Milestone


class PaperMetadataSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaperMetadata
        exclude = ["paper"]


class PaperAuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaperAuthor
        fields = "__all__"
        read_only_fields = ["paper"]


class MilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Milestone
        fields = "__all__"
        read_only_fields = ["paper"]


class PaperSerializer(serializers.ModelSerializer):
    authors = PaperAuthorSerializer(many=True, read_only=True)
    metadata = PaperMetadataSerializer(read_only=True)
    milestones = MilestoneSerializer(many=True, read_only=True)
    overall_progress = serializers.SerializerMethodField()

    class Meta:
        model = Paper
        fields = "__all__"
        read_only_fields = ["paper_id", "status", "created_by", "created_at", "updated_at"]

    def get_overall_progress(self, obj):
        fields = [
            obj.literature_review_progress,
            obj.dataset_progress,
            obj.experiment_progress,
            obj.writing_progress,
            obj.revision_progress,
        ]
        return round(sum(fields) / len(fields), 1)
