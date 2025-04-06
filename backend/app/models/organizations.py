from app.database import mongo
from bson import ObjectId

class Organizations:
    @staticmethod
    def get_organizations():
        orgs = mongo.db.organizations.find()
        return list(orgs)

    @staticmethod
    def get_organization_by_id(org_id):
        orgs = mongo.db.organizations.find_one({"_id": org_id})
        return list(orgs)

    @staticmethod
    def get_organizations_by_user(user_id):
        org = mongo.db.organizations.find({"owner": user_id})
        return org

    @staticmethod
    def create_organization(user_id, name, description):
        organization = {
            "owner": user_id,
            "name": name,
            "description": description
        }

        id = mongo.db.organizations.insert_one(organization).inserted_id
        return Organizations.get_organization_by_id(id)

