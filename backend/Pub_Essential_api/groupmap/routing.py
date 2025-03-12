from django.urls import re_path
from django.urls import path

from . import consumers

websocket_urlpatterns = [
    path("ws/livemap/<int:group_id>/", consumers.LiveMapConsumer.as_asgi()),
]