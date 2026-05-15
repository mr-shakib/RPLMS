from rest_framework import serializers
from .models import Meeting


class MeetingSerializer(serializers.ModelSerializer):
    participant_ids = serializers.PrimaryKeyRelatedField(
        many=True, source="participants",
        queryset=__import__("apps.users.models", fromlist=["User"]).User.objects.all(),
        required=False,
    )
    participant_names = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Meeting
        fields = [
            "id", "paper", "title", "meeting_date", "location",
            "agenda", "notes", "decisions", "action_items",
            "participant_ids", "participant_names",
            "created_by", "created_at", "updated_at",
        ]
        read_only_fields = ["created_by", "created_at", "updated_at"]

    def get_participant_names(self, obj):
        return [u.full_name for u in obj.participants.all()]
