from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'name', 'organization_name', 'password']

    def create(self, validated_data):
        # The user creating the account is automatically Account Manager
        user = User.objects.create_user(
            email=validated_data['email'],
            name=validated_data['name'],
            organization_name=validated_data['organization_name'],
            password=validated_data['password'],
            role='Account Manager'  # default role
        )
        return user


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['name'] = user.name
        token['role'] = user.role
        token['organization_name'] = user.organization_name
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        # Add extra responses here
        data['name'] = self.user.name
        data['role'] = self.user.role
        data['organization_name'] = self.user.organization_name
        return data


class TeamUserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('email', 'name', 'password', 'role')

    def validate_role(self, value):
        if value not in ['Team Lead', 'Team Member']:
            raise serializers.ValidationError(
                "You can only create Team Lead or Team Member"
            )
        return value

    def create(self, validated_data):
        request = self.context['request']

        user = User.objects.create_user(
            email=validated_data['email'],
            name=validated_data['name'],
            organization_name=request.user.organization_name,
            password=validated_data['password'],
            role=validated_data['role']
        )
        return user