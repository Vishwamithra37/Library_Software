import config
import datetime
from bson.objectid import ObjectId
import easycrypt
import cryptography
import qrcode
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

class math_operations:
    def calculate_penality(rent_object:dict):
        current_time=datetime.datetime.now()
        time_of_rent=datetime.datetime.strptime(rent_object["timestamp"],"%Y-%m-%d %H:%M:%S.%f")
        time_difference_in_days=(current_time-time_of_rent).days
        Library_params=getters.config_organization_libary_parrameters(rent_object["organization"])
        day_penality=Library_params["Day_Penality"]
        month_penality=Library_params["Month_Penality"]
        year_penality=Library_params["Year_Penality"]

        if time_difference_in_days<=int(rent_object["rentedfor"]):
            return 0
        else:
            if time_difference_in_days<=30:
                return (time_difference_in_days-int(rent_object["rentedfor"]))*day_penality
            elif time_difference_in_days<=365:
                # The penality is cumulative. That is if the book is overdue by 2 months and 10 days, the penality is calculated as 2*month_penality+70*day_penality.
                return (time_difference_in_days-int(rent_object["rentedfor"]))*day_penality+(time_difference_in_days//30)*month_penality
            else:
                return (time_difference_in_days-int(rent_object["rentedfor"]))*day_penality+(time_difference_in_days//30)*month_penality+(time_difference_in_days//365)*year_penality
        
class QR_code_operations:
    def generate_QR(stringer:str,multiple_QRs:list=[]): 
        #    Generate multiple QR codes and attach them equidisatntly to the pdf. 
              img = qrcode.make(stringer)
              with open('qr.png', 'wb') as f:
                img.save(f)
              return True



class inserts:
    def return_book(unique_book_id: str, user_id: str, organization:str,Unique_book_object:dict, notes:str=""):
        """Returns True if the book was returned successfully\n
        """
        dac = dab["BOOKS"]
        dac1=dab["RENT_RECORDS"]
        dac2=dab["RENTS"]
        dac3=dab["USERS"]
        dac4=dab["UNIQUE_BOOK_IDS"]
        ### Step 1 is check if the rent object exists. That is if the user really rented the book.
        fil={
            "unique_book_id":unique_book_id,
            "user_id":user_id,
            "organization":organization,
            "status":"Rented"
        }
        rent_object=dac2.find_one(fil)
        if not rent_object:
            return False
        ### Step 2 is to calculate the penality if any.
        penality=math_operations.calculate_penality(rent_object)
        ### Step 3 pass the rent object to the rent records. Update the user object with the penality and the book and unique book object with the return.
        rent_object["penality"]=penality
        rent_object["notes"]=notes
        rent_object["status"]="Returned"
        add_overdue_count=0
        if penality:
            add_overdue_count=1
            current_date=datetime.datetime.now()
            rent_object["return_timestamp"]=str(current_date)
            rent_object["time_difference"]=additional_functions.calculate_time_difference(datetime.datetime.strptime(rent_object["timestamp"],"%Y-%m-%d %H:%M:%S.%f"))
            rent_object["is_overdue"]="Yes"
        dac1.insert_one(rent_object)
        dac3.update_one({"_id":ObjectId(user_id)},{"$inc":{          # Incrementing the number of books rented by the user. Purely for statistics.
                                                              "Library."+organization+".Number_of_books_rented_currently":-1,
                                                              "Library."+organization+".Number_of_books_returned":1,
                                                              "Library."+organization+".Number_of_times_overdue":add_overdue_count,
                                                              "Library."+organization+".Total_fine_amount":penality,
                                                              }})
        dac4.update_one({"_id":ObjectId(unique_book_id)},{"$set":{"status":"Available","Last_returned":str(datetime.datetime.now())}})
        dac2.delete_one(fil)
        dac.update_one({"_id":ObjectId(Unique_book_object["BOOK_ID"])},{"$inc":{"noofcopies_available_currently":1,"noofcopies_rented_currently":-1}})
        ###### Step4 return True
        return True
    
    def rent_book(common_book_details, unique_book_details,unique_book_id, user_id: str, authorizer_object, rentedfor: str,organizaiton,notes:str=''):
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
            "rentedfor": rentedfor,
            "organization":organizaiton,
            "onrentnotes":notes
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
                                                           "Library."+organizaiton+".Number_of_books_rented_currently":1,
                                                           "Library."+organizaiton+".Total_Number_of_books_rented":1,
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
        number_of_sessions=len(list(dac.find({"email":user_Object["email"]},{"_id":1})))
        if number_of_sessions>4:
            dac.delete_one({"email":user_Object["email"]})
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
    
    def edit_book(new_book_object:dict,new_book_copies_to_add:int,old_common_book_object:dict,book_id:str):
        """Returns True if the book was edited successfully

        Keyword arguments:
        new_book_object -- a dictionary containing the new book details from the form
        book_id -- the book id (String)
        Returns:
        False -- if the book could not be edited (Boolean)
        True -- if the book was edited successfully (Boolean)
        """
        dac = dab["BOOKS"]
        dac2=dab["UNIQUE_BOOK_IDS"]
        new_book_object["noofcopies_available_currently"]=old_common_book_object["noofcopies_available_currently"]+new_book_copies_to_add
        if old_common_book_object["status"]=="Rented" and new_book_copies_to_add>0:
            new_book_object["status"]="Available"
        book_Object = dac.update_one({"_id":ObjectId(book_id)},{"$set":new_book_object})
        del new_book_object["noofcopies_available_currently"]
        if book_Object.acknowledged:
            new_book_object["Update_timestamp"]=str(datetime.datetime.utcnow())
            new_book_object["BOOK_ID"]=book_id
            new_book_object["status"]="Available"
            dac2.update_many({"BOOK_ID":book_id},{"$set":new_book_object})
            for i in range(new_book_copies_to_add):
                dac2.insert_one(new_book_object)
                del new_book_object["_id"]
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
    def get_user_data_by_id(user_id:str,organization:str):
        dac=dab["USERS"]
        v1=dac.find_one({"_id":ObjectId(user_id),"organization":organization},{"_id":0})
        if v1:
            return v1
        return False
    def get_simple_meta_data(organization:str):
        dac=dab["USERS"]
        dac2=dab["BOOKS"]
        dac3=dab["RENTS"]
        print(organization)
        current_date=datetime.datetime.now()
        # Dues, Number of Books, Rents, total penality
        v1=dac.aggregate([
            {"$match":{"organization":organization}},
            {"$group":{
                "_id":None,
                "user_total_users":{"$sum":1},
                "user_total_books_taken_for_rent":{"$sum":"$Library."+organization+".Total_Number_of_books_rented"},
                "user_current_active_rents":{"$sum":"$Library."+organization+".Number_of_books_rented_currently"},
                "user_all_user_total_penality":{"$sum":"$Library."+organization+".Total_fine_amount"},
                "user_all_time_total_dues_counter":{"$sum":"$Library."+organization+".Number_of_times_overdue"},
                "user_total_amount_paid":{"$sum":"$Library."+organization+".Total_amount_paid"}
            },
            },
            {"$project":{
                "_id":0,
                "user_total_users":1,
                "user_total_books_taken_for_rent":1,
                "user_current_active_rents":1,
                "user_all_user_total_penality":1,
                "user_all_time_total_dues_counter":1,
                "user_total_amount_paid":1
            }
            }
        ])
        v1_data=list(v1)
        Book_data=dac2.aggregate([
            {"$match":{"organization":organization}},
            {"$group":{
                "_id":None,
                "books_total_number_of_books_registered":{"$sum":1},
                "books_noofcopies_books_available_currently":{"$sum":"$noofcopies_available_currently"},
                "books_noofcopies_rented_currently":{"$sum":"$noofcopies_rented_currently"},
                "books_nooftimes_books_have_been_rented":{"$sum":"$nooftimes_rented"}
            },
            },
            {"$project":{
                "_id":0,
                "books_total_number_of_books_registered":1,
                "books_noofcopies_books_available_currently":1,
                "books_noofcopies_rented_currently":1,
                "books_nooftimes_books_have_been_rented":1
            }
            }
        ])
        overdue_data = dac3.find({"organization": organization, "status": "Rented"}) 
        overdue_data_2={}
        overdue_data_2["penality"]=v1_data[0]["user_all_user_total_penality"]
        overdue_data_2["card_data"]=[]
        for i in overdue_data:
            i["time_difference"]=additional_functions.calculate_time_difference(datetime.datetime.strptime(i["timestamp"],"%Y-%m-%d %H:%M:%S.%f"))
            i["sid"]=str(i["_id"])
            del i["_id"]
            rented_for=int(i["rentedfor"])
            if rented_for<i["time_difference"]:
                unique_book_details=getters.get_specific_book_details_by_unique_id(i["unique_book_id"],organization)
                user_details=getters.get_user_data_by_id(i["user_id"],organization)
                overdue_data_2["total_penality"]=math_operations.calculate_penality(i)+overdue_data_2["penality"]
                append_card={}
                append_card["User_Name"]=user_details["username"]
                append_card["User_Email"]=user_details["email"]
                append_card["id_number"]=user_details["id_number"]
                append_card["role"]=user_details["Role"]
                append_card["authorizer_email"]=i["authoriser_email"]
                append_card["book_name"]=unique_book_details["title"]
                append_card["author"]=unique_book_details["author"]
                append_card["book_tags"]=unique_book_details["tags"]
                append_card["unique_book_id"]=i["unique_book_id"]
                append_card["rentedfor"]=i["rentedfor"]
                append_card["Book_Rented_On"]=i["timestamp"]
                append_card["time_difference"]=i["time_difference"]
                append_card["penality"]=math_operations.calculate_penality(i)
                overdue_data_2["card_data"].append(append_card)
        overdue_data_2["total_number_of_overdue_books"]=len(overdue_data_2["card_data"])
        Book_data=list(Book_data)

 

        return [v1_data[0],Book_data[0],overdue_data_2]

    def config_role_permission_dictionary(orgaization:str):
        """Returns the role permission dictionary for the organization

        Keyword arguments:
        organization -- the organization name
        Returns:
        False -- if the organization is invalid (Boolean)
        True -- if the organization is valid (Boolean)
        """
        dac = dab["CONFIGS"]
        v1 = dac.find_one({"Config_Name":"PERMISSIONS_DICTIONARY","organization":orgaization})
        if v1:
            del v1["_id"]
            return v1
        return False
    def config_organization_libary_parrameters(organization:str):
        """Returns the library parameters for the organization

        Keyword arguments:
        organization -- the organization name
        Returns:
        False -- if the organization is invalid (Boolean)
        True -- if the organization is valid (Boolean)
        """
        dac = dab["CONFIGS"]
        v1 = dac.find_one({"Config_Name":"Library_Parameters"},{"_id":0,organization:1})
        if v1:
            return v1[organization]
        return False
    def get_unique_book_ids(book_id: str,organization:str):
        """ Returns the unique book ids if the book_id is valid
        
        Keyword arguments:
        book_id -- the book id (String)
        Returns:
        False -- if the book_id is invalid (Boolean)
        book -- if the book_id is valid (Dictionary)
        """
        dac = dab["UNIQUE_BOOK_IDS"]
        v1 = dac.find({"BOOK_ID":book_id,"organization":organization,"status":"Available"},{"_id":1})
        all_unique_book_ids=[]
        if v1:
            for i in v1:
                all_unique_book_ids.append(str(i["_id"]))
            return all_unique_book_ids
        return False
    def get_unique_book_ids_returns(user_id: str,organization:str):
        """ Returns the unique book ids if the book_id is valid
        
        Keyword arguments:
        book_id -- the book id (String)
        Returns:
        False -- if the book_id is invalid (Boolean)
        book -- if the book_id is valid (Dictionary)
        """
        dac = dab["RENTS"]
        v1 = dac.find({"user_id":user_id,"organization":organization,"status":"Rented"},{"_id":0,"unique_book_id":1})
        all_unique_book_ids=[]
        if v1:
            for i in v1:
                all_unique_book_ids.append(str(i["unique_book_id"]))
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
    
    def get_book_list(skip: int=0, limit: int=0,organization=""):
        """ Returns a list of books
        Keyword arguments:
        skip -- the number of books to skip (Integer)
        limit -- the number of books to return (Integer)
        Returns:
        False -- if the skip and limit are invalid (Boolean)
        all_books_list -- if the skip and limit are valid (list of dictionaries)
        """
        dac = dab["BOOKS"]
        v1 = dac.find({"organization":organization}).skip(skip).limit(limit)
        all_books_list=[]
        for i in v1:
            i["sid"]=str(i["_id"])
            del i["_id"]
            all_books_list.append(i)
        if all_books_list:
            return all_books_list
        return False
    
    def get_rented_book_list(book_id:str,skip: int=0, limit: int=0,organization="",additional_filters={}):
        """ Returns a list of books which are rented.
        Keyword arguments:
        book_id -- the book id (String)
        skip -- the number of books to skip (Integer)
        limit -- the number of books to return (Integer)
        organization -- the organization name (String)
        additional_filters -- the additional filters (Dictionary) (optional)
        Returns:
        False -- if the skip and limit are invalid (Boolean)
        all_books_list -- if the skip and limit are valid (list of dictionaries)
        """
        dac = dab["UNIQUE_BOOK_IDS"]
        v1 = dac.find({"BOOK_ID":book_id,"status":"Rented","organization":organization}).skip(skip).limit(limit)
        return_array=[]
        for i in v1:
            return_data={}
            fil2={
                "unique_book_id":str(i["_id"]),
                "status":"Rented",
                "organization":organization
            }
            v2=dab["RENTS"].find_one(fil2,{"_id":0})
            v3_user_info=dab["USERS"].find_one({"_id":ObjectId(v2["user_id"])},{"_id":0})
            return_data["User_Email"]=v3_user_info["email"]
            return_data["User_Name"]=v3_user_info["username"]
            return_data["Book_Rented_On"]=v2["timestamp"]
            return_data["authorizer_email"]=v2["authoriser_email"]
            return_data["rentedfor"]=v2["rentedfor"]
            return_data["unique_book_id"]=str(i["_id"])
            return_data["potential_penality"]=math_operations.calculate_penality(v2)
            return_data["time_difference"]=additional_functions.calculate_time_difference(datetime.datetime.strptime(v2["timestamp"],"%Y-%m-%d %H:%M:%S.%f"))
            i["sid"]=str(i["_id"])
            del i["_id"]
            return_array.append(return_data)
        if return_array:
            return return_array
        return False


    def get_all_rented_book_list(skip: int=0, limit: int=0,organization="",additional_filters={}):
        """ Returns the list of all books which are rented.
        Keyword arguments:
        skip -- the number of books to skip (Integer)
        limit -- the number of books to return (Integer)
        organization -- the organization name (String)
        additional_filters -- the additional filters (Dictionary) (optional)
        Returns:
        False -- if the skip and limit are invalid (Boolean)
        all_books_list -- if the skip and limit are valid (list of dictionaries)
        """
        dac = dab["UNIQUE_BOOK_IDS"]
        v1 = dac.find({"status":"Rented","organization":organization}).skip(skip).limit(limit)
        return_array=[]
        for i in v1:
            return_data={}
            fil2={
                "unique_book_id":str(i["_id"]),
                "status":"Rented",
                "organization":organization
            }
            v2=dab["RENTS"].find_one(fil2,{"_id":0})
            v3_user_info=dab["USERS"].find_one({"_id":ObjectId(v2["user_id"])},{"_id":0})
            return_data["User_Email"]=v3_user_info["email"]
            return_data["User_Name"]=v3_user_info["username"]
            return_data["Book_Rented_On"]=v2["timestamp"]
            return_data["authorizer_email"]=v2["authoriser_email"]
            return_data["rentedfor"]=v2["rentedfor"]
            return_data["unique_book_id"]=str(i["_id"])
            return_data["potential_penality"]=math_operations.calculate_penality(v2)
            return_data["time_difference"]=additional_functions.calculate_time_difference(datetime.datetime.strptime(v2["timestamp"],"%Y-%m-%d %H:%M:%S.%f"))
            i["sid"]=str(i["_id"])
            del i["_id"]
            return_array.append(return_data)
        if return_array:
            return return_array
        return False



    def get_book_list_special(skip: int=0, limit: int=0,returner:dict={},sorting_order=-1,search_string=0,generic=[],tags=[],organization=""):
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
        fil={
            "organization":organization
        }
        if search_string:
            fil={
                "$or":[
                    {"title":{"$regex":search_string,"$options":"i"}},
                    {"author":{"$regex":search_string,"$options":"i"}},
                    {"description":{"$regex":search_string,"$options":"i"}},
                    {"tags":{"$regex":search_string,"$options":"i"}},
                ],
                "organization":organization

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
        }
        v1=dac.find_one(fil,ret)
        if v1:
            v1["sid"]=str(v1["_id"])
            del v1["_id"]
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

class updaters:
    def add_user_payment(user_email:str,payment_mode:str,payment_reference_number:str,payment_value:int,organization:str):
        dac=dab["USERS"]
        dac2=dab["PAYMENT_RECORDS"]
        r1=dac.update_one({"email":user_email,"organization":organization},{"$inc":{"Library."+organization+".Total_amount_paid":payment_value}})
        payment_dictionary={
            "user_email":user_email,
            "payment_mode":payment_mode,
            "payment_reference_number":payment_reference_number,
            "payment_value":payment_value,
            "timestamp":str(datetime.datetime.now()),
            "organization":organization
        }
        r2=dac2.insert_one(payment_dictionary)
        if r1.modified_count:
            return True
        return False
    

    def update_user_data(
                         organization:str,
                         user_id:str,
                         description:str="",
                         username:str="",
                         email:str="",
                         phone_number:str="",
                         description_of_user:str="",
                         Payment_details:str=""
                         ):
        dac=dab["USERS"]
        update_object={}
        if description:
            update_object["description"]=description

        dac.update_one({"_id":ObjectId(user_id),"organization":organization},{"$set":update_object})
        return True
        
        
     

class deleters:
    def delete_unique_book(unique_book_id:str,organization:str):
        dac=dab["UNIQUE_BOOK_IDS"]
        dac2=dab["RENTS"]
        dac3=dab["BOOKS"]
        dac4=dab["OLD_UNIQUE_BOOK_IDS_RECORDS"]

        unique_book_object=dac.find_one({"_id":ObjectId(unique_book_id),"organization":organization})
        Total_number_of_books_rented=len(list(dac2.find({"unique_book_id":unique_book_id,"organization":organization},{"_id":1})))
        if_successful_number_of_copies=int(unique_book_object["noofcopies"])-1
        number_of_unique_books=unique_book_object["noofcopies"]
        if not unique_book_object:
            return False
        if int(number_of_unique_books)>1 and unique_book_object["status"]=="Available":
            dac.delete_one({"_id":ObjectId(unique_book_id),"organization":organization})
            dac4.insert_one(unique_book_object)
            dac3.update_one({"_id":ObjectId(unique_book_object["BOOK_ID"])},{"$inc":{"noofcopies_available_currently":-1},"$set":{"noofcopies":if_successful_number_of_copies}})
            dac.update_many({"BOOK_ID":unique_book_object["BOOK_ID"]},{"$set":{"noofcopies":if_successful_number_of_copies}})
            return True
        elif not Total_number_of_books_rented and unique_book_object["status"]=="Available" and unique_book_object["noofcopies"]==1:
            dac.delete_one({"_id":ObjectId(unique_book_id),"organization":organization})
            dac4.insert_one(unique_book_object)
            dac4.insert_one(dac3.find_one({"_id":ObjectId(unique_book_object["BOOK_ID"])}))
            dac3.delete_one({"_id":ObjectId(unique_book_object["BOOK_ID"])})
            return True
        print(unique_book_object["status"])
        print(Total_number_of_books_rented)
        print(number_of_unique_books)
        print("Not deleted")
        return False