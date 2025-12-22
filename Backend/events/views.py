from django.db.models import Sum, Count, Q
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import generics, permissions, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied, ValidationError
from .permissions import IsAccountManager
from .models import Event, BudgetItem, Expense, EventChecklist
from .serializers import (
    EventSerializer, BudgetItemSerializer, 
    ExpenseSerializer, EventChecklistSerializer
)


class CreateEventView(generics.CreateAPIView):
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated, IsAccountManager]

    def perform_create(self, serializer):
        serializer.save(
            created_by=self.request.user,
            organization_name=self.request.user.organization_name
        )


class UpdateEventView(generics.UpdateAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        event = self.get_object()
        user = self.request.user

        if user.is_account_manager():
            serializer.save()
            return

        if user.is_team_lead() and event.team_lead == user:
            serializer.save()
            return

        raise PermissionDenied("You cannot update this event")


class ListEventsView(generics.ListAPIView):
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.is_account_manager():
            return Event.objects.filter(
                organization_name=user.organization_name
            )

        if user.is_team_lead():
            return Event.objects.filter(team_lead=user)

        if user.is_team_member():
            return Event.objects.filter(
                checklist_items__assigned_to=user
            ).distinct()

        return Event.objects.none()


class CreateBudgetItemView(generics.CreateAPIView):
    serializer_class = BudgetItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        event_id = self.kwargs['event_id']
        event = Event.objects.get(id=event_id)
        
        # Check if adding this budget item would exceed approved budget
        estimated_cost = serializer.validated_data.get('estimated_cost', 0)
        total_allocated = event.total_budget_allocated + estimated_cost
        
        if total_allocated > event.expected_budget:
            raise ValidationError({
                'estimated_cost': f'Total budget allocation ({total_allocated}) '
                                  f'would exceed approved budget ({event.expected_budget})'
            })
        
        serializer.save(event_id=event_id)


class ListBudgetItemsView(generics.ListAPIView):
    serializer_class = BudgetItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        event_id = self.kwargs['event_id']
        return BudgetItem.objects.filter(event_id=event_id)


class UpdateBudgetItemView(generics.UpdateAPIView):
    queryset = BudgetItem.objects.all()
    serializer_class = BudgetItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_update(self, serializer):
        budget_item = self.get_object()
        event = budget_item.event
        
        # Check if updating this budget item would exceed approved budget
        new_estimate = serializer.validated_data.get(
            'estimated_cost', 
            budget_item.estimated_cost
        )
        old_estimate = budget_item.estimated_cost
        
        total_allocated = event.total_budget_allocated - old_estimate + new_estimate
        
        if total_allocated > event.expected_budget:
            raise ValidationError({
                'estimated_cost': f'Total budget allocation ({total_allocated}) '
                                  f'would exceed approved budget ({event.expected_budget})'
            })
        
        serializer.save()


class DeleteBudgetItemView(generics.DestroyAPIView):
    queryset = BudgetItem.objects.all()
    serializer_class = BudgetItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_destroy(self, instance):
        # Check if there are expenses linked to this budget item
        if instance.expenses.exists():
            raise ValidationError({
                'detail': 'Cannot delete budget item with linked expenses. '
                          'Remove or reassign expenses first.'
            })
        instance.delete()


class CreateExpenseView(generics.CreateAPIView):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        event_id = self.kwargs['event_id']
        event = Event.objects.get(id=event_id)
        
        # Check budget before creating expense
        expense_amount = serializer.validated_data.get('amount', 0)
        new_total = event.total_expenses + expense_amount
        
        if new_total > event.expected_budget:
            raise ValidationError({
                'amount': f'This expense would exceed the approved budget. '
                          f'Budget: {event.expected_budget}, '
                          f'Current expenses: {event.total_expenses}, '
                          f'Remaining: {event.budget_remaining}'
            })
        
        serializer.save(event_id=event_id)


class ListExpensesView(generics.ListAPIView):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        event_id = self.kwargs['event_id']
        return Expense.objects.filter(event_id=event_id)


class UpdateExpenseView(generics.UpdateAPIView):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_update(self, serializer):
        expense = self.get_object()
        event = expense.event
        
        # Check budget before updating expense
        new_amount = serializer.validated_data.get('amount', expense.amount)
        old_amount = expense.amount
        
        new_total = event.total_expenses - old_amount + new_amount
        
        if new_total > event.expected_budget:
            raise ValidationError({
                'amount': f'This expense update would exceed the approved budget. '
                          f'Budget: {event.expected_budget}, '
                          f'Current expenses: {event.total_expenses}, '
                          f'New expense: {new_amount}'
            })
        
        serializer.save()


class DeleteExpenseView(generics.DestroyAPIView):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]


