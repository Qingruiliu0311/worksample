from django.db import models
from django.conf import settings


class Product(models.Model):
    vendor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        limit_choices_to={'is_vendor': True},  # Only allow vendor users
        related_name='products'
    )
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class BusinessReview(models.Model):
    vendor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        limit_choices_to={'is_vendor': True},
        related_name='reviews'
    )
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='submitted_reviews'
    )
    review_text = models.TextField(null=True, blank=True)
    rating = models.PositiveSmallIntegerField(default=5)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review for {self.vendor.Businessname}"

    @staticmethod
    def get_average_rating(vendor_id):
        reviews = BusinessReview.objects.filter(vendor_id=vendor_id)
        if not reviews.exists():
            return 5.0  # Default score if no reviews
        average_rating = reviews.aggregate(models.Avg('rating'))['rating__avg']
        return round(average_rating, 1)

    @property
    def average_rating(self):
        return self.get_average_rating(self.vendor.id)

    @property
    def total_reviews(self):
        return BusinessReview.objects.filter(vendor_id=self.vendor.id).count()