# carepath/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import datetime, timedelta

from .models import (
    AvatarConfig, UserProfile, Task, ConstellationStar,
    UserState, AdaptiveChallenge, FutureSelfMessage
)
from .serializers import (
    AvatarConfigSerializer, UserProfileSerializer, TaskSerializer,
    ConstellationStarSerializer, UserStateSerializer, AdaptiveChallengeSerializer,
    FutureSelfMessageSerializer, UserRegistrationSerializer
)


# ============= AUTH ENDPOINTS =============
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
            'message': 'User created successfully'
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
            profile = UserProfile.objects.get(user=user)
            
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


# ============= AVATAR CONFIG ENDPOINTS =============
class AvatarConfigViewSet(viewsets.ModelViewSet):
    serializer_class = AvatarConfigSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return AvatarConfig.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get', 'post'])
    def current(self, request):
        """Get or create current user's avatar config"""
        try:
            avatar = AvatarConfig.objects.get(user=request.user)
            if request.method == 'POST':
                serializer = self.get_serializer(avatar, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            else:
                serializer = self.get_serializer(avatar)
                return Response(serializer.data)
        except AvatarConfig.DoesNotExist:
            if request.method == 'POST':
                avatar = AvatarConfig.objects.create(user=request.user, **request.data)
                serializer = self.get_serializer(avatar)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response({'error': 'Avatar not found'}, status=status.HTTP_404_NOT_FOUND)


# ============= USER PROFILE ENDPOINTS =============
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
    
    @action(detail=False, methods=['post'])
    def complete_onboarding(self, request):
        """Mark onboarding as complete and create avatar"""
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        
        # Create or update avatar config
        avatar_data = request.data.get('avatar', {})
        avatar, avatar_created = AvatarConfig.objects.get_or_create(user=request.user)
        
        avatar.name = avatar_data.get('name', 'Your Future Self')
        avatar.appearance = avatar_data.get('appearance', 'gentle')
        avatar.expression = avatar_data.get('expression', 'warm')
        avatar.tone = avatar_data.get('tone', 'encouraging')
        avatar.save()
        
        profile.avatar_config = avatar
        profile.has_completed_onboarding = True
        profile.save()
        
        serializer = self.get_serializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)


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
        today = timezone.now().date()
        tasks = self.get_queryset().filter(date=today)
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def daily(self, request):
        """Get all daily tasks for today"""
        today = timezone.now().date()
        tasks = self.get_queryset().filter(date=today, task_type='daily')
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def challenges(self, request):
        """Get all challenge tasks for today"""
        today = timezone.now().date()
        tasks = self.get_queryset().filter(date=today, task_type='challenge')
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def toggle_completion(self, request, pk=None):
        """Toggle task completion status"""
        task = self.get_object()
        task.completed = not task.completed
        if task.completed:
            task.completed_at = timezone.now()
        else:
            task.completed_at = None
        task.save()
        
        serializer = self.get_serializer(task)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'])
    def initialize_today(self, request):
        """Initialize today's tasks if they don't exist"""
        today = timezone.now().date()
        has_today = Task.objects.filter(user=request.user, date=today).exists()
        
        if not has_today:
            daily_templates = [
                {'title': 'Morning medication', 'description': 'Take prescribed morning doses', 'type': 'daily', 'priority': 'high'},
                {'title': 'Physical therapy exercises', 'description': '15-minute routine', 'type': 'daily', 'priority': 'high'},
                {'title': 'Healthy breakfast', 'description': 'Nourish your body well', 'type': 'daily', 'priority': 'medium'},
                {'title': 'Evening medication', 'description': 'Take prescribed evening doses', 'type': 'daily', 'priority': 'high'},
                {'title': 'Hydration check', 'description': 'Drink 8 glasses of water', 'type': 'daily', 'priority': 'medium'},
                {'title': 'Rest period', 'description': 'Take time to relax', 'type': 'daily', 'priority': 'low'},
            ]
            
            challenge_templates = [
                {'title': 'Complete a mindfulness meditation', 'description': 'Take 20 minutes for deep reflection', 'type': 'challenge', 'priority': 'medium'},
                {'title': 'Write a gratitude journal entry', 'description': 'Reflect on three things you\'re grateful for', 'type': 'challenge', 'priority': 'low'},
                {'title': 'Connect with a support person', 'description': 'Call or message someone who supports your journey', 'type': 'challenge', 'priority': 'medium'},
                {'title': 'Learn something new about your health', 'description': 'Read an article or watch a video', 'type': 'challenge', 'priority': 'low'},
                {'title': 'Do an extra wellness activity', 'description': 'Gentle yoga, stretching, or a short walk', 'type': 'challenge', 'priority': 'low'},
            ]
            
            all_tasks = daily_templates + challenge_templates
            tasks = [Task(
                user=request.user,
                title=t['title'],
                description=t['description'],
                task_type=t['type'],
                priority=t['priority']
            ) for t in all_tasks]
            
            Task.objects.bulk_create(tasks)
        
        today_tasks = Task.objects.filter(user=request.user, date=today)
        serializer = self.get_serializer(today_tasks, many=True)
        return Response({
            'message': 'Today\'s tasks initialized',
            'tasks': serializer.data
        }, status=status.HTTP_200_OK)


