# vio/serializers.py
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
        # Créer les profils associés
        UserProfile.objects.create(user=user)
        UserState.objects.create(user=user)
        AvatarConfig.objects.create(user=user)
        return user


class OnboardingDataSerializer(serializers.Serializer):
    """Serializer pour compléter l'onboarding (tous les steps)"""
    # Avatar
    avatar_name = serializers.CharField(max_length=255)
    avatar_appearance = serializers.ChoiceField(choices=['youthful', 'mature', 'gentle', 'energetic'])
    avatar_expression = serializers.ChoiceField(choices=['warm', 'hopeful', 'peaceful', 'joyful'])
    avatar_tone = serializers.ChoiceField(choices=['encouraging', 'gentle', 'inspiring', 'celebratory'])
    
    # Treatment Info
    diagnosis = serializers.CharField(max_length=255, required=False, allow_blank=True)
    treatment_type = serializers.CharField(max_length=255, required=False, allow_blank=True)
    doctor_name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    hospital = serializers.CharField(max_length=255, required=False, allow_blank=True)
    start_date = serializers.DateField()
    duration_weeks = serializers.IntegerField(min_value=1)
    notes = serializers.CharField(required=False, allow_blank=True)
    
    # Task Templates
    task_templates = serializers.ListField(
        child=serializers.DictField(),
        required=False
    )