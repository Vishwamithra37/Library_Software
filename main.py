import flask
import dbops
import config



app = flask.Flask(__name__)
app.secret_key = config.SESSION_ENCRYPTING_KEY


@app.route('/login')
def index():
    return flask.render_template('login.html')

@app.route('/register')
def register2():
    pass

@app.route('/login')
def login2():
    pass

@app.route('/dashboard')
def dashboard():
    pass

@app.route('/profile')
def profile():
    pass

@app.route('/books')
def books():
    pass

# Genric frontend #

####################### User Endpoints ############################
@app.route('/api/v1/user/register', methods=['POST'])
def register():
    Flask_JSON = flask.request.get_json()
    ################### Validation ###################
    expected_keys = ['username', 'password', 'email','id_number']
    if list(set(expected_keys) - set(Flask_JSON.keys())) != []:
        return {'status': 'error', 'message': 'Missing keys'}, 400
    if 20<len(Flask_JSON['username']) < 2: return {'status': 'error', 'message': 'Username too short'}, 400
    if 50<len(Flask_JSON['password']) < 2: return {'status': 'error', 'message': 'Password too short'}, 400
    if 50<len(Flask_JSON['email']) < 2: return {'status': 'error', 'message': 'Email too short'}, 400
    if not '@' in Flask_JSON['email']: return {'status': 'error', 'message': 'Invalid email'}, 400
    if not '.' in Flask_JSON['email']: return {'status': 'error', 'message': 'Invalid email'}, 400
    if 50<len(Flask_JSON['id_number']) < 2: return {'status': 'error', 'message': 'ID Number too short'}, 400
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

@app.route('/api/v1/users/get_user_list', methods=['GET'])
def get_user_list():
    UserDetails=dbops.getters.get_session_by_token(flask.session["Top_Secret_Token"])
    if not UserDetails:
        return {'status': 'error', 'message': 'Invalid token'}, 400
    if not "get_user_list" in UserDetails["permissions"]:
        return {'status': 'error', 'message': 'You do not have permission to get user list'}, 400
    skip=flask.request.args.get('skip')
    limit=flask.request.args.get('limit')
    if int(skip)<0: return {'status': 'error', 'message': 'Skip cannot be negative'}, 400
    if int(limit)<0: return {'status': 'error', 'message': 'Limit cannot be negative'}, 400
    step1=dbops.getters.get_user_list()
    if step1:
        return {'status': 'success', 'data': step1}, 200
    return {'status': 'error', 'message': 'No users found'}, 400

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
    expected_keys = ['title', 'author', 'isbn', 'genre', 'description', 'tags', 'noofcopies']
    if list(set(expected_keys) - set(Flask_JSON.keys())) != []:
        return {'status': 'error', 'message': 'Missing keys'}, 400
    if 200<len(Flask_JSON['title']) < 2: return {'status': 'error', 'message': 'Title too short'}, 400
    if 200<len(Flask_JSON['author']) < 2: return {'status': 'error', 'message': 'Author too short'}, 400
    if 200<len(Flask_JSON['isbn']) < 2: return {'status': 'error', 'message': 'ISBN too short'}, 400
    if 200<len(Flask_JSON['genre']) < 2: return {'status': 'error', 'message': 'Genre too short'}, 400
    if 400<len(Flask_JSON['description']) < 2: return {'status': 'error', 'message': 'Description too short'}, 400
    if 200<len(Flask_JSON['tags']) < 1: return {'status': 'error', 'message': 'At least 1 tag required'}, 400
    if int(Flask_JSON['noofcopies']) <1 : return {'status': 'error', 'message': 'At least 1 copy required'}, 400
    ################## End Validation #################
    Flask_JSON["status"]="Available"  # Book status changes between Available and Rented . This is the default status.
    Flask_JSON["noofcopies_available_currently"]=int(Flask_JSON["noofcopies"]) # This is the number of copies available for rent.
    Flask_JSON["noofcopies_rented_currently"]=0 # This is the number of copies currently rented.
    Flask_JSON["nooftimes_rented"]=0 # This is the number of times the book has been rented. Purely for statistics.
    Flask_JSON["tags"]=Flask_JSON["tags"] # This is a list of tags for the book. This is used for searching.
    step1= dbops.inserts.register_book(Flask_JSON)
    if step1:
        return {'status': 'success'}, 200
    return {'status': 'error', 'message': 'Internal error'}, 500

@app.route('/api/v1/admin/books/rent', methods=['POST'])
def admin_rent_book():
    UserDetails=dbops.getters.get_session_by_token(flask.session["Top_Secret_Token"])
    if not UserDetails:
        return {'status': 'error', 'message': 'Invalid token'}, 400
    if not "admin_rent_book" in UserDetails["permissions"]:
        return {'status': 'error', 'message': 'You do not have permission to rent books'}, 400
    Flask_JSON = flask.request.get_json()
    ################### Validation ###################
    expected_keys = ['book_id', 'user_id']
    if list(set(expected_keys) - set(Flask_JSON.keys())) != []:
        return {'status': 'error', 'message': 'Missing keys'}, 400
    if 200<len(Flask_JSON['book_id']) < 2: return {'status': 'error', 'message': 'Book ID too short'}, 400
    if 200<len(Flask_JSON['user_id']) < 2: return {'status': 'error', 'message': 'User ID too short'}, 400
    ################## End Validation #################
    step1= dbops.inserts.rent_book(Flask_JSON["book_id"], Flask_JSON["user_id"], UserDetails["username"])
    if step1:
        return {'status': 'success'}, 200
    return {'status': 'error', 'message': 'Conditions to rent not met. Please check the number of books available or if it is already rented to the said user.'}, 500

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


#################### End Admin Endpoints ##########################

@app.route('/api/v1/get_book_list', methods=['GET'])
def get_book_list():
    UserDetails=dbops.getters.get_session_by_token(flask.session["Top_Secret_Token"])
    if not UserDetails:
        return {'status': 'error', 'message': 'Invalid token'}, 400
    if not "get_book_list" in UserDetails["permissions"]:
        return {'status': 'error', 'message': 'You do not have permission to get book list'}, 400
    skip=flask.request.args.get('skip')
    limit=flask.request.args.get('limit')
    if int(skip)<0: return {'status': 'error', 'message': 'Skip cannot be negative'}, 400
    if int(limit)<0: return {'status': 'error', 'message': 'Limit cannot be negative'}, 400
    step1=dbops.getters.get_book_list()
    if step1:
        return {'status': 'success', 'data': step1}, 200
    return {'status': 'error', 'message': 'No books found'}, 400





if __name__ == '__main__':
    app.run(host='localhost', port=80, debug=True)
