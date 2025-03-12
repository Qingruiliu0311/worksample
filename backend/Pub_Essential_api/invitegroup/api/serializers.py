from rest_framework import serializers
from ..models import Group

class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'members', 'created_at']
        read_only_fields = ['owner', 'created_at']

    def create(self, validated_data):
        members = validated_data.pop("members", [])
        group = Group.objects.create(**validated_data)
        group.members.add(*members)  # Add members to the group
        return group