import flask
import dbops
import config



app = flask.Flask(__name__)
app.secret_key = config.SESSION_ENCRYPTING_KEY


@app.route('/login')
def login_page():
    return flask.render_template('login.html')

@app.route('/register')
def register2():
    pass

@app.route('/login')
def login2():
    pass

@app.route('/dashboard')
def dashboard_page():
    UserDetails=dbops.getters.get_session_by_token(flask.session["Top_Secret_Token"])
    if not UserDetails:
        return flask.redirect(flask.url_for('login_page'))
    if not "dashboard_page" in UserDetails["permissions"]:
        return flask.redirect(flask.url_for('login_page'))
    Organizations=UserDetails["organization"]
    return flask.render_template('dashboard.html',Organizations=Organizations)

@app.route('/profile')
def profile():
    pass

@app.route('/books')
def books():
    pass

# Genric frontend #

####################### User Endpoints ############################
@app.route('/api/v1/user/register', methods=['POST'])
def admin_register_api():
    UserDetails=dbops.getters.get_session_by_token(flask.session["Top_Secret_Token"])
    if not UserDetails:
        return {'status': 'error', 'message': 'Invalid token'}, 400
    if "admin_register_api" not in UserDetails["permissions"]:
        return {'status': 'error', 'message': 'You do not have permission to register users'}, 400
    Flask_JSON = flask.request.get_json()
    ################### Validation ###################
    expected_keys = ['username', 'email','id_number','phone_number','description','organization','role','password']
    if list(set(expected_keys) - set(Flask_JSON.keys())) != []:
        return {'status': 'error', 'message': 'Missing keys'}, 400
    if 20<len(Flask_JSON['username']) < 2: return {'status': 'error', 'message': 'Username too short'}, 400
    if 50<len(Flask_JSON['password']) < 2: return {'status': 'error', 'message': 'Password too short'}, 400
    if 50<len(Flask_JSON['email']) < 2: return {'status': 'error', 'message': 'Email too short'}, 400
    if not '@' in Flask_JSON['email']: return {'status': 'error', 'message': 'Invalid email'}, 400
    if 50<len(Flask_JSON['id_number']) < 2: return {'status': 'error', 'message': 'ID Number too short'}, 400
    if Flask_JSON["role"] not in ["Student","Staff","Faculty","Admin","Other"]: return {'status': 'error', 'message': 'Invalid role'}, 400
    ################## End Validation #################
    Flask_JSON["Role"]="Student"
    Flask_JSON["password"]=dbops.hash512(Flask_JSON["password"])
    Flask_JSON["permissions"]=config.PERMISSION_LIST
    Flask_JSON["Library"]={}
    Flask_JSON["Library"]["Number_of_books_rented_currently"]=0
    Flask_JSON["Library"]["Number_of_books_returned"]=0
    Flask_JSON["Library"]["Number_of_times_overdue"]=0
    Flask_JSON["Library"]["Total_Number_of_books_rented"]=0
    Flask_JSON["Library"]["Total_fine_amount"]=0
    Flask_JSON["Library"]["Total_fine_amount_paid"]=0
    Flask_JSON["Library"]["Total_fine_amount_pending"]=0
    Flask_JSON["Library"]["Total_fine_amount_waived"]=0
    step1= dbops.inserts.register_new_user(Flask_JSON, Flask_JSON["email"])
    if step1:
        return {'status': 'success'}, 200
    return {'status': 'error', 'message': 'Username already exists'}, 400


