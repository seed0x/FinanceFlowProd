# Simplified Plaid Integration

## Overview
Simple, single-bank Plaid integration that automatically imports transactions and allows manual syncing.

## Features
1. **Connect Bank**: Connect one bank account via Plaid Link
2. **Auto-Import**: Transactions are automatically imported on connection (last 30 days)
3. **Manual Sync**: Button to manually sync new transactions
4. **Accounts**: Bank accounts saved and available for manual transaction categorization
5. **Transaction CRUD**: Full create, read, update, delete operations for transactions

## Backend Changes

### Models (`backend/models.py`)
- `User.plaid_access_token` - Stores Plaid access token (one per user)
- `Account.plaid_account_id` - Links accounts to Plaid
- `Transaction.account_id` - Links transactions to accounts
- `Transaction.plaid_tx_id` - Unique ID from Plaid (prevents duplicates)

### API Routes

#### Plaid Routes (`backend/routes/plaid_routes.py`)
- `POST /api/plaid/create-link-token` - Generate link token for Plaid Link
- `POST /api/plaid/exchange` - Exchange public token + auto-sync transactions
- `POST /api/plaid/sync` - Manually sync transactions

#### Transaction Routes (`backend/routes/transactions.py`)
- `GET /api/transactions` - List all user transactions
- `POST /api/transactions` - Create manual transaction
- `PUT /api/transactions/<id>` - Update transaction
- `DELETE /api/transactions/<id>` - Delete transaction

#### Account Routes (`backend/routes/accounts_routes.py`)
- `GET /api/accounts` - List all user accounts

## Frontend Changes

### ConnectBank Component (`frontend/src/components/ConnectBank.jsx`)
Simplified to show:
- "Connect Bank Account" button - Opens Plaid Link
- "Sync Transactions" button - Manually sync new transactions
- Status messages for success/error

### AddTransaction Component
- Already supports account selection
- Account dropdown populated from `/api/accounts`

## How It Works

### Connecting a Bank
1. User clicks "Connect Bank Account"
2. Plaid Link modal opens
3. User selects bank and authenticates
4. Public token exchanged for access token
5. Bank accounts automatically imported
6. Last 30 days of transactions automatically imported
7. User sees success message with transaction count

### Manual Sync
1. User clicks "Sync Transactions"
2. Backend fetches last 30 days from Plaid
3. Only new transactions added (duplicates skipped via `plaid_tx_id`)
4. User sees count of new transactions

### Manual Transactions
1. User fills out transaction form
2. Optional: Select account from dropdown
3. Transaction saved with `account_id` link
4. Appears in transaction list and charts

### Transaction Management
1. **View**: All transactions listed in dashboard
2. **Edit**: Update amount, category, description, date, account
3. **Delete**: Remove unwanted transactions

## Transaction Flow

### Plaid Transactions
- Automatically imported from bank
- Linked to account via `account_id`
- Category auto-mapped from Plaid's `personal_finance_category`
- Amount stored as negative for expenses, positive for income
- `plaid_tx_id` prevents duplicates on re-sync

### Manual Transactions
- User-created via form
- Optional account link
- User-selected category
- Same data structure as Plaid transactions

## Database Schema

### Key Fields
- `User.plaid_access_token` - Plaid API access token
- `Account.plaid_account_id` - Plaid account identifier  
- `Transaction.account_id` - FK to Account (nullable)
- `Transaction.plaid_tx_id` - Plaid transaction ID (nullable, unique)

## Code Conventions Followed
- Session-based auth check: `if "user" not in session`
- User ID from session: `session["user_id"]`
- Helper function pattern: `_helper_name()` for internal functions
- Dictionary converter: `_to_dict()` for model serialization
- Error responses: `return {"error": "message"}, status_code`
- Success responses: `return jsonify({...}), status_code`
- Blueprint naming: `{feature}_bp`
- Route prefix: `/api/...`

## Testing
1. Start backend: `python app.py` (or `flask run`)
2. Start frontend: `npm run dev`
3. Sign up/login
4. Click "Connect Bank Account"
5. Use Plaid Sandbox credentials
6. Verify transactions imported
7. Click "Sync Transactions" to test manual sync
8. Add manual transaction with account
9. Edit/delete transactions

## Notes
- Plaid Sandbox used for development (free test accounts)
- 30-day transaction window on sync
- Duplicate prevention via `plaid_tx_id`
- Manual transactions work alongside Plaid transactions
- Accounts available for both Plaid and manual transactions
