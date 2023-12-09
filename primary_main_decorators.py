import dbops
import flask
from functools import wraps

def general_user_power_verification(route_function):
    @wraps(route_function)
    def wrapper_function(*args, **kwargs):
        UserDetails=dbops.getters.get_session_by_token(flask.session["Top_Secret_Token"])
        power_name=route_function.__name__
        if not UserDetails:
            return {"status":"error", "message": "Invalid token"},400
        if not power_name in UserDetails["permissions"]:
            # print(power_name)
            # print(UserDetails["permissions"])
            return {"status":"error", "message": "You do not have permission to get rented book list"},400
        return route_function(*args, **kwargs, UserDetails=UserDetails)
    return wrapper_function

def page_access_general_user_power_verification(route_function):
    @wraps(route_function)
    def wrapper_function(*args, **kwargs):
        UserDetails=dbops.getters.get_session_by_token(flask.session["Top_Secret_Token"])
        power_name=route_function.__name__
        if not UserDetails:
            return {"status":"error", "message": "Invalid token"},400
        if not power_name in UserDetails["permissions"]:
            return {"status":"error", "message": "You do not have permission to get rented book list"},400
        return route_function(*args, **kwargs, UserDetails=UserDetails)
    return wrapper_function