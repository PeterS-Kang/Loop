import os
from dotenv import load_dotenv

load_dotenv(".env")

class Config():
    """ base configuration """
    
    # General flask config
    SECRET_KEY = os.getenv("SECRET_KEY", "default_secret_key")
    DEBUG = os.getenv("DEBUG", "False").lower() == "true"
    TESTING = False

    #MongoDB config
    MONGO_URI = os.getenv("ATLAS_URI", "default_mongo_uri")

    #JWT Config
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "default_jwt_secret_key")
    JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", 3600))
    JWT_REFRESH_TOKEN_EXPIRES = int(os.getenv("JWT_REFRESH_TOKEN_EXPIRES", 86400))