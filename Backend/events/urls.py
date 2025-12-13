from django.urls import path
from .views import ( CreateEventView, ListEventsView,
ListBudgetItemsView,CreateBudgetItemView,UpdateBudgetItemView,
DeleteBudgetItemView,ListExpensesView,CreateExpenseView,
UpdateExpenseView,DeleteExpenseView,ListChecklistItemsView,
CreateChecklistItemView,UpdateChecklistItemView,DeleteChecklistItemView,
EventSummaryView
)

urlpatterns = [
    path('create/', CreateEventView.as_view(), name='create_event'),
    path('', ListEventsView.as_view(), name='list_events'),

     # Budget endpoints
    path('<int:event_id>/budget-items/', ListBudgetItemsView.as_view(), name='list_budget_items'),
    path('<int:event_id>/budget-items/create/', CreateBudgetItemView.as_view(), name='create_budget_item'),
    path('budget-items/<int:pk>/update/', UpdateBudgetItemView.as_view(), name='update_budget_item'),
    path('budget-items/<int:pk>/delete/', DeleteBudgetItemView.as_view(), name='delete_budget_item'),
    # Event endpoints
    path('<int:event_id>/expenses/', ListExpensesView.as_view(), name='list_expenses'),
    path('<int:event_id>/expenses/create/', CreateExpenseView.as_view(), name='create_expense'),
    path('expenses/<int:pk>/update/', UpdateExpenseView.as_view(), name='update_expense'),
    path('expenses/<int:pk>/delete/', DeleteExpenseView.as_view(), name='delete_expense'),
    # Checklist Endpoints
    path('<int:event_id>/checklist/', ListChecklistItemsView.as_view(), name='list_checklist'),
    path('<int:event_id>/checklist/create/', CreateChecklistItemView.as_view(), name='create_checklist_item'),
    path('checklist/<int:pk>/update/', UpdateChecklistItemView.as_view(), name='update_checklist_item'),
    path('checklist/<int:pk>/delete/', DeleteChecklistItemView.as_view(), name='delete_checklist_item'),
    # Event Summary
    path('<int:event_id>/summary/', EventSummaryView.as_view(), name='event_summary'),
]
