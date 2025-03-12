from rest_framework import serializers
from ..models import CustomUser
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed



class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    cpassword = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = '__all__'  # Adjust fields based on your user model
        extra_kwargs =  {
            "password": {"write_only": True},  # Ensure password is write-only
            "cpassword": {"write_only": True},  # cpassword is write-only
            # Mark all other fields as optional
            "Firstname": {"required": True, "allow_blank": True},
            "Lastname": {"required": True, "allow_blank": True},
            "Contactnumber": {"required": False, "allow_blank": True},
            "Businessname": {"required": False, "allow_blank": True},
            "Businessaddress": {"required": False, "allow_blank": True},
        }

    def validate(self, attrs):
        # Check if passwords match
        if attrs["password"] != attrs["cpassword"]:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        
        # Check if email already exists
        if CustomUser.objects.filter(email=attrs["email"]).exists():
            raise serializers.ValidationError({"email": "Email is already registered."})

        # Check if phone number already exists
        contact_number = attrs.get("Contactnumber")
        if contact_number and CustomUser.objects.filter(Contactnumber=contact_number).exists():
            raise serializers.ValidationError({"phone": "Phone number is already registered."})

        return attrs
    
        

    def create(self, validated_data):
        # Use the create_user method of your custom user manager
        validated_data.pop("cpassword")
        user = CustomUser.objects.create_user(**validated_data)
        return user
    

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        email = attrs.get("email", None)
        password = attrs.get("password", None)

        # Check if the username exists
        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            raise AuthenticationFailed({"detail": "User does not exist"})

        # Check if the password is correct
        if not user.check_password(password):
            raise AuthenticationFailed({"detail": "Incorrect password"})

        # Proceed with the default behavior
        return super().validate(attrs)