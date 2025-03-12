from django.contrib.auth import get_user_model
from rest_framework import generics, permissions
from rest_framework.exceptions import ValidationError
from ..models import Product, BusinessReview
from User_management.models import CustomUser
from .serializers import ProductSerializer, BusinessReviewSerializer
from User_management.api.serializer import UserRegistrationSerializer

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status


class VendorProductListCreateView(generics.ListCreateAPIView):
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        vendor_id = self.kwargs['vendor_id']
        return Product.objects.filter(vendor_id=vendor_id)

    def perform_create(self, serializer):
        vendor = self.request.user
        if not vendor.is_vendor:
            raise ValidationError("Only vendors can create products.")
        serializer.save(vendor=vendor)

User = get_user_model()

class VendorReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = BusinessReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        vendor_id = self.kwargs['vendor_id']
        return BusinessReview.objects.filter(vendor_id=vendor_id)

    def perform_create(self, serializer):
        vendor_id = self.kwargs['vendor_id']
        reviewer = self.request.user

        # Ensure the target user exists and is a vendor
        try:
            vendor = User.objects.get(id=vendor_id, is_vendor=True)
        except User.DoesNotExist:
            raise ValidationError("The specified user is not a valid vendor.")

        # Ensure a user cannot review the same vendor more than once
        if BusinessReview.objects.filter(vendor_id=vendor_id, reviewer=reviewer).exists():
            raise ValidationError("You have already reviewed this vendor.")

        serializer.save(vendor=vendor, reviewer=reviewer)

class VendorListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Fetch all users where is_vendor is True
            vendors = CustomUser.objects.filter(is_vendor=True)

            # Serialize the data
            serializer = UserRegistrationSerializer(vendors, many=True)

            return Response({"vendors": serializer.data}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": "Unable to fetch vendor data", "details": str(e)}, 
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)