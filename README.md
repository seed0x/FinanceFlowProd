# FinanceFlow

Team finance tracking app for CSE310 Fall 2025.

## Team Members
- Derek 
- Vlad 
- David 

---

## Project Overview

FinanceFlow is a web app where users can track their income and expenses. Each user has their own account and can add transactions, view their balance, and see monthly spending.

**What it does:**
- User login/logout with sessions
- Add transactions (income or expenses)
- View all your transactions in a list
- See total balance and monthly totals

---

## Tech Stack

### Backend (Flask + Python)
- **Flask** - Web framework
- **Flask-CORS** - Handle cross-origin requests from frontend
- **Flask Sessions** - User authentication with cookies
- **In-memory storage** - Using Python lists/dicts (no database yet)

### Frontend (React + Vite)
- **React 19** - UI framework
- **Vite 7** - Dev server and build tool
- **React Router** - Navigation between pages
- **CSS** - Custom styling

---

## Project Structure

```
-FinaceFlow/
├── backend/
│   ├── app.py              # Main Flask app
│   ├── storage.py          # Shared data (receipts list)
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py         # Login/logout routes
│   │   ├── transactions.py # Transaction CRUD
│   │   └── analytics.py    # Analytics endpoints
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   └── Dashboard.jsx
    │   └── components/
    │       ├── Header.jsx
    │       ├── StatsGrid.jsx
    │       ├── TransactionList.jsx
    │       ├── TransactionItem.jsx
    │       └── addTransaction.jsx
    ├── .env
    └── package.json
```

---

## Setup Instructions

### Backend Setup

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the Flask server:**
   ```bash
   python app.py
   ```
   
   Server runs on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend folder:**
   ```bash
   cd frontend
   ```

2. **Install Node dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```
   VITE_API_URL=http://localhost:5000
   ```

4. **Run the dev server:**
   ```bash
   npm run dev
   ```
   
   App runs on `http://localhost:5173` or `http://localhost:5174`

---

## API Endpoints

### Authentication Routes (`/api`)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/api/login` | User login | `{username, password}` | `{message, user}` |
| POST | `/api/logout` | User logout | - | `{message}` |

### Transaction Routes (`/api`)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/transactions` | Get user's transactions | - | `{transactions: [...]}` |
| POST | `/api/transactions` | Add new transaction | `{category, description, amount, type}` | `{transaction: {...}}` |

### Analytics Routes (`/api`)

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| GET | `/api/totalBalance` | Get user's total balance | `{totalBalance: number}` |
| GET | `/api/monthlyExpenses` | Get current month total | `{monthlyTotal: number}` |

---

## How Data Flows

### 1. Login Flow
```
User enters credentials → Frontend POST to /api/login
→ Backend checks USERS dict → Sets session cookie
→ Frontend stores username in localStorage
→ Redirect to dashboard
```

### 2. Add Transaction Flow
```
User fills form → addTransaction() called
→ Frontend POST to /api/transactions with {category, amount, ...}
→ Backend checks session → Creates transaction object
→ Adds to receipts list → Returns {transaction: {...}}
→ Frontend adds to state → UI updates instantly
```

### 3. View Transactions Flow
```
Dashboard loads → useEffect runs
→ Frontend GET /api/transactions
→ Backend filters receipts for current user
→ Returns {transactions: [...]}
→ Frontend stores in state → TransactionList maps and displays
```

---

## Important Notes

### Sessions & Cookies
- Backend uses Flask sessions with encrypted cookies
- Cookie setting: `SameSite=Lax` (works on localhost)
- Frontend must send `credentials: 'include'` in ALL fetch calls
- Session stores username, used to filter transactions

### Data Storage
- **Future:** Need to add SQLite or PostgreSQL database
- `receipts` list in `storage.py` holds all transactions
- Each transaction has: `{id, user, amount, category, description, type, timestamp}`

### CORS Configuration
- Backend allows `http://localhost:5173` and `http://localhost:5174`
- `supports_credentials=True` to allow cookies
- If frontend runs on different port, update `app.py`

### Date Format
- Backend stores ISO format: `datetime.now().isoformat()`
- Example: `"2024-10-24T20:30:45.123456"`
- Frontend can format for display`
- Backend queries use `datetime.fromisoformat()` for filtering

---

## Common Issues & Fixes


## Test Users

Hardcoded users `auth.py`
```python
users = {
    'derek': '123',
    'vlad': '123',
    'david': '123'
}
```

Login with any of these to test!

---

## What Still Needs Work

- [ ] Add database (SQLite or PostgreSQL)
- [ ] User registration endpoint
- [ ] Delete/edit transactions
- [ ] Charts/graphs for visualizations
- [ ] Budget tracking
- [ ] Better error handling
- [ ] Filter transactions
- [ ] Eit/delete transactions
- [ ] Carts/graphs for spending visualization

---

## Git Workflow

**Branches:**
- `main` - stable code
- Create feature branches for new work

**Commits:**
- Backend changes: commit to backend folder
- Frontend changes: commit to frontend folder

---

## Resources

- [Flask Docs](https://flask.palletsprojects.com/)
- [React Docs](https://react.dev/)
- [Vite Docs](https://vitejs.dev/)
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

---

Last updated: October 24, 2025
