from channels.generic.websocket import AsyncJsonWebsocketConsumer
from asgiref.sync import sync_to_async
from .models import Group, GroupMembership
from django.contrib.auth import get_user_model

User = get_user_model()

class GroupConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        user = self.scope["user"]
        if user is None or not user.is_authenticated:
            await self.close()
        else:
            self.group_id = self.scope['url_route']['kwargs']['group_id']
            self.group_name = f"group_{self.group_id}"  # Initialize group_name here
            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()
            
            group_info = await self.get_group_info(self.group_id)
            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "group_update",
                    "event": "connected",
                    "data": group_info,
                }
            )

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)


    async def receive_json(self, content):
        action = content.get("action")
        data = content.get("data")

        if action == "add_member":
            user_ids = data.get("user_ids")  # IDs of users being invited
            invited_by = self.scope["user"]  # Current user (inviter)
            group_id = self.group_id
            print(user_ids)

            # Add members and collect results
            new_members, existing_members = await self.add_members_to_group(group_id, user_ids, invited_by)

            # Broadcast updated group info
            group_info = await self.get_group_info(group_id)
            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "group_update",
                    "event": "member_added",
                    "data": group_info,
                }
            )

            # Send response back to the inviter
            await self.send_json({
                "event": "add_member_result",
                "new_members": new_members,
                "existing_members": existing_members,
            })
            
        elif action == "accept_invitation":
            user = self.scope["user"]
            group_id = data.get("group_id")  # Retrieve group_id from client data

            if not group_id:
                await self.send_json({
                    "event": "invitation_accepted",
                    "success": False,
                    "error": "Missing group_id.",
                })
                return

            # Update invitation status
            updated = await self.accept_invitation(group_id, user)

            if updated:
                group_info = await self.get_group_info(group_id)
                await self.channel_layer.group_send(
                    f"group_{group_id}",
                    {
                        "type": "group_update",
                        "event": "invitation_accepted",
                        "data": group_info,
                    }
                )
                await self.send_json({
                    "event": "invitation_accepted",
                    "success": True,
                })
            else:
                await self.send_json({
                    "event": "invitation_accepted",
                    "success": False,
                    "error": "Failed to accept invitation.",
                })
                
        elif action == "decline_invitation":
            user = self.scope["user"]
            group_id = data.get("group_id")  # Retrieve group_id from client data

            if not group_id:
                await self.send_json({
                    "event": "invitation_declined",
                    "success": False,
                    "error": "Missing group_id.",
                })
                return

            # Delete the invitation
            deleted = await self.decline_invitation(group_id, user)

            if deleted:
                # Broadcast updated group info
                group_info = await self.get_group_info(group_id)
                await self.channel_layer.group_send(
                    f"group_{group_id}",
                    {
                        "type": "group_update",
                        "event": "invitation_declined",
                        "data": group_info,
                    }
                )
                await self.send_json({
                    "event": "invitation_declined",
                    "success": True,
                })
            else:
                await self.send_json({
                    "event": "invitation_declined",
                    "success": False,
                    "error": "Failed to decline invitation.",
                })
                
        elif action == "send_message":
            user = self.scope["user"]
            text = data.get("text", "").strip()
            if text:
                chat_message = {
                    "type": "chat_message",
                    "sender": {
                        "id": user.id,
                        "firstname": user.Firstname,
                        "lastname": user.Lastname,
                    },
                    "text": text,
                    "timestamp": str(await self.get_current_time()),  # Add timestamp
                }
                # Broadcast the message to all members of the group
                await self.channel_layer.group_send(self.group_name, chat_message)

        elif action == "delete_member":
            pass
        elif action == "delete_group":
            pass

    async def group_update(self, event):
        """
        Handler for the `group_update` event.
        """
        await self.send_json(event)

    async def group_created(self, event):
        """
        Handler for the `group_created` event.
        """
        await self.send_json({
            "event": "group_created",
            "group_id": event["group_id"],
            "owner": event["owner"],
        })

    @sync_to_async
    def accept_invitation(self, group_id, user):
        """
        Updates the invitation status to 'accepted' for a specific user and group.
        """
        try:
            membership = GroupMembership.objects.get(group_id=group_id, user=user)
            if membership.invitation_status == "pending":
                membership.invitation_status = "accepted"
                membership.save()
                return True
            return False
        except GroupMembership.DoesNotExist:
            return False

    @sync_to_async
    def add_members_to_group(self, group_id, user_ids, invited_by):
        """
        Adds multiple members to the group. Returns a tuple of new members and existing members.
        """
        group = Group.objects.get(id=group_id)
        new_members = []
        existing_members = []

        for user_id in user_ids:
            user = User.objects.get(id=user_id)
            membership, created = GroupMembership.objects.get_or_create(
                user=user,
                group=group,
                defaults={"invited_by": invited_by, "invitation_status": "pending"},
            )
            if created:
                new_members.append({"id": user.id, "firstname": user.Firstname, "lastname": user.Lastname})
            else:
                existing_members.append({"id": user.id, "firstname": user.Firstname, "lastname": user.Lastname})

        return new_members, existing_members
        
    @sync_to_async
    def get_group_info(self, group_id):
        """
        Retrieves group information, including owner, members, and their invitation statuses.
        """
        group = Group.objects.get(id=group_id)
        owner = group.owner
        memberships = GroupMembership.objects.filter(group=group)

        # Format member data including invitation_status
        def format_member(membership):
            member = membership.user
            pub_cards = member.cards.all()  # Assuming the user has a `cards` related name
            return {
                "id": member.id,
                "firstname": member.Firstname,
                "lastname": member.Lastname,
                "invitation_status": membership.invitation_status,
                "pub_cards": [
                    {"pub_card": card.pub_card, "card_type": card.card_type}
                    for card in pub_cards
                ],
            }

        return {
            "group_id": group.id,
            "owner": {
                "id": owner.id,
                "firstname": owner.Firstname,
                "lastname": owner.Lastname,
                "pub_cards": [
                    {"pub_card": card.pub_card, "card_type": card.card_type}
                    for card in owner.cards.all()
                ],
            },
            "members": [format_member(membership) for membership in memberships],
        }

    @sync_to_async
    def decline_invitation(self, group_id, user):
        """
        Deletes the GroupMembership entry for a specific user and group.
        """
        try:
            membership = GroupMembership.objects.get(group_id=group_id, user=user)
            if membership.invitation_status == "pending":
                membership.delete()  # Delete the entry
                return True
            return False
        except GroupMembership.DoesNotExist:
            return False
        
        
    async def chat_message(self, event):
        """
        Handler for the `chat_message` event.
        Broadcasts the message to all clients in the group.
        """
        await self.send_json({
            "event": "chat_message",
            "sender": event["sender"],
            "text": event["text"],
            "timestamp": event["timestamp"],  # Include timestamp
        })
        
    @sync_to_async
    def get_current_time(self):
        from datetime import datetime
        return datetime.now().isoformat()  # Return time in "HH:MM" format