# ============= CONSTELLATION STAR ENDPOINTS =============
class ConstellationStarViewSet(viewsets.ModelViewSet):
    serializer_class = ConstellationStarSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ConstellationStar.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get constellation statistics"""
        stars = self.get_queryset()
        stats = {
            'difficult-day': stars.filter(star_type='difficult-day').count(),
            'milestone': stars.filter(star_type='milestone').count(),
            'return': stars.filter(star_type='return').count(),
            'emotional-challenge': stars.filter(star_type='emotional-challenge').count(),
            'total': stars.count(),
        }
        return Response(stats)


# ============= USER STATE ENDPOINTS =============
class UserStateViewSet(viewsets.ModelViewSet):
    serializer_class = UserStateSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get', 'post'])
    def current(self, request):
        """Get or update current user state"""
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


# ============= ADAPTIVE CHALLENGE ENDPOINTS =============
class AdaptiveChallengeViewSet(viewsets.ModelViewSet):
    serializer_class = AdaptiveChallengeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return AdaptiveChallenge.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def today(self, request):
        """Get today's adaptive challenges"""
        today = timezone.now().date()
        challenges = self.get_queryset().filter(date=today)
        serializer = self.get_serializer(challenges, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def toggle_completion(self, request, pk=None):
        """Toggle challenge completion status"""
        challenge = self.get_object()
        challenge.completed = not challenge.completed
        if challenge.completed:
            challenge.completed_at = timezone.now()
        else:
            challenge.completed_at = None
        challenge.save()
        
        serializer = self.get_serializer(challenge)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ============= FUTURE SELF MESSAGE ENDPOINTS =============
class FutureSelfMessageViewSet(viewsets.ModelViewSet):
    serializer_class = FutureSelfMessageSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return FutureSelfMessage.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def unlocked(self, request):
        """Get all unlocked messages"""
        messages = self.get_queryset().filter(is_unlocked=True)
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def check_unlocks(self, request):
        """Check and unlock messages based on progress"""
        # Calcul du progrès global
        today = timezone.now().date()
        total_tasks = Task.objects.filter(user=request.user, date=today).count()
        completed_tasks = Task.objects.filter(user=request.user, date=today, completed=True).count()
        
        progress = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
        overall_progress = min(progress * 2, 100)
        
        messages = self.get_queryset()
        unlocked_messages = []
        
        for message in messages:
            if overall_progress >= message.unlock_progress and not message.is_unlocked:
                message.is_unlocked = True
                message.unlocked_at = timezone.now()
                message.save()
                unlocked_messages.append(message)
        
        serializer = self.get_serializer(self.get_queryset(), many=True)
        return Response({
            'overall_progress': overall_progress,
            'unlocked_count': len(unlocked_messages),
            'messages': serializer.data
        })