from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import AccessToken
from django.http import HttpRequest
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth.models import AnonymousUser
from channels.middleware import BaseMiddleware
from asgiref.sync import sync_to_async
import logging
logger = logging.getLogger("websocket")


User = get_user_model()

class CustomJWTAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    def __call__(self, scope):
        return self.inner(scope)

class CustomJWTAuthMiddleware(BaseMiddleware):
    def __init__(self, inner):
        super().__init__(inner)

    async def __call__(self, scope, receive, send):
        # Extract headers from scope
        headers = dict(scope.get("headers", []))
        logger.info(f"Headers: {headers}")
        
        token = None

        if b"authorization" in headers:
            auth_header = headers[b"authorization"].decode()
            logger.info(f"Authorization header: {auth_header}")

            # Check if it's a Bearer token
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
                logger.info(f"Token extracted from Authorization header: {token}")

        # Check for the 'cookie' header
        elif b"cookie" in headers:
            cookies = headers[b"cookie"].decode()
            cookie_dict = self.parse_cookie(cookies)
            logger.info(f"Cookies parsed: {cookie_dict}")

            # Extract access_token from the cookies
            if "access_token" in cookie_dict:
                token = cookie_dict["access_token"]
                logger.info(f"Token extracted from cookies: {token}")

        # Authenticate user with the token
        if token:
            user = await self.authenticate_user(token)
            scope["user"] = user if user else AnonymousUser()
        else:
            scope["user"] = AnonymousUser()  # Set as AnonymousUser if no token

        # Call the inner handler (the consumer)
        return await super().__call__(scope, receive, send)
    
    
    def parse_cookie(self, cookie_string):
        """
        Parse the cookie string into a dictionary.
        """
        cookies = {}
        for item in cookie_string.split(";"):
            key, value = item.strip().split("=", 1)
            cookies[key] = value
        return cookies


    @sync_to_async
    def authenticate_user(self, token):
        try:
            # Use JWTAuthentication to validate the token
            jwt_auth = JWTAuthentication()
            validated_token = jwt_auth.get_validated_token(token)
            user = jwt_auth.get_user(validated_token)
            logger.info(f"Authenticated user: {user}")
            return user
        except Exception as e:
            logger.error(f"Authentication failed: {str(e)}")
            return None
        
        

class CustomJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        """
        Overriding the authenticate method to customize token extraction logic.
        """
        public_paths = ['/register/', '/accounts/google/login/callback/', '/accounts/facebook/login/callback/']
        if request.path in public_paths:
            return None
        
        # Extract token from cookies or headers
        raw_token = self.get_token_from_request(request)

        if raw_token is None:
            return None  # No token means no authentication, so DRF will fall back to permissions.

        # Validate and decode the token
        validated_token = self.get_validated_token(raw_token)

        # Get the user from the validated token
        user = self.get_user(validated_token)

        return (user, validated_token)

    def get_token_from_request(self, request):
        """
        Extracts the token from the Authorization header or cookies.
        """
        # Check cookies for the token
        raw_token = request.COOKIES.get("access_token")
        if raw_token:
            return raw_token

        # Fallback to the Authorization header
        auth_header = self.get_header(request)
        if auth_header is not None:
            parts = auth_header.split()

            if len(parts) == 2 and parts[0].lower() == "bearer":
                return parts[1]

        # No token found
        return None

    def get_validated_token(self, raw_token):
        """
        Validates the raw token using the parent class's method.
        """
        try:
            return super().get_validated_token(raw_token)
        except Exception as e:
            raise AuthenticationFailed(("Invalid or expired token.")) from e