from datetime import date, timedelta
from decimal import Decimal
from flask import Blueprint, request, jsonify
from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest
from plaid.model.accounts_get_request import AccountsGetRequest
from plaid.model.transactions_get_request import TransactionsGetRequest
from plaid.model.link_token_create_request import LinkTokenCreateRequest
from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
from plaid.model.country_code import CountryCode
from plaid.model.products import Products
from plaid_client import plaid_client
from db import db
from models import User, Account, Transaction
from auth_middleware import token_required

plaid_bp = Blueprint("plaid", __name__)
    
#--------------------------------------------------------------------
# POST /api/plaid/create-link-token
@plaid_bp.post("/plaid/create-link-token")
@token_required
def create_link_token(current_user_id, current_username):
    user = User.query.get(current_user_id)
    
    req = LinkTokenCreateRequest(
        user=LinkTokenCreateRequestUser(
            client_user_id=str(user.id)
        ),
        client_name="FinanceFlow",
        language="en",
        country_codes=[CountryCode("US")],
        products=[Products("transactions")]
    )
    
    resp = plaid_client.link_token_create(req)
    return jsonify({"link_token": resp["link_token"]}), 200

#--------------------------------------------------------------------
# POST /api/plaid/exchange
@plaid_bp.post("/plaid/exchange")
@token_required
def plaid_exchange(current_user_id, current_username):
    data = request.get_json() or {}
    token = data.get("public_token")

    if not token:
        return jsonify({"error": "Missing public_token"}), 400

    # Exchange token
    req = ItemPublicTokenExchangeRequest(public_token=token)
    resp = plaid_client.item_public_token_exchange(req)
    access_token = resp["access_token"]

    # Save to user
    user = User.query.get(current_user_id)
    user.plaid_access_token = access_token
    db.session.add(user)

    # Get accounts from plaid
    acc_req = AccountsGetRequest(access_token=access_token)
    acc_resp = plaid_client.accounts_get(acc_req)

    for acc in acc_resp["accounts"]:
        existing = Account.query.filter_by(plaid_account_id=acc["account_id"]).first()
        if existing:
            continue

        new_acc = Account(
            user_id=current_user_id,
            plaid_account_id=acc["account_id"],
            name=acc.get("name"),
            mask=acc.get("mask"),
            type=str(acc.get("type")) if acc.get("type") else None,
            subtype=str(acc.get("subtype")) if acc.get("subtype") else None,
        )
        db.session.add(new_acc)

    db.session.commit()

    # Sync transactions
    try:
        count = _sync_transactions(user)
        db.session.commit()
        return jsonify({"success": True, "new_transactions": count}), 200
    except Exception as e:
        print(f"Error syncing: {e}")  # Debug
        return jsonify({"success": True, "new_transactions": 0, "sync_error": str(e)}), 200

