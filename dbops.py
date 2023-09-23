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
    def return_book(unique_book_id: str, user_id: str, authorizer_object):
        """Returns True if the book was returned successfully\n
        Keyword arguments:\n
        unique_book_id -- the book id (String)\n
        user_id -- the user id (String)\n
        authoriser_object -- the authoriser session object\n
        Returns:\n
        False -- if the book could not be returned (Boolean)\n
        True -- if the book was returned successfully (Boolean)\n
        Description:\n
        The idea is to mark the book as returned by pushing the rent object into 
        another collection called records and then deleting it from the rents collection.
        The next step is to then update the metadata of the book and the user- Such as penality if any
        and the number of books rented by the user.
        """
        dac = dab["BOOKS"]
        dac1=dab["USERS"]
        dac2=dab["RENTS"]
        dac3=dab["RENT_RECORDS"]
        book_object=dac.find_one({"_id":ObjectId(unique_book_id)})
        user_object=dac1.find_one({"_id":ObjectId(user_id)})
        authoriser_user_object=authorizer_object
        # ################### If none of the objects exist ###################
        if not book_object or book_object["status"]!="Rented" or not user_object or not authoriser_user_object:
            return False
        # ################### End If none of the objects exist ###################
        rent_object=dac2.find_one({"book_id":unique_book_id,"user_id":user_id,"status":"Rented"})
        # ################### If the user has not rented the book ###################
        if not rent_object:
            return False
        # ################### End If the user has not rented the book ###################
        # ################### Insertion and Update ###################
        dac2.delete_one({"book_id":unique_book_id,"user_id":user_id,"status":"Rented"})
        book_update={"$inc":{"noofcopies_available_currently":1,"noofcopies_rented_currently":-1}}
        if book_object["noofcopies_rented_currently"]==1:
            book_update["$set"]={"status":"Available"}
        dac.update_one({"_id":ObjectId(unique_book_id)},book_update)
        dac1.update_one({"_id":ObjectId(user_id)},{"$inc":{          # Incrementing the number of books rented by the user. Purely for statistics.
                                                           "Library.Number_of_books_rented_currently":-1,
                                                           }})
        # ################## End Insertion and Update #################
        return True

        



    def rent_book(common_book_details, unique_book_details,unique_book_id, user_id: str, authorizer_object, rentedfor: str):
        """Returns True if the book was rented successfully\n
        Keyword arguments:\n
        common_book_details -- dict\n
        \n
        authoriser_id -- the authoriser id (String)\n
        rentedfor -- the duration for which the book is rented-In Days (String)\n
        Returns:\n
        False -- if the book could not be rented (Boolean)\n
        True -- if the book was rented successfully (Boolean)\n
        """
        dac = dab["BOOKS"]
        dac1=dab["USERS"]
        dac2=dab["RENTS"]
        dac3=dab["UNIQUE_BOOK_IDS"]
        user_object=dac1.find_one({"_id":ObjectId(user_id)})
        authoriser_user_object=authorizer_object
        # ################### If none of the objects exist ###################
        if  unique_book_details["status"]!="Available" or not user_object or not authoriser_user_object:
            return False
        # ################### End If none of the objects exist ###################
        rent_object={
            "unique_book_id":unique_book_id,
            "user_id":user_id,
            "authoriser_email":authoriser_user_object["email"],
            "timestamp":str(datetime.datetime.now()),
            "status":"Rented",
            "rentedfor": rentedfor
        }
        # ################### If the user has already rented the book ###################
        if dac2.find_one({"unique_book_id":unique_book_id,"user_id":user_id,"status":"Rented"}):
            return False
        dac2.insert_one(rent_object)
        # ################### End If the user has already rented the book ###################
        book_update={"$inc":{"noofcopies_available_currently":-1,"noofcopies_rented_currently":1,"nooftimes_rented":1}}
        if common_book_details["noofcopies_available_currently"]==1:
            book_update["$set"]={"status":"Rented"}
        dac.update_one({"_id":ObjectId(str(unique_book_details["BOOK_ID"]))},book_update)
        dac1.update_one({"_id":ObjectId(user_id)},{"$inc":{          # Incrementing the number of books rented by the user. Purely for statistics.
                                                           "Library.Number_of_books_rented_currently":1,
                                                           "Library.Total_Number_of_books_rented":1,
                                                           }})
        dac3.update_one({"_id":ObjectId(unique_book_id)},{"$set":{"status":"Rented"},"$inc":{"nooftimes_rented":1}})
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
        dac2=dab["UNIQUE_BOOK_IDS"]
        book_Object["timestamp"]=str(datetime.datetime.utcnow())
        v1 = dac.insert_one(book_Object)
        book_Object["BOOK_ID"]=str(v1.inserted_id)
        del book_Object["_id"]
        del book_Object["noofcopies_available_currently"]
        del book_Object["noofcopies_rented_currently"]
        for i in range(int(book_Object["noofcopies"])):
            dac2.insert_one(book_Object)
            del book_Object["_id"]
        if v1.acknowledged:
            return True
        return False
    
    def add_unique_tags_to_config(all_new_book_parameters:dict):
        """Returns True if the tags were added successfully

        Keyword arguments:
        all_new_book_parameters -- a dictionary containing the new tags
        Returns:
        False -- if the tags could not be added (Boolean)
        True -- if the tags were added successfully (Boolean)
        """
        dac = dab["CONFIGS"]
        for i in all_new_book_parameters:
            v1 = dac.update_one({"Config_Name":"Book_Tag_Options"},{"$addToSet":{i:{'$each':all_new_book_parameters[i]}}})
            if not v1.acknowledged:
                return False
        return True
    
