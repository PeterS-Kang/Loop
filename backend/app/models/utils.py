from datetime import datetime, timezone

class Utils:
    @staticmethod
    def serialize_document(doc):
        if doc is None:
            return None
        serialized = {}
        for key, value in doc.items():
            if key == '_id':
                serialized[key] = str(value) # Convert ObjectId to string
            elif isinstance(value, datetime):
                serialized[key] = value.isoformat()
            else:
                serialized[key] = value
        return serialized