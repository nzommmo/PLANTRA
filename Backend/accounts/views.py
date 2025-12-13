from rest_framework import generics
from rest_framework.permissions import AllowAny
from .serializers import UserRegistrationSerializer,MyTokenObtainPairSerializer,TeamUserCreateSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAuthenticated
from .models import User


class RegisterUserView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]  # anyone can register


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


class CreateTeamUserView(generics.CreateAPIView):
    serializer_class = TeamUserCreateSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        if not self.request.user.is_account_manager():
            raise PermissionDenied("Only Account Managers can create team users")

        serializer.save()


class ListTeamUsersView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TeamUserCreateSerializer

    def get_queryset(self):
        user = self.request.user

        if not user.is_account_manager():
            return User.objects.none()

        return User.objects.filter(
            organization_name=user.organization_name
        ).exclude(id=user.id)
