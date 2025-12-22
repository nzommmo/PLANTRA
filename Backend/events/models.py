from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
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

    # Keep existing field name - this is your approved budget
    expected_budget = models.DecimalField(
        max_digits=12, 
        decimal_places=2,
        help_text="Total approved/expected budget for this event"
    )
    actual_budget = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        null=True, 
        blank=True
    )
    
    expected_attendance = models.PositiveIntegerField(default=0)
    expected_revenue = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        null=True, 
        blank=True
    )

    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='Pending'
    )

    # Relations
    organization_name = models.CharField(max_length=255)
    created_by = models.ForeignKey(
        User, 
        related_name="created_events", 
        on_delete=models.CASCADE
    )
    team_lead = models.ForeignKey(
        User, 
        related_name="lead_events", 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.organization_name}"

    @property
    def total_budget_allocated(self):
        """Sum of all budget item estimates"""
        return self.budget_items.aggregate(
            total=models.Sum('estimated_cost')
        )['total'] or 0

    @property
    def total_expenses(self):
        """Sum of all actual expenses"""
        return self.expenses.aggregate(
            total=models.Sum('amount')
        )['total'] or 0

    @property
    def budget_remaining(self):
        """Expected budget minus actual expenses"""
        return self.expected_budget - self.total_expenses

    @property
    def budget_utilization_percent(self):
        """Percentage of expected budget spent"""
        if self.expected_budget == 0:
            return 0
        return (self.total_expenses / self.expected_budget) * 100

    @property
    def is_over_budget(self):
        """Check if expenses exceed expected budget"""
        return self.total_expenses > self.expected_budget

    @property
    def is_near_budget_limit(self):
        """Check if expenses are near budget limit (90% threshold)"""
        return self.budget_utilization_percent >= 90

    def check_budget_threshold(self, threshold=90):
        """Check if expenses exceed a specific threshold percentage"""
        return self.budget_utilization_percent >= threshold

    @property
    def budget_status(self):
        """Get current budget status"""
        utilization = self.budget_utilization_percent
        if utilization >= 100:
            return "over_budget"
        elif utilization >= 90:
            return "critical"
        elif utilization >= 75:
            return "warning"
        else:
            return "healthy"


class BudgetItem(models.Model):
    """
    Budget items represent PLANNED expenditures.
    They are estimates/allocations from the approved budget.
    """
    STATUS_CHOICES = [
        ('not_paid', 'Not Paid'),
        ('deposit_paid', 'Deposit Paid'),
        ('paid', 'Paid'),
    ]

    event = models.ForeignKey(
        Event, 
        on_delete=models.CASCADE, 
        related_name="budget_items"
    )
    
    # Category with default to avoid migration prompt
    category = models.CharField(
        max_length=100,
        default='General',
        blank=True,
        help_text="e.g., Venue, Catering, Entertainment, Marketing"
    )
    
    name = models.CharField(max_length=255)
    
    # Description - nullable to avoid migration issues
    description = models.TextField(blank=True, null=True)
    
    estimated_cost = models.DecimalField(
        max_digits=12, 
        decimal_places=2,
        help_text="Estimated/planned cost for this item"
    )
    
    actual_cost = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        null=True, 
        blank=True
    )
    
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default="not_paid"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.event.name}"

    @property
    def total_expenses(self):
        """Sum of all expenses linked to this budget item"""
        return self.expenses.aggregate(
            total=models.Sum('amount')
        )['total'] or 0

    @property
    def variance(self):
        """Difference between estimated cost and actual expenses"""
        return self.estimated_cost - self.total_expenses

    @property
    def is_over_estimate(self):
        """Check if actual expenses exceed estimate"""
        return self.total_expenses > self.estimated_cost

    @property
    def utilization_percent(self):
        """Percentage of estimated cost spent"""
        if self.estimated_cost == 0:
            return 0
        return (self.total_expenses / self.estimated_cost) * 100

    class Meta:
        ordering = ['-created_at']


class Expense(models.Model):
    """
    Expenses represent ACTUAL expenditures.
    They should be linked to budget items when possible.
    """
    PAYMENT_METHOD_CHOICES = [
        ('cash', 'Cash'),
        ('card', 'Card'),
        ('bank_transfer', 'Bank Transfer'),
        ('check', 'Check'),
        ('mobile_money', 'Mobile Money'),
    ]

    event = models.ForeignKey(
        Event, 
        on_delete=models.CASCADE, 
        related_name="expenses"
    )
    
    budget_item = models.ForeignKey(
        BudgetItem,
        on_delete=models.SET_NULL,
        related_name="expenses",
        null=True,
        blank=True,
        help_text="Link to budget item if applicable"
    )
    
    name = models.CharField(
        max_length=255,
        help_text="Expense description"
    )
    
    amount = models.DecimalField(
        max_digits=12, 
        decimal_places=2,
        help_text="Actual amount spent"
    )
    
    # New fields - all nullable/with defaults to avoid migration prompts
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        default='cash',
        blank=True
    )
    
    receipt_number = models.CharField(
        max_length=100, 
        blank=True, 
        null=True
    )
    
    # Use null=True, blank=True to avoid migration prompt
    date = models.DateField(
        null=True,
        blank=True,
        help_text="Date of expense"
    )
    
    description = models.TextField(blank=True, null=True)
    
    approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_expenses'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.amount}"
    
    def save(self, *args, **kwargs):
        # Auto-set date to today if not provided
        if not self.date:
            self.date = timezone.now().date()
        super().save(*args, **kwargs)

    def clean(self):
        """Validate expense against event budget"""
        if self.event_id:
            event = self.event
            # Calculate what total expenses would be with this expense
            current_expenses = event.total_expenses
            
            # If updating existing expense, subtract old amount
            if self.pk:
                old_expense = Expense.objects.get(pk=self.pk)
                current_expenses -= old_expense.amount
            
            new_total = current_expenses + self.amount
            
            if new_total > event.expected_budget:
                raise ValidationError(
                    f"This expense would exceed the event budget. "
                    f"Budget: {event.expected_budget}, "
                    f"Current expenses: {current_expenses}, "
                    f"New expense: {self.amount}, "
                    f"Would total: {new_total}"
                )

    class Meta:
        ordering = ['-created_at']


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

    class Meta:
        ordering = ['due_date', '-created_at']