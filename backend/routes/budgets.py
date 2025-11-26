from flask import Blueprint, jsonify, session, request
from datetime import date, datetime
from sqlalchemy import func, case
from models import db, Transaction, Budgets

budgets_bp = Blueprint("budgets", __name__)

#Helper Function to check if the user logged is really logged in
def _require_user():
    if "user_id" not in session:
        return jsonify({"error": "Not logged in"}), 401
    return None
    
#--------------------------------------------------------------------

# POST /api/budgets/setBudget
@budgets_bp.post("/budgets/setBudget")
def setBudet():
        
    user_logged_in = _require_user()
    if user_logged_in:
        return user_logged_in  
    
    uid = session["user_id"]
    data = request.get_json() or {}
    
    category = data.get("category")
    amount = data.get("budget") or data.get("amount")
    month = data.get("month") or datetime.now().strftime("%Y-%m")
    
    if not category or amount is None:
        return jsonify({"error": "category and budget are required"}), 400

    try:
        amount = float(amount)
    except Exception:
        return jsonify({"error": "budget must be a number"}), 400
    
    b = Budgets(
        user_id=uid,
        category=category,
        amount=amount,
        date=datetime.strptime(month + "-01", "%Y-%m-%d").date(),
    )
    db.session.add(b)
    db.session.commit()

    return jsonify({
        "id": b.id,
        "category": b.category,
        "budget": float(b.amount),
        "month": month,
    }), 201
    
#------------------------------------------------------------------------

@budgets_bp.get("/budgets/getBudgets")
def list_budgets():
    
    user_logged_in = _require_user()
    if user_logged_in:
        return user_logged_in

    uid = session["user_id"]
    today = date.today()
    month_str = f"{today.year}-{today.month:02d}"
    
    spend_rows = db.session.query(
        Transaction.category.label("category"),
        func.coalesce(
            func.sum(case((Transaction.amount < 0, -Transaction.amount), else_=0)),0,
        ).label("spent"),
    ).filter(
        Transaction.user_id == uid,
        func.extract("year", Transaction.date) == today.year,
        func.extract("month", Transaction.date) == today.month,
    ).group_by(Transaction.category).all()
    
    spent_by_cat = {row.category: float(row.spent or 0.0) for row in spend_rows}

    budget_rows = Budgets.query.filter(
        Budgets.user_id == uid,
        func.extract("year", Budgets.date) == today.year,
        func.extract("month", Budgets.date) == today.month,
    ).all()
    
    result = []

    for b in budget_rows:
        spent = spent_by_cat.get(b.category, 0.0)
        budget_amt = float(b.amount)
        result.append({
            "id": b.id,
            "category": b.category,
            "month": month_str,
            "budget": budget_amt,
            "spent": spent,
            "remaining": round(budget_amt - spent, 2),
            "active": True,  # has a saved budget
        })
    
    resp = {"month": month_str, "budgets": result}
    if budget_rows:
        resp["budget"] = float(budget_rows[0].amount)
        resp["category"] = budget_rows[0].category

    return jsonify(resp), 200
    
#------------------------------------------------------------------------

@budgets_bp.put("/budgets/<int:budget_id>")
def update_budget(budget_id):
    """Update an existing budget's amount"""
    user_logged_in = _require_user()
    if user_logged_in:
      return user_logged_in

    uid = session["user_id"]
    budget = Budgets.query.filter_by(id=budget_id, user_id=uid).first()

    if not budget:
      return jsonify({"error": "Budget not found"}), 404

    data = request.get_json() or {}
    new_amount = data.get("amount") or data.get("budget")

    if new_amount is None:
      return jsonify({"error": "Amount is required"}), 400

    try:
      new_amount = float(new_amount)
      if new_amount <= 0:
          return jsonify({"error": "Amount must be greater than 0"}), 400
    except Exception:
        return jsonify({"error": "Invalid amount"}), 400

    # update budget amount
    budget.amount = new_amount
    db.session.commit()

    # recalulate spent amount on response
    today = date.today()
    spend_row = db.session.query(
        func.coalesce(
            func.sum(case((Transaction.amount < 0, -Transaction.amount), else_=0)), 0
        )
    ).filter(
        Transaction.user_id == uid,
        Transaction.category == budget.category,
        func.extract("year", Transaction.date) == today.year,
        func.extract("month", Transaction.date) == today.month,
    ).scalar()

    spent = float(spend_row or 0.0)
    budget_amt = float(budget.amount)

    return jsonify({
        "id": budget.id,
        "category": budget.category,
        "budget": budget_amt,
        "spent": spent,
        "remaining": round(budget_amt - spent, 2),
        "month": f"{today.year}-{today.month:02d}",
    }), 200
#------------------------------------------------------------------------

'''def spending_summary(user_id, month):
    # Get all budgets
    budgets = Budget.query.filter_by(user_id=user_id, month=month).all()

    print(f"Fetching budgets for user={session.get('user')}, user_id={uid}")  # Debug
    
    # Get total spent per category for that month
    results = (
        db.session.query(Transaction.category, func.sum(Transaction.amount))
        .filter(
            Transaction.user_id == user_id,
            Transaction.amount < 0,  # only expenses
            func.strftime("%Y-%m", Transaction.date) == month,
        )
        .group_by(Transaction.category)
        .all()
    )

    spent_by_cat = {cat: abs(total) for cat, total in results}

    # Compare
    report = []
    for b in budgets:
        spent = spent_by_cat.get(b.category, 0)
        remaining = float(b.amount) - float(spent)
        report.append({
            "category": b.category,
            "budget": float(b.amount),
            "spent": float(spent),
            "remaining": remaining,
        })
    return report'''
    
