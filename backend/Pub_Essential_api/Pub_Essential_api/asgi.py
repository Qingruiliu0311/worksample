"""
ASGI config for Pub_Essential_api project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from channels.security.websocket import OriginValidator
from django.core.asgi import get_asgi_application
from User_management.authentication import CustomJWTAuthMiddleware

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysite.settings")
# Initialize Django ASGI application early to ensure the AppRegistry
# is populated before importing code that may import ORM models.
django_asgi_app = get_asgi_application()

from invitegroup.routing import websocket_urlpatterns as group_urlpatterns
from groupmap.routing import websocket_urlpatterns as map_urlpatterns
from friendship.routing import websocket_urlpatterns as friendship_urlpatterns

websocket_urlpatterns = group_urlpatterns + map_urlpatterns + friendship_urlpatterns

application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": OriginValidator(
            CustomJWTAuthMiddleware(
                AuthMiddlewareStack(URLRouter(websocket_urlpatterns))
            ),["*"],
        ),
    }
)
