from rest_framework import serializers
from ..models import Product, BusinessReview


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ['vendor']


class BusinessReviewSerializer(serializers.ModelSerializer):
    average_rating = serializers.SerializerMethodField()  # Add this field

    class Meta:
        model = BusinessReview
        fields = ['id', 'vendor', 'reviewer', 'review_text', 'rating', 'average_rating', 'created_at']
        read_only_fields = ['vendor', 'average_rating', 'reviewer']

    def get_average_rating(self, obj):
        return BusinessReview.get_average_rating(obj.vendor.id)