import config
import datetime
from bson.objectid import ObjectId
import easycrypt
import cryptography


import additional_functions



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
        """Returns True if the book was rented successfully\n

        Keyword arguments:\n
        book_id -- the book id (String)\n
        user_id -- the user id (String)\n
        authoriser_id -- the authoriser id (String)\n
        rentedfor -- the duration for which the book is rented-In Days (String)\n
        Returns:\n
        False -- if the book could not be rented (Boolean)\n
        True -- if the book was rented successfully (Boolean)\n
        """
        dac = dab["BOOKS"]
        dac1=dab["USERS"]
        dac2=dab["RENTS"]
        book_object=dac.find_one({"_id":ObjectId(book_id)})
        user_object=dac1.find_one({"_id":ObjectId(user_id)})
        authoriser_user_object=dac1.find_one({"_id":ObjectId(authoriser_id)})
        # ################### If none of the objects exist ###################
        if not book_object or book_object["status"]!="Available" or not user_object or not authoriser_user_object:
            return False
        # ################### End If none of the objects exist ###################
        rent_object={
            "book_id":book_id,
            "user_id":user_id,
            "authoriser_id":authoriser_id,
            "timestamp":str(datetime.datetime.now()),
            "status":"Rented",
            "rentedfor": rentedfor
        }
        # ################### If the user has already rented the book ###################
        if dac2.find_one({"book_id":book_id,"user_id":user_id,"status":"Rented"}):
            return False
        #  To negate this, one needs to either mark the old rent as returned or delete it from the database.
        # ################### End If the user has already rented the book ###################

        # ################### Insertion and Update ###################
        dac2.insert_one(rent_object)
        book_update={"$inc":{"noofcopies_available_currently":-1,"noofcopies_rented_currently":1,"nooftimes_rented":1}}
        if book_object["noofcopies_available_currently"]==1:
            book_update["$set"]={"status":"Rented"}
        dac.update_one({"_id":ObjectId(book_id)},book_update)
        dac1.update_one({"_id":ObjectId(user_id)},{"$inc":{          # Incrementing the number of books rented by the user. Purely for statistics.
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
    
    def get_book_list(skip: int, limit: int):
        """ Returns a list of books
        
        Keyword arguments:
        skip -- the number of books to skip (Integer)
        limit -- the number of books to return (Integer)
        Returns:
        False -- if the skip and limit are invalid (Boolean)
        all_books_list -- if the skip and limit are valid (list of dictionaries)
        """
        dac = dab["BOOKS"]
        v1 = dac.find({},{"_id":0}).skip(skip).limit(limit)
        all_books_list=[]
        for i in v1:
            all_books_list.append(i)
        if all_books_list:
            return all_books_list
        return False
    
    def get_user_list(skip: int, limit: int):
        """ Returns a list of users
        
        Keyword arguments:
        skip -- the number of users to skip (Integer)
        limit -- the number of users to return (Integer)
        Returns:
        False -- if the skip and limit are invalid (Boolean)
        all_users_list -- if the skip and limit are valid (list of dictionaries)
        """
        dac = dab["USERS"]
        v1 = dac.find({},{"_id":0}).skip(skip).limit(limit)
        all_users_list=[]
        for i in v1:
            all_users_list.append(i)
        if all_users_list:
            return all_users_list
        return False
        
    def get_book_by_id(book_id: str):
        """ Returns the book object if the book_id is valid
        
        Keyword arguments:
        book_id -- the book id (String)
        Returns:
        False -- if the book_id is invalid (Boolean)
        book -- if the book_id is valid (Dictionary)
        """
        dac = dab["BOOKS"]
        v1 = dac.find_one({"_id":ObjectId(book_id)})
        if v1:
            return v1
        return False
    
    def get_rented_books_by_user_id(user_id: str):
        """ Returns a list of rented books by the user
        
        Keyword arguments:
        user_id -- the user id (String)
        Returns:
        False -- if the user_id is invalid (Boolean)
        rented_books_list -- if the user_id is valid (list of dictionaries)
        """
        dac = dab["RENTS"]
        dac1=dab["BOOKS"]
        v1 = dac.find({"user_id":user_id,"status":"Rented"},{"_id":0})
        rented_books_list=[]

        for i in v1:
            book_object=dac1.find_one({"_id":ObjectId(i["book_id"])},{"_id":0})
            i["book_details"]=book_object
            i["time_difference"]=additional_functions.calculate_time_difference(datetime.datetime.strptime(i["timestamp"],"%Y-%m-%d %H:%M:%S.%f"))
            ######### Content for penality #########
            ######### Content for penality #########
            rented_books_list.append(i)
        if rented_books_list:
            return rented_books_list
        return False
    
    def get_specific_user_details_with_books_rented(user_specification: str, user_specification_value: str):
        """ Returns the user object if the user_specification is valid
        
        Keyword arguments:
        user_specification -- the user_specification (String)
        user_specification_value -- the user_specification_value (String)
        Returns:
        False -- if the user_specification is invalid (Boolean)
        user -- if the user_specification is valid (Dictionary)
        """
        dac = dab["USERS"]
        user_object = dac.find_one({user_specification:user_specification_value},{"_id":0})
        if not user_object:
            return False
        user_rented_books_list = getters.get_rented_books_by_user_id(str(user_object["_id"]))
        user_object["Library"]["rented_books"]=user_rented_books_list
        return user_object
        
        
     

