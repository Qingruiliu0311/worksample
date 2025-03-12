from django.urls import path
from .views import VendorProductListCreateView, VendorReviewListCreateView , VendorListView

urlpatterns = [
    path('<int:vendor_id>/product/', VendorProductListCreateView.as_view(), name='vendor-products'),
    path('<int:vendor_id>/reviews/', VendorReviewListCreateView.as_view(), name='vendor-reviews'),
    path('vendors/', VendorListView.as_view(), name='get-vendor'),
]