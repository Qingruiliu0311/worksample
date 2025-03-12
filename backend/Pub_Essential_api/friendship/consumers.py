import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async
from django.shortcuts import get_object_or_404
from .models import Friendship
from User_management.models import CustomUser
from asgiref.sync import async_to_sync


class FriendshipConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        if self.scope["user"] == AnonymousUser():
            await self.close()
        else:
            self.user = self.scope["user"]
            self.room_group_name = f"user_{self.user.id}"
            
            print(f"User {self.user.email} connected to {self.room_group_name}")

            # Join room
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        
    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get("action")
        pub_card_id = data.get("pub_card")

        if action == "send_request":
            await self.send_friend_request(pub_card_id)
        elif action == "accept_request":
            await self.accept_friend_request(pub_card_id)
        elif action == "decline_request":
            await self.decline_friend_request(pub_card_id)
        elif action == "remove_friend":
            await self.remove_friend(data.get("user_id"))
            
    @database_sync_to_async
    def send_friend_request(self, pub_card_id):
        to_user = get_object_or_404(CustomUser, cards__pub_card=pub_card_id)

        if self.user == to_user:
            return

        friendship, created = Friendship.objects.get_or_create(
            from_user=self.user,
            to_user=to_user,
            defaults={"status": "pending"},
        )

        if not created and friendship.status == "declined":
            friendship.status = "pending"
            friendship.save()

        async_to_sync(self.channel_layer.group_send)(
            f"user_{to_user.id}",
            {
                "type": "friend_request_notification",
                "message": f"You have a new friend request from {self.user.email}",
            },
        )

    @database_sync_to_async
    def accept_friend_request(self, pub_card_id):
        from_user = get_object_or_404(CustomUser, cards__pub_card=pub_card_id)
        friendship = Friendship.objects.filter(from_user=from_user, to_user=self.user, status="pending").first()

        if friendship:
            friendship.status = "accepted"
            friendship.save()

            async_to_sync(self.channel_layer.group_send)(
                f"user_{from_user.id}",
                {
                    "type": "friend_request_notification",
                    "message": f"{self.user.email} accepted your friend request!",
                },
            )

    @database_sync_to_async
    def decline_friend_request(self, pub_card_id):
        from_user = get_object_or_404(CustomUser, cards__pub_card=pub_card_id)
        friendship = Friendship.objects.filter(from_user=from_user, to_user=self.user, status="pending").first()

        if friendship:
            friendship.status = "declined"
            friendship.save()

            async_to_sync(self.channel_layer.group_send)(
                f"user_{from_user.id}",
                {
                    "type": "friend_request_notification",
                    "message": f"{self.user.email} declined your friend request.",
                },
            )

    @database_sync_to_async
    def remove_friend(self, user_id):
        friend = get_object_or_404(CustomUser, id=user_id)
        friendships = Friendship.objects.filter(
            from_user=self.user, to_user=friend, status="accepted"
        ) | Friendship.objects.filter(
            from_user=friend, to_user=self.user, status="accepted"
        )

        deleted_count = friendships.delete()[0]

        if deleted_count > 0:
            async_to_sync(self.channel_layer.group_send)(
                f"user_{friend.id}",
                {
                    "type": "friend_request_notification",
                    "message": f"{self.user.email} removed you as a friend.",
                },
            )

    async def friend_request_notification(self, event):
        await self.send(text_data=json.dumps({"message": event["message"]}))
