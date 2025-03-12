from django.urls import path
from .views import (
    SendFriendRequestView,
    AcceptFriendRequestView,
    DeclineFriendRequestView,
    RemoveFriendView,
    ListFriendsView,
)
urlpatterns = [
    path('friend/send/', SendFriendRequestView.as_view(), name='friend_request'),
    path('friend/accept/', AcceptFriendRequestView.as_view(), name='accept_friend_request'),
    path('friend/decline/', DeclineFriendRequestView.as_view(), name='decline_friend_request'),
    path('friend/remove/<int:user_id>/', RemoveFriendView.as_view(), name='remove_friend'),
    path('friend/list/', ListFriendsView.as_view(), name='list_friends'),
]