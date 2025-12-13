from django.db.models import Sum, Count, Q
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import generics, permissions
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from .permissions import IsAccountManager
from .models import Event,BudgetItem,Expense,EventChecklist
from .serializers import EventSerializer,BudgetItemSerializer,ExpenseSerializer,EventChecklistSerializer

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


class DeleteBudgetItemView(generics.DestroyAPIView):
    queryset = BudgetItem.objects.all()
    serializer_class = BudgetItemSerializer
    permission_classes = [permissions.IsAuthenticated]


class CreateExpenseView(generics.CreateAPIView):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        event_id = self.kwargs['event_id']
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
    permission_classes = [IsAuthenticated]

    def get(self, request, event_id):
        user = request.user

        try:
            event = Event.objects.get(id=event_id)
        except Event.DoesNotExist:
            return Response({"detail": "Event not found"}, status=404)

        # 🔐 Permission check
        if not (
            user.is_account_manager() and event.organization_name == user.organization_name
            or user.is_team_lead() and event.team_lead == user
            or user.is_team_member() and EventChecklist.objects.filter(
                event=event, assigned_to=user
            ).exists()
        ):
            raise PermissionDenied("You do not have access to this event")

        # 💰 Budget & Expenses
        total_budget_items = BudgetItem.objects.filter(event=event).aggregate(
            total=Sum('estimated_cost')
        )['total'] or 0

        total_expenses = Expense.objects.filter(event=event).aggregate(
            total=Sum('amount')
        )['total'] or 0

        remaining_budget = total_budget_items - total_expenses

        budget_utilization = (
            (total_expenses / total_budget_items) * 100
            if total_budget_items > 0 else 0
        )

        # ✅ Checklist progress
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
            "financials": {
                "expected_budget": event.expected_budget,
                "budget_items_total": total_budget_items,
                "expenses_total": total_expenses,
                "remaining_budget": remaining_budget,
                "budget_utilization_percent": round(budget_utilization, 2)
            },
            "checklist": {
                "total_items": checklist_total,
                "completed_items": checklist_completed,
                "progress_percent": round(checklist_progress, 2)
            },
            "attendance": {
                "expected_attendance": event.expected_attendance,
                "expected_revenue": event.expected_revenue
            }
        })
