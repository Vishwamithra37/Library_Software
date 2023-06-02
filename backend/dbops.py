import config
import datetime
from bson.objectid import ObjectId
import easycrypt
import cryptography
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

def hash512(sstr: str):
    hasher=cryptography.hazmat.primitives.hashes.Hash(cryptography.hazmat.primitives.hashes.SHA512())
    hasher.update(sstr.encode('utf-8'))
    return hasher.finalize().hex()



class inserts:
    def rent_book(book_id: str, user_id: str, authoriser_id: str, rentedfor: str):
        """Returns True if the book was rented successfully

        Keyword arguments:
        book_id -- the book id (String)
        user_id -- the user id (String)
        Returns:
        False -- if the book could not be rented (Boolean)
        True -- if the book was rented successfully (Boolean)
        """
        dac = dab["BOOKS"]
        dac1=dab["USERS"]
        dac2=dab["RENTS"]
        book_object=dac.find_one({"_id":ObjectId(book_id)})
        user_object=dac1.find_one({"_id":ObjectId(user_id)})
        authoriser_user_object=dac1.find_one({"_id":ObjectId(authoriser_id)})
        if not book_object or book_object["status"]!="Available" or not user_object or not authoriser_user_object:
            return False
        rent_object={
            "book_id":book_id,
            "user_id":user_id,
            "authoriser_id":authoriser_id,
            "timestamp":str(datetime.datetime.now()),
            "status":"Rented",
            "rentedfor": rentedfor
        }
        if dac2.find_one({"book_id":book_id,"user_id":user_id,"status":"Rented"}):
            return False
        
        # ################### Insertion and Update ###################
        dac2.insert_one(rent_object)
        dac.update_one({"_id":ObjectId(book_id)},{"$inc":{"noofcopies_available_currently":-1,"noofcopies_rented_currently":1,"nooftimes_rented":1}})
        dac1.update_one({"_id":ObjectId(user_id)},{"$inc":{
                                                           "Library.Number_of_books_rented_currently":1,
                                                           "Library.Total_Number_of_books_rented":1,
                                                           }})
        # ################## End Insertion and Update #################
        return True
    
    def register_new_user(user_Object: dict, useremail: str):
        """Returns True if the user was registered successfully

        Keyword arguments:
        user_Object -- a dictionary containing the user details from the form
        Returns:
        False -- if the user could not be registered (Boolean)
        True -- if the user was registered successfully (Boolean)
        """
        dac = dab["USERS"]
        v0 = dac.find_one({"email": useremail})
        if v0:
            return False
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
        
        dac = dab["SESSIONS"]
        v1 = dac.insert_one(user_Object)
        if v1.acknowledged:
            return enco(str(v1.inserted_id))
        return False
    
    def register_book(book_Object: dict):
        """Returns True if the book was registered successfully

        Keyword arguments:
        book_Object -- a dictionary containing the book details from the form
        Returns:
        False -- if the book could not be registered (Boolean)
        True -- if the book was registered successfully (Boolean)
        """
        dac = dab["BOOKS"]
        v1 = dac.insert_one(book_Object)
        if v1.acknowledged:
            return True
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

        dac = dab["USERS"]
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
        
        dac = dab["SESSIONS"]
        v1 = dac.find_one({"_id":ObjectId(deco(token))})
        v1["_id"]=str(v1["_id"])
        if v1:
            return v1
        return False