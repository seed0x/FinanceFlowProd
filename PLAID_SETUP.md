# Plaid Bank Integration Setup

## What I Added

### Frontend
1. **ConnectBank Component** (`frontend/src/components/ConnectBank.jsx`)
   - Simple button to connect bank accounts
   - Shows status messages (connecting, success, errors)
   - Automatically syncs transactions after connecting

2. **Updated Dashboard** (`frontend/src/pages/Dashboard.jsx`)
   - Added ConnectBank component at the top
   - Will show "Connect Bank Account" button

### Backend
Already set up with these endpoints:
- `POST /api/plaid/create-link-token` - Creates Plaid link token
- `POST /api/plaid/exchange` - Exchanges public token for access token
- `POST /api/plaid/sync` - Syncs transactions from Plaid

## How to Use

1. **Get Plaid API Keys** (if you haven't already)
   - Sign up at https://plaid.com/
   - Get your `PLAID_CLIENT_ID` and `PLAID_SECRET` from the dashboard
   - Use SANDBOX mode for testing (free)

2. **Add to backend `.env` file:**
   ```
   PLAID_CLIENT_ID=your_client_id_here
   PLAID_SECRET=your_secret_here
   PLAID_ENV=sandbox
   ```

3. **Start the app:**
   ```
   # Terminal 1 - Backend
   cd backend
   flask run

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

4. **Connect a bank:**
   - Login to your app
   - Click "Connect Bank Account" button on dashboard
   - Follow Plaid's popup to link a bank
   - In sandbox mode, use test credentials:
     - Username: `user_good`
     - Password: `pass_good`
   - Transactions will automatically sync!

## Test Bank Credentials (Sandbox Mode)

Use these in the Plaid popup when testing:
- **Username:** `user_good`
- **Password:** `pass_good`
- **Institution:** Search for "Chase" or any bank

This will give you fake transactions to test with.

## Notes

- The code is intentionally simple/amateur looking (as requested)
- Page reloads after successful sync to show new transactions
- Syncs last 30 days of transactions
- Won't duplicate transactions if you sync multiple times