@app.route('/api/v1/user/login', methods=['POST'])
def login():
    Flask_JSON = flask.request.get_json()
    ################### Validation ###################
    expected_keys = ['email', 'password']
    if list(set(expected_keys) - set(Flask_JSON.keys())) != []:
        return {'status': 'error', 'message': 'Missing keys'}, 400
    if 50<len(Flask_JSON['password']) < 2: return {'status': 'error', 'message': 'Password too short'}, 400
    if 50<len(Flask_JSON['email']) < 2: return {'status': 'error', 'message': 'Email too short'}, 400
    if not '@' in Flask_JSON['email']: return {'status': 'error', 'message': 'Invalid email'}, 400
    if not '.' in Flask_JSON['email']: return {'status': 'error', 'message': 'Invalid email'}, 400
    ################## End Validation #################
    Flask_JSON["password"]=dbops.hash512(Flask_JSON["password"])
    step1= dbops.getters.get_user_by_credentials(Flask_JSON)
    if step1:
        del step1["_id"]
        if "login" not in step1["permissions"]: return {'status': 'error', 'message': 'You do not have permission to login'}, 400
        step2=dbops.inserts.create_session_token(step1)
        if step2:
            r1=dbops.enco(str(step1["_id"]))
            flask.session["Top_Secret_Token"] = r1
            flask.session.permanent = True
            return {'status': 'success', 'token': step2}, 200
        return {'status': 'error', 'message': 'Internal error'}, 500
    return {'status': 'error', 'message': 'Invalid credentials'}, 400

@app.route('/api/v1/users/logout', methods=['POST'])
def logout():
    flask.session.clear()
    return {'status': 'success'}, 200

@app.route('/api/v1/users/get_user_list', methods=['POST'])
def get_user_list():
    UserDetails=dbops.getters.get_session_by_token(flask.session["Top_Secret_Token"])
    if not UserDetails:
        return {'status': 'error', 'message': 'Invalid token'}, 400
    if not "get_user_list" in UserDetails["permissions"]:
        return {'status': 'error', 'message': 'You do not have permission to get user list'}, 400
    JSON_DATA = flask.request.get_json()
    print(JSON_DATA)
    skip=JSON_DATA["skip"]
    limit=JSON_DATA["limit"]
    search_string=JSON_DATA["search_string"]
    if JSON_DATA.keys() != {"skip","limit","search_string","organization"}: return {'status': 'error', 'message': 'Missing keys'}, 400
    if int(skip)<0: return {'status': 'error', 'message': 'Skip cannot be negative'}, 400
    if int(limit)<0: return {'status': 'error', 'message': 'Limit cannot be negative'}, 400
    if int(len(search_string))<3: return {'status': 'error', 'message': 'Search string cannot be negative'}, 400
    if JSON_DATA["organization"] not in UserDetails["organization"]: return {'status': 'error', 'message': 'Invalid organization'}, 400
    step1=dbops.getters.get_user_list(search_string,skip,limit,organization=JSON_DATA["organization"])
    if step1:
        return {'status': 'success', 'data': step1}, 200
    return {'status': 'error', 'message': 'No users found'}, 400

@app.route('/api/v1/users/get_specific_user_data', methods=['POST'])
def get_specific_user_list():
    UserDetails=dbops.getters.get_session_by_token(flask.session["Top_Secret_Token"])
    if not UserDetails:
        return {'status': 'error', 'message': 'Invalid token'}, 400
    if not "get_specific_user_list" in UserDetails["permissions"]:
        return {'status': 'error', 'message': 'You do not have permission to get user list'}, 400
    JSON_DATA = flask.request.get_json()
    print(JSON_DATA)
    if JSON_DATA.keys() != {"email","id_number","organization"}: return {'status': 'error', 'message': 'Missing keys'}, 400
    if int(len(JSON_DATA["email"]))<3: return {'status': 'error', 'message': 'Email cannot be negative'}, 400
    if int(len(JSON_DATA["id_number"]))<3: return {'status': 'error', 'message': 'ID Number cannot be negative'}, 400
    if int(len(JSON_DATA["organization"]))<3: return {'status': 'error', 'message': 'Organization cannot be negative'}, 400
    step1=dbops.getters.get_specific_user_data(JSON_DATA["email"],JSON_DATA["id_number"],JSON_DATA["organization"])
    if step1:
        return {'status': 'success', 'data': step1}, 200
    return {'status': 'error', 'message': 'No users found'}, 400

