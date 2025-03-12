from django.urls import path
from .views import user_registration,CustomTokenObtainPairView, google_oauth_callback, CustomTokenRefreshView, facebook_oauth_callback
# from .views import CustomTokenObtainPairView, CustomTokenRefreshView
# from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('register/', user_registration.as_view(), name='user_registration'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('accounts/google/login/callback/', google_oauth_callback, name='google_oauth_callback'),
    path('accounts/facebook/login/callback/', facebook_oauth_callback, name='facebook_oauth_callback')
    ]