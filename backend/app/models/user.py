from app.database import mongo, bcrypt
from bson import ObjectId

class User:
    """User Model to interact with MongoDB"""

    @staticmethod
    def create_user(username, password):
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        user = {
            "username": username,
            "password": hashed_password
        }
        user_id = mongo.db.users.insert_one(user).inserted_id
        return str(user_id)


    @staticmethod
    def find_user_by_id(user_id):
        user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
        return user

    @staticmethod
    def find_user_by_username(username):
        print(username)
        user = mongo.db.users.find_one({"username": username})
        return user