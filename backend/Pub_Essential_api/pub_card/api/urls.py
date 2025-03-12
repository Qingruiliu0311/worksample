from django.urls import path
from .views import UserDetailView,PubCardUpdateView,UserDetailAndCardStyleView,CardListView,CardInviteListView

urlpatterns = [
    path('api/user/', UserDetailView.as_view(), name='user_detail'),
    path("api/pubcard/", PubCardUpdateView.as_view(), name="pubcard-update"),
    path('api/user/details/', UserDetailAndCardStyleView.as_view(), name='user_detail_and_card_style'),
    path('friend/cards/', CardListView.as_view(), name='friend_cards'),
    path('friend/invite/cards/', CardInviteListView.as_view(), name='friend_cards'),
]