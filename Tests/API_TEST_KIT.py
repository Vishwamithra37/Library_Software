import config
import requests
dab = config.DB[config.DATABASE]
BASEURL= config.BASEURL
TEST_ARRAY=[]

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
        Success Response: {'status': 'success'} , 200
        Failure Response: {'status': 'error', 'message': 'Username already exists'} , 400
        """
        test_data={
             "TestName":"Registration Test",
             "TestFunction":"test_register",
             "TestUrl":BASEURL+"/api/v1/user/register",
             "TestType":"POST",
             "TestData":  {'username': 'testuser', 'password': 'testpassword', 'email': 'tester@gmail.com'},
             "TestExpectedResponse":{'status': 'success', 'SatusCode':200} ,
        }
        url = test_data["TestUrl"]
        data = test_data["TestData"]
        r = requests.post(url, json=data)
        if r.status_code == 200:
            test_data["TestActualResponse"] = r.json()
            test_data["TestStatus"] = "Passed"
            TEST_ARRAY.append(test_data)
            print("Registration Successful")
        else:
            test_data["TestActualResponse"] = r.json()
            test_data["TestStatus"] = "Failed"
            TEST_ARRAY.append(test_data)
            print("Registration Failed")
            raise Exception("Registration Failed")
            




