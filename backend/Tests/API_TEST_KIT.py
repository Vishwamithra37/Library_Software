import config
import requests
from pprint import pprint as print
dab = config.DB[config.DATABASE]
BASEURL= config.BASEURL
TEST_ARRAY=[]

# This is the test kit. It is used to test the various api endpoints with the help of the requests library.


# This is the test kit. It is used to test the various api endpoints with the help of the requests library.

# Testing registration endpoint.
def test_register():
        """This function tests the registration endpoint.
        It sends a post request to the endpoint with the following data:
        username: testuser
        password: testpassword
        email: tester@gmail.com
        id_number : 123456789
        Current  Endpoint: /api/v1/user/register
        Success Response: {'status': 'success'} , 200
        Failure Response: {'status': 'error', 'message': 'Username already exists'} , 400
        """
        test_data={
             "TestName":"Registration Test",
             "TestFunction":"test_register",
             "TestUrl":BASEURL+"/api/v1/user/register",
             "TestType":"POST",
             "TestData":  {'username': 'testuser', 'password': 'testpassword', 'email': 'tester@gmail.com', 'id_number': '123456789'},
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
        return r.json()
            
# Testing login endpoint.
def test_login():
        """This function tests the login endpoint.
        It sends a post request to the endpoint with the following data:
        email: tester@gmail.com
        password: testpassword
        Current  Endpoint: /api/v1/user/login
        Success Response: {'status': 'success', 'token': 'encrypted token'} , 200
        Failure Response: {'status': 'error', 'message': 'Invalid credentials'} , 400
        """
        test_data={
             "TestName":"Login Test",
             "TestFunction":"test_login",
             "TestUrl":BASEURL+"/api/v1/user/login",
             "TestType":"POST",
             "TestData":  {'email': 'tester@gmail.com', 'password': 'testpassword'},
             "TestExpectedResponse":{'status': 'success', 'SatusCode':200} ,
        }
        url = test_data["TestUrl"]
        data = test_data["TestData"]
        r = requests.post(url, json=data)
        if r.status_code == 200:
            test_data["TestActualResponse"] = r.json()
            test_data["TestStatus"] = "Passed"
            TEST_ARRAY.append(test_data)
            print("Login Successful")
        else:
            test_data["TestActualResponse"] = r.json()
            test_data["TestStatus"] = "Failed"
            TEST_ARRAY.append(test_data)
            print(TEST_ARRAY)
            print("Login Failed")
            raise Exception("Login Failed")
        return r.json()

# Testing book registration endpoint.
def test_book_registration():
     pass


# This class is used to delete stuff from the database after testing.
class deleters:
     def delete_test_users():
        dac=dab["USERS"]
        dac.delete_one({"email": "tester@gmail.com"})

     def delete_test_sessions():
        dac=dab["SESSIONS"]
        dac.delete_one({"email": "tester@gmail.com"}) 

class verifiers:
     def verify_test_user_registration():
          dac=dab["USERS"]
          v1=dac.find_one({"email": "tester@gmail.com"})
          if v1:
               return True
          return False
     def verify_test_user_login():
          dac=dab["SESSIONS"]
          v1=dac.find_one({"email": "tester@gmail.com"})
          if v1:
                return True
          return False

# Testing registration endpoint.
class TestKits:
    def registration_kit():
        print("Registration Kit")
        test_register()
        if not verifiers.verify_test_user_registration(): raise Exception("Registration Failed")
        deleters.delete_test_users()
    def registration_and_login_kit():
        print("Registration and Login Kit")
        test_register()
        test_login()
        if not verifiers.verify_test_user_registration(): raise Exception("Registration Failed")
        if not verifiers.verify_test_user_login(): raise Exception("Login Failed")
        deleters.delete_test_users()
        deleters.delete_test_sessions()
    


# Testing Kits

TestKits.registration_kit()
TestKits.registration_and_login_kit()
print(TEST_ARRAY)
