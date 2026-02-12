# vio/views.py - VERSION SIMPLIFIÉE
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import datetime, timedelta, date
from .models import (
    AvatarConfig, TreatmentInfo, TaskTemplate, Task,
    UserProfile, UserState, ConstellationStar, FutureSelfMessage
)
from .serializers import (
    AvatarConfigSerializer, TreatmentInfoSerializer, TaskTemplateSerializer,
    TaskSerializer, UserProfileSerializer, UserStateSerializer,
    ConstellationStarSerializer, FutureSelfMessageSerializer,
    UserRegistrationSerializer, OnboardingDataSerializer
)


# ============= AUTHENTICATION ENDPOINTS =============

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Register a new user"""
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'user_id': user.id,
            'username': user.username,
            'email': user.email,
            'token': token.key,
            'message': 'User created successfully - Complete onboarding next'
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """Login user"""
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response({
            'error': 'Please provide username and password'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(username=username)
        if user.check_password(password):
            token, created = Token.objects.get_or_create(user=user)
            profile, _ = UserProfile.objects.get_or_create(user=user)
            
            return Response({
                'user_id': user.id,
                'username': user.username,
                'email': user.email,
                'token': token.key,
                'has_completed_onboarding': profile.has_completed_onboarding,
                'message': 'Login successful'
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
    except User.DoesNotExist:
        return Response({
            'error': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """Logout user"""
    request.user.auth_token.delete()
    return Response({
        'message': 'Logout successful'
    }, status=status.HTTP_200_OK)


# ============= TASK GENERATION LOGIC =============

def generate_daily_tasks(user, target_date=None):
    """
    Génère les tâches quotidiennes basées sur les templates
    """
    if target_date is None:
        target_date = date.today()
    
    # Récupérer tous les templates actifs de l'utilisateur
    templates = TaskTemplate.objects.filter(
        user=user,
        start_date__lte=target_date
    ).exclude(end_date__lt=target_date)
    
    tasks_created = []
    
    for template in templates:
        # Vérifier si cette tâche doit apparaître aujourd'hui
        if not template.should_appear_on_date(target_date):
            continue
        
        # Vérifier qu'on ne crée pas de doublon
        existing_task = Task.objects.filter(
            user=user,
            title=template.title,
            date=target_date,
            timing=template.timing
        ).exists()
        
        if existing_task:
            continue
        
        # Créer la tâche
        task = Task.objects.create(
            user=user,
            template=template,
            title=template.title,
            description=template.description,
            timing=template.timing,
            dosage=template.dosage,
            quantity=template.quantity,
            date=target_date,
            is_important=template.is_important
        )
        tasks_created.append(task)
    
    return tasks_created


# ============= PROFILE ENDPOINTS =============

class UserProfileViewSet(viewsets.ModelViewSet):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get', 'post'])
    def current(self, request):
        """Get or update current user's profile"""
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        
        if request.method == 'POST':
            serializer = self.get_serializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
    
    @action(detail=False, methods=['POST'], url_path='complete_onboarding')
    def complete_onboarding(self, request):
        """
        Complete the entire onboarding process
        ✅ VERSION SIMPLIFIÉE : start_date est automatiquement aujourd'hui
        """
        print("=" * 60)
        print("🚀 ONBOARDING REQUEST RECEIVED")
        print(f"   User: {request.user.username}")
        print(f"   Data keys: {list(request.data.keys())}")
        print(f"   duration_weeks in data: {'duration_weeks' in request.data}")
        if 'duration_weeks' in request.data:
            print(f"   duration_weeks value: {request.data['duration_weeks']} (type: {type(request.data['duration_weeks'])})")
        print("=" * 60)
        
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        
        try:
            # Parser les données
            serializer = OnboardingDataSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            data = serializer.validated_data
            
            # 1. Créer/Mettre à jour Avatar Config
            avatar, _ = AvatarConfig.objects.get_or_create(user=request.user)
            avatar.name = data['avatar_name']
            avatar.appearance = data['avatar_appearance']
            avatar.expression = data['avatar_expression']
            avatar.tone = data['avatar_tone']
            avatar.save()
            
            # 2. Créer/Mettre à jour Treatment Info
            # ✅ Use update_or_create to ensure ALL fields are properly set
            treatment_info, created = TreatmentInfo.objects.update_or_create(
                user=request.user,
                defaults={
                    'diagnosis': data.get('diagnosis', ''),
                    'treatment_type': data.get('treatment_type', ''),
                    'doctor_name': data.get('doctor_name', ''),
                    'hospital': data.get('hospital', ''),
                    'start_date': date.today(),
                    'duration_weeks': data['duration_weeks'],
                    'notes': data.get('notes', ''),
                }
            )
            
            print(f"✅ Treatment info {'created' if created else 'updated'}")
            print(f"   - start_date: {treatment_info.start_date}")
            print(f"   - duration_weeks: {treatment_info.duration_weeks}")
            
            # 3. Créer les Task Templates
            task_templates_data = data.get('task_templates', [])
            for template_data in task_templates_data:
                TaskTemplate.objects.create(
                    user=request.user,
                    title=template_data.get('title'),
                    description=template_data.get('description', ''),
                    frequency=template_data.get('frequency', 'daily'),
                    custom_frequency_days=template_data.get('custom_frequency_days'),
                    timing=template_data.get('timing', 'anytime'),
                    monday=template_data.get('monday', True),
                    tuesday=template_data.get('tuesday', True),
                    wednesday=template_data.get('wednesday', True),
                    thursday=template_data.get('thursday', True),
                    friday=template_data.get('friday', True),
                    saturday=template_data.get('saturday', True),
                    sunday=template_data.get('sunday', True),
                    dosage=template_data.get('dosage', ''),
                    quantity=template_data.get('quantity', ''),
                    is_important=template_data.get('is_important', False),
                    end_date=treatment_info.end_date
                )
            
            # 4. Mettre à jour le profil
            profile.avatar_config = avatar
            profile.has_completed_onboarding = True
            profile.onboarding_step = 5  # Completed
            profile.save()
            
            # 5. Générer les tâches pour aujourd'hui et les 7 prochains jours
            for i in range(8):
                target_date = date.today() + timedelta(days=i)
                generate_daily_tasks(request.user, target_date)
            
            result_serializer = UserProfileSerializer(profile)
            return Response({
                'status': 'success',
                'message': 'Onboarding completed successfully',
                'profile': result_serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            import traceback
            error_trace = traceback.format_exc()
            print("❌ Onboarding error:", str(e))
            print(error_trace)
            
            return Response({
                'error': str(e),
                'trace': error_trace if request.user.is_staff else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============= AVATAR ENDPOINTS =============

class AvatarConfigViewSet(viewsets.ModelViewSet):
    serializer_class = AvatarConfigSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return AvatarConfig.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get', 'post'])
    def current(self, request):
        """Get or update current user's avatar"""
        avatar, created = AvatarConfig.objects.get_or_create(user=request.user)
        
        if request.method == 'POST':
            serializer = self.get_serializer(avatar, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            serializer = self.get_serializer(avatar)
            return Response(serializer.data)


# ============= TREATMENT INFO ENDPOINTS =============

class TreatmentInfoViewSet(viewsets.ModelViewSet):
    serializer_class = TreatmentInfoSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get', 'post'])
    def current(self, request):
        """Get or update treatment info"""
        treatment_info, created = TreatmentInfo.objects.get_or_create(user=request.user)
        
        if request.method == 'POST':
            serializer = self.get_serializer(treatment_info, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            serializer = self.get_serializer(treatment_info)
            return Response(serializer.data)


# ============= TASK TEMPLATE ENDPOINTS =============

class TaskTemplateViewSet(viewsets.ModelViewSet):
    serializer_class = TaskTemplateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return TaskTemplate.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def regenerate_future_tasks(self, request):
        """Régénère les tâches pour les 7 prochains jours"""
        # Supprimer les futures tasks (optionnel)
        Task.objects.filter(
            user=request.user,
            date__gt=date.today()
        ).delete()
        
        # Régénérer
        for i in range(1, 8):
            target_date = date.today() + timedelta(days=i)
            generate_daily_tasks(request.user, target_date)
        
        return Response({
            'message': 'Tasks regenerated for the next 7 days'
        })


# ============= TASK ENDPOINTS =============

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def today(self, request):
        """Get today's tasks"""
        today = date.today()
        tasks = self.get_queryset().filter(date=today)
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_date(self, request):
        """Get tasks by date (query param: date=2025-02-10)"""
        target_date_str = request.query_params.get('date')
        if not target_date_str:
            return Response({'error': 'Please provide date parameter'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            target_date = datetime.strptime(target_date_str, '%Y-%m-%d').date()
            tasks = self.get_queryset().filter(date=target_date)
            serializer = self.get_serializer(tasks, many=True)
            return Response(serializer.data)
        except ValueError:
            return Response({'error': 'Invalid date format (use YYYY-MM-DD)'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def init_today_tasks(self, request):
        """Initialiser les tâches d'aujourd'hui"""
        today = date.today()
        
        # Vérifier si les tâches d'aujourd'hui existent déjà
        has_today = Task.objects.filter(user=request.user, date=today).exists()
        
        if not has_today:
            generate_daily_tasks(request.user, today)
        
        today_tasks = Task.objects.filter(user=request.user, date=today)
        serializer = self.get_serializer(today_tasks, many=True)
        return Response({
            'message': 'Today\'s tasks initialized',
            'tasks': serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def toggle_completion(self, request, pk=None):
        """Toggle task completion"""
        task = self.get_object()
        task.completed = not task.completed
        if task.completed:
            task.completed_at = timezone.now()
        else:
            task.completed_at = None
        task.save()
        
        serializer = self.get_serializer(task)
        return Response(serializer.data)


# ============= USER STATE ENDPOINTS =============

class UserStateViewSet(viewsets.ModelViewSet):
    serializer_class = UserStateSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get', 'post'])
    def current(self, request):
        """Get or update user state"""
        user_state, created = UserState.objects.get_or_create(user=request.user)
        
        if request.method == 'POST':
            serializer = self.get_serializer(user_state, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            serializer = self.get_serializer(user_state)
            return Response(serializer.data)


# ============= CONSTELLATION ENDPOINTS =============

class ConstellationStarViewSet(viewsets.ModelViewSet):
    serializer_class = ConstellationStarSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ConstellationStar.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get constellation stats"""
        stars = self.get_queryset()
        stats = {
            'difficult-day': stars.filter(star_type='difficult-day').count(),
            'milestone': stars.filter(star_type='milestone').count(),
            'return': stars.filter(star_type='return').count(),
            'emotional-challenge': stars.filter(star_type='emotional-challenge').count(),
            'total': stars.count(),
        }
        return Response(stats)


# ============= FUTURE SELF MESSAGE ENDPOINTS =============

class FutureSelfMessageViewSet(viewsets.ModelViewSet):
    serializer_class = FutureSelfMessageSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return FutureSelfMessage.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def unlocked(self, request):
        """Get unlocked messages"""
        messages = self.get_queryset().filter(is_unlocked=True)
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)