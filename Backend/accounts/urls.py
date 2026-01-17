from django.urls import path
from .views import (
    RegisterUserView, 
    MyTokenObtainPairView,
    CreateTeamUserView,
    ListTeamUsersView,
    GoogleLoginView,
    DeleteAccountView,
    DeleteOwnAccountView
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', RegisterUserView.as_view(), name='register'),
    path('login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/google/', GoogleLoginView.as_view(), name='google_login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('team/create/', CreateTeamUserView.as_view(), name='create_team_user'),
    path('team/', ListTeamUsersView.as_view(), name='list_team_users'),
    
    # Delete account endpoints
    path('account/delete/', DeleteOwnAccountView.as_view(), name='delete_own_account'),
    path('team/delete/<int:user_id>/', DeleteAccountView.as_view(), name='delete_team_member'),
]