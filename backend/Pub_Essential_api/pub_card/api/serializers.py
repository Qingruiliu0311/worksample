from rest_framework import serializers
from django.contrib.auth.models import User
from ..models import pubcard


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name']

class PubCardSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = pubcard
        fields = '__all__'  # Adjust fields based on your user model
        extra_kwargs =  {
            "card_type": {"required": False, "allow_blank": True},
            "card_mood": {"required": False, "allow_blank": True},
        }