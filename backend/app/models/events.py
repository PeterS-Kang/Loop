from app.database import mongo
from bson import ObjectId

from app.models.utils import Utils

class Events:
    @staticmethod
    def get_events():
        pipeline = [
            {
                '$lookup': {
                    'from': 'organizations', # The collection to join with
                    'localField': 'org_id', # Field from the 'events' collection
                    'foreignField': '_id', # Field from the 'organizations' collection (usually _id)
                    'as': 'organizationInfo' # Name of the new array field to add
                }
            },
            {
                '$unwind': {
                    'path': '$organizationInfo',
                    'preserveNullAndEmptyArrays': True # Keep events even if org not found
                }
            },
            {
                '$project': {
                    # Include all original event fields (use field names explicitly or find a shorter way if many)
                    'name': 1,
                    'description': 1,
                    'start_time': 1, # Assuming snake_case based on user's last input
                    'end_time': 1,   # Assuming snake_case
                    'location': 1,
                    'organizationName': '$organizationInfo.name', # Get name from joined doc
                }
            },
            {
                 '$sort': { 'start_time': 1 }
            }
        ]

        events = mongo.db.events.aggregate(pipeline)
        return list(events)

    @staticmethod
    def get_event_by_id(event_id):
        return mongo.db.events.find_one({"_id": event_id})

    @staticmethod
    def create_event(user_id, name, description, start_time, end_time, latitude, longitude, org_id):
        event = {
            "owner": user_id,
            "name": name,
            "description": description,
            "start_time": start_time,
            "end_time": end_time,
            "location": {
                "type": "Point",
                "coordinates": [latitude, longitude]
            },
            "org_id": org_id
        }

        id = mongo.db.events.insert_one(event).inserted_id
        return Events.get_event_by_id(id)

    @staticmethod
    def attend_event(user_id, event_id, action):
        user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
        event = mongo.db.events.find_one({"_id": ObjectId(event_id)})
        if not user or not event:
            print(4)
            return False

        if action:
            print(4)
            if user.get("attending_events", None) and ObjectId(event_id) in user["attending_events"]:
                print(1)
                return False
            
            print(5)
            if event.get("attending_members", None) and ObjectId(user_id) in event["attending_members"]:
                print(2)
                return False
            
            print(3)
            mongo.db.users.update_one(
                {"_id": ObjectId(user_id)},
                {"$addToSet": {
                    "attending_events": ObjectId(event_id)
                }}
            )

            mongo.db.events.update_one(
                {"_id": ObjectId(event_id)},
                {"$addToSet": {
                    "attending_members": ObjectId(user_id)
                }}
            )

            return True
        else:
            print(5)
            mongo.db.users.update_one(
                {"_id": ObjectId(user_id)},
                {"$pull": {
                    "attending_events": ObjectId(event_id)
                }}
            )

            mongo.db.events.update_one(
                {"_id": ObjectId(event_id)},
                {"$pull": {
                    "attending_members": ObjectId(user_id)
                }}
            )

            return True


    @staticmethod
    def get_attending_events(user_id):
        pipeline = [
            {
                '$match': {
                    '_id': ObjectId(user_id) # Assumes user_object_id is a valid ObjectId
                }
            },
            {
                '$lookup': {
                    'from': 'events',
                    'localField': 'attending_events', # Verify this field name in 'users' collection
                    'foreignField': '_id',
                    'as': 'attendedEventObjects'
                }
            },
            {
                '$project': {
                    '_id': 0,
                    'events': '$attendedEventObjects'
                }
            }
        ]
        events = mongo.db.users.aggregate(pipeline)
        return list(events)[0]

    def get_attending_status(user_id, event_id):
        event = mongo.db.events.find_one({"_id": ObjectId(event_id)})
        if not event:
            return False
        
        if event.get("attending_members", None):
            if ObjectId(user_id) in event["attending_members"]:
                return True
            return False
        return False