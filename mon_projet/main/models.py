# vio/models.py
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from datetime import datetime, timedelta

class AvatarConfig(models.Model):
    """Configuration de l'avatar du future self"""
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
    # Pour stocker une image/avatar personnalisé
    avatar_image = models.ImageField(upload_to='avatars/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'avatar_config'
        verbose_name = 'Avatar Configuration'
    
    def __str__(self):
        return f"{self.user.username}'s Avatar - {self.name}"


class TreatmentInfo(models.Model):
    """Informations sur le traitement de l'utilisateur"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='treatment_info')
    
    # Informations médicales
    diagnosis = models.CharField(max_length=255, blank=True)  # Ex: "Cancer", "Maladie chronique"
    treatment_type = models.CharField(max_length=255, blank=True)  # Ex: "Chimiothérapie"
    doctor_name = models.CharField(max_length=255, blank=True)
    hospital = models.CharField(max_length=255, blank=True)
    
    # Durée du traitement
    start_date = models.DateField()
    duration_weeks = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(1000)])
    
    # Dates calculées
    end_date = models.DateField()  # Calculée à partir de start_date + duration
    
    # Notes personnelles
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'treatment_info'
        verbose_name = 'Treatment Information'
    
    def save(self, *args, **kwargs):
        # Calculer la date de fin
        if self.start_date:
            self.end_date = self.start_date + timedelta(weeks=self.duration_weeks)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.user.username}'s Treatment - {self.duration_weeks} weeks"


class TaskTemplate(models.Model):
    """Template de tâche récurrente avec fréquence"""
    FREQUENCY_CHOICES = [
        ('daily', 'Every day'),
        ('every-2-days', 'Every 2 days'),
        ('every-3-days', 'Every 3 days'),
        ('weekly', 'Every week'),
        ('twice-weekly', 'Twice a week'),
        ('twice-daily', 'Twice a day'),
        ('three-times-daily', 'Three times a day'),
        ('custom', 'Custom'),
    ]
    
    TIMING_CHOICES = [
        ('morning', 'Morning'),
        ('afternoon', 'Afternoon'),
        ('evening', 'Evening'),
        ('night', 'Night'),
        ('anytime', 'Anytime'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='task_templates')
    
    title = models.CharField(max_length=255)  # Ex: "Medication A"
    description = models.TextField(blank=True)
    
    # Fréquence
    frequency = models.CharField(max_length=50, choices=FREQUENCY_CHOICES)
    custom_frequency_days = models.IntegerField(null=True, blank=True)  # Pour 'custom'
    
    # Timing (matin, soir, etc.)
    timing = models.CharField(max_length=50, choices=TIMING_CHOICES, default='anytime')
    
    # Jours de la semaine pour "weekly" (1=lundi, 7=dimanche)
    monday = models.BooleanField(default=True)
    tuesday = models.BooleanField(default=True)
    wednesday = models.BooleanField(default=True)
    thursday = models.BooleanField(default=True)
    friday = models.BooleanField(default=True)
    saturday = models.BooleanField(default=True)
    sunday = models.BooleanField(default=True)
    
    # Dosage/détails
    dosage = models.CharField(max_length=255, blank=True)  # Ex: "500mg"
    quantity = models.CharField(max_length=100, blank=True)  # Ex: "1 tablet"
    
    # Dates
    start_date = models.DateField(auto_now_add=True)
    end_date = models.DateField(null=True, blank=True)
    
    # Priority
    is_important = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'task_templates'
        verbose_name = 'Task Template'
        ordering = ['-is_important', 'title']
    
    def __str__(self):
        return f"{self.user.username} - {self.title} ({self.frequency})"
    
    def should_appear_on_date(self, date):
        """
        Détermine si cette tâche doit apparaître pour une date donnée
        """
        # Vérifier les dates de début/fin
        if self.start_date and date < self.start_date:
            return False
        if self.end_date and date > self.end_date:
            return False
        
        # Fréquence quotidienne
        if self.frequency == 'daily':
            return True
        
        # Tous les X jours
        if self.frequency == 'every-2-days':
            days_diff = (date - self.start_date).days
            return days_diff % 2 == 0
        
        if self.frequency == 'every-3-days':
            days_diff = (date - self.start_date).days
            return days_diff % 3 == 0
        
        # Personnalisé
        if self.frequency == 'custom' and self.custom_frequency_days:
            days_diff = (date - self.start_date).days
            return days_diff % self.custom_frequency_days == 0
        
        # Hebdomadaire - vérifier le jour
        if self.frequency == 'weekly':
            weekday = date.weekday()  # 0=lundi, 6=dimanche
            weekday_check = [
                self.monday, self.tuesday, self.wednesday, self.thursday,
                self.friday, self.saturday, self.sunday
            ]
            return weekday_check[weekday]
        
        # Deux fois par semaine - implémenter selon vos besoins
        if self.frequency == 'twice-weekly':
            # Supposons lundi et jeudi par défaut
            weekday = date.weekday()
            return weekday in [0, 3]  # lundi (0) et jeudi (3)
        
        return False


class Task(models.Model):
    """Tâche quotidienne générée à partir des templates"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    template = models.ForeignKey(TaskTemplate, on_delete=models.SET_NULL, null=True, blank=True)
    
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    
    timing = models.CharField(max_length=50, default='anytime')
    dosage = models.CharField(max_length=255, blank=True)
    quantity = models.CharField(max_length=100, blank=True)
    
    date = models.DateField()
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    is_important = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'tasks'
        verbose_name = 'Task'
        ordering = ['-date', '-is_important', 'timing']
        unique_together = ('user', 'title', 'date', 'timing')  # Pas de doublons
    
    def __str__(self):
        return f"{self.user.username} - {self.title} ({self.date})"


class UserProfile(models.Model):
    """Profil utilisateur avec état d'onboarding"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='vio_profile')
    avatar_config = models.OneToOneField(AvatarConfig, on_delete=models.SET_NULL, null=True, related_name='profile')
    
    # Onboarding status
    has_completed_onboarding = models.BooleanField(default=False)
    onboarding_step = models.IntegerField(default=0)  # Quel étape de l'onboarding
    
    # Dates
    start_date = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_profile'
        verbose_name = 'User Profile'
    
    def __str__(self):
        return f"{self.user.username}'s Profile"


class UserState(models.Model):
    """État émotionnel de l'utilisateur"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='user_state')
    
    fatigue_level = models.IntegerField(default=50, validators=[MinValueValidator(0), MaxValueValidator(100)])
    consistency_score = models.IntegerField(default=50, validators=[MinValueValidator(0), MaxValueValidator(100)])
    mood_level = models.IntegerField(default=50, validators=[MinValueValidator(0), MaxValueValidator(100)])
    
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_state'
        verbose_name = 'User State'
    
    def __str__(self):
        return f"{self.user.username}'s State"


class ConstellationStar(models.Model):
    """Star de la constellation (achievements)"""
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
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.star_type}"


class FutureSelfMessage(models.Model):
    """Messages du future self à débloquer"""
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
        ordering = ['unlock_progress']
    
    def __str__(self):
        return f"{self.user.username} - {self.message_type}"