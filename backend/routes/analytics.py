from flask import Blueprint, request, jsonify, session
from datetime import datetime
from storage import receipts


USERS = {
    'derek':'123',
    'vlad':'123',
    'david':'123'
}

analytics_bp = Blueprint("analytics", __name__)
# Total Balance
@analytics_bp.route('/totalBalance', methods=['GET'])
def get_total_balance():
    print(f"[ANALYTICS] Session received: {session}")  # Debug
    print(f"[ANALYTICS] Request headers: {dict(request.headers)}")  # Debug
    
    totalBalance=0
    
    if 'user' not in session:
        print("[ANALYTICS] ERROR: No user in session!")  # Debug
        return {'error': 'Not logged in'}, 401
    
    current_user = session['user']
    print(f"[ANALYTICS] User found: {current_user}")  # Debug
    
    receipts_for_user = []
    for r in receipts:
        if r.get("user") == current_user:
            totalBalance+=r.get("amount",0)
            receipts_for_user.append(r)

    print(totalBalance)
    return jsonify({"totalBalance": totalBalance}), 200


# Monthly Expenses
@analytics_bp.route('/monthlyExpenses', methods=['GET'])
def get_monthly_expenses():
    print(f"[ANALYTICS] Session received: {session}")  # Debug
    print(f"[ANALYTICS] Request headers: {dict(request.headers)}")  # Debug
    
    monthlyTotal=0
    
    if 'user' not in session:
        print("[ANALYTICS] ERROR: No user in session!")  # Debug
        return {'error': 'Not logged in'}, 401
    
    current_user = session['user']
    print(f"[ANALYTICS] User found: {current_user}")  # Debug
    
    now = datetime.now()
    print(now)  # Debug
    monthly_receipts = []
    for r in receipts:
        if r.get("user") == current_user:
            timestamp = datetime.fromisoformat(r.get("timestamp"))
            print(f"Checking timestamp: {timestamp}")  # Debug
            if timestamp.year == now.year and timestamp.month == now.month:
                monthlyTotal += r.get("amount")
                monthly_receipts.append(r)

   
    print(monthly_receipts)
    return jsonify({"monthlyTotal": monthlyTotal}), 200



# Total Transactions
@analytics_bp.route('/totalTransactions', methods=['GET'])
def get_monthly_transactions():

    if 'user' not in session:
        return {'error': 'Not logged in'}, 401
    
    current_user = session['user']
    
    for r in receipts:
        if r.get("user") == current_user:
            monthlyTransactions+=1
  
    print(monthlyTransactions)
    return jsonify(({"monthlyTransactions": monthlyTransactions}), 200)
