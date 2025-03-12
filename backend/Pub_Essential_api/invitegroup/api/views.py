from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from ..models import Group, GroupMembership
from pub_card.models import pubcard
from friendship.models import Friendship
from .serializers import GroupSerializer
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.shortcuts import get_object_or_404

class CheckUserGroupAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Check if the user is an owner of any group
        owned_group = Group.objects.filter(owner=user).first()
        if owned_group:
            return Response({
                "exists": True,
                "data": {
                    "group_id": owned_group.id,
                    "role": "owner"
                }
            })

        # Check if the user is a member of any group with accepted invitation status
        membership = GroupMembership.objects.filter(
            user=user,
            invitation_status='accepted'  # Ensure only accepted memberships are considered
        ).select_related("group").first()
        if membership:
            return Response({
                "exists": True,
                "data": {
                    "group_id": membership.group.id,
                    "role": "member"
                }
            })

        # No group found for the user
        return Response({
            "exists": False,
            "data": None
        })

class GroupCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = GroupSerializer(data=request.data)
        if serializer.is_valid():
            group = serializer.save(owner=request.user)
            return Response(GroupSerializer(group).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class CheckInvitationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Fetch all pending invitations for the user
        invitations = GroupMembership.objects.filter(
            user=user, invitation_status="pending"
        )

        if not invitations.exists():
            return Response({"message": "You have no pending invitations."}, status=status.HTTP_200_OK)

        # Prepare the response data
        invitation_data = []
        for invitation in invitations:
            inviter = invitation.invited_by
            if inviter:
                # Fetch the inviter's pub_card
                pub_card = pubcard.objects.filter(user=inviter).first()

                invitation_data.append({
                    "group_id": invitation.group.id,
                    "inviter_email": inviter.email,
                    "inviter_firstname": inviter.Firstname,
                    "inviter_lastname": inviter.Lastname,
                    "inviter_card_type": pub_card.card_type if pub_card else None,
                    "inviter_pub_card": pub_card.pub_card if pub_card else None,
                    "invitation_status": invitation.invitation_status,
                })

        return Response({"invitations": invitation_data}, status=status.HTTP_200_OK)
    
class GroupMembersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user  # The currently logged-in user

        # Step 1: Find the group(s) the user belongs to
        group = None

        # Check if the user is the owner of any group
        owned_group = Group.objects.filter(owner=user).first()
        if owned_group:
            group = owned_group
        else:
            # Check if the user is a member of any group with accepted invitation status
            membership = GroupMembership.objects.filter(
                user=user,
                invitation_status='accepted'
            ).select_related("group").first()
            if membership:
                group = membership.group

        if not group:
            return Response({
                "message": "You do not belong to any group."
            }, status=status.HTTP_404_NOT_FOUND)

        # Step 2: Retrieve all members or owners of the group, excluding the requestor
        members = group.members.exclude(id=user.id)  # Exclude the requestor
        owner = group.owner if group.owner != user else None  # Exclude the requestor if they are the owner

        # Step 3: Combine owner and members into a single list called `proposed_member`
        proposed_member = []

        # Add owner data if the owner is not the requestor
        if owner:
            proposed_member.append({
                "id": owner.id,
                "email": owner.email,
                "firstname": owner.Firstname,
                "lastname": owner.Lastname,
                "role": "owner",  # Add role to distinguish owner from members
            })

        # Add member data
        for member in members:
            proposed_member.append({
                "id": member.id,
                "email": member.email,
                "firstname": member.Firstname,
                "lastname": member.Lastname,
                "role": "member",  # Add role to distinguish members from owner
            })

        # Prepare the response data
        response_data = {
            "group_id": group.id,
            "proposed_member": proposed_member,
        }

        return Response(response_data, status=status.HTTP_200_OK)