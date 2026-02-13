# main/admin.py
from django.contrib import admin
from .models import (
    AvatarConfig,
    TreatmentInfo,
    TaskTemplate,
    Task,
    UserProfile,
    UserState,
    ConstellationStar,
    FutureSelfMessage,
    # ✅ NEW: Add these imports
    Routine,
    RoutineCompletion,
    UserScore,
    ScoreHistory,
)

# Avatar Config
@admin.register(AvatarConfig)
class AvatarConfigAdmin(admin.ModelAdmin):
    list_display = ('user', 'name', 'appearance', 'expression', 'tone', 'created_at')
    search_fields = ('user__username', 'name')
    list_filter = ('appearance', 'expression', 'tone', 'created_at')
    fieldsets = (
        ('User', {'fields': ('user',)}),
        ('Avatar Info', {'fields': ('name', 'avatar_image')}),
        ('Configuration', {'fields': ('appearance', 'expression', 'tone')}),
    )

# Treatment Info
@admin.register(TreatmentInfo)
class TreatmentInfoAdmin(admin.ModelAdmin):
    list_display = ('user', 'diagnosis', 'treatment_type', 'start_date', 'end_date')
    search_fields = ('user__username', 'diagnosis', 'treatment_type')
    list_filter = ('start_date', 'end_date')
    fieldsets = (
        ('User', {'fields': ('user',)}),
        ('Medical Info', {'fields': ('diagnosis', 'treatment_type', 'doctor_name', 'hospital')}),
        ('Treatment Duration', {'fields': ('start_date', 'duration_weeks', 'end_date')}),
        ('Notes', {'fields': ('notes',)}),
    )

# Task Template
@admin.register(TaskTemplate)
class TaskTemplateAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'frequency', 'timing', 'is_important', 'created_at')
    search_fields = ('user__username', 'title')
    list_filter = ('frequency', 'timing', 'is_important', 'created_at')
    fieldsets = (
        ('User', {'fields': ('user',)}),
        ('Task Info', {'fields': ('title', 'description')}),
        ('Frequency', {'fields': ('frequency', 'custom_frequency_days')}),
        ('Days', {'fields': ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')}),
        ('Timing', {'fields': ('timing',)}),
        ('Dosage', {'fields': ('dosage', 'quantity')}),
        ('Dates', {'fields': ('start_date', 'end_date')}),
        ('Priority', {'fields': ('is_important',)}),
    )

# Task
@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'date', 'timing', 'completed', 'is_important')
    search_fields = ('user__username', 'title')
    list_filter = ('date', 'timing', 'completed', 'is_important')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('User', {'fields': ('user',)}),
        ('Task Info', {'fields': ('title', 'description', 'template')}),
        ('Details', {'fields': ('timing', 'dosage', 'quantity')}),
        ('Status', {'fields': ('date', 'completed', 'completed_at', 'is_important')}),
        ('Metadata', {'fields': ('created_at', 'updated_at')}),
    )

# User Profile
@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'has_completed_onboarding', 'onboarding_step', 'start_date')
    search_fields = ('user__username',)
    list_filter = ('has_completed_onboarding', 'start_date')
    readonly_fields = ('start_date', 'updated_at')
    fieldsets = (
        ('User', {'fields': ('user',)}),
        ('Avatar', {'fields': ('avatar_config',)}),
        ('Onboarding', {'fields': ('has_completed_onboarding', 'onboarding_step')}),
        ('Metadata', {'fields': ('start_date', 'updated_at')}),
    )

# User State
@admin.register(UserState)
class UserStateAdmin(admin.ModelAdmin):
    list_display = ('user', 'fatigue_level', 'consistency_score', 'mood_level', 'updated_at')
    search_fields = ('user__username',)
    list_filter = ('updated_at',)
    readonly_fields = ('updated_at',)

