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