@app.route('/api/v1/admin/books/get_book_details', methods=['POST'])
def get_specific_book_details():
    UserDetails=dbops.getters.get_session_by_token(flask.session["Top_Secret_Token"])
    if not UserDetails:
        return {'status': 'error', 'message': 'Invalid token'}, 400
    if not "get_specific_book_details" in UserDetails["permissions"]:
        return {'status': 'error', 'message': 'You do not have permission to get book details'}, 400
    JSON_DATA = flask.request.get_json()
    print(JSON_DATA)
    if JSON_DATA.keys() != {"book_id","organization","unique_book_id"}: return {'status': 'error', 'message': 'Missing keys'}, 400 
    if int(len(JSON_DATA["book_id"]))<3: return {'status': 'error', 'message': 'Book ID cannot be negative'}, 400
    if int(len(JSON_DATA["organization"]))<3: return {'status': 'error', 'message': 'Organization cannot be negative'}, 400
    if int(len(JSON_DATA["unique_book_id"]))<3: return {'status': 'error', 'message': 'Unique ID cannot be negative'}, 400
    step1=dbops.getters.get_specific_book_details(JSON_DATA["book_id"],JSON_DATA["organization"])
    if step1:
        return {'status': 'success', 'data': step1}, 200
    return {'status': 'error', 'message': 'No book found'}, 400

@app.route('/api/v1/admin/books/get_unique_book_details', methods=['POST'])
def get_specific_unique_book_details():
    UserDetails=dbops.getters.get_session_by_token(flask.session["Top_Secret_Token"])
    if not UserDetails:
        return flask.redirect(flask.url_for('login_page'))
    if not "get_specific_unique_book_details" in UserDetails["permissions"]:
        return flask.redirect(flask.url_for('login_page'))
    JSON_DATA = flask.request.get_json()
    print(JSON_DATA)
    if JSON_DATA.keys() != {"unique_book_id","organization"}: return {'status': 'error', 'message': 'Missing keys'}, 400
    if int(len(JSON_DATA["unique_book_id"]))<3: return {'status': 'error', 'message': 'Unique ID cannot be negative'}, 400
    if int(len(JSON_DATA["organization"]))<3: return {'status': 'error', 'message': 'Organization cannot be negative'}, 400
    step1=dbops.getters.get_specific_book_details_by_unique_id(JSON_DATA["unique_book_id"],JSON_DATA["organization"])
    if step1:
        return {'status': 'success', 'data': step1}, 200
    return {'status': 'error', 'message': 'No book found'}, 400

    
@app.route('/api/v1/books/get_unique_book_ids', methods=['POST'])
def get_unique_book_ids():
    UserDetails=dbops.getters.get_session_by_token(flask.session["Top_Secret_Token"])
    if not UserDetails:
        return flask.redirect(flask.url_for('login_page'))
    if not "get_unique_book_ids" in UserDetails["permissions"]:
        return flask.redirect(flask.url_for('login_page'))
    JSON_DATA = flask.request.get_json()
    print(JSON_DATA)
    if JSON_DATA.keys() != {"book_id","organization"}: return {'status': 'error', 'message': 'Missing keys'}, 400
    if int(len(JSON_DATA["book_id"]))<3: return {'status': 'error', 'message': 'Book ID cannot be negative'}, 400
    if JSON_DATA["organization"] not in UserDetails["organization"]: return {'status': 'error', 'message': 'Invalid organization'}, 400
    step1=dbops.getters.get_unique_book_ids(JSON_DATA["book_id"],JSON_DATA["organization"])
    if step1:
        return {'status': 'success', 'data': step1}, 200
    return {'status': 'error', 'message': 'No book found'}, 400
