from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"", views.PaperViewSet, basename="paper")
router.register(r"(?P<paper_pk>[^/.]+)/authors", views.PaperAuthorViewSet, basename="paper-author")
router.register(r"(?P<paper_pk>[^/.]+)/milestones", views.MilestoneViewSet, basename="milestone")

urlpatterns = [
    path("", include(router.urls)),
    path("<str:paper_pk>/transition/", views.PaperTransitionView.as_view(), name="paper-transition"),
]
