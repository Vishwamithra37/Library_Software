import config
import requests
dab = config.DB[config.DATABASE]

# This is the test kit. It is used to test the various api endpoints with the help of the requests library.

# Testing registration endpoint.
# This is the test kit. It is used to test the various api endpoints with the help of the requests library.
def test_register():
    """This function tests the registration endpoint.
    It sends a post request to the endpoint with the following data:
    username: testuser
    password: testpassword
    email: tester@gmail.com
    Current  Endpoint: /api/v1/user/register
    Success Response: {'status': 'success'}
    Failure Response: {'status': 'error', 'message': 'Username already exists'}
    """



