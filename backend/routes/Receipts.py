from flask import Blueprint, request, jsonify
from datetime import datetime

api = Blueprint("api", __name__)

receipts = []

@api.post("/receipts")
def add_receipt():
    data = request.get_json() or {}
    data["id"] = len(receipts) + 1
    data["timestamp"] = datetime.now().isoformat()
    receipts.append(data)
    print(data)
    return jsonify({"message":"Receipt Added"}, 201)

@api.get("/receipts")
def get_receipts():
    return jsonify(receipts)
