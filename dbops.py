import config
import datetime
from bson.objectid import ObjectId
import easycrypt
import json
import copy
import time



dab = config.DB[config.DATABASE]


def enco(sstr: str):
    key2 = easycrypt.genkeypassword(
        config.SESSION_ENCRYPTING_KEY, config.DBOPSENCODINGSTRING.encode('utf-8'))
    fkey = easycrypt.encrypt((sstr).encode('utf-8'), key2)
    fkey = fkey.decode('utf-8')
    # print(key)
    return fkey


def deco(secode: str):
    secode = secode.encode('utf-8')
    key2 = easycrypt.genkeypassword(
        config.SESSION_ENCRYPTING_KEY, config.DBOPSENCODINGSTRING.encode('utf-8'))
    fkey3 = easycrypt.decrypt(secode, key2)
    # print(fkey3)
    return fkey3


class inserts:
    def register_new_user(user_Object: dict):
        """Returns True if the user was registered successfully

        Keyword arguments:
        user_Object -- a dictionary containing the user details from the form
        Returns:
        False -- if the user could not be registered (Boolean)
        True -- if the user was registered successfully (Boolean)
        """
        dac = dab["users"]
        v1 = dac.insert_one(user_Object)
        if v1.acknowledged:
            return True
        return False
    
    def create_session_token(user_Object: dict):
        """Returns a string of encrypted session token
        
        Keyword arguments:
        user_Object -- a dictionary containing the user_id
        Returns:
        False -- if the token could not be created (Boolean)
        token -- if the token was created successfully (String and Encrypted)
        """
        
        dac = dab["sessions"]
        v1 = dac.insert_one(user_Object)
        if v1.acknowledged:
            return enco(str(v1.inserted_id))
        return False
    
class getters:
    def get_user_by_credentials(user_Object: dict):
        """ Returns the user object if the credentials are valid
            
        Keyword arguments:
        user_Object -- a dictionary containing the email and password
        Returns:
        False -- if the credentials are invalid (Boolean)
        user -- if the credentials are valid (Dictionary)
        """

        dac = dab["users"]
        v1 = dac.find_one(user_Object)
        if v1:
            return v1
        return False
    
    def get_session_by_token(token: str):
        """ Returns the session object if the token is valid
        
        Keyword arguments:
        token -- the encrypted token (String)
        Returns:
        False -- if the token is invalid (Boolean)
        session -- if the token is valid (Dictionary)
        """
        
        dac = dab["sessions"]
        v1 = dac.find_one({"_id":ObjectId(deco(token))})
        if v1:
            return v1
        return False