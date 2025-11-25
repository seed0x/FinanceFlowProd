# Plaid Integration Walkthrough

## Overview

Your Plaid integration has two main flows:

### Flow 1: Connect Bank Account (`/api/plaid/exchange`)
```
User clicks "Connect Bank" 
  → Plaid Link modal opens (frontend)
  → User logs into their bank
  → Plaid returns public_token
  → Frontend sends to /api/plaid/exchange
  → Backend exchanges public_token for access_token
  → Backend fetches accounts from Plaid & saves them
  → User now has connected account(s) linked to their profile
```

### Flow 2: Sync Transactions (`/api/plaid/sync`)
```
User clicks "Sync Transactions"
  → Backend retrieves user's plaid_access_token
  → Backend calls Plaid API to fetch last 30 days of transactions
  → Backend creates Transaction records (avoiding duplicates via plaid_tx_id)
  → Transactions appear in user's dashboard
```

---

## Code Walkthrough

### 1. Plaid Client Setup (`backend/plaid_client.py`)

```python
from plaid import Configuration, ApiClient, PlaidApi
from dotenv import load_dotenv
import os

load_dotenv()

# Creates a configured Plaid client
configuration = Configuration(
    host="https://sandbox.plaid.com",  # Always sandbox for testing
    api_key={
        "clientId": os.getenv("PLAID_CLIENT_ID"),
        "secret": os.getenv("PLAID_SECRET")
    }
)

api_client = ApiClient(configuration)
plaid_client = PlaidApi(api_client)  # This is what you use to call Plaid APIs
```

**Key points:**
- Uses Plaid Sandbox (fake bank data for testing, not production)
- Credentials come from `.env` file
- `plaid_client` is a reusable instance for making API calls

---

### 2. Exchange Token Endpoint (`POST /api/plaid/exchange`)

**What it does:**
1. Takes the `public_token` from frontend (from Plaid Link)
2. Exchanges it for a permanent `access_token`
3. Fetches user's bank accounts from Plaid
4. Saves them to your database as Account records
5. Stores the access token on the User so you can fetch transactions later

**Code breakdown:**

```python
@plaid_bp.post("/plaid/exchange")
def plaid_exchange():
    # Step 1: Check user is logged in
    err = _require_user()
    if err:
        return err
    
    uid = session["user_id"]
    data = request.get_json() or {}
    public_token = data.get("public_token")
    
    if not public_token:
        return jsonify({"error": "Missing public_token"}), 400
    
    # Step 2: Exchange public_token → access_token (this is permanent)
    req = ItemPublicTokenExchangeRequest(public_token=public_token)
    resp = plaid_client.item_public_token_exchange(req)
    access_token = resp["access_token"]
    
    # Step 3: Save access_token on user (needed for future sync calls)
    user = User.query.get(uid)
    user.plaid_access_token = access_token
    db.session.add(user)
    
    # Step 4: Fetch all accounts linked to this bank connection
    acc_req = AccountsGetRequest(access_token=access_token)
    acc_resp = plaid_client.accounts_get(acc_req)
    
    # Step 5: Create Account records for each bank account
    for acc in acc_resp["accounts"]:
        # Skip if we already have this account
        existing = Account.query.filter_by(
            plaid_account_id=acc["account_id"]
        ).first()
        if existing:
            continue
        
        # Create new Account record
        a = Account(
            user_id=uid,
            plaid_account_id=acc["account_id"],  # Plaid's ID for this account
            name=acc.get("name"),                # e.g., "Chase Checking"
            mask=acc.get("mask"),                # e.g., "1234" (last 4 digits)
            type=acc.get("type"),                # e.g., "depository"
            subtype=acc.get("subtype"),          # e.g., "checking"
        )
        db.session.add(a)
    
    db.session.commit()
    return jsonify({"success": True}), 200
```

**What gets saved to database:**
```
User table:
  - plaid_access_token: "access-sandbox-abc123..."  (used for future API calls)

Account table (one row per bank account):
  - user_id: 1
  - plaid_account_id: "aBc123XYZ"
  - name: "Chase Checking"
  - mask: "4321"
  - type: "depository"
  - subtype: "checking"
```

---

