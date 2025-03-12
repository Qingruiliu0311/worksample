from django.http import JsonResponse, HttpResponseRedirect
from .serializer import UserRegistrationSerializer, CustomTokenObtainPairSerializer
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework import generics
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
import requests
from rest_framework.permissions import AllowAny
from pub_card.api.views import generate_unique_pub_card
from pub_card.models import pubcard




User = get_user_model()
class user_registration(generics.CreateAPIView):
    permission_classes = permission_classes = [AllowAny]
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    def perform_create(self, serializer):
        user = serializer.save()
        if not user:
            raise ValueError("User creation failed.")
        # Automatically create a pubcard for the user
        pubcard.objects.create(
            user=user,
            pub_card=generate_unique_pub_card(),
            card_type=""  # Leave card_type blank
        )
        return user
        
    def create(self, request, *args, **kwargs):
        # Call the parent method to create the user
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = self.perform_create(serializer)

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token

        # Prepare the response
        response = Response({
            "message": "User registered and logged in successfully.",
            "access_token": str(access_token),
            "refresh_token": str(refresh),
        })

        # Set tokens as HttpOnly cookies
        response.set_cookie(
            key="access_token",
            value=str(access_token),
            httponly=True,
            secure=False,  # Set to True in production
            samesite="Strict",
            max_age=60*60*24*7  # 1 week expiration
        )
        response.set_cookie(
            key="refresh_token",
            value=str(refresh),
            httponly=True,
            secure=True,  # Set to True in production
            samesite="Lax",
        )

        return response

def facebook_oauth_callback(request):
    try:
        # Extract authorization code from query params
        auth_code = request.GET.get('code')
        if not auth_code:
            return JsonResponse({'error': 'Authorization code missing'}, status=400)

        # Exchange authorization code for access token
        token_response = requests.get(
            'https://graph.facebook.com/v16.0/oauth/access_token',
            params={
                'client_id': '',
                'redirect_uri': 'http://localhost:8000/accounts/facebook/login/callback/',
                'client_secret': '',
                'code': auth_code,
            }
        )
        token_data = token_response.json()
        access_token = token_data.get('access_token')

        if not access_token:
            return JsonResponse({'error': 'Failed to get access token'}, status=400)

        # Fetch user info using the access token
        user_info_response = requests.get(
            'https://graph.facebook.com/me',
            params={
                'fields': 'id,email,first_name,last_name',
                'access_token': access_token,
            }
        )
        user_info = user_info_response.json()
        email = user_info.get('email')

        if not email:
            return JsonResponse({'error': 'Email not provided by Facebook'}, status=400)

        # Get or create the user
        user, created = get_user_model().objects.get_or_create(
            email=email,
            defaults={
                'Firstname': user_info.get('first_name', ''),
                'Lastname': user_info.get('last_name', ''),
            }
        )
        
        if created:
            pubcard.objects.create(
                user=user,
                pub_card=generate_unique_pub_card(),
                card_type=""  # Leave card_type blank
            )
        

        # Generate JWT tokens for the user
        refresh = RefreshToken.for_user(user)
        jwt_token = refresh.access_token

        # Return JWT to the frontend
        response = HttpResponseRedirect('http://localhost:5173/choosepubcard')
        response.set_cookie(
            key='access_token',
            value=str(jwt_token),
            httponly=True,
            secure=False,  # Set to True for production
            samesite='Strict',
            max_age=60*60*24*7,  # 1 week expiration
        )
        response.set_cookie(
            key="refresh_token",
            value=str(refresh),
            httponly=True,
            secure=True,
            samesite="Lax",
        )
        return response

    except Exception as e:
        return JsonResponse({'error': 'Server error', 'details': str(e)}, status=500)