@app.route('/api/v1/admin/books/returns/get_unique_book_ids', methods=['POST'])
def get_unique_book_ids_returns():
    UserDetails=dbops.getters.get_session_by_token(flask.session["Top_Secret_Token"])
    if not UserDetails:
        return flask.redirect(flask.url_for('login_page'))
    if not "get_unique_book_ids_returns" in UserDetails["permissions"]:
        return flask.redirect(flask.url_for('login_page'))
    JSON_DATA = flask.request.get_json()
    print(JSON_DATA)
    if JSON_DATA.keys() != {"user_id","organization"}: return {'status': 'error', 'message': 'Missing keys'}, 400
    if int(len(JSON_DATA["user_id"]))<3: return {'status': 'error', 'message': 'User ID cannot be negative'}, 400
    if JSON_DATA["organization"] not in UserDetails["organization"]: return {'status': 'error', 'message': 'Invalid organization'}, 400

    step1=dbops.getters.get_unique_book_ids_returns(JSON_DATA["user_id"],JSON_DATA["organization"])
    if step1:
        return {'status': 'success', 'data': step1}, 200
    return {'status': 'error', 'message': 'No book found'}, 400
    
@app.route('/api/v1/admin/books/edit_book', methods=['POST'])
def admin_edit_book():
    UserDetails=dbops.getters.get_session_by_token(flask.session["Top_Secret_Token"])
    if not UserDetails:
        return {'status': 'error', 'message': 'Invalid token'}, 400
    if not "admin_edit_book" in UserDetails["permissions"]:
        return {'status': 'error', 'message': 'You do not have permission to edit books'}, 400
    Flask_JSON = flask.request.get_json()
    ################### Validation ###################
    expected_keys = ['title', 'author', 'isbn', 'description', 'tags', 'noofcopies', 'organization','book_id']
    common_book_details=dbops.getters.get_specific_book_details(Flask_JSON["book_id"],Flask_JSON["organization"])
    if not common_book_details: return {'status': 'error', 'message': 'Invalid book ID'}, 400
    if list(set(expected_keys) - set(Flask_JSON.keys())) != []: return {'status': 'error', 'message': 'Missing keys'}, 400
    if 200<len(Flask_JSON['title']) < 2: return {'status': 'error', 'message': 'Title too short'}, 400
    if 200<len(Flask_JSON['author']) < 2: return {'status': 'error', 'message': 'Author too short'}, 400
    if 200<len(Flask_JSON['isbn']) < 2: return {'status': 'error', 'message': 'ISBN too short'}, 400
    if 400<len(Flask_JSON['description']) < 2: return {'status': 'error', 'message': 'Description too short'}, 400
    if 200<len(Flask_JSON['tags']) < 1: return {'status': 'error', 'message': 'At least 1 tag required'}, 400
    if Flask_JSON["organization"] not in UserDetails["organization"]: return {'status': 'error', 'message': 'Invalid organization'}, 400
    if type(Flask_JSON['tags'])!=str: return {'status': 'error', 'message': 'Tags must be a string'}, 400
    if int(Flask_JSON['noofcopies']) < int(common_book_details["noofcopies"]) : return {'status': 'error', 'message': 'Number of copies cannot be less than the existing number'}, 400
    ################## End Validation #################
    Flask_JSON["tags"]=Flask_JSON["tags"].split(",")
    Flask_JSON["tags"]=[item.strip() for item in Flask_JSON["tags"]]
    more_copies=int(Flask_JSON['noofcopies'])-int(common_book_details["noofcopies"])
    BOOK_ID=Flask_JSON["book_id"]
    del Flask_JSON["book_id"]
    step1= dbops.inserts.edit_book(Flask_JSON,more_copies,common_book_details,BOOK_ID)
    to_add_into_configs={
        "tags":Flask_JSON["tags"]
    }
    step2= dbops.inserts.add_unique_tags_to_config(to_add_into_configs)
    if step1:
        return {'status': 'success'}, 200
    return {'status': 'error', 'message': 'Internal error'}, 500

        

