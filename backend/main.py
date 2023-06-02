import flask
import dbops
import config



app = flask.Flask(__name__)
app.secret_key = config.SESSION_ENCRYPTING_KEY




@app.route('/')
def index():
    return flask.render_template('home.html')

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
    Flask_JSON["permissions"]=[]
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
        step2=dbops.inserts.create_session_token(step1)
        if step2:
            r1=dbops.enco(str(step1["_id"]))
            flask.session["Top_Secret_Token"] = r1
            flask.session.permanent = True
            return {'status': 'success', 'token': step2}, 200
        return {'status': 'error', 'message': 'Internal error'}, 500
    return {'status': 'error', 'message': 'Invalid credentials'}, 400

@app.route('/api/v1/books/register', methods=['POST'])
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
    if int(Flask_JSON['noofcopies']) < 1: return {'status': 'error', 'message': 'At least 1 copy required'}, 400
    if Flask_JSON['noofcopies'].isdigit(): return {'status': 'error', 'message': 'Invalid noofcopies'}, 400
    ################## End Validation #################
    Flask_JSON["status"]="Available"
    Flask_JSON["noofcopies_available_currently"]=int(Flask_JSON["noofcopies"])
    Flask_JSON["noofcopies_rented_currently"]=0
    Flask_JSON["nooftimes_rented"]=0
    Flask_JSON["tags"]=Flask_JSON["tags"].split(",")
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
    return {'status': 'error', 'message': 'Internal error'}, 500



if __name__ == '__main__':
    app.run(host='localhost', port=80, debug=True)
