from django.conf import settings
from django.db import models
from invitegroup.models import Group

class Proposal(models.Model):
    # Primary ID is automatically created by Django (no need to define it explicitly)
    group = models.ForeignKey(
        "invitegroup.Group",  # Assuming Group is defined in the same app or imported
        on_delete=models.CASCADE,
        related_name="proposals",
        help_text="The group associated with this proposal.",
    )
    number_of_acceptance = models.PositiveIntegerField(
        default=0,
        help_text="Number of members who have accepted the proposal.",
    )
    proposed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="owned_proposals",
        help_text="The user who created the proposal.",
        null=True,
    )
    vendor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        limit_choices_to={"is_vendor": True},  # Ensure only vendor users can be selected
        related_name="vendor_proposals",
        help_text="The vendor associated with the proposal.",
        null=True,
    )
    vendor_latitude = models.DecimalField(
        max_digits=9,  # Precision for latitude (up to 6 decimal places)
        decimal_places=6,
        help_text="Latitude of the vendor's location.",
        null=True,
        blank=True,
    )
    vendor_longitude = models.DecimalField(
        max_digits=9,  # Precision for longitude (up to 6 decimal places)
        decimal_places=6,
        help_text="Longitude of the vendor's location.",
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Proposal {self.id} for Group {self.group.id}"

    def update_acceptance_count(self):
        """
        Updates the `number_of_acceptance` field based on the number of members who have accepted the proposal.
        """
        self.number_of_acceptance = self.proposal_members.filter(status="accepted").count()
        self.save()


class ProposalMember(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("rejected", "Rejected"),
    ]

    # Primary ID is automatically created by Django (no need to define it explicitly)
    proposal = models.ForeignKey(
        Proposal,
        on_delete=models.CASCADE,
        related_name="proposal_members",
        help_text="The proposal associated with this member.",
    )
    member = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="proposal_memberships",
        help_text="The member associated with the proposal.",
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
        help_text="The acceptance status of the member for the proposal.",
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["proposal", "member"],
                name="unique_proposal_member",
            )
        ]

    def __str__(self):
        return f"{self.member.email} in Proposal {self.proposal.id} ({self.status})"

    def save(self, *args, **kwargs):
        """
        Override the save method to update the proposal's acceptance count when a member's status changes.
        """
        super().save(*args, **kwargs)
        self.proposal.update_acceptance_count()