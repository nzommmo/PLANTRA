from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from .serializers import (
    UserRegistrationSerializer,
    MyTokenObtainPairSerializer,
    TeamUserCreateSerializer,
    GoogleLoginSerializer,TeamUserListSerializer
)
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User
from django.db.models import Count, Q, Sum
from django.utils import timezone

class RegisterUserView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


class GoogleLoginView(generics.GenericAPIView):
    """
    Handle Google OAuth login/registration
    """
    serializer_class = GoogleLoginSerializer
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        name = serializer.validated_data['name']
        google_id = serializer.validated_data['google_id']
        organization_name = serializer.validated_data.get('organization_name', '').strip()
        
        # Check if user exists
        user = None
        try:
            user = User.objects.get(email=email)
            
            # Update Google ID if not set
            if not user.google_id:
                user.google_id = google_id
                user.auth_provider = 'google'
                user.save()
                
        except User.DoesNotExist:
            # New user registration via Google
            if not organization_name:
                return Response(
                    {
                        'error': 'organization_name is required for new users',
                        'detail': 'Please provide your organization name to complete registration'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create new user (as Account Manager)
            user = User.objects.create_user(
                email=email,
                name=name,
                organization_name=organization_name,
                password=None,
                role='Account Manager'
            )
            user.google_id = google_id
            user.auth_provider = 'google'
            user.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        # Add custom claims
        refresh['name'] = user.name
        refresh['role'] = user.role
        refresh['organization_name'] = user.organization_name
        
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'email': user.email,
                'name': user.name,
                'role': user.role,
                'organization_name': user.organization_name,
            }
        }, status=status.HTTP_200_OK)


class CreateTeamUserView(generics.CreateAPIView):
    serializer_class = TeamUserCreateSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        if not self.request.user.is_account_manager():
            raise PermissionDenied("Only Account Managers can create team users")
        serializer.save()