class getters:
    def get_unique_book_ids(book_id: str,organization:str):
        """ Returns the unique book ids if the book_id is valid
        
        Keyword arguments:
        book_id -- the book id (String)
        Returns:
        False -- if the book_id is invalid (Boolean)
        book -- if the book_id is valid (Dictionary)
        """
        dac = dab["UNIQUE_BOOK_IDS"]
        v1 = dac.find({"BOOK_ID":book_id,"organization":organization},{"_id":1})
        all_unique_book_ids=[]
        if v1:
            for i in v1:
                all_unique_book_ids.append(str(i["_id"]))
            return all_unique_book_ids
        return False

    def get_specific_book_details(book_id: str,organization:str):
        """ Returns the book object if the book_id is valid
        
        Keyword arguments:
        book_id -- the book id (String)
        Returns:
        False -- if the book_id is invalid (Boolean)
        book -- if the book_id is valid (Dictionary)
        """
        dac = dab["BOOKS"]
        v1 = dac.find_one({"_id":ObjectId(book_id),"organization":organization},{"_id":0})
        if v1:
            return v1
        return False
    
    def get_specific_book_details_by_unique_id(unique_book_id: str,organization:str):
        """ Returns the unique book object by unique book id if the book_id is valid
        Keyword arguments:
        unique_book_id -- the book id (String)
        organization -- the organization (String)
        Returns:
        False -- if the book_id is invalid (Boolean)
        book -- if the book_id is valid (Dictionary)
        """
        dac = dab["UNIQUE_BOOK_IDS"]
        v1 = dac.find_one({"_id":ObjectId(unique_book_id),"organization":organization},{"_id":0})
        if v1:
            return v1
        return False

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
    
    def get_book_list(skip: int=0, limit: int=0):
        """ Returns a list of books
        Keyword arguments:
        skip -- the number of books to skip (Integer)
        limit -- the number of books to return (Integer)
        Returns:
        False -- if the skip and limit are invalid (Boolean)
        all_books_list -- if the skip and limit are valid (list of dictionaries)
        """
        dac = dab["BOOKS"]
        v1 = dac.find({}).skip(skip).limit(limit)
        all_books_list=[]
        for i in v1:
            i["sid"]=str(i["_id"])
            del i["_id"]
            all_books_list.append(i)
        if all_books_list:
            return all_books_list
        return False
    
    def get_book_list_special(skip: int=0, limit: int=0,returner:dict={},sorting_order=-1,search_string=0,generic=[],tags=[]):
        """ Returns a list of books
        Keyword arguments:
        skip -- the number of books to skip (Integer)
        limit -- the number of books to return (Integer)
        returner -- the fields to return (Dictionary)
        sorting_order -- the sorting order (Integer) (optional default=-1)
        search_string -- the search string (String) (optional)
        generic -- the generic search string (List) (optional)
        tags -- the tags to search (List) (optional)
        Returns:
        False -- if the skip and limit are invalid (Boolean)
        all_books_list -- if the skip and limit are valid (list of dictionaries)
        """ 
        dac = dab["BOOKS"]
        fil={}
        if search_string:
            fil={
                "$or":[
                    {"title":{"$regex":search_string,"$options":"i"}},
                    {"author":{"$regex":search_string,"$options":"i"}},
                    {"description":{"$regex":search_string,"$options":"i"}},
                    {"tags":{"$regex":search_string,"$options":"i"}},
                ]
            }
        # if generic:
        #     # Alphabetical search.
        #     fil["$or"]=[]
        #     for i in generic:
        #         fil["$or"].append({"book_name":{"$regex":'/^'+i+'/',"options":"i"}})               
        if tags:
            fil["tags"]={"$in":tags}
        print(fil)    
        v1 = dac.find(fil,returner).sort("timestamp",sorting_order).skip(skip).limit(limit)
        all_books_list=[]
        for i in v1:
            i["sid"]=str(i["_id"])
            del i["_id"]
            all_books_list.append(i)
        if all_books_list:
            return all_books_list
        return False
    
    def get_book_by_parameter(book_parameter:str,book_parameter_value:str):
        """ Returns the book object if the book_name is valid
        Keyword arguments:
        book_name -- the book name (String)
        Returns:
        False -- if the book_name is invalid (Boolean)
        book -- if the book_name is valid (Dictionary)
        """
        dac = dab["BOOKS"]
        v1 = dac.find_one({book_parameter:book_parameter_value},{"_id":0})
        if v1:
            return v1
        return False
    
    def get_all_book_tags():
        """ Returns a list of all book tags
        Returns:
        False -- if the parameter_name is invalid (Boolean)
        book_tags_list -- if the parameter_name is valid (list of dictionaries)
        """
        dac = dab["CONFIGS"]
        v1 = dac.find_one({"Config_Name":"Book_Tag_Options"},{"_id":0})
        if v1:
            return v1
        return False
    
    
    def get_book_tags(parameter_name:str):
        """ Returns a list of book tags
        Keyword arguments:
        parameter_name -- the parameter name (String)
        Returns:
        False -- if the parameter_name is invalid (Boolean)
        book_tags_list -- if the parameter_name is valid (list of dictionaries)
        """
        dac = dab["CONFIGS"]
        v1 = dac.find_one({"Config_Name":"Book_Tag_Options"},{"_id":0, parameter_name:1})
        print(v1)
        if v1:
            return v1[parameter_name]
        return False

    def get_user_list(search_string:str, skip: int=0, limit: int=10,returner:dict={},organization:str=""):
        """ Returns a list of users
        
        Keyword arguments:
        skip -- the number of users to skip (Integer)
        limit -- the number of users to return (Integer)
        Returns:
        False -- if the skip and limit are invalid (Boolean)
        all_users_list -- if the skip and limit are valid (list of dictionaries)
        """
        dac = dab["USERS"]
        fil={
            # Regex call username.
            "$or":[
                {"username":{"$regex":search_string,"$options":"i"}},
                {"email":{"$regex":search_string,"$options":"i"}},
            ],
            "organization":organization
        }
        v1 = dac.find(fil,returner).skip(skip).limit(limit)
        

        all_users_list=[]
        for i in v1:
            i["sid"]=str(i["_id"])
            del i["_id"]
            del i["password"]
            all_users_list.append(i)
        if all_users_list:
            return all_users_list
        return False

    def get_specific_user_data(user_email:str,id_number:str,organization:str):
        """Returns the user object if the user_email is valid
        
        Keyword arguments:
        user_email -- the user email (String)
        id_number -- the user id_number (String)
        organization -- the user organization (String)
        Returns:
        False -- if the user_email is invalid (Boolean)
        user -- if the user_email is valid (Dictionary)
        """
        dac=dab["USERS"]
        fil={
            "$or":[
                {"email":user_email},
                {"id_number":id_number},
            ],
            "organization":organization
        }
        ret={
            "_id":0,
        }
        v1=dac.find_one(fil,ret)
        if v1:
            return v1
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
        
        
     

