import flask
import dbops
import config
app = flask.Flask(__name__)


@app.route('/')
def index():
    return flask.render_template('home.html')

@app.route('/api/v1/user/register', methods=['POST'])
def register():
    Flask_JSON = flask.request.get_json()
    ################### Validation ###################
    expected_keys = ['username', 'password', 'email']
    if list(set(expected_keys) - set(Flask_JSON.keys())) != []:
        return {'status': 'error', 'message': 'Missing keys'}, 400
    if 20<len(Flask_JSON['username']) < 2: return {'status': 'error', 'message': 'Username too short'}, 400
    if 50<len(Flask_JSON['password']) < 2: return {'status': 'error', 'message': 'Password too short'}, 400
    if 50<len(Flask_JSON['email']) < 2: return {'status': 'error', 'message': 'Email too short'}, 400
    if not '@' in Flask_JSON['email']: return {'status': 'error', 'message': 'Invalid email'}, 400
    if not '.' in Flask_JSON['email']: return {'status': 'error', 'message': 'Invalid email'}, 400
    ################## End Validation #################
    Flask_JSON["Role"]="Student"
    Flask_JSON["password"]=dbops.enco(Flask_JSON["password"])
    Flask_JSON["permissions"]=[]
    step1= dbops.inserts.register_new_user(Flask_JSON)
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
    Flask_JSON["password"]=dbops.enco(Flask_JSON["password"])
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

if __name__ == '__main__':
    app.run(host='localhost', port=80, debug=True)
