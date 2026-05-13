from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.db.models import Count

from apps.papers.models import Paper
from apps.tasks.models import Task
from .models import AuditLog
from .serializers import AuditLogSerializer

User = get_user_model()


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role in ("super_admin", "supervisor"):
            papers_qs = Paper.objects.all()
        else:
            papers_qs = Paper.objects.filter(authors__user=user)

        return Response({
            "total_papers": papers_qs.count(),
            "by_status": list(papers_qs.values("status").annotate(count=Count("id"))),
            "pending_tasks": Task.objects.filter(
                assigned_to=user, status__in=["todo", "in_progress"]
            ).count(),
        })


class PaperAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "by_domain": list(Paper.objects.values("domain").annotate(count=Count("id"))),
            "by_year": list(
                Paper.objects.extra(select={"year": "EXTRACT(year FROM created_at)"})
                .values("year")
                .annotate(count=Count("id"))
            ),
        })


class UserAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "total_users": User.objects.count(),
            "by_role": list(User.objects.values("role").annotate(count=Count("id"))),
        })


class AuditLogListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        logs = AuditLog.objects.select_related("user").order_by("-timestamp")[:100]
        return Response(AuditLogSerializer(logs, many=True).data)
