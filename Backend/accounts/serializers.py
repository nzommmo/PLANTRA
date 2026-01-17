from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.conf import settings


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


class GoogleLoginSerializer(serializers.Serializer):
    # Accept either token OR user info directly
    token = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False)
    name = serializers.CharField(required=False, allow_blank=True)
    google_id = serializers.CharField(required=False, allow_blank=True)
    organization_name = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, attrs):
        # If token is provided, verify it with Google
        if attrs.get('token'):
            try:
                idinfo = id_token.verify_oauth2_token(
                    attrs['token'], 
                    google_requests.Request(), 
                    settings.GOOGLE_OAUTH_CLIENT_ID
                )
                
                if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                    raise serializers.ValidationError('Wrong issuer.')
                
                attrs['email'] = idinfo.get('email')
                attrs['name'] = idinfo.get('name', '')
                attrs['google_id'] = idinfo.get('sub')
                attrs['email_verified'] = idinfo.get('email_verified', False)
                
            except ValueError:
                raise serializers.ValidationError('Invalid Google token')
        
        # If email and google_id are provided directly (from access token flow)
        elif attrs.get('email') and attrs.get('google_id'):
            attrs['email_verified'] = True
        else:
            raise serializers.ValidationError('Either token or email and google_id must be provided')
        
        if not attrs.get('email_verified', False):
            raise serializers.ValidationError('Email not verified by Google')
        
        return attrs


class TeamUserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ('id', 'email', 'name', 'password', 'role')
        read_only_fields = ('id',)

    def validate_role(self, value):
        # When creating a new user, only allow Team Lead or Team Member
        if self.context.get('request') and self.context['request'].method == 'POST':
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
            password=validated_data.get('password'),
            role=validated_data['role']
        )
        return user


class TeamUserListSerializer(serializers.ModelSerializer):
    """
    Serializer for listing team members with more details
    """
    class Meta:
        model = User
        fields = ('id', 'email', 'name', 'role', 'is_active', 'date_joined', 'auth_provider')
        read_only_fields = fields