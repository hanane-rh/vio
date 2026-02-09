# carepath/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    AvatarConfig, UserProfile, Task, ConstellationStar,
    UserState, AdaptiveChallenge, FutureSelfMessage
)


class AvatarConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvatarConfig
        fields = ['id', 'name', 'appearance', 'expression', 'tone', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserProfileSerializer(serializers.ModelSerializer):
    avatar = AvatarConfigSerializer(source='avatar_config', read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['id', 'has_completed_onboarding', 'avatar', 'start_date', 'updated_at']
        read_only_fields = ['id', 'start_date', 'updated_at']


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'task_type', 'priority', 'completed', 'date', 'completed_at', 'created_at']
        read_only_fields = ['id', 'date', 'created_at']


class ConstellationStarSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConstellationStar
        fields = ['id', 'star_type', 'mood', 'note', 'size', 'x', 'y', 'created_at']
        read_only_fields = ['id', 'created_at']


class UserStateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserState
        fields = ['id', 'fatigue_level', 'consistency_score', 'mood_level', 'updated_at']
        read_only_fields = ['id', 'updated_at']


class AdaptiveChallengeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdaptiveChallenge
        fields = ['id', 'mode', 'title', 'description', 'completed', 'date', 'completed_at', 'created_at']
        read_only_fields = ['id', 'date', 'created_at']


class FutureSelfMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = FutureSelfMessage
        fields = ['id', 'message_type', 'content', 'unlock_progress', 'is_unlocked', 'unlocked_at', 'created_at']
        read_only_fields = ['id', 'unlocked_at', 'created_at']


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name']
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        # Créer les modèles liés
        UserProfile.objects.create(user=user)
        UserState.objects.create(user=user)
        return user