from .auth import auth_bp
from .organizations import orgs_bp
from .events import events_bp
from .user import user_bp

def register_blueprints(app):
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(orgs_bp, url_prefix="/org")
    app.register_blueprint(events_bp, url_prefix="/event")
    app.register_blueprint(user_bp, url_prefix="/user")