from rest_framework import serializers
from ..models import Proposal, ProposalMember

class ProposalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proposal
        fields = '__all__'

class ProposalMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProposalMember
        fields = '__all__'