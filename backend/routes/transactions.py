from datetime import date, datetime
from decimal import Decimal
from flask import Blueprint, request, jsonify
from db import db
from models import Transaction, Account
from auth_middleware import token_required

transactions_bp = Blueprint("transactions", __name__)

def _to_dict(t: Transaction, username=None):
    # include everything UI might render
    return {
        "id": t.id,
        "date": t.date.isoformat(),
        "description": t.description or "",
        "category": t.category,
        "amount": float(t.amount),
        "merchant": t.merchant,
        "type": ("income" if t.amount and float(t.amount) > 0 else "expense"),
        "timestamp": t.date.isoformat(),  # Use actual transaction date, not created_at
        "user": username,
    }
#--------------------------------------------------------------------------------------------
@transactions_bp.get("/transactions")
@token_required
def list_transactions(current_user_id, current_username):
    print(f"Fetching transactions for user={current_username}, user_id={current_user_id}")  # Debug
    items = (Transaction.query
             .filter_by(user_id=current_user_id)
             .order_by(Transaction.date.desc(), Transaction.id.desc())
             .all())
    print(f"Found {len(items)} transactions")  # Debug
    return jsonify({"transactions": [_to_dict(t, current_username) for t in items]}), 200

#-------------------------------------------------------------------------------------------
@transactions_bp.post("/transactions")
@token_required
def create_transaction(current_user_id, current_username):
    data = request.get_json() or {}

    d_str = data.get("date")
    d = date.fromisoformat(d_str) if d_str else date.today()

    try:
        amt = Decimal(str(data["amount"]))
    except Exception:
        return {"error": "Invalid amount"}, 400

    #Normalize sign based on optional 'type' from UI
    tx_type = (data.get("type") or "").lower()
    if tx_type == "expense" and amt > 0:
        amt = -amt
    if tx_type == "income" and amt < 0:
        amt = -amt

    t = Transaction(
        user_id=current_user_id,
        date=d,
        description=data.get("description"),
        category=(data.get("category") or "Other"),
        amount=amt,
        merchant=data.get("merchant"),
        account_id=data.get("account_id") if data.get("account_id") else None,
    )
    db.session.add(t)
    db.session.commit()

    return jsonify({"transaction": _to_dict(t, current_username)}), 201

#--------------------------------------------------------------------------------------------
# PUT /api/transactions/<id>
@transactions_bp.put("/transactions/<int:transaction_id>")
@token_required
def update_transaction(current_user_id, current_username, transaction_id):
    t = Transaction.query.filter_by(id=transaction_id, user_id=current_user_id).first()
    
    if not t:
        return {"error": "Transaction not found"}, 404
    
    data = request.get_json() or {}
    
    # Only allow category updates
    if "category" in data:
        t.category = data.get("category") or "Other"
    else:
        return {"error": "Category is required"}, 400
    
    db.session.add(t)
    db.session.commit()
    
    return jsonify({"transaction": _to_dict(t, current_username)}), 200

#--------------------------------------------------------------------------------------------
# DELETE /api/transactions/<id>
@transactions_bp.delete("/transactions/<int:transaction_id>")
@token_required
def delete_transaction(current_user_id, current_username, transaction_id):
    t = Transaction.query.filter_by(id=transaction_id, user_id=current_user_id).first()
    
    if not t:
        return {"error": "Transaction not found"}, 404
    
    db.session.delete(t)
    db.session.commit()
    
    return jsonify({"success": True, "message": "Transaction deleted"}), 200

#--------------------------------------------------------------------------------------------
# GET /api/accounts
@transactions_bp.get("/accounts")
@token_required
def list_accounts(current_user_id, current_username):
    accounts = Account.query.filter_by(user_id=current_user_id).all()
    
    return jsonify({
        "accounts": [
            {
                "id": a.id,
                "name": a.name,
                "mask": a.mask,
                "type": a.type,
                "subtype": a.subtype,
            }
            for a in accounts
        ]
    }), 200
