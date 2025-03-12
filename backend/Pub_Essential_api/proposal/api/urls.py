from django.urls import path
from .views import (
    ProposalListCreateView,
    ProposalRetrieveUpdateDestroyView,
    ProposalMemberListCreateView,
    ProposalMemberRetrieveUpdateDestroyView,
    GroupProposalsListView,
)

urlpatterns = [
    path('proposals/', ProposalListCreateView.as_view(), name='proposal-list-create'),
    path('proposals/<int:pk>/', ProposalRetrieveUpdateDestroyView.as_view(), name='proposal-retrieve-update-destroy'),
    path('proposal-members/', ProposalMemberListCreateView.as_view(), name='proposal-member-list-create'),
    path('proposal-members/<int:pk>/', ProposalMemberRetrieveUpdateDestroyView.as_view(), name='proposal-member-retrieve-update-destroy'),
    path('groups/<int:group_id>/proposals/', GroupProposalsListView.as_view(), name='group-proposals-list'),
]
