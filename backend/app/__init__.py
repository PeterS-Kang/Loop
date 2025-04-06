from flask import Flask
from flask_cors import CORS
from flask_restful import Api

from app.config import Config
from app.blueprints import register_blueprints
from app.database import mongo
from app.extensions import jwt

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS
    CORS(app, supports_credentials=True, allow_headers=["Authorization", "Content-Type"])

    # TODO init JWT
    jwt.init_app(app)

    # TODO init mongo
    mongo.init_app(app)

    # Create rest api
    api = Api(app)

    # Register API resources
    register_blueprints(app)

    return app