####################### Admin Endpoints ############################
@app.route('/api/v1/admin/books/register', methods=['POST'])
def register_book():
    UserDetails=dbops.getters.get_session_by_token(flask.session["Top_Secret_Token"])
    if not UserDetails:
        return {'status': 'error', 'message': 'Invalid token'}, 400
    if not "register_book" in UserDetails["permissions"]:
        return {'status': 'error', 'message': 'You do not have permission to register books'}, 400
    Flask_JSON = flask.request.get_json()
    ################### Validation ###################
    expected_keys = ['title', 'author', 'isbn', 'genre', 'description', 'tags', 'noofcopies', 'organization']
    if list(set(expected_keys) - set(Flask_JSON.keys())) != []:
        return {'status': 'error', 'message': 'Missing keys'}, 400
    if 200<len(Flask_JSON['title']) < 2: return {'status': 'error', 'message': 'Title too short'}, 400
    if 200<len(Flask_JSON['author']) < 2: return {'status': 'error', 'message': 'Author too short'}, 400
    if 200<len(Flask_JSON['isbn']) < 2: return {'status': 'error', 'message': 'ISBN too short'}, 400
    if 200<len(Flask_JSON['genre']) < 2: return {'status': 'error', 'message': 'Genre too short'}, 400
    if 400<len(Flask_JSON['description']) < 2: return {'status': 'error', 'message': 'Description too short'}, 400
    if 200<len(Flask_JSON['tags']) < 1: return {'status': 'error', 'message': 'At least 1 tag required'}, 400
    if Flask_JSON["organization"] not in UserDetails["organization"]: return {'status': 'error', 'message': 'Invalid organization'}, 400
    if type(Flask_JSON['tags'])!=str: return {'status': 'error', 'message': 'Tags must be a string'}, 400
    if int(Flask_JSON['noofcopies']) <1 : return {'status': 'error', 'message': 'At least 1 copy required'}, 400
    ################## End Validation #################
    Flask_JSON["status"]="Available"  # Book status changes between Available and Rented . This is the default status.
    Flask_JSON["noofcopies_available_currently"]=int(Flask_JSON["noofcopies"]) # This is the number of copies available for rent.
    Flask_JSON["noofcopies_rented_currently"]=0 # This is the number of copies currently rented.
    Flask_JSON["nooftimes_rented"]=0 # This is the number of times the book has been rented. Purely for statistics.
    Flask_JSON["tags"]=Flask_JSON["tags"] # This is a list of tags for the book. This is used for searching.
     # This is the organization the book belongs to. ########################################################
    check_if_same_book_exists=dbops.getters.get_book_by_parameter("title",Flask_JSON["title"])
    if check_if_same_book_exists: return {'status': 'error', 'message': 'Book already exists'}, 400
    if Flask_JSON["isbn"]!="000": 
        check_if_same_book_exists=dbops.getters.get_book_by_parameter("isbn",Flask_JSON["isbn"])
        if check_if_same_book_exists: return {'status': 'error', 'message': 'Book already exists'}, 400   

    Flask_JSON["tags"]=Flask_JSON["tags"].split(",")
    Flask_JSON["tags"]=[item.strip() for item in Flask_JSON["tags"]]

    step1= dbops.inserts.register_book(Flask_JSON)
    to_add_into_configs={
        # "title":Flask_JSON["title"],
        # "author":Flask_JSON["author"],
        # "isbn":Flask_JSON["isbn"],
        "genre":[Flask_JSON["genre"]],
        "tags":Flask_JSON["tags"]
    }
    step2= dbops.inserts.add_unique_tags_to_config(to_add_into_configs)
    
    if step1:
        return {'status': 'success'}, 200
    return {'status': 'error', 'message': 'Internal error'}, 500