### 3. Sync Transactions Endpoint (`POST /api/plaid/sync`)

**What it does:**
1. Gets user's access token
2. Calls Plaid to fetch last 30 days of transactions
3. Creates Transaction records (avoids duplicates)
4. Associates each transaction with the correct Account

**Code breakdown:**

```python
@plaid_bp.post("/plaid/sync")
def plaid_sync():
    # Step 1: Check user is logged in
    err = _require_user()
    if err:
        return err
    
    uid = session["user_id"]
    user = User.query.get(uid)
    
    # Step 2: Check if user has connected a bank account
    if not user or not user.plaid_access_token:
        return jsonify({"error": "No Plaid access token"}), 400
    
    access_token = user.plaid_access_token
    
    # Step 3: Set date range (last 30 days)
    start_date = (date.today() - timedelta(days=30)).isoformat()
    end_date = date.today().isoformat()
    
    # Step 4: Fetch transactions from Plaid
    req = TransactionsGetRequest(
        access_token=access_token,
        start_date=start_date,
        end_date=end_date,
        options={"count": 500, "offset": 0},  # Get up to 500 transactions
    )
    resp = plaid_client.transactions_get(req)
    plaid_transactions = resp["transactions"]
    
    # Step 5: Create a lookup map: plaid_account_id → Account
    accounts = Account.query.filter_by(user_id=uid).all()
    account_map = {a.plaid_account_id: a for a in accounts}
    
    # Step 6: Add each transaction to database (skip duplicates)
    new_count = 0
    for tx in plaid_transactions:
        plaid_tx_id = tx["transaction_id"]
        
        # Skip if we already have this transaction
        if Transaction.query.filter_by(plaid_tx_id=plaid_tx_id).first():
            continue
        
        # Find which account this transaction belongs to
        account = account_map.get(tx["account_id"])
        
        # Convert amount: Plaid gives positive for expenses,
        # but we store negative for expenses
        raw_amount = Decimal(str(tx["amount"]))
        amount = -raw_amount  # Treat as expense (negative)
        
        # Get category from Plaid's category array
        cat_list = tx.get("category") or []
        category = cat_list[0] if cat_list else "Other"
        
        # Create Transaction record
        t = Transaction(
            user_id=uid,
            account_id=account.id if account else None,
            date=tx["date"],                    # ISO string: "2025-11-24"
            description=tx.get("name"),         # e.g., "STARBUCKS COFFEE"
            category=category,                  # e.g., "FOOD_AND_DRINK"
            amount=amount,                      # e.g., -5.50
            merchant=tx.get("merchant_name"),   # e.g., "Starbucks"
            plaid_tx_id=plaid_tx_id,            # Unique ID to prevent duplicates
        )
        db.session.add(t)
        new_count += 1
    
    db.session.commit()
    
    return jsonify({"success": True, "new_transactions": new_count}), 200
```

**What gets saved to database:**
```
Transaction table (one row per synced transaction):
  - user_id: 1
  - account_id: 5 (links to Account we created earlier)
  - date: "2025-11-20"
  - description: "STARBUCKS COFFEE"
  - category: "FOOD_AND_DRINK"
  - amount: -5.50 (negative = expense)
  - merchant: "Starbucks"
  - plaid_tx_id: "tx_abc123" (Plaid's unique ID)
```

---

## Testing Guide

### Setup

1. **Create Plaid account** at https://plaid.com/dashboard
2. **Get credentials from dashboard:**
   - Client ID
   - Sandbox Secret
3. **Add to `backend/.env`:**
   ```
   PLAID_CLIENT_ID=your_client_id
   PLAID_SECRET=your_sandbox_secret
   ```
4. **Install dependencies:**
   ```powershell
   cd backend
   pip install -r requirements.txt
   ```
5. **Run migrations (to create Account table):**
   ```powershell
   $env:FLASK_APP="app"
   flask db migrate -m "Add Plaid support"
   flask db upgrade
   ```
6. **Start backend:**
   ```powershell
   python app.py
   ```

---

### Test Flow (Using Postman or curl)

#### Step 1: Create a test user and login

**POST** `http://localhost:5000/api/login`
```json
{
  "username": "testuser",
  "password": "testpass123"
}
```

