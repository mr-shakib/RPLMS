from rest_framework import serializers
from .models import Review, ReviewerResponse


class ReviewerResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewerResponse
        fields = "__all__"
        read_only_fields = ["submitted_at"]


class ReviewSerializer(serializers.ModelSerializer):
    response = ReviewerResponseSerializer(read_only=True)

    class Meta:
        model = Review
        fields = "__all__"
        read_only_fields = ["created_at"]
