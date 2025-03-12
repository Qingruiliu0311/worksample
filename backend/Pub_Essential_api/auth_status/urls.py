from django.urls import path
from .views import AuthStatusView


urlpatterns = [
    path('api/auth/status/', AuthStatusView.as_view(), name='AuthStatus')
]