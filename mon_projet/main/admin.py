# carepath/admin.py
from django.contrib import admin
from .models import (
    AvatarConfig, UserProfile, Task, ConstellationStar,
    UserState, AdaptiveChallenge, FutureSelfMessage
)


@admin.register(AvatarConfig)
class AvatarConfigAdmin(admin.ModelAdmin):
    list_display = ('user', 'name', 'appearance', 'tone', 'created_at')
    list_filter = ('appearance', 'expression', 'tone', 'created_at')
    search_fields = ('user__username', 'name')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Avatar Details', {
            'fields': ('name', 'appearance', 'expression', 'tone')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'has_completed_onboarding', 'start_date', 'updated_at')
    list_filter = ('has_completed_onboarding', 'start_date')
    search_fields = ('user__username', 'user__email')
    readonly_fields = ('start_date', 'updated_at')


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'task_type', 'priority', 'completed', 'date', 'created_at')
    list_filter = ('task_type', 'priority', 'completed', 'date')
    search_fields = ('user__username', 'title')
    readonly_fields = ('created_at',)
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Task Details', {
            'fields': ('title', 'description', 'task_type', 'priority')
        }),
        ('Status', {
            'fields': ('completed', 'completed_at', 'date')
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )


@admin.register(ConstellationStar)
class ConstellationStarAdmin(admin.ModelAdmin):
    list_display = ('user', 'star_type', 'mood', 'size', 'created_at')
    list_filter = ('star_type', 'created_at')
    search_fields = ('user__username', 'mood', 'note')
    readonly_fields = ('created_at',)
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Star Details', {
            'fields': ('star_type', 'mood', 'note')
        }),
        ('Position & Size', {
            'fields': ('x', 'y', 'size')
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )


@admin.register(UserState)
class UserStateAdmin(admin.ModelAdmin):
    list_display = ('user', 'fatigue_level', 'consistency_score', 'mood_level', 'updated_at')
    list_filter = ('updated_at',)
    search_fields = ('user__username',)
    readonly_fields = ('updated_at',)
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('State Metrics', {
            'fields': ('fatigue_level', 'consistency_score', 'mood_level')
        }),
        ('Timestamps', {
            'fields': ('updated_at',),
            'classes': ('collapse',)
        }),
    )


@admin.register(AdaptiveChallenge)
class AdaptiveChallengeAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'mode', 'completed', 'date', 'created_at')
    list_filter = ('mode', 'completed', 'date')
    search_fields = ('user__username', 'title')
    readonly_fields = ('created_at',)
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Challenge Details', {
            'fields': ('title', 'description', 'mode')
        }),
        ('Status', {
            'fields': ('completed', 'completed_at', 'date')
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )


@admin.register(FutureSelfMessage)
class FutureSelfMessageAdmin(admin.ModelAdmin):
    list_display = ('user', 'message_type', 'unlock_progress', 'is_unlocked', 'created_at')
    list_filter = ('message_type', 'is_unlocked', 'unlock_progress', 'created_at')
    search_fields = ('user__username', 'content')
    readonly_fields = ('created_at', 'unlocked_at')
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Message Details', {
            'fields': ('message_type', 'content')
        }),
        ('Unlock Settings', {
            'fields': ('unlock_progress', 'is_unlocked', 'unlocked_at')
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )