from flask import Blueprint, jsonify
from datetime import date
from sqlalchemy import func
from models import db, Transaction
from auth_middleware import token_required

analytics_bp = Blueprint("analytics", __name__)
#--------------------------------------------------------------------
@analytics_bp.get('/totalBalance')
@token_required
def total_balance(current_user_id, current_username):
    total = db.session.query(func.coalesce(func.sum(Transaction.amount), 0))\
        .filter(Transaction.user_id == current_user_id)\
        .scalar() or 0
    return jsonify({"totalBalance": float(total)}), 200
#--------------------------------------------------------------------
@analytics_bp.get('/totalIncome')
@token_required
def total_income(current_user_id, current_username):
    total = db.session.query(func.coalesce(func.sum(Transaction.amount), 0))\
        .filter(Transaction.user_id == current_user_id,
                Transaction.amount > 0)\
        .scalar() or 0
    return jsonify({"totalIncome": float(total)}), 200
#--------------------------------------------------------------------
@analytics_bp.get("/totalExpense")
@token_required
def total_expense(current_user_id, current_username):
    total = db.session.query(func.coalesce(func.sum(Transaction.amount), 0))\
        .filter(Transaction.user_id == current_user_id,
                Transaction.amount < 0)\
        .scalar() or 0
    # UI expects positive expense total
    return jsonify({"totalExpense": float(abs(total))}), 200
#--------------------------------------------------------------------
@analytics_bp.get("/monthlyExpenses")
@token_required
def monthly_expenses(current_user_id, current_username):
    today = date.today()
    total = db.session.query(func.coalesce(func.sum(Transaction.amount), 0))\
        .filter(Transaction.user_id == current_user_id,
                func.extract("year", Transaction.date) == today.year,
                func.extract("month", Transaction.date) == today.month,
                Transaction.amount < 0)\
        .scalar() or 0
    # return absolute spend this month
    return jsonify({"monthlyTotal": float(abs(total))}), 200
#--------------------------------------------------------------------
@analytics_bp.get("/totalTransactions")
@token_required
def monthly_transactions(current_user_id, current_username):
    today = date.today()
    count = db.session.query(func.count(Transaction.id))\
        .filter(Transaction.user_id == current_user_id,
                func.extract("year", Transaction.date) == today.year,
                func.extract("month", Transaction.date) == today.month)\
        .scalar() or 0
    return jsonify({"monthlyTransactions": int(count)}), 200
#-----------------------------------------------------------------------
@analytics_bp.get("/monthlyIncome")
@token_required
def monthly_income(current_user_id, current_username):
    today = date.today()
    total = db.session.query(func.coalesce(func.sum(Transaction.amount), 0))\
        .filter(Transaction.user_id == current_user_id,
                func.extract("year", Transaction.date) == today.year,
                func.extract("month", Transaction.date) == today.month,
                Transaction.amount > 0)\
        .scalar() or 0
    return jsonify({"monthlyIncome": float(total)}), 200
#-----------------------------------------------------------------------


