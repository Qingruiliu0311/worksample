from django.urls import path

from . import consumers

websocket_urlpatterns = [
    path("ws/friendship/", consumers.FriendshipConsumer.as_asgi()),
]