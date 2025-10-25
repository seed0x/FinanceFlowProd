from flask import Blueprint, request, jsonify, session
from datetime import datetime
from storage import receipts 

transactions_bp = Blueprint("transactions", __name__)



@transactions_bp.route('/transactions', methods=['POST'])
def add_receipt():
    print(f"[TRANSACTION] Session received: {session}")  # Debug
    
    if 'user' not in session:
        print("[TRANSACTION] ERROR: No user in session!")  # Debug
        return {'error': 'Not logged in'}, 401
    
    current_user = session['user']
    print(f"[TRANSACTION] User found: {current_user}")  # Debug
    data = request.get_json() or {}
    
    # This is the data front needs to reieve to store its state memory
    new_transaction = {
        "user": current_user,
        "id": len(receipts) + 1,
        "timestamp": datetime.now().isoformat(),
        "amount": data.get('amount'),
        "description": data.get('description'),
        "category": data.get('category'),
        "type": data.get('type')
        
    }
    receipts.append(new_transaction)
    print(new_transaction)
    return jsonify({"transaction": new_transaction}), 201

@transactions_bp.get("/transactions")
def get_receipts():

    receipts_for_user = []
    for r in receipts:
        if r.get("user") == session.get("user"):
            receipts_for_user.append(r)
    
    print(f"[TRANSACTION] Returning receipts for user {session.get('user')}: {receipts_for_user}")  # Debug
    return jsonify({'transactions':receipts_for_user}), 200
