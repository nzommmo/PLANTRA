from django.db import models
from accounts.models import User
from django.conf import settings

class Event(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    ]

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=255)
    event_date = models.DateField()

    expected_budget = models.DecimalField(max_digits=12, decimal_places=2)
    actual_budget = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    expected_attendance = models.PositiveIntegerField(default=0)
    expected_revenue = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')

    # relations
    organization_name = models.CharField(max_length=255)
    created_by = models.ForeignKey(User, related_name="created_events", on_delete=models.CASCADE)
    team_lead = models.ForeignKey(User, related_name="lead_events", on_delete=models.SET_NULL, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.organization_name}"


class BudgetItem(models.Model):
    STATUS_CHOICES = [
        ('not_paid', 'Not Paid'),
        ('deposit_paid', 'Deposit Paid'),
        ('paid', 'Paid'),
    ]

    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="budget_items")
    name = models.CharField(max_length=255)
    estimated_cost = models.DecimalField(max_digits=12, decimal_places=2)
    actual_cost = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="not_paid")

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.event.name}"


class Expense(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="expenses")
    budget_item = models.ForeignKey(
        BudgetItem,
        on_delete=models.SET_NULL,
        related_name="expenses",
        null=True,
        blank=True
    )
    
    # For misc expenses (not tied to a budget item)
    name = models.CharField(max_length=255)
    
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.amount}"
    

class EventChecklist(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]

    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name='checklist_items'
    )

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)

    assigned_to = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_checklists'
    )

    due_date = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.event.name}"

