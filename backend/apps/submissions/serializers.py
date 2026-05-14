from rest_framework import serializers
from .models import Venue, Submission


class VenueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Venue
        fields = "__all__"


class VenueMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Venue
        fields = ["id", "name", "venue_type", "quartile", "impact_factor", "submission_link"]


class SubmissionSerializer(serializers.ModelSerializer):
    venue_detail = VenueMinimalSerializer(source="venue", read_only=True)

    class Meta:
        model = Submission
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at", "attempt_number"]
