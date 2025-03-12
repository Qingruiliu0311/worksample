from django.shortcuts import render
from ..models import pubcard
from friendship.models import Friendship
from User_management.models import CustomUser
import random
import string
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import PubCardSerializer

# Create your views here.
def generate_unique_pub_card():
    while True:
        pub_card = ''.join(random.choices(string.ascii_uppercase, k=2)) + ''.join(random.choices(string.digits, k=6))
        if not pubcard.objects.filter(pub_card=pub_card).exists():
            return pub_card
        
class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        try:
            pub_card = pubcard.objects.get(user=user)
            data = {
                "firstname": user.Firstname,
                "lastname": user.Lastname,
                "pubID": pub_card.pub_card,
            }
            return Response(data, status=status.HTTP_200_OK)
        except pubcard.DoesNotExist:
            return Response({"error": "Pub card not found for user."}, status=status.HTTP_404_NOT_FOUND)
        
        
class CardInviteListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Fetch all friendships where the request user is the from_user
        friendships = Friendship.objects.filter(to_user=user)

        card_data = []

        for friendship in friendships:
            # Get the to_user (responsor) details
            target_user = friendship.from_user

            # Fetch the pub_card for the to_user
            user_card = pubcard.objects.filter(user=target_user).first()
            if not user_card:
                continue

            # Append the card data
            card_data.append({
                "card_prime_id": friendship.from_user.id,
                "firstname": target_user.Firstname,
                "lastname": target_user.Lastname,
                "card_type": user_card.card_type,
                "card_id": user_card.pub_card,
                "invite_status": user_card.card_invite,
                "friendship_status": friendship.status,
            })

        return Response(card_data)
        
class CardListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Fetch all friendships where the request user is the from_user
        friendships = Friendship.objects.filter(from_user=user)

        card_data = []

        for friendship in friendships:
            # Get the to_user (responsor) details
            target_user = friendship.to_user

            # Fetch the pub_card for the to_user
            user_card = pubcard.objects.filter(user=target_user).first()
            if not user_card:
                continue

            # Append the card data
            card_data.append({
                "card_prime_id": friendship.to_user.id,
                "firstname": target_user.Firstname,
                "lastname": target_user.Lastname,
                "card_type": user_card.card_type,
                "card_id": user_card.pub_card,
                "invite_status": user_card.card_invite,
                "friendship_status": friendship.status,
            })

        return Response(card_data)
        
class PubCardUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        user = request.user
        
        try:
            pub_card = pubcard.objects.get(user=user)
            
            # Only update fields that are present in the request
            if 'card_type' in request.data:
                pub_card.card_type = request.data.get('card_type')
            
            if 'card_invite' in request.data:
                pub_card.card_invite = request.data.get('card_invite')
            
            pub_card.save()
            
            return Response(
                {"message": "Card updated successfully."},
                status=status.HTTP_200_OK
            )
        except pubcard.DoesNotExist:
            return Response(
                {"error": "Pub card not found for user."},
                status=status.HTTP_404_NOT_FOUND
            )
            
class UserDetailAndCardStyleView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        try:
            # Fetch the pub card associated with the user
            pub_card = pubcard.objects.get(user=user)

            # Prepare the response data
            data = {
                "firstname": user.Firstname,  # Using Django's default User model field names
                "lastname": user.Lastname,
                "pubID": pub_card.pub_card,
                "card_type": pub_card.card_type,
                "card_invite": pub_card.card_invite,
            }
            return Response(data, status=status.HTTP_200_OK)
        except pubcard.DoesNotExist:
            return Response(
                {"error": "Pub card not found for the user."},
                status=status.HTTP_404_NOT_FOUND
            )