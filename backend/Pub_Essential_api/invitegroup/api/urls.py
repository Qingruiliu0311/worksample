from django.urls import path
from .views import GroupCreateView, CheckUserGroupAPIView, CheckInvitationsView, GroupMembersView

urlpatterns = [
    path('group/create/', GroupCreateView.as_view(), name='create_group'),
    path('group/check/', CheckUserGroupAPIView.as_view(), name='check_group'),
    path('group/checkinvitation/', CheckInvitationsView.as_view(), name='check_invitation'),
    path('group/getmembers/', GroupMembersView.as_view(), name='get_members'),
]