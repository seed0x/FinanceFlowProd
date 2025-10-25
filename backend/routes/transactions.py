from datetime import date, datetime
from decimal import Decimal
from flask import Blueprint, request, jsonify, session
from db import db
from models import Transaction

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
        "timestamp": t.created_at.isoformat() if t.created_at else datetime.now().isoformat(),
        "user": session.get("user"),
    }

@transactions_bp.get("/transactions")
def list_transactions():
    if "user_id" not in session:
        return {"error": "Not logged in"}, 401
    uid = session["user_id"]
    items = (Transaction.query
             .filter_by(user_id=uid)
             .order_by(Transaction.date.desc(), Transaction.id.desc())
             .all())
    return jsonify({"transactions": [_to_dict(t) for t in items]}), 200

@transactions_bp.post("/transactions")
def create_transaction():
    if "user_id" not in session:
        return {"error": "Not logged in"}, 401
    uid = session["user_id"]
    data = request.get_json() or {}

    d_str = data.get("date")
    d = date.fromisoformat(d_str) if d_str else date.today()

    try:
        amt = Decimal(str(data["amount"]))
    except Exception:
        return {"error": "Invalid amount"}, 400

    # 🔧 Normalize sign based on optional 'type' from UI
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
    )
    db.session.add(t)
    db.session.commit()

    return jsonify({"transaction": _to_dict(t)}), 201