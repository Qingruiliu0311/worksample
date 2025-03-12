from django.conf import settings
from django.db import models
from django.db.models import UniqueConstraint

class Friendship(models.Model):
    from_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="friendship_initiated",  # Friend requests initiated by this user
    )
    to_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="friendship_received",  # Friend requests received by this user
    )
    status = models.CharField(
        max_length=10,
        choices=[
            ("pending", "Pending"),
            ("accepted", "Accepted"),
            ("declined", "Declined"),
        ],
        default="pending",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    sorted_users = models.CharField(max_length=255, editable=False, null=True)
    def save(self, *args, **kwargs):
        # Automatically sort the user IDs and generate the sorted_users value
        sorted_ids = sorted([self.from_user.id, self.to_user.id])
        self.sorted_users = f"{sorted_ids[0]}_{sorted_ids[1]}"
        super().save(*args, **kwargs)

    class Meta:
        constraints = [
            UniqueConstraint(
                fields=["sorted_users"],
                name="unique_friendship_sorted",
            ),
        ]
    def __str__(self):
        return f"{self.from_user.email} -> {self.to_user.email} ({self.status})"