# Constellation Star
@admin.register(ConstellationStar)
class ConstellationStarAdmin(admin.ModelAdmin):
    list_display = ('user', 'star_type', 'mood', 'created_at')
    search_fields = ('user__username', 'mood')
    list_filter = ('star_type', 'created_at')
    readonly_fields = ('created_at',)
    fieldsets = (
        ('User', {'fields': ('user',)}),
        ('Star Info', {'fields': ('star_type', 'mood', 'note')}),
        ('Position', {'fields': ('x', 'y', 'size')}),
        ('Metadata', {'fields': ('created_at',)}),
    )

# Future Self Message
@admin.register(FutureSelfMessage)
class FutureSelfMessageAdmin(admin.ModelAdmin):
    list_display = ('user', 'message_type', 'unlock_progress', 'is_unlocked', 'created_at')
    search_fields = ('user__username',)
    list_filter = ('message_type', 'unlock_progress', 'is_unlocked', 'created_at')
    readonly_fields = ('created_at', 'unlocked_at')
    fieldsets = (
        ('User', {'fields': ('user',)}),
        ('Message', {'fields': ('message_type', 'content')}),
        ('Unlock', {'fields': ('unlock_progress',)}),
        ('Status', {'fields': ('is_unlocked', 'unlocked_at')}),
        ('Metadata', {'fields': ('created_at',)}),
    )


# ============================================================================
# ✅ NEW: ROUTINE & SCORING SYSTEM ADMIN
# ============================================================================

@admin.register(Routine)
class RoutineAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'time', 'frequency', 'is_paused', 'created_at']
    list_filter = ['frequency', 'is_paused', 'created_at']
    search_fields = ['title', 'user__username', 'notes']
    readonly_fields = ['created_at', 'updated_at', 'last_completed']
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('user', 'title', 'time', 'icon', 'notes')
        }),
        ('Frequency', {
            'fields': ('frequency', 'custom_days')
        }),
        ('Status', {
            'fields': ('is_paused', 'last_completed')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('user')


@admin.register(RoutineCompletion)
class RoutineCompletionAdmin(admin.ModelAdmin):
    list_display = ['user', 'routine', 'completion_date', 'completed_at']
    list_filter = ['completion_date', 'completed_at']
    search_fields = ['user__username', 'routine__title']
    readonly_fields = ['completed_at']
    date_hierarchy = 'completion_date'
    
    fieldsets = (
        ('Completion Info', {
            'fields': ('user', 'routine', 'completion_date')
        }),
        ('Metadata', {
            'fields': ('completed_at',)
        }),
    )
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('user', 'routine')


@admin.register(UserScore)
class UserScoreAdmin(admin.ModelAdmin):
    list_display = ['user', 'total_score', 'total_completions', 'current_streak', 'longest_streak', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['user__username']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Score', {
            'fields': ('total_score', 'total_completions')
        }),
        ('Streaks', {
            'fields': ('current_streak', 'longest_streak', 'last_completion_date')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('user')


@admin.register(ScoreHistory)
class ScoreHistoryAdmin(admin.ModelAdmin):
    list_display = ['user', 'points_earned', 'reason', 'routine', 'created_at']
    list_filter = ['created_at', 'points_earned']
    search_fields = ['user__username', 'reason', 'routine__title']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Info', {
            'fields': ('user', 'points_earned', 'reason', 'routine')
        }),
        ('Metadata', {
            'fields': ('created_at',)
        }),
    )
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('user', 'routine')


# notifications/admin.py

from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'user',
        'title',
        'notification_type',
        'scheduled_time',
        'is_dismissed',
        'shown_at',
        'created_at',
    ]
    list_filter = [
        'notification_type',
        'is_dismissed',
        'scheduled_time',
        'created_at',
    ]
    search_fields = ['user__username', 'title', 'message']
    readonly_fields = ['created_at', 'shown_at']
    
    fieldsets = (
        ('Information', {
            'fields': ('user', 'title', 'message', 'notification_type', 'icon')
        }),
        ('Timing', {
            'fields': ('scheduled_time', 'shown_at', 'created_at')
        }),
        ('Status', {
            'fields': ('is_read', 'is_dismissed')
        }),
    )
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('user')