from flask import request, Blueprint
from app.models.user import User
from app.database import bcrypt
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token, create_refresh_token

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/login", methods=["POST"])
def login():
    username = request.json.get("username")
    password = request.json.get("password")
    print(username, password)

    if not username or not password:
        return {"message": "username or password missing"}, 404
    try:
        user = User.find_user_by_username(username)
        print("user:", user)
        if user and bcrypt.check_password_hash(user["password"], password):
            print("1",str(user["_id"]))
            access_token = create_access_token(identity=str(user["_id"]), fresh=True)
            refresh_token = create_refresh_token(identity=str(user["_id"]))
            return {"message": "User logged in", "access_token": access_token, "refresh_token": refresh_token}, 200
        else:
            return {"message": "Incorrect password"}, 400
    except Exception as e:
        print("Error logging in:", str(e))
        return {"message": "Error logging in", "error": str(e)}, 500


@auth_bp.route("/register", methods=["POST"])
def register():
    username = request.json.get("username")
    password = request.json.get("password")

    if not username or not password:
        return {"message": "username or password missing"}, 404
    
    if User.find_user_by_username(username):
        return {"message": "User with username already exists"}, 401

    try:
        user_id = User.create_user(username, password)
        if not user_id:
            return {"message": "Error registering user"}, 500
        
        access_token = create_access_token(identity=user_id, fresh=True)
        refresh_token = create_refresh_token(identity=user_id)

        return {"message": "User registered succesfully", "access_token": access_token, "refresh_token": refresh_token}, 200

    except Exception as e:
        print("Error registering user", str(e))
        return {"message": "Error registering user", "error": str(e)}, 500