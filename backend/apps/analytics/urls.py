from django.urls import path
from . import views

urlpatterns = [
    path("dashboard/", views.DashboardStatsView.as_view(), name="analytics-dashboard"),
    path("papers/", views.PaperAnalyticsView.as_view(), name="analytics-papers"),
    path("users/", views.UserAnalyticsView.as_view(), name="analytics-users"),
    path("audit-logs/", views.AuditLogListView.as_view(), name="audit-logs"),
]
