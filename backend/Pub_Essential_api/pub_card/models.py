# Create your models here.
from django.db import models
from django.conf import settings

# Create your models here.
class pubcard(models.Model):
    card_type = models.CharField(max_length=100)
    card_invite = models.CharField(max_length=100)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,  # Dynamically references your custom user model
        on_delete=models.CASCADE,  # Deletes cards if the associated user is deleted
        related_name="cards"       # Allows reverse lookup (e.g., user.cards.all())
    )
    pub_card = models.CharField(
        max_length=8,  # 2 letters + 6 digits = 8 characters
        unique=True,  # Ensures that each pub card is unique
        help_text="Format: 2 letters followed by 6 digits (e.g., AB123456)."
    )