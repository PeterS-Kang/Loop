from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from app.models.organizations import Organizations

orgs_bp = Blueprint("org", __name__)

@orgs_bp.route("/", methods=["GET"])
def get_orgs():
    try:
        orgs = Organizations.get_organizations()
        print(orgs)
        return {"message": "Organizations fetched succesfully", "organizations": orgs}, 200
    except Exception as e:
        return {"message": "Error fetching organizations", "error": str(e)}, 500


@orgs_bp.route("/user", methods=["GET"])
@jwt_required()
def get_orgs_by_user():
    try:
        user_id = get_jwt_identity()
        orgs = Organizations.get_organizations_by_user(user_id)
        print(orgs)
        return {"message": "Organizations fetched succesfully", "organizations": orgs}, 200
    except Exception as e:
        return {"message": "Error fetching organizations", "error": str(e)}, 500

@orgs_bp.route("/create", methods=["POST"])
@jwt_required()
def create_org():
    name = request.json.get("name")
    description = request.json.get("description")
    print(name, description)
    user_id = get_jwt_identity()
    try:
        new_org = Organizations.create_organization(user_id, name, description)
        if not new_org:
            return {"message": "Error making organization"}, 500
        return {"message": "Organization created succesfully", "organization": new_org}, 200
    except Exception as e:
        print("error creating org", str(e))
        return {"message": "Error creating organization"}, 500
    
