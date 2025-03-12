from drf_spectacular.extensions import OpenApiAuthenticationExtension

class CustomJWTAuthenticationExtension(OpenApiAuthenticationExtension):
    target_class = 'User_management.authentication.CustomJWTAuthentication'
    name = 'CustomJWTAuthentication'

    def get_security_definition(self, auto_schema):
        return {
            'type': 'apiKey',
            'in': 'header',
            'name': 'Authorization',
            'description': 'Custom JWT Authentication'
        }