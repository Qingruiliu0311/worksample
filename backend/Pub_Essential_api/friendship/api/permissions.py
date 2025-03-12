from rest_framework.permissions import BasePermission

class IsOwnerOrFriend(BasePermission):
    """
    Custom permission to allow only the involved users to manage or view friendships.
    """

    def has_object_permission(self, request, view, obj):
        # Check if the authenticated user is either `from_user` or `to_user`
        return request.user == obj.from_user or request.user == obj.to_user