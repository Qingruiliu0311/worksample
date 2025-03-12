from rest_framework import generics
from ..models import Proposal, ProposalMember
from .serializers import ProposalSerializer, ProposalMemberSerializer
from rest_framework.permissions import IsAuthenticated

class ProposalListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProposalSerializer

    def get_queryset(self):
        """
        Filter proposals to only include those where `proposed_by` matches the logged-in user.
        """
        return Proposal.objects.filter(proposed_by=self.request.user)

    def perform_create(self, serializer):
        # Automatically set the `proposed_by` field to the current logged-in user
        serializer.save(proposed_by=self.request.user)

class ProposalRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Proposal.objects.all()
    serializer_class = ProposalSerializer

class ProposalMemberListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = ProposalMember.objects.all()
    serializer_class = ProposalMemberSerializer

class ProposalMemberRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = ProposalMember.objects.all()
    serializer_class = ProposalMemberSerializer
    
class GroupProposalsListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProposalSerializer

    def get_queryset(self):
        """
        Filter proposals by the group_id provided in the URL.
        """
        group_id = self.kwargs['group_id']  # Get group_id from URL
        return Proposal.objects.filter(group_id=group_id)