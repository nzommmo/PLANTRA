from django.urls import path
from .views import RegisterUserView, MyTokenObtainPairView,CreateTeamUserView,ListTeamUsersView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', RegisterUserView.as_view(), name='register'),
    path('login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('team/create/', CreateTeamUserView.as_view(), name='create_team_user'),
    path('team/', ListTeamUsersView.as_view(), name='list_team_users'),
]