# helper to guess category from merchant name
def _guess_category_from_merchant(merchant_name, description):
    text = (merchant_name or description or "").lower()
    
    # Food & Dining
    if any(word in text for word in ['starbucks', 'mcdonalds', 'restaurant', 'cafe', 'coffee', 'pizza', 'burger', 'food', 'dining', 'kfc', 'subway', 'chipotle', 'wendys', 'taco bell', 'dominos', 'panera', 'dunkin', 'chick-fil-a', 'popeyes', 'arbys', 'sonic', 'dairy queen', 'five guys', 'shake shack', 'in-n-out', 'whataburger', 'bar', 'grill', 'kitchen', 'bakery', 'deli', 'sushi', 'thai', 'chinese', 'mexican', 'italian', 'diner', 'buffet', 'eatery', 'bistro']):
        return "Food"
    
    # Transportation
    if any(word in text for word in ['uber', 'lyft', 'gas', 'fuel', 'parking', 'transit', 'metro', 'taxi', 'airline', 'airlines', 'united', 'delta', 'american airlines', 'southwest', 'jetblue', 'spirit', 'frontier', 'alaska airlines', 'flight', 'airways', 'car rental', 'hertz', 'enterprise', 'avis', 'budget', 'toll', 'dmv', 'registration', 'auto', 'vehicle', 'shell', 'chevron', 'exxon', 'bp', 'mobil', 'citgo', '76', 'arco', 'speedway', 'wawa', 'sheetz']):
        return "Transport"
    
    # Shopping
    if any(word in text for word in ['amazon', 'walmart', 'target', 'store', 'shop', 'retail', 'bicycle', 'bike', 'costco', 'sams club', 'best buy', 'home depot', 'lowes', 'ikea', 'macys', 'nordstrom', 'kohls', 'jcpenney', 'sears', 'dicks sporting', 'rei', 'tj maxx', 'marshalls', 'ross', 'burlington', 'old navy', 'gap', 'clothing', 'apparel', 'footwear', 'shoes', 'mall', 'outlet', 'boutique', 'hardware', 'furniture', 'decor', 'pet', 'toys', 'electronics', 'jewelry']):
        return "Shopping"
    
    # Entertainment
    if any(word in text for word in ['netflix', 'spotify', 'hulu', 'movie', 'theater', 'game', 'climbing', 'gym', 'disney', 'hbo', 'amazon prime', 'apple music', 'youtube', 'twitch', 'playstation', 'xbox', 'nintendo', 'steam', 'amc', 'regal', 'cinemark', 'imax', 'concert', 'tickets', 'ticketmaster', 'stubhub', 'sports', 'fitness', 'planet fitness', 'la fitness', '24 hour fitness', 'ymca', 'recreation', 'club', 'membership', 'ski', 'golf', 'bowling', 'arcade', 'museum', 'zoo', 'aquarium', 'park']):
        return "Entertainment"
    
    # Utilities
    if any(word in text for word in ['electric', 'utility', 'water', 'internet', 'phone', 'cable', 'power', 'energy', 'gas company', 'pge', 'con edison', 'duke energy', 'comcast', 'xfinity', 'verizon', 'att', 't-mobile', 'sprint', 'spectrum', 'cox', 'centurylink', 'frontier', 'payment', 'bill pay', 'autopay', 'sewage', 'trash', 'waste management', 'recycling']):
        return "Utilities"
    
    # Healthcare
    if any(word in text for word in ['pharmacy', 'doctor', 'hospital', 'medical', 'health', 'cvs', 'walgreens']):
        return "Healthcare"
    
    return "Other"

# sync transactions from plaid
def _sync_transactions(user):
    if not user.plaid_access_token:
        return 0

    token = user.plaid_access_token
    start = date.today() - timedelta(days=30)
    end = date.today()

    req = TransactionsGetRequest(
        access_token=token,
        start_date=start,
        end_date=end,
        options={"count": 500, "offset": 0},
    )
    resp = plaid_client.transactions_get(req)
    txs = resp["transactions"]

    # map plaid account ids to our accounts
    accounts = Account.query.filter_by(user_id=user.id).all()
    acc_map = {a.plaid_account_id: a for a in accounts if a.plaid_account_id}

    count = 0
    for tx in txs:
        tx_id = tx["transaction_id"]

        # skip duplicates
        if Transaction.query.filter_by(plaid_tx_id=tx_id).first():
            continue

        account = acc_map.get(tx["account_id"])
        amt = Decimal(str(tx["amount"]))
        amt = -amt  # plaid: positive = expense, we flip it

        # figure out category
        merchant = tx.get("merchant_name")
        name = tx.get("name")
        pfc = tx.get("personal_finance_category")
        cats = tx.get("category", [])
        
        category = "Other"
        
        if pfc and isinstance(pfc, dict) and pfc.get("primary"):
            category = pfc["primary"].replace("_", " ").title()
            print(f"PFC: {category}")  # Debug
        elif cats and len(cats) > 0:
            category = cats[-1].title()
            print(f"Legacy: {category}")  # Debug
        else:
            category = _guess_category_from_merchant(merchant, name)
            print(f"Guessed: {category}")  # Debug
        
        print(f"{name} -> {category}")  # Debug

        t = Transaction(
            user_id=user.id,
            account_id=account.id if account else None,
            date=tx["date"],
            description=tx.get("name"),
            category=category,
            amount=amt,
            merchant=tx.get("merchant_name"),
            plaid_tx_id=tx_id,
        )
        db.session.add(t)
        count += 1

    return count


#--------------------------------------------------------------------
# POST /api/plaid/sync
@plaid_bp.post("/plaid/sync")
@token_required
def plaid_sync(current_user_id, current_username):
    user = User.query.get(current_user_id)

    if not user or not user.plaid_access_token:
        return jsonify({"error": "No Plaid account connected"}), 400

    try:
        count = _sync_transactions(user)
        db.session.commit()
        return jsonify({"success": True, "new_transactions": count}), 200
    except Exception as e:
        print(f"Error syncing: {e}")  # Debug
        return jsonify({"error": str(e)}), 500

