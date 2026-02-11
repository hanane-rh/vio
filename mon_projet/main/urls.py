# vio/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    register, login, logout,
    UserProfileViewSet, AvatarConfigViewSet, TreatmentInfoViewSet,
    TaskTemplateViewSet, TaskViewSet, UserStateViewSet,
    ConstellationStarViewSet, FutureSelfMessageViewSet
)

router = DefaultRouter()
router.register(r'profiles', UserProfileViewSet, basename='profile')
router.register(r'avatars', AvatarConfigViewSet, basename='avatar')
router.register(r'treatment', TreatmentInfoViewSet, basename='treatment')
router.register(r'task-templates', TaskTemplateViewSet, basename='task-template')
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'user-state', UserStateViewSet, basename='user-state')
router.register(r'constellation', ConstellationStarViewSet, basename='constellation')
router.register(r'messages', FutureSelfMessageViewSet, basename='message')

urlpatterns = [
    # Auth
    path('auth/register/', register, name='register'),
    path('auth/login/', login, name='login'),
    path('auth/logout/', logout, name='logout'),
    
    # API
    path('', include(router.urls)),
]