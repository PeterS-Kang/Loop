from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from app.models.events import Events
from datetime import datetime, timezone

user_bp = Blueprint("user", __name__)

user_bp.route("/events", methods=["GET"])
@jwt_required()
def get_attending_events():
    user_id = get_jwt_identity()
    print(1, "user_id", user_id)
    try:
        events = Events.get_attending_events(user_id)
        return {"message": "Fetched attending events", "events": events}, 200
    except Exception as e:
        return {"message": "Error fetching atttending events"}, 500