@app.route('/api/v1/admin/books/rent', methods=['POST'])
def admin_rent_book():
    UserDetails=dbops.getters.get_session_by_token(flask.session["Top_Secret_Token"])
    if not UserDetails:
        return {'status': 'error', 'message': 'Invalid token'}, 400
    if not "admin_rent_book" in UserDetails["permissions"]:
        print(UserDetails["permissions"])
        return {'status': 'error', 'message': 'You do not have permission to rent books'}, 400
    Flask_JSON = flask.request.get_json()
    ################### Validation ###################
    expected_keys = ['user_id','unique_book_id','noofdays','organization']
    if list(set(expected_keys) - set(Flask_JSON.keys())) != []:
        return {'status': 'error', 'message': 'Missing keys'}, 400
    if 200<len(Flask_JSON['unique_book_id']) < 2: return {'status': 'error', 'message': 'unique_book_id too short'}, 400
    if 200<len(Flask_JSON['user_id']) < 2: return {'status': 'error', 'message': 'User ID too short'}, 400
    if int(Flask_JSON['noofdays']) <1 : return {'status': 'error', 'message': 'At least 1 day required'}, 400
    if Flask_JSON["organization"] not in UserDetails["organization"]: return {'status': 'error', 'message': 'Invalid organization'}, 400
    ################## End Validation #################
    unique_book_details=dbops.getters.get_specific_book_details_by_unique_id(Flask_JSON["unique_book_id"],Flask_JSON["organization"])
    if unique_book_details["status"]!="Available": return {'status': 'error', 'message': 'Book rented/lost'}, 400
    common_book_details=dbops.getters.get_specific_book_details(unique_book_details["BOOK_ID"],Flask_JSON["organization"])
    if not unique_book_details: return {'status': 'error', 'message': 'Invalid unique book ID'}, 400
    if unique_book_details["status"]=="Rented": return {'status': 'error', 'message': 'Book already rented'}, 400
    if not common_book_details: return {'status': 'error', 'message': 'Invalid book ID'}, 400
    step1= dbops.inserts.rent_book(common_book_details,unique_book_details,Flask_JSON["unique_book_id"], Flask_JSON["user_id"], UserDetails,Flask_JSON["noofdays"],Flask_JSON["organization"])
    if step1:
        return {'status': 'success'}, 200
    return {'status': 'error', 'message': 'Conditions to rent not met. Please check the number of books available or if it is already rented to the said user.'}, 500

@app.route('/api/v1/admin/books/scanner/action', methods=['POST'])
def admin_scanner_actions():
    UserDetails=dbops.getters.get_session_by_token(flask.session["Top_Secret_Token"])
    if not UserDetails:
        return {'status': 'error', 'message': 'Invalid token'}, 400
    if not "admin_scanner_actions" in UserDetails["permissions"]:
        print(UserDetails["permissions"])
        return {'status': 'error', 'message': 'You do not have permission to rent books'}, 400
    Flask_JSON = flask.request.get_json()
    print(Flask_JSON)
    ################### Validation ###################
    expected_keys = ['user_id','unique_book_ids','noofdays','organization']
    if list(set(expected_keys) - set(Flask_JSON.keys())) != []:
        return {'status': 'error', 'message': 'Missing keys'}, 400
    for i in Flask_JSON["unique_book_ids"]:
        if 200<len(i) < 2: return {'status': 'error', 'message': 'unique_book_id too short'}, 400
    if 200<len(Flask_JSON['user_id']) < 2: return {'status': 'error', 'message': 'User ID too short'}, 400
    if int(Flask_JSON['noofdays']) <1 : return {'status': 'error', 'message': 'At least 1 day required'}, 400
    if Flask_JSON["organization"] not in UserDetails["organization"]: return {'status': 'error', 'message': 'Invalid organization'}, 400
    ################## End Validation #################
    for i in Flask_JSON["unique_book_ids"]:
        # Check all book rent status.
        unique_book_details=dbops.getters.get_specific_book_details_by_unique_id(i,Flask_JSON["organization"])
        common_book_details=dbops.getters.get_specific_book_details(unique_book_details["BOOK_ID"],Flask_JSON["organization"])
        if not unique_book_details: return {'status': 'error', 'message': 'Invalid unique book ID'}, 400
        if unique_book_details["status"]=="Rented": 
            step1= dbops.inserts.return_book(i, Flask_JSON["user_id"], Flask_JSON["organization"], unique_book_details)
            if step1:
                continue
            return {'status': 'error', 'message': 'Conditions to return not met. Please make sure the ID and the One who borrowed the book match'}, 500
        if unique_book_details["status"]!="Available": return {'status': 'error', 'message': 'Book already rented'}, 400
        if not common_book_details: return {'status': 'error', 'message': 'Invalid book ID'}, 400
        step1= dbops.inserts.rent_book(common_book_details,unique_book_details,i, Flask_JSON["user_id"], UserDetails,Flask_JSON["noofdays"],Flask_JSON["organization"])
        if not step1:
                return {'status': 'error', 'message': 'Conditions to rent not met. Please check the number of books available or if it is already rented to the said user.'}, 500
    return {'status': 'success'}, 200