class CreateChecklistItemView(generics.CreateAPIView):
    serializer_class = EventChecklistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        event_id = self.kwargs['event_id']
        serializer.save(event_id=event_id)


class ListChecklistItemsView(generics.ListAPIView):
    serializer_class = EventChecklistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        event_id = self.kwargs['event_id']
        return EventChecklist.objects.filter(event_id=event_id)


class UpdateChecklistItemView(generics.UpdateAPIView):
    queryset = EventChecklist.objects.all()
    serializer_class = EventChecklistSerializer
    permission_classes = [permissions.IsAuthenticated]


class DeleteChecklistItemView(generics.DestroyAPIView):
    queryset = EventChecklist.objects.all()
    serializer_class = EventChecklistSerializer
    permission_classes = [permissions.IsAuthenticated]


class EventSummaryView(APIView):
    """
    Comprehensive event financial and progress summary
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, event_id):
        user = request.user

        try:
            event = Event.objects.get(id=event_id)
        except Event.DoesNotExist:
            return Response(
                {"detail": "Event not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )

        # Permission check
        if not (
            user.is_account_manager() and event.organization_name == user.organization_name
            or user.is_team_lead() and event.team_lead == user
            or user.is_team_member() and EventChecklist.objects.filter(
                event=event, assigned_to=user
            ).exists()
        ):
            raise PermissionDenied("You do not have access to this event")

        # Budget breakdown by category
        budget_by_category = BudgetItem.objects.filter(event=event).values(
            'category'
        ).annotate(
            estimated=Sum('estimated_cost'),
            actual=Sum('expenses__amount')
        ).order_by('-estimated')

        # Recent expenses
        recent_expenses = Expense.objects.filter(event=event).order_by(
            '-date'
        )[:5].values('name', 'amount', 'date', 'budget_item__name')

        # Checklist progress
        checklist_total = EventChecklist.objects.filter(event=event).count()
        checklist_completed = EventChecklist.objects.filter(
            event=event, status='completed'
        ).count()
        checklist_progress = (
            (checklist_completed / checklist_total) * 100
            if checklist_total > 0 else 0
        )

        return Response({
            "event": {
                "id": event.id,
                "name": event.name,
                "status": event.status,
                "event_date": event.event_date,
                "location": event.location,
            },
            "budget": {
                "approved_budget": float(event.expected_budget),
                "total_allocated": float(event.total_budget_allocated),
                "total_expenses": float(event.total_expenses),
                "remaining": float(event.budget_remaining),
                "utilization_percent": round(event.budget_utilization_percent, 2),
                "status": event.budget_status,
                "is_over_budget": event.is_over_budget,
                "is_near_limit": event.is_near_budget_limit,
            },
            "budget_by_category": list(budget_by_category),
            "recent_expenses": list(recent_expenses),
            "checklist": {
                "total_items": checklist_total,
                "completed_items": checklist_completed,
                "progress_percent": round(checklist_progress, 2)
            },
            "attendance": {
                "expected_attendance": event.expected_attendance,
                "expected_revenue": float(event.expected_revenue) if event.expected_revenue else None
            }
        })


class BudgetAlertView(APIView):
    """
    Check budget status and provide alerts
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, event_id):
        try:
            event = Event.objects.get(id=event_id)
        except Event.DoesNotExist:
            return Response(
                {"detail": "Event not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )

        alerts = []
        
        # Overall budget alerts
        if event.is_over_budget:
            alerts.append({
                "level": "critical",
                "type": "over_budget",
                "message": f"Event is over budget by {abs(event.budget_remaining)}"
            })
        elif event.check_budget_threshold(90):
            alerts.append({
                "level": "warning",
                "type": "near_budget_limit",
                "message": f"Event has used {event.budget_utilization_percent:.1f}% of budget"
            })

        # Budget item alerts
        for item in event.budget_items.all():
            if item.is_over_estimate:
                alerts.append({
                    "level": "warning",
                    "type": "budget_item_exceeded",
                    "message": f"'{item.name}' has exceeded estimate by {abs(item.variance)}",
                    "budget_item": item.name
                })

        return Response({
            "event_id": event_id,
            "budget_status": event.budget_status,
            "alerts": alerts,
            "summary": {
                "approved_budget": float(event.expected_budget),
                "total_expenses": float(event.total_expenses),
                "remaining": float(event.budget_remaining),
                "utilization_percent": round(event.budget_utilization_percent, 2)
            }
        })