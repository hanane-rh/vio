# vio/serializers.py - VERSION SIMPLIFIÃ‰E
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    AvatarConfig, TreatmentInfo, TaskTemplate, Task,
    UserProfile, UserState, ConstellationStar, FutureSelfMessage
)


class AvatarConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvatarConfig
        fields = ['id', 'name', 'appearance', 'expression', 'tone', 'avatar_image', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class TreatmentInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TreatmentInfo
        fields = ['id', 'diagnosis', 'treatment_type', 'doctor_name', 'hospital', 
                  'start_date', 'duration_weeks', 'end_date', 'notes', 'created_at', 'updated_at']
        read_only_fields = ['id', 'end_date', 'created_at', 'updated_at']


class TaskTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskTemplate
        fields = ['id', 'title', 'description', 'frequency', 'custom_frequency_days',
                  'timing', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 
                  'saturday', 'sunday', 'dosage', 'quantity', 'start_date', 'end_date',
                  'is_important', 'created_at', 'updated_at']
        read_only_fields = ['id', 'start_date', 'created_at', 'updated_at']


class TaskSerializer(serializers.ModelSerializer):
    template_title = serializers.CharField(source='template.title', read_only=True)
    
    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'timing', 'dosage', 'quantity',
                  'date', 'completed', 'completed_at', 'is_important', 
                  'template', 'template_title', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserProfileSerializer(serializers.ModelSerializer):
    avatar = AvatarConfigSerializer(source='avatar_config', read_only=True)
    treatment_info = TreatmentInfoSerializer(source='user.treatment_info', read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['id', 'has_completed_onboarding', 'onboarding_step', 'avatar', 
                  'treatment_info', 'start_date', 'updated_at']
        read_only_fields = ['id', 'start_date', 'updated_at']


class UserStateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserState
        fields = ['id', 'fatigue_level', 'consistency_score', 'mood_level', 'updated_at']
        read_only_fields = ['id', 'updated_at']


class ConstellationStarSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConstellationStar
        fields = ['id', 'star_type', 'mood', 'note', 'size', 'x', 'y', 'created_at']
        read_only_fields = ['id', 'created_at']


class FutureSelfMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = FutureSelfMessage
        fields = ['id', 'message_type', 'content', 'unlock_progress', 'is_unlocked', 
                  'unlocked_at', 'created_at']
        read_only_fields = ['id', 'unlocked_at', 'created_at']


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name']
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords do not match"})
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        # CrÃ©er les profils associÃ©s
        UserProfile.objects.create(user=user)
        UserState.objects.create(user=user)
        AvatarConfig.objects.create(user=user)
        return user


class OnboardingDataSerializer(serializers.Serializer):
    """
    Serializer for complete onboarding data
    âœ… VERSION SIMPLIFIÃ‰E : start_date n'est pas inclus - gÃ©rÃ© automatiquement par le model
    """
    
    # Avatar fields
    avatar_name = serializers.CharField(max_length=100)
    avatar_appearance = serializers.CharField(max_length=50)
    avatar_expression = serializers.CharField(max_length=50)
    avatar_tone = serializers.CharField(max_length=50)
    
    # Treatment Info fields
    diagnosis = serializers.CharField(max_length=200, allow_blank=True, required=False)
    treatment_type = serializers.CharField(max_length=100, allow_blank=True, required=False)
    doctor_name = serializers.CharField(max_length=100, allow_blank=True, required=False)
    hospital = serializers.CharField(max_length=200, allow_blank=True, required=False)
    
    # âœ… start_date supprimÃ© - sera automatiquement aujourd'hui via model default
    
    duration_weeks = serializers.IntegerField()
    notes = serializers.CharField(allow_blank=True, required=False)
    
    # Task Templates
    task_templates = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        allow_empty=True
    )
# notifications/serializers.py

from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'id',
            'title',
            'message',
            'notification_type',
            'icon',
            'is_read',
            'is_dismissed',
            'scheduled_time',
            'created_at',
            'shown_at',
        ]
        read_only_fields = ['id', 'created_at', 'shown_at']

        # vio/serializers.py - ADD THESE TO YOUR EXISTING FILE

from rest_framework import serializers
from .models import Routine, RoutineCompletion, UserScore, ScoreHistory


class RoutineSerializer(serializers.ModelSerializer):
    """Serializer for Routine model"""
    completion_dates = serializers.SerializerMethodField()
    
    class Meta:
        model = Routine
        fields = [
            'id', 'title', 'time', 'frequency', 'notes', 'icon',
            'custom_days', 'is_paused', 'created_at', 'updated_at',
            'last_completed', 'completion_dates'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_completed']
    
    def get_completion_dates(self, obj):
        """Get list of dates when this routine was completed"""
        completions = obj.completions.values_list('completion_date', flat=True)
        return [date.isoformat() for date in completions]


class RoutineCompletionSerializer(serializers.ModelSerializer):
    """Serializer for RoutineCompletion model"""
    routine_title = serializers.CharField(source='routine.title', read_only=True)
    
    class Meta:
        model = RoutineCompletion
        fields = [
            'id', 'routine', 'routine_title', 'completion_date', 'completed_at'
        ]
        read_only_fields = ['id', 'completed_at']


class UserScoreSerializer(serializers.ModelSerializer):
    """Serializer for UserScore model"""
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = UserScore
        fields = [
            'id', 'username', 'total_score', 'total_completions',
            'current_streak', 'longest_streak', 'last_completion_date',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'total_score', 'total_completions', 'current_streak',
            'longest_streak', 'last_completion_date', 'created_at', 'updated_at'
        ]


class ScoreHistorySerializer(serializers.ModelSerializer):
    """Serializer for ScoreHistory model"""
    routine_title = serializers.CharField(source='routine.title', read_only=True)
    
    class Meta:
        model = ScoreHistory
        fields = [
            'id', 'points_earned', 'reason', 'routine', 'routine_title', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class LeaderboardSerializer(serializers.Serializer):
    """Serializer for leaderboard data"""
    rank = serializers.IntegerField()
    username = serializers.CharField()
    total_score = serializers.IntegerField()
    total_completions = serializers.IntegerField()
    current_streak = serializers.IntegerField()