def google_oauth_callback(request):
    try:
        # Extract authorization code from query params
        auth_code = request.GET.get('code')
        if not auth_code:
            return JsonResponse({'error': 'Authorization code missing'}, status=400)

        # Exchange authorization code for tokens
        token_response = requests.post(
            'https://oauth2.googleapis.com/token',
            data={
                'code': auth_code,
                'client_id': '',
                'client_secret': '',
                'redirect_uri': 'http://localhost:8000/accounts/google/login/callback/',
                'grant_type': '',
            }
        )
        token_data = token_response.json()
        access_token = token_data.get('access_token')

        if not access_token:
            return JsonResponse({'error': 'Failed to get access token'}, status=400)

        # Fetch user info using access token
        user_info_response = requests.get(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            headers={'Authorization': f'Bearer {access_token}'},
        )
        user_info = user_info_response.json()

        email = user_info.get('email')
        if not email:
            return JsonResponse({'error': 'Email not provided by Google'}, status=400)
        
        user = get_user_model().objects.filter(email=email).first()
        if user:
            # Generate JWT tokens for the existing user
            refresh = RefreshToken.for_user(user)
            jwt_token = refresh.access_token

            # Redirect to the frontend with JWT tokens
            response = HttpResponseRedirect('http://localhost:5173')
            response.set_cookie(
                key='access_token', 
                value=str(jwt_token), 
                httponly=True,  # Prevent access via JavaScript
                secure=False,   # Set to True for production with HTTPS
                samesite='Strict',  # Protect against CSRF attacks
                max_age=60*60*24*7  # Cookie expiration (1 week)
            )
            response.set_cookie(
                key="refresh_token",  # Cookie for refresh token
                value=str(refresh),
                httponly=True,
                secure=True,
                samesite="Lax",
            )
            return response

        # Get or create the user
        user, created = get_user_model().objects.get_or_create(
            email=user_info['email'],
            defaults={
                'Firstname': user_info.get('given_name', ''),
                'Lastname': user_info.get('family_name', ''),
            }
        )
        
        if created:
            pubcard.objects.create(
            user=user,
            pub_card=generate_unique_pub_card(),
            card_type=""  # Leave card_type blank
        )

        # Generate JWT tokens for the user
        refresh = RefreshToken.for_user(user)
        jwt_token = refresh.access_token

        # Return JWT to the frontend
        response = HttpResponseRedirect('http://localhost:5173/choosepubcard')
        response.set_cookie(
            key='access_token', 
            value=str(jwt_token), 
            httponly=True,  # Prevent access via JavaScript
            secure=False,   # Set to True for production with HTTPS
            samesite='Strict',  # Protect against CSRF attacks
            max_age=60*60*24*7  # Cookie expiration (1 week)
        )
        response.set_cookie(
            key="refresh_token",  # Cookie for refresh token
            value=str(refresh),
            httponly=True,
            secure=True,
            samesite="Lax",
        )
        return response

    except Exception as e:
        return JsonResponse({'error': 'Server error', 'details': str(e)}, status=500)
    
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tokens = serializer.validated_data

        # Set the JWT as an HttpOnly cookie
        response = Response({"message": "Token stored in cookie."}, status=200)
        response.set_cookie(
            key="access_token",  # Cookie name
            value=tokens.get("access"),  # Access token
            httponly=True,  # HTTP-only flag
            secure=True,  # Set to True in production to enforce HTTPS
            samesite="Lax",  # Protect against CSRF; set "Strict" for more security
        )
        response.set_cookie(
            key="refresh_token",  # Cookie for refresh token
            value=tokens.get("refresh"),
            httponly=True,
            secure=True,
            samesite="Lax",
        )
        return response
    
class CustomTokenRefreshView(TokenRefreshView):
    serializer_class = TokenRefreshSerializer

    def post(self, request, *args, **kwargs):
        # Read refresh token from cookie
        refresh_token = request.COOKIES.get("refresh_token")
        if not refresh_token:
            return Response({"error": "Refresh token not provided"}, status=400)

        serializer = self.get_serializer(data={"refresh": refresh_token})
        serializer.is_valid(raise_exception=True)
        tokens = serializer.validated_data

        # Update the access token in the cookie
        response = Response({
            "access": tokens.get("access"),
        })
        response.set_cookie(
            key="access_token",
            value=tokens.get("access"),
            httponly=True,
            secure=True,
            samesite="Lax",
        )

        message = {"Tokens are stored in cookie"}
        return response
    
