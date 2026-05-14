from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.db.models import Count, Q

from apps.papers.models import Paper
from apps.tasks.models import Task
from apps.submissions.models import Submission
from .models import AuditLog
from .serializers import AuditLogSerializer

User = get_user_model()

SUBMISSION_STATUSES = ["submitted", "under_review", "revision_requested", "resubmitted"]


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role in ("super_admin", "supervisor"):
            papers_qs = Paper.objects.all()
        else:
            papers_qs = Paper.objects.filter(
                Q(authors__user=user) | Q(created_by=user)
            ).distinct()

        # My tasks (assigned to me)
        my_tasks = Task.objects.filter(
            assigned_to=user, status__in=["todo", "in_progress", "waiting_review"]
        ).select_related("paper").order_by("deadline")[:8]

        my_tasks_data = [
            {
                "id": t.id,
                "title": t.title,
                "status": t.status,
                "priority": t.priority,
                "deadline": t.deadline.isoformat() if t.deadline else None,
                "paper_id": t.paper_id,
                "paper_title": t.paper.title if t.paper else None,
            }
            for t in my_tasks
        ]

        # Recent activity derived from paper updates
        recent_papers = papers_qs.order_by("-updated_at")[:6]
        activity = [
            {
                "type": "paper",
                "title": p.title,
                "detail": p.status.replace("_", " ").title(),
                "link": f"/papers/{p.id}",
                "timestamp": p.updated_at.isoformat(),
            }
            for p in recent_papers
        ]

        # Recent submissions
        if user.role in ("super_admin", "supervisor"):
            recent_subs = Submission.objects.select_related("paper", "venue").order_by("-created_at")[:5]
        else:
            recent_subs = Submission.objects.select_related("paper", "venue").filter(
                Q(paper__authors__user=user) | Q(paper__created_by=user)
            ).distinct().order_by("-created_at")[:5]

        for s in recent_subs:
            activity.append({
                "type": "submission",
                "title": s.venue.name if s.venue else "Unknown venue",
                "detail": s.paper.title if s.paper else "",
                "link": f"/submissions",
                "timestamp": s.created_at.isoformat(),
            })

        activity.sort(key=lambda x: x["timestamp"], reverse=True)

        return Response({
            "total_papers": papers_qs.count(),
            "submitted_papers": papers_qs.filter(status__in=SUBMISSION_STATUSES).count(),
            "published_papers": papers_qs.filter(status="published").count(),
            "by_status": list(papers_qs.values("status").annotate(count=Count("id"))),
            "pending_tasks": Task.objects.filter(
                assigned_to=user, status__in=["todo", "in_progress"]
            ).count(),
            "my_tasks": my_tasks_data,
            "recent_activity": activity[:10],
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
