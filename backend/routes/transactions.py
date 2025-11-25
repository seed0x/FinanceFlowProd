from datetime import date, datetime
from decimal import Decimal
from flask import Blueprint, request, jsonify, session
from db import db
from models import Transaction, Account

transactions_bp = Blueprint("transactions", __name__)

def _to_dict(t: Transaction):
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
        "user": session.get('user'),
    }
#--------------------------------------------------------------------------------------------
@transactions_bp.get("/transactions")
def list_transactions():
    if 'user' not in session:
        return {"error": "Not logged in"}, 401
    
    uid = session['user_id']
    print(f"Fetching transactions for user={session.get('user')}, user_id={uid}")  # Debug
    items = (Transaction.query
             .filter_by(user_id=uid)
             .order_by(Transaction.date.desc(), Transaction.id.desc())
             .all())
    print(f"Found {len(items)} transactions")  # Debug
    return jsonify({"transactions": [_to_dict(t) for t in items]}), 200

#-------------------------------------------------------------------------------------------
@transactions_bp.post("/transactions")
def create_transaction():
    if "user" not in session:
        return {"error": "Not logged in"}, 401
    
    uid = session["user_id"]
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
        user_id=uid,
        date=d,
        description=data.get("description"),
        category=(data.get("category") or "Other"),
        amount=amt,
        merchant=data.get("merchant"),
        account_id=data.get("account_id") if data.get("account_id") else None,
    )
    db.session.add(t)
    db.session.commit()

    return jsonify({"transaction": _to_dict(t)}), 201

#--------------------------------------------------------------------------------------------
# PUT /api/transactions/<id>
@transactions_bp.put("/transactions/<int:transaction_id>")
def update_transaction(transaction_id):
    if "user" not in session:
        return {"error": "Not logged in"}, 401
    
    uid = session["user_id"]
    t = Transaction.query.filter_by(id=transaction_id, user_id=uid).first()
    
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
    
    return jsonify({"transaction": _to_dict(t)}), 200

#--------------------------------------------------------------------------------------------
# DELETE /api/transactions/<id>
@transactions_bp.delete("/transactions/<int:transaction_id>")
def delete_transaction(transaction_id):
    if "user" not in session:
        return {"error": "Not logged in"}, 401
    
    uid = session["user_id"]
    t = Transaction.query.filter_by(id=transaction_id, user_id=uid).first()
    
    if not t:
        return {"error": "Transaction not found"}, 404
    
    db.session.delete(t)
    db.session.commit()
    
    return jsonify({"success": True, "message": "Transaction deleted"}), 200

#--------------------------------------------------------------------------------------------
# GET /api/accounts
@transactions_bp.get("/accounts")
def list_accounts():
    if "user" not in session:
        return {"error": "Not logged in"}, 401
    
    uid = session["user_id"]
    accounts = Account.query.filter_by(user_id=uid).all()
    
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