@app.route('/api/v1/admin/get_specific_user_details_with_books_rented', methods=['GET'])
def get_specific_user_details_with_books_rented():
    UserDetails=dbops.getters.get_session_by_token(flask.session["Top_Secret_Token"])
    if not UserDetails:
        return {'status': 'error', 'message': 'Invalid token'}, 400
    if not "get_specific_user_details_with_books_rented" in UserDetails["permissions"]:
        return {'status': 'error', 'message': 'You do not have permission to get user details'}, 400
    user_specification=flask.request.args.get('user_specification')
    if not user_specification: return {'status': 'error', 'message': 'User specification not provided'}, 400
    if not user_specification in ["username","email","id_number"]: return {'status': 'error', 'message': 'Invalid user specification'}, 400
    user_value=flask.request.args.get('user_value')
    if not user_value: return {'status': 'error', 'message': 'User value not provided'}, 400
    if user_value=="": return {'status': 'error', 'message': 'User value cannot be empty'}, 400
    step1=dbops.getters.get_specific_user_details_with_books_rented(
        user_specification,user_value
    )
    if step1:
        return {'status': 'success', 'data': step1}, 200
    return {'status': 'error', 'message': 'No users found'}, 400



@app.route('/api/v1/admin/get_book_tags', methods=['GET'])
def get_book_tags():
    UserDetails=dbops.getters.get_session_by_token(flask.session["Top_Secret_Token"])
    if not UserDetails:
        return {'status': 'error', 'message': 'Invalid token'}, 400
    if not "get_book_tags" in UserDetails["permissions"]:
        return {'status': 'error', 'message': 'You do not have permission to get book tags'}, 400
    book_tag_parameter=flask.request.args.get('book_tag_parameter')
    if not book_tag_parameter: return {'status': 'error', 'message': 'Book tag parameter not provided'}, 400
    if not book_tag_parameter in ["genre","tags"]: return {'status': 'error', 'message': 'Invalid book tag parameter'}, 400
    book_tag_parameters=dbops.getters.get_book_tags(book_tag_parameter)
    if book_tag_parameters:
        return {'status': 'success', 'options': book_tag_parameters}, 200
    return {'status': 'success', 'options': []}, 200

@app.route('/api/v1/admin/return_book', methods=['POST'])
def admin_return_book():
    UserDetails=dbops.getters.get_session_by_token(flask.session["Top_Secret_Token"])
    if not UserDetails:
        return {'status': 'error', 'message': 'Invalid token'}, 400
    if not "admin_return_book" in UserDetails["permissions"]:
        return {'status': 'error', 'message': 'You do not have permission to return books'}, 400
    Flask_JSON = flask.request.get_json()
    ################### Validation ###################
    expected_keys = ['unique_book_id', 'user_id','organization']
    if list(set(expected_keys) - set(Flask_JSON.keys())) != []:
        return {'status': 'error', 'message': 'Missing keys'}, 400
    if 200<len(Flask_JSON['unique_book_id']) < 2: return {'status': 'error', 'message': 'Unique Book ID too short'}, 400
    if 200<len(Flask_JSON['user_id']) < 2: return {'status': 'error', 'message': 'User ID too short'}, 400
    if Flask_JSON["organization"] not in UserDetails["organization"]: return {'status': 'error', 'message': 'Invalid organization'}, 400
    ################## End Validation #################
    unique_book_object=dbops.getters.get_specific_book_details_by_unique_id(Flask_JSON["unique_book_id"],Flask_JSON["organization"])
    if not unique_book_object: return {'status': 'error', 'message': 'Invalid unique book ID'}, 400
    step1= dbops.inserts.return_book(Flask_JSON["unique_book_id"], Flask_JSON["user_id"], Flask_JSON["organization"], unique_book_object)
    if step1:
        return {'status': 'success'}, 200
    return {'status': 'error', 'message': 'Conditions to return not met. Please check the number of books available or if it is already rented to the said user.'}, 500

