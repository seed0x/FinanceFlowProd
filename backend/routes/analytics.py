from flask import Blueprint, jsonify, session
from datetime import date
from sqlalchemy import func
from models import db, Transaction 

analytics_bp = Blueprint("analytics", __name__)

def _require_user():
    if "user_id" not in session:
        return {"error": "Not logged in"}, 401
    return None

@analytics_bp.get("/totalBalance")
def total_balance():
    not_ok = _require_user()
    if not_ok: return not_ok

    total = db.session.query(func.coalesce(func.sum(Transaction.amount), 0))\
        .filter(Transaction.user_id == session["user_id"])\
        .scalar() or 0
    return jsonify({"totalBalance": float(total)}), 200

@analytics_bp.get("/totalIncome")
def total_income():
    not_ok = _require_user()
    if not_ok: return not_ok

    total = db.session.query(func.coalesce(func.sum(Transaction.amount), 0))\
        .filter(Transaction.user_id == session["user_id"],
                Transaction.amount > 0)\
        .scalar() or 0
    return jsonify({"totalIncome": float(total)}), 200

@analytics_bp.get("/totalExpense")
def total_expense():
    not_ok = _require_user()
    if not_ok: return not_ok

    total = db.session.query(func.coalesce(func.sum(Transaction.amount), 0))\
        .filter(Transaction.user_id == session["user_id"],
                Transaction.amount < 0)\
        .scalar() or 0
    # UI expects positive expense total
    return jsonify({"totalExpense": float(abs(total))}), 200

@analytics_bp.get("/monthlyExpenses")
def monthly_expenses():
    not_ok = _require_user()
    if not_ok: return not_ok

    today = date.today()
    total = db.session.query(func.coalesce(func.sum(Transaction.amount), 0))\
        .filter(Transaction.user_id == session["user_id"],
                func.extract("year", Transaction.date) == today.year,
                func.extract("month", Transaction.date) == today.month,
                Transaction.amount < 0)\
        .scalar() or 0
    # return absolute spend this month
    return jsonify({"monthlyTotal": float(abs(total))}), 200

@analytics_bp.get("/totalTransactions")
def monthly_transactions():
    not_ok = _require_user()
    if not_ok: return not_ok

    today = date.today()
    count = db.session.query(func.count(Transaction.id))\
        .filter(Transaction.user_id == session["user_id"],
                func.extract("year", Transaction.date) == today.year,
                func.extract("month", Transaction.date) == today.month)\
        .scalar() or 0
    return jsonify({"monthlyTransactions": int(count)}), 200