class ListTeamUsersView(generics.ListAPIView):
    """
    List all users in the same organization.
    Any authenticated user can view their team members.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = TeamUserListSerializer  # Use the detailed serializer

    def get_queryset(self):
        user = self.request.user
        
        # Return all users in the same organization, excluding the current user
        return User.objects.filter(
            organization_name=user.organization_name
        ).exclude(id=user.id).order_by('role', 'name')
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        # Add summary information
        team_summary = {
            'total_members': queryset.count(),
            'account_managers': queryset.filter(role='Account Manager').count(),
            'team_leads': queryset.filter(role='Team Lead').count(),
            'team_members': queryset.filter(role='Team Member').count(),
        }
        
        return Response({
            'summary': team_summary,
            'members': serializer.data
        })

class DeleteAccountView(APIView):
    """
    Delete user account
    - Account Managers can delete their own account (will delete entire organization)
    - Team Leads and Team Members can delete their own account
    - Account Managers can delete team members' accounts
    """
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, user_id=None):
        user = request.user
        
        # If user_id is provided, Account Manager is trying to delete a team member
        if user_id:
            if not user.is_account_manager():
                return Response(
                    {'error': 'Only Account Managers can delete team members'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            try:
                user_to_delete = User.objects.get(
                    id=user_id,
                    organization_name=user.organization_name
                )
                
                # Prevent Account Manager from deleting another Account Manager
                if user_to_delete.is_account_manager():
                    return Response(
                        {'error': 'Cannot delete another Account Manager'},
                        status=status.HTTP_403_FORBIDDEN
                    )
                
                user_to_delete.delete()
                return Response(
                    {'message': f'User {user_to_delete.email} has been deleted successfully'},
                    status=status.HTTP_200_OK
                )
                
            except User.DoesNotExist:
                return Response(
                    {'error': 'User not found or not in your organization'},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        # User is deleting their own account
        else:
            if user.is_account_manager():
                # Warn: deleting Account Manager will delete all team members
                team_count = User.objects.filter(
                    organization_name=user.organization_name
                ).exclude(id=user.id).count()
                
                if team_count > 0:
                    # Optional: You can choose to prevent deletion or cascade delete
                    # For now, we'll delete all team members as well
                    User.objects.filter(
                        organization_name=user.organization_name
                    ).delete()
                    return Response(
                        {
                            'message': f'Your account and {team_count} team member(s) have been deleted successfully'
                        },
                        status=status.HTTP_200_OK
                    )
            
            # Delete the user's own account
            user.delete()
            return Response(
                {'message': 'Your account has been deleted successfully'},
                status=status.HTTP_200_OK
            )


class DeleteOwnAccountView(APIView):
    """
    Allow any authenticated user to delete their own account only
    """
    permission_classes = [IsAuthenticated]
    
    def delete(self, request):
        user = request.user
        
        if user.is_account_manager():
            # Count team members
            team_count = User.objects.filter(
                organization_name=user.organization_name
            ).exclude(id=user.id).count()
            
            if team_count > 0:
                return Response(
                    {
                        'error': f'Cannot delete account. You have {team_count} team member(s). Please delete or transfer them first.',
                        'team_count': team_count
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Delete user account
        email = user.email
        user.delete()
        
        return Response(
            {'message': f'Account {email} has been deleted successfully'},
            status=status.HTTP_200_OK
        )
    


class DashboardStatsView(APIView):
    """
    Get dashboard statistics for the authenticated user's organization
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Import here to avoid circular imports
        try:
            from events.models import Event, EventChecklist, BudgetItem, Expense
        except ImportError as e:
            # If models don't exist, return empty data
            return Response({
                'stats': {
                    'active_events': {
                        'value': 0,
                        'change': '+0 this month',
                        'trend': 'neutral'
                    },
                    'team_members': {
                        'value': 0,
                        'change': '+0 this week',
                        'trend': 'neutral'
                    },
                    'pending_tasks': {
                        'value': 0,
                        'change': '0 overdue',
                        'trend': 'neutral'
                    },
                    'total_budget': {
                        'value': '$0',
                        'change': '0% spent',
                        'trend': 'neutral'
                    }
                },
                'upcoming_events': [],
                'urgent_tasks': [],
                'recent_activity': []
            })
        
        user = request.user
        organization = user.organization_name
        
        # Get events for the organization
        events = Event.objects.filter(organization_name=organization)
        
        # Count active events (future or ongoing events)
        active_events_count = events.filter(
            Q(event_date__gte=timezone.now().date()) | Q(event_date__isnull=True)
        ).count()
        
        # Count team members
        team_members_count = User.objects.filter(
            organization_name=organization
        ).count()
        
        # Count pending tasks across all events
        try:
            pending_tasks_count = EventChecklist.objects.filter(
                event__organization_name=organization,
                status__in=['pending', 'in_progress']
            ).count()
            
            # Count overdue tasks
            overdue_tasks_count = EventChecklist.objects.filter(
                event__organization_name=organization,
                status__in=['pending', 'in_progress'],
                due_date__lt=timezone.now().date()
            ).count()
        except Exception:
            pending_tasks_count = 0
            overdue_tasks_count = 0
        
        # Calculate total budget and spent amount
        try:
            total_budget = events.aggregate(
                total=Sum('expected_budget')
            )['total'] or 0
            
            total_spent = Expense.objects.filter(
                event__organization_name=organization
            ).aggregate(total=Sum('amount'))['total'] or 0
        except Exception:
            total_budget = 0
            total_spent = 0
        
        budget_percentage = 0
        if total_budget > 0:
            budget_percentage = round((total_spent / total_budget) * 100, 1)
        
        # Get upcoming events (next 5)
        upcoming_events = events.filter(
            event_date__gte=timezone.now().date()
        ).order_by('event_date')[:5]
        
        upcoming_events_data = []
        for event in upcoming_events:
            try:
                total_tasks = event.checklist_items.count()
                completed_tasks = event.checklist_items.filter(status='completed').count()
            except Exception:
                total_tasks = 0
                completed_tasks = 0
            
            progress = 0
            if total_tasks > 0:
                progress = round((completed_tasks / total_tasks) * 100)
            
            status_label = 'Planning'
            if progress > 75:
                status_label = 'In Progress'
            elif progress < 30:
                status_label = 'Early Stage'
            
            upcoming_events_data.append({
                'id': event.id,
                'name': event.name,
                'date': event.event_date,
                'status': status_label,
                'progress': progress,
                'location': event.location or 'TBD'
            })
        
        # Get urgent tasks (overdue or due soon)
        urgent_tasks_data = []
        try:
            urgent_tasks = EventChecklist.objects.filter(
                event__organization_name=organization,
                status__in=['pending', 'in_progress'],
                due_date__lte=timezone.now().date() + timezone.timedelta(days=3)
            ).select_related('event').order_by('due_date')[:5]
            
            for task in urgent_tasks:
                days_until = (task.due_date - timezone.now().date()).days
                if days_until < 0:
                    deadline = f"{abs(days_until)} days overdue"
                elif days_until == 0:
                    deadline = "Today"
                elif days_until == 1:
                    deadline = "Tomorrow"
                else:
                    deadline = f"In {days_until} days"
                
                urgent_tasks_data.append({
                    'id': task.id,
                    'task': task.title,
                    'event': task.event.name,
                    'event_id': task.event.id,
                    'deadline': deadline,
                    'due_date': task.due_date
                })
        except Exception as e:
            print(f"Error fetching urgent tasks: {e}")
            pass
        
        # Get recent activity
        recent_activity = []
        
        # Recent expenses
        try:
            recent_expenses = Expense.objects.filter(
                event__organization_name=organization
            ).select_related('event').order_by('-created_at')[:3]
            
            for expense in recent_expenses:
                recent_activity.append({
                    'action': 'Expense added',
                    'detail': f"{expense.name} - ${expense.amount}",
                    'time': self._get_time_ago(expense.created_at),
                    'icon': 'DollarSign',
                    'created_at': expense.created_at
                })
        except Exception as e:
            print(f"Error fetching expenses: {e}")
            pass
        
        # Recent completed tasks
        try:
            recent_tasks = EventChecklist.objects.filter(
                event__organization_name=organization,
                status='completed'
            ).select_related('event').order_by('-created_at')[:3]
            
            for task in recent_tasks:
                recent_activity.append({
                    'action': 'Task completed',
                    'detail': task.title,
                    'time': self._get_time_ago(task.created_at),
                    'icon': 'CheckSquare',
                    'created_at': task.created_at
                })
        except Exception as e:
            print(f"Error fetching tasks: {e}")
            pass
        
        # Recent events
        try:
            recent_events = Event.objects.filter(
                organization_name=organization
            ).order_by('-created_at')[:2]
            
            for event in recent_events:
                recent_activity.append({
                    'action': 'Event created',
                    'detail': event.name,
                    'time': self._get_time_ago(event.created_at),
                    'icon': 'Calendar',
                    'created_at': event.created_at
                })
        except Exception as e:
            print(f"Error fetching events: {e}")
            pass
        
        # Sort by created_at and take top 10
        recent_activity.sort(key=lambda x: x.get('created_at', timezone.now()), reverse=True)
        recent_activity = recent_activity[:10]
        
        # Remove created_at from response
        for activity in recent_activity:
            activity.pop('created_at', None)
        
        # Calculate recent additions
        events_this_month = events.filter(
            created_at__gte=timezone.now() - timezone.timedelta(days=30)
        ).count()
        
        team_this_week = User.objects.filter(
            organization_name=organization,
            date_joined__gte=timezone.now() - timezone.timedelta(days=7)
        ).count()
        
        return Response({
            'stats': {
                'active_events': {
                    'value': active_events_count,
                    'change': f'+{events_this_month} this month',
                    'trend': 'up' if events_this_month > 0 else 'neutral'
                },
                'team_members': {
                    'value': team_members_count,
                    'change': f'+{team_this_week} this week',
                    'trend': 'up' if team_this_week > 0 else 'neutral'
                },
                'pending_tasks': {
                    'value': pending_tasks_count,
                    'change': f'{overdue_tasks_count} overdue',
                    'trend': 'down' if overdue_tasks_count > 0 else 'neutral'
                },
                'total_budget': {
                    'value': f'${total_budget:,.0f}',
                    'change': f'{budget_percentage}% spent',
                    'trend': 'neutral'
                }
            },
            'upcoming_events': upcoming_events_data,
            'urgent_tasks': urgent_tasks_data,
            'recent_activity': recent_activity
        })
    
    def _get_time_ago(self, dt):
        """Helper method to get human-readable time difference"""
        if not dt:
            return 'Recently'
        
        diff = timezone.now() - dt
        
        if diff.days > 0:
            if diff.days == 1:
                return '1 day ago'
            return f'{diff.days} days ago'
        
        hours = diff.seconds // 3600
        if hours > 0:
            if hours == 1:
                return '1 hour ago'
            return f'{hours} hours ago'
        
        minutes = diff.seconds // 60
        if minutes > 0:
            if minutes == 1:
                return '1 minute ago'
            return f'{minutes} minutes ago'
        
        return 'Just now'