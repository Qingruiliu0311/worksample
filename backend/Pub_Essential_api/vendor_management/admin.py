from django.contrib import admin
from .models import Product, BusinessReview

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'vendor', 'price', 'stock', 'created_at')
    search_fields = ('name', 'vendor__email')

@admin.register(BusinessReview)
class BusinessReviewAdmin(admin.ModelAdmin):
    list_display = ('vendor', 'average_rating', 'total_reviews', 'created_at')
    search_fields = ('vendor__email', 'vendor__Businessname')