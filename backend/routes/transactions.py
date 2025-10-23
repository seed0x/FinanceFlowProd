from flask import Blueprint, request, jsonify, session
from datetime import datetime

transactions_bp = Blueprint("transactions", __name__)

receipts = []

@transactions_bp.post('api/transactions')
def add_receipt():
    
    if 'user' not in session:
        return {'error': 'Not logged in'}, 401
    
    current_user = session['user']
    
    data = request.get_json() or {}
    
    data["user"] = current_user
    data["id"] = len(receipts) + 1
    data["timestamp"] = datetime.now().isoformat()
    receipts.append(data)
    print(data)
    return jsonify({"message":"Transaction Added"}, 201)

@transactions_bp.get("/transactions")
def get_receipts():
    return jsonify(receipts)