@app.route('/api/v1/normal/return_books', methods=['POST'])
def normal_return_book():
    pass


#################### End Admin Endpoints ##########################

@app.route('/api/v1/get_book_list', methods=['POST'])
def get_book_list():
    UserDetails=dbops.getters.get_session_by_token(flask.session["Top_Secret_Token"])
    if not UserDetails:
        return {'status': 'error', 'message': 'Invalid token'}, 400
    if not "get_book_list" in UserDetails["permissions"]:
        print(UserDetails["permissions"])
        return {'status': 'error', 'message': 'You do not have permission to get book list'}, 400
    JSON_DATA = flask.request.get_json()
    if JSON_DATA.keys() != {"skip","limit","special_filter","organization"}: return {'status': 'error', 'message': 'Missing keys'}, 400
    skip=JSON_DATA["skip"]
    limit=JSON_DATA["limit"]
    ##################################################################################################################SCARY BUG ALERT####################################################################################################
    if JSON_DATA["organization"] not in UserDetails["organization"]: return {'status': 'error', 'message': 'Invalid organization'}, 400
    ##################################################################################################################SCARY BUG ALERT####################################################################################################
    if int(skip)<0: return {'status': 'error', 'message': 'Skip cannot be negative'}, 400
    if int(limit)<0: return {'status': 'error', 'message': 'Limit cannot be negative'}, 400
    step1=dbops.getters.get_book_list(skip,limit,JSON_DATA["organization"])
    # special_step=dbops.getters.get_book_list_special(special_filter)
    if step1:
        return {'status': 'success', 'data': step1}, 200
    return {'status': 'error', 'message': 'No books found'}, 400



@app.route('/api/v1/get_book_list_special', methods=['POST'])
def get_book_list_special_filter():
    UserDetails=dbops.getters.get_session_by_token(flask.session["Top_Secret_Token"])
    if not UserDetails:
        return {'status': 'error', 'message': 'Invalid token'}, 400
    if not "get_book_list" in UserDetails["permissions"]:
        print(UserDetails["permissions"])
        return {'status': 'error', 'message': 'You do not have permission to get book list'}, 400
    JSON_DATA = flask.request.get_json()
    if JSON_DATA.keys() != {"skip","limit","special_filter","organization"}: return {'status': 'error', 'message': 'Missing keys'}, 400
    skip=JSON_DATA["skip"]
    limit=JSON_DATA["limit"]
    ##################################################################################################################SCARY BUG ALERT####################################################################################################
    special_filter=JSON_DATA["special_filter"]
    if special_filter.keys() != {"search_string","generic","tags","time","status"}: return {'status': 'error', 'message': 'Missing keys'}, 400
    if int(len(special_filter["generic"]))<1: return {'status': 'error', 'message': 'Generic cannot be negative'}, 400
    if special_filter["time"] not in ["asc","desc"]: return {'status': 'error', 'message': 'Time cannot be negative'}, 400
    if special_filter["status"] not in ["Available","Rented","All"]: return {'status': 'error', 'message': 'Status cannot be negative'}, 400
    if JSON_DATA["organization"] not in UserDetails["organization"]: return {'status': 'error', 'message': 'Invalid organization'}, 400
    ##################################################################################################################SCARY BUG ALERT####################################################################################################
    if int(skip)<0: return {'status': 'error', 'message': 'Skip cannot be negative'}, 400
    if int(limit)<0: return {'status': 'error', 'message': 'Limit cannot be negative'}, 400
    print(special_filter)
    step1=dbops.getters.get_book_list_special(
        skip,
        limit,
        {},
        -1,
        special_filter["search_string"],    
        special_filter["generic"],
        special_filter["tags"],
        JSON_DATA["organization"],
    )
    if step1:
        return {'status': 'success', 'data': step1}, 200
    return {'status': 'error', 'message': 'No books found'}, 400




if __name__ == '__main__':
    app.run(host='0.0.0.0', port=config.RUNNINGPORT, debug=True)
