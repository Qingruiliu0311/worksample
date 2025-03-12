from django.shortcuts import render

# Create your views here.
from .permissions import IsOwnerOrFriend
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import IntegrityError
from django.shortcuts import get_object_or_404
from ..models import Friendship
from User_management.models import CustomUser
from pub_card.models import pubcard

class SendFriendRequestView(APIView):
    permission_classes = [IsOwnerOrFriend]

    def post(self, request):
        pub_card_id = request.data.get("pub_card")
        if not pub_card_id:
            return Response({"error": "pub_card is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        
        to_user = get_object_or_404(CustomUser, cards__pub_card=pub_card_id)
        if request.user == to_user:
            return Response({"error": "You cannot send a friend request to yourself."}, status=status.HTTP_400_BAD_REQUEST)

        friendship = Friendship.objects.filter(
            from_user=request.user, 
            to_user=to_user
        ).first()

        if friendship:
            if friendship.status == "accepted":
                return Response(
                    {"message": "You are already friends."},
                    status=status.HTTP_200_OK,
                )

            # If the friend request was previously declined or canceled, update it to "pending"
            if friendship.status in ["declined", "canceled"]:
                friendship.status = "pending"
                friendship.save()
                return Response(
                    {"message": "Friend request re-sent."},
                    status=status.HTTP_200_OK,
                )

            # If it's already pending, no need to resend
            return Response(
                {"message": "Friend request is already pending."},
                status=status.HTTP_200_OK,
            )
        
        # If no existing friendship, create a new friend request
        try:
            Friendship.objects.create(
                from_user=request.user,
                to_user=to_user,
                status="pending",
            )
            return Response(
                {"message": "Friend request sent."},
                status=status.HTTP_201_CREATED,
            )
        except IntegrityError:
            return Response(
                {"error": "Your friend already sent you invitation, please accept from your notification center!"},
                status=status.HTTP_400_BAD_REQUEST,
            )
    
class AcceptFriendRequestView(APIView):
    permission_classes = [IsOwnerOrFriend]

    def post(self, request):
        pub_card_id = request.data.get("card_id")
        from_user = get_object_or_404(CustomUser, cards__pub_card=pub_card_id)
        friendship = Friendship.objects.filter(from_user=from_user, to_user=request.user, status="pending").first()

        if not friendship:
            return Response({"error": "Friend request not found."}, status=status.HTTP_404_NOT_FOUND)

        friendship.status = "accepted"
        friendship.save()
        return Response({"message": "Friend request accepted."}, status=status.HTTP_200_OK)
    
class DeclineFriendRequestView(APIView):
    permission_classes = [IsOwnerOrFriend]

    def post(self, request):
        pub_card_id = request.data.get("card_id")  # Retrieve pub_card from the request body
        if not pub_card_id:
            return Response({"error": "card_id is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        from_user = get_object_or_404(CustomUser, cards__pub_card=pub_card_id)
        friendship = Friendship.objects.filter(from_user=from_user, to_user=request.user, status="pending").first()

        if not friendship:
            return Response({"error": "Friend request not found."}, status=status.HTTP_404_NOT_FOUND)

        friendship.status = "declined"
        friendship.save()
        return Response({"message": "Friend request declined."}, status=status.HTTP_200_OK)

class RemoveFriendView(APIView):
    permission_classes = [IsOwnerOrFriend]

    def delete(self, request, user_id):
        friend = get_object_or_404(CustomUser, id=user_id)

        # Check for friendships initiated by request.user
        friendships_1 = Friendship.objects.filter(
            from_user=request.user, to_user=friend, status="accepted"
        )
        

        # Check for friendships initiated by the friend
        friendships_2 = Friendship.objects.filter(
            from_user=friend, to_user=request.user, status="accepted"
        )
        print(friendships_1)
        print(friendships_2)

        # Combine the two querysets
        friendships = friendships_1 | friendships_2
        print(friendships)

        # Delete the combined friendships
        deleted_count = friendships.delete()[0]

        if deleted_count > 0:
            return Response({"message": "Friend removed."}, status=status.HTTP_200_OK)
        return Response({"error": "Friendship not found."}, status=status.HTTP_404_NOT_FOUND)
    
class ListFriendsView(APIView):
    permission_classes = [IsOwnerOrFriend]

    def get(self, request):
        friends = Friendship.objects.filter(
            Q(from_user=request.user, status="accepted") | Q(to_user=request.user, status="accepted")
        )
        friend_data = [
            {
                "id": f.to_user.id if f.from_user == request.user else f.from_user.id,
                "email": f.to_user.email if f.from_user == request.user else f.from_user.email,
            }
            for f in friends
        ]
        return Response(friend_data, status=status.HTTP_200_OK)