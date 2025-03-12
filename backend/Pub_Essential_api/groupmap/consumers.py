from channels.generic.websocket import AsyncJsonWebsocketConsumer
from asgiref.sync import sync_to_async
from django.contrib.auth import get_user_model

User = get_user_model()

class LiveMapConsumer(AsyncJsonWebsocketConsumer):
    # Dictionary to store the latest positions of all users
    user_positions = {}

    async def connect(self):
        user = self.scope["user"]
        if user is None or not user.is_authenticated:
            await self.close()
        else:
            self.group_id = self.scope['url_route']['kwargs']['group_id']
            self.group_name = f"group_map_{self.group_id}"  # Initialize group_name here
            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()

            # Send the latest positions to the newly connected user
            await self.send_latest_positions()

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            # Remove the user's position when they disconnect
            user = self.scope["user"]
            if user.id in self.user_positions:
                del self.user_positions[user.id]
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive_json(self, content):
        action = content.get("action")
        data = content.get("data")

        if action == "update_position":
            # Handle live position updates
            user = self.scope["user"]
            position = data.get("position")  # { lat: number, lng: number }
            await self.update_user_position(user, position)

    async def update_user_position(self, user, position):
        """
        Updates the user's position and broadcasts the latest positions to the group.
        """
        # Update the user's position in the dictionary
        self.user_positions[user.id] = {
            "user_id": user.id,
            "firstname": user.Firstname,
            "lastname": user.Lastname,
            "position": position,
        }

        # Broadcast the latest positions to the group
        await self.broadcast_positions()

    async def broadcast_positions(self):
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "positions_update",  # This should match the method name
                "positions": list(self.user_positions.values()),
            }
        )

    async def positions_update(self, event):
        """
        Handler for the `positions_update` event.
        """
        await self.send_json(event)

    async def send_latest_positions(self):
        """
        Sends the latest positions to the newly connected user.
        """
        await self.send_json({
            "event": "positions_updated",
            "positions": list(self.user_positions.values()),
        })