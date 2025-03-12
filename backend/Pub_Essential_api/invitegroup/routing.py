from django.urls import re_path
from django.urls import path

from . import consumers

websocket_urlpatterns = [
    path("ws/group/<int:group_id>/", consumers.GroupConsumer.as_asgi()),
]