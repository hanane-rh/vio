# carepath/models.py
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator

class AvatarConfig(models.Model):
    APPEARANCE_CHOICES = [
        ('youthful', 'Youthful'),
        ('mature', 'Mature'),
        ('gentle', 'Gentle'),
        ('energetic', 'Energetic'),
    ]
    
    EXPRESSION_CHOICES = [
        ('warm', 'Warm'),
        ('hopeful', 'Hopeful'),
        ('peaceful', 'Peaceful'),
        ('joyful', 'Joyful'),
    ]
    
    TONE_CHOICES = [
        ('encouraging', 'Encouraging'),
        ('gentle', 'Gentle'),
        ('inspiring', 'Inspiring'),
        ('celebratory', 'Celebratory'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='avatar_config')
    name = models.CharField(max_length=255, default='Your Future Self')
    appearance = models.CharField(max_length=50, choices=APPEARANCE_CHOICES, default='gentle')
    expression = models.CharField(max_length=50, choices=EXPRESSION_CHOICES, default='warm')
    tone = models.CharField(max_length=50, choices=TONE_CHOICES, default='encouraging')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'avatar_config'
        verbose_name = 'Avatar Configuration'
        verbose_name_plural = 'Avatar Configurations'
    
    def __str__(self):
        return f"{self.user.username}'s Avatar - {self.name}"


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='carepath_profile')
    avatar_config = models.OneToOneField(AvatarConfig, on_delete=models.SET_NULL, null=True, related_name='profile')
    has_completed_onboarding = models.BooleanField(default=False)
    start_date = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_profile'
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'
    
    def __str__(self):
        return f"{self.user.username}'s Profile"


class Task(models.Model):
    TASK_TYPE_CHOICES = [
        ('daily', 'Daily'),
        ('challenge', 'Challenge'),
    ]
    
    PRIORITY_CHOICES = [
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=255)
    description = models.TextField()
    task_type = models.CharField(max_length=50, choices=TASK_TYPE_CHOICES)
    priority = models.CharField(max_length=50, choices=PRIORITY_CHOICES, default='medium')
    completed = models.BooleanField(default=False)
    date = models.DateField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'tasks'
        verbose_name = 'Task'
        verbose_name_plural = 'Tasks'
        ordering = ['-date', '-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.title}"


class ConstellationStar(models.Model):
    STAR_TYPE_CHOICES = [
        ('difficult-day', 'Difficult Day'),
        ('milestone', 'Milestone'),
        ('return', 'Return After Pause'),
        ('emotional-challenge', 'Emotional Challenge'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='constellation_stars')
    star_type = models.CharField(max_length=50, choices=STAR_TYPE_CHOICES)
    mood = models.CharField(max_length=255, blank=True)
    note = models.TextField()
    size = models.FloatField(default=1.0, validators=[MinValueValidator(0.75), MaxValueValidator(1.25)])
    x = models.FloatField(validators=[MinValueValidator(15), MaxValueValidator(85)])
    y = models.FloatField(validators=[MinValueValidator(10), MaxValueValidator(80)])
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'constellation_stars'
        verbose_name = 'Constellation Star'
        verbose_name_plural = 'Constellation Stars'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.star_type}"


class UserState(models.Model):
    """Track user's current emotional state for adaptive challenges"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='user_state')
    fatigue_level = models.IntegerField(default=50, validators=[MinValueValidator(0), MaxValueValidator(100)])
    consistency_score = models.IntegerField(default=50, validators=[MinValueValidator(0), MaxValueValidator(100)])
    mood_level = models.IntegerField(default=50, validators=[MinValueValidator(0), MaxValueValidator(100)])
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_state'
        verbose_name = 'User State'
        verbose_name_plural = 'User States'
    
    def __str__(self):
        return f"{self.user.username}'s State"


class AdaptiveChallenge(models.Model):
    CHALLENGE_MODE_CHOICES = [
        ('comfort', 'Comfort'),
        ('flow', 'Flow'),
        ('momentum', 'Momentum'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='adaptive_challenges')
    mode = models.CharField(max_length=50, choices=CHALLENGE_MODE_CHOICES)
    title = models.CharField(max_length=255)
    description = models.TextField()
    completed = models.BooleanField(default=False)
    date = models.DateField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'adaptive_challenges'
        verbose_name = 'Adaptive Challenge'
        verbose_name_plural = 'Adaptive Challenges'
        ordering = ['-date', '-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.title}"


class FutureSelfMessage(models.Model):
    MESSAGE_TYPE_CHOICES = [
        ('letter', 'Letter'),
        ('voice', 'Voice'),
        ('advice', 'Advice'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='future_self_messages')
    message_type = models.CharField(max_length=50, choices=MESSAGE_TYPE_CHOICES)
    content = models.TextField()
    unlock_progress = models.IntegerField(default=50, validators=[MinValueValidator(0), MaxValueValidator(100)])
    is_unlocked = models.BooleanField(default=False)
    unlocked_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'future_self_messages'
        verbose_name = 'Future Self Message'
        verbose_name_plural = 'Future Self Messages'
        ordering = ['unlock_progress']
    
    def __str__(self):
        return f"{self.user.username} - {self.message_type}"