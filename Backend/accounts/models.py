from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, email, name, organization_name, password=None, role='Account Manager'):
        if not email:
            raise ValueError("Users must have an email address")

        email = self.normalize_email(email)

        user = self.model(
            email=email,
            name=name,
            organization_name=organization_name,
            role=role
        )

        user.set_password(password)
        user.is_active = True
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, organization_name, password):
        user = self.create_user(
            email=email,
            name=name,
            organization_name=organization_name,
            password=password,
            role='Account Manager'
        )
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ('Account Manager', 'Account Manager'),
        ('Team Lead', 'Team Lead'),
        ('Team Member', 'Team Member'),
    ]

    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)
    organization_name = models.CharField(max_length=255)
    role = models.CharField(
        max_length=50,
        choices=ROLE_CHOICES,
        default='Account Manager'
    )

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name', 'organization_name']

    def __str__(self):
        return f"{self.name} ({self.organization_name})"

    # ✅ ROLE HELPERS (THIS IS WHERE THEY BELONG)
    def is_account_manager(self):
        return self.role == 'Account Manager'

    def is_team_lead(self):
        return self.role == 'Team Lead'

    def is_team_member(self):
        return self.role == 'Team Member'
