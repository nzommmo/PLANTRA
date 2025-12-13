from rest_framework import serializers
from .models import Event,BudgetItem,Expense,EventChecklist
from accounts.models import User

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'
        read_only_fields = (
            'id',
            'organization_name',
            'created_by',
            'created_at',
        )

    def validate_team_lead(self, value):
        if value and value.role != 'Team Lead':
            raise serializers.ValidationError(
                "Assigned user must have Team Lead role"
            )
        return value

    def create(self, validated_data):
        user = self.context["request"].user

        validated_data["created_by"] = user
        validated_data["organization_name"] = user.organization_name

        return super().create(validated_data)



class BudgetItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = BudgetItem
        fields = "__all__"
        read_only_fields = ("id", "event")



class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = "__all__"
        read_only_fields = ("id", "event")


class EventChecklistSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventChecklist
        fields = '__all__'
        read_only_fields = ('id', 'event')