Response:
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "testuser"
  }
}
```

This sets a session cookie. Make sure to:
- In Postman: Click "Cookies" and enable the session cookie
- In curl: Use `-c cookies.txt -b cookies.txt` to store/use cookies

---

#### Step 2: Get Plaid Link Token (Frontend step, but simulate with backend endpoint)

Actually, you need to create a `/api/plaid/create-link-token` endpoint first. Add this to `plaid_routes.py`:

```python
from plaid.model import LinkTokenCreateRequest

@plaid_bp.post("/plaid/create-link-token")
def create_link_token():
    err = _require_user()
    if err:
        return err
    
    user = User.query.get(session["user_id"])
    
    req = LinkTokenCreateRequest(
        user=LinkTokenUser(
            client_user_id=str(user.id)
        ),
        client_name="FinanceFlow",
        language="en",
        country_codes=["US"],
        user_legal_name=user.username,
        products=["transactions"]
    )
    
    resp = plaid_client.link_token_create(req)
    return jsonify({"link_token": resp["link_token"]}), 200
```

Then in Postman:

**POST** `http://localhost:5000/api/plaid/create-link-token`

Response:
```json
{
  "link_token": "link-sandbox-abc123..."
}
```

---

#### Step 3: Simulate Plaid Link (Get public token)

In a real app, frontend would:
1. Use Plaid Link modal with the link_token
2. User selects bank and logs in
3. Plaid returns public_token

For testing, use Plaid's test credentials:
- Username: `user_good`
- Password: `pass_good`

The public_token you get will look like: `public-sandbox-abc123-xyz789`

---

#### Step 4: Exchange public token for access token

**POST** `http://localhost:5000/api/plaid/exchange`
```json
{
  "public_token": "public-sandbox-abc123-xyz789"
}
```

Response:
```json
{
  "success": true
}
```

**What just happened:**
- Backend exchanged public token for access token
- Access token saved to `user.plaid_access_token`
- Bank accounts fetched and saved to Account table
- Now you have 1+ Account records linked to this user

---

#### Step 5: Sync transactions

**POST** `http://localhost:5000/api/plaid/sync`

Response:
```json
{
  "success": true,
  "new_transactions": 42
}
```

**What just happened:**
- Backend fetched 42 transactions from the last 30 days
- Each transaction was saved to Transaction table
- Each transaction is linked to the correct Account

---

#### Step 6: Verify data in database

Now check your database to see what was saved:

```bash
# Open SQLite database
sqlite3 financeflow.db

# See accounts
SELECT id, name, mask, type, subtype FROM account;

# See transactions
SELECT id, description, category, amount, merchant FROM transaction LIMIT 10;
```

---

## Quick Reference: Plaid Sandbox Test Credentials

Use these to test without needing real bank accounts:

| Username | Password | Behavior |
|----------|----------|----------|
| `user_good` | `pass_good` | Successful login, returns transactions |
| `user_custom_items_easily` | `pass_good` | Multiple accounts |
| `user_auth` | `pass_good` | Requires identity verification |

---

## Common Issues & Fixes

### Issue: "Missing plaid_access_token"
**Cause:** User hasn't called `/api/plaid/exchange` yet
**Fix:** Make sure Step 4 succeeded before trying Step 5

### Issue: "Transaction already exists"
**Cause:** Calling `/api/plaid/sync` twice creates duplicates
**Fix:** Code checks `plaid_tx_id` to prevent duplicates — this is normal

### Issue: "ModuleNotFoundError: No module named 'plaid'"
**Cause:** Dependencies not installed
**Fix:** Run `pip install -r requirements.txt` again

### Issue: 401 Unauthorized
**Cause:** Session expired or user not logged in
**Fix:** Make sure to login first (Step 1) and include cookies in requests

---

## Next Steps

Once basic Plaid sync works:

1. **Frontend:** Add Plaid Link modal component
2. **Manual transactions:** Create `POST /api/accounts/{account_id}/transactions` endpoint to let users manually add transactions to accounts
3. **Recurring sync:** Set up a background job to sync transactions daily
4. **Multi-account:** Let users connect multiple banks
5. **Production:** Switch from Sandbox to Production credentials when ready

