from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from app.models.events import Events
from datetime import datetime, timezone

events_bp = Blueprint("events", __name__)

@events_bp.route("/", methods=["GET"])
def get_events():
    try:
        events = Events.get_events()
        print(events)
        return {"message": "Events fetched succesfully", "events": events}, 200
    except Exception as e:
        print("Error fetching events", str(e))
        return {"message": "Error fetching events", "error": str(e)}, 500

@events_bp.route("/create", methods=["POST"])
@jwt_required()
def create_event():
    name = request.json.get("title")
    description = request.json.get("description")
    start_time = request.json.get("startTime")
    end_time = request.json.get("endTime")
    latitude = request.json.get("latitude")
    longitude = request.json.get("longitude")
    org_id = request.json.get("organizationId")
    user_id = get_jwt_identity()
    try:
        start_date_time_obj = datetime.fromisoformat(start_time)
        end_date_time_obj = datetime.fromisoformat(end_time)
        new_event = Events.create_event(user_id, name, description, start_date_time_obj, end_date_time_obj, latitude, longitude, org_id)
        print("new event:", new_event)
        if not new_event:
            return {"message": "Error making event"}, 500
        return {"message": "Event created succesfully", "event": new_event}, 200
    except Exception as e:
        print("error creating event", str(e))
        return {"message": "Error creating event"}, 500
    

@events_bp.route("/attend", methods=["POST"])
@jwt_required()
def attend_event():
    user_id = get_jwt_identity()
    event_id = request.json.get("event")
    action = request.json.get("action")
    print(user_id, event_id, action)
    try:
        attend = Events.attend_event(user_id, event_id, action)
        print(attend)
        if not attend:
            return {"message": "Error attend event"}, 500
        return {"message": "attend event", "updated": attend}, 200
    except Exception as e:
        print("Error attend event:", str(e))
        return {"message": "Error attend event"}, 500


@events_bp.route("/attending", methods=["GET"])
@jwt_required()
def get_attending_events():
    user_id = get_jwt_identity()
    print(1)
    try:
        events = Events.get_attending_events(user_id)
        print(events)
        return {"message": "Fetched attending events", "events": events}, 200
    except Exception as e:
        print("error:", str(e))
        return {"message": "Error fetching atttending events"}, 500

@events_bp.route("status/<event_id>", methods=["GET"])
@jwt_required()
def get_attending_status(event_id):
    user_id = get_jwt_identity()
    try:
        status = Events.get_attending_status(user_id, event_id)
        return {"message": "Fetched status", "status": status}, 200
    except Exception as e:
        return {"message": "Error fetching atttending events"}, 500
