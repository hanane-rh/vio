# carepath/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    register, login, logout,
    AvatarConfigViewSet, UserProfileViewSet, TaskViewSet,
    ConstellationStarViewSet, UserStateViewSet, AdaptiveChallengeViewSet,
    FutureSelfMessageViewSet
)

router = DefaultRouter()
router.register(r'avatars', AvatarConfigViewSet, basename='avatar')
router.register(r'profile', UserProfileViewSet, basename='profile')
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'constellation', ConstellationStarViewSet, basename='constellation')
router.register(r'user-state', UserStateViewSet, basename='user-state')
router.register(r'challenges', AdaptiveChallengeViewSet, basename='challenge')
router.register(r'future-messages', FutureSelfMessageViewSet, basename='future-message')

urlpatterns = [
    # Auth endpoints
    path('auth/register/', register, name='register'),
    path('auth/login/', login, name='login'),
    path('auth/logout/', logout, name='logout'),
    
    # API endpoints
    path('', include(router.urls)),
]