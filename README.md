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
- **Flask-SQLAlchemy** - Database ORM
- **Flask-Migrate** - Database migrations
- **SQLite** - Persistent local database

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
│   ├── db.py               # Database setup (SQLAlchemy + Migrate)
│   ├── models.py           # Database models
│   ├── seed.py             # Optional seed data
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py         # Login/logout routes
│   │   ├── transactions.py # Transaction CRUD (DB-backed)
│   │   ├── analytics.py    # Analytics endpoints (DB-backed)
│   │   └── budgets.py      # Budget endpoints (per-category monthly)
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

3. **Create `.env` file:**

   ```
   SECRET_KEY=dev-change-me
   DATABASE_URL=sqlite:///financeflow.db
   FLASK_ENV=development
   ```

4. **Initialize database:**

   ```powershell
   # PowerShell (Windows)
   $env:FLASK_APP="app"
   flask db upgrade
   ```

   ```bash
   # bash/zsh (macOS/Linux)
   export FLASK_APP=app
   flask db upgrade
   ```

5. **Run the Flask server:**

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
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Run the dev server:**

   ```bash
   npm run dev
   ```

   App runs on `http://localhost:5173` or `http://localhost:5174`

---

## API Endpoints

### Authentication Routes (`/api`)

| Method | Endpoint      | Description | Request Body           | Response          |
| ------ | ------------- | ----------- | ---------------------- | ----------------- |
| POST   | `/api/login`  | User login  | `{username, password}` | `{message, user}` |
| POST   | `/api/logout` | User logout | -                      | `{message}`       |

### Transaction Routes (`/api`)

| Method | Endpoint            | Description             | Request Body                            | Response                |
| ------ | ------------------- | ----------------------- | --------------------------------------- | ----------------------- |
| GET    | `/api/transactions` | Get user's transactions | -                                       | `{transactions: [...]}` |
| POST   | `/api/transactions` | Add new transaction     | `{category, description, amount, type}` | `{transaction: {...}}`  |

### Analytics Routes (`/api`)

|| Method | Endpoint                 | Description                         | Response                        |
|| ------ | ------------------------ | ----------------------------------- | ------------------------------- |
|| GET    | `/api/totalBalance`      | Get user's total balance            | `{totalBalance: number}`        |
|| GET    | `/api/totalIncome`       | Get total income                    | `{totalIncome: number}`         |
|| GET    | `/api/totalExpense`      | Get total expenses                  | `{totalExpense: number}`        |
|| GET    | `/api/monthlyExpenses`   | Get current month total             | `{monthlyTotal: number}`        |
|| GET    | `/api/totalTransactions` | Get current month transaction count | `{monthlyTransactions: number}` |

### Budgets Routes (`/api/budgets`)

|| Method | Endpoint                    | Description                            | Request Body                              | Response                                 |
|| ------ | --------------------------- | -------------------------------------- | ----------------------------------------- | ---------------------------------------- |
|| GET    | `/api/budgets/getBudgets`   | List budgets for current month         | -                                         | `{month, budgets: [{category,budget,spent,remaining,active}], [budget], [category]}` |
|| POST   | `/api/budgets/setBudget`    | Create a budget for a category/month   | `{category: string, budget: number}`      | `{id, category, budget, month}`          |

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
→ Backend checks session → Saves to database
→ Returns {transaction: {...}}
→ Frontend adds to state → UI updates instantly
```

### 3. View Transactions Flow

```
Dashboard loads → useEffect runs
→ Frontend GET /api/transactions
→ Backend queries database for current user
→ Returns {transactions: [...]}
→ Frontend stores in state → TransactionList maps and displays
```

### 4. Budgets Flow

```
User selects category + amount → Frontend POST /api/budgets/setBudget {category, budget}
→ Backend saves a budget row for the current month
→ Frontend updates the per-category budget card
→ Frontend GET /api/budgets/getBudgets to refresh all cards (optional)
```

---

## Important Notes

### Sessions & Cookies

- Backend uses Flask sessions with encrypted cookies
- Cookie setting: `SameSite=Lax` (works on localhost)
- Frontend must send `credentials: 'include'` in ALL fetch calls
- Session stores username and user_id, used to filter transactions

### Data Storage

- Uses SQLite database through SQLAlchemy
- Each transaction has: `{id, user_id, amount, category, description, type, date, created_at}`
- Income stored as positive, expenses stored as negative

### CORS Configuration

- Backend allows `http://localhost:5173` and `http://localhost:5174`
- `supports_credentials=True` to allow cookies
- If frontend runs on different port, update `app.py`

### Date Format

- Backend stores ISO format: `datetime.now().isoformat()`
- Example: `"2025-10-25T20:30:45.123456"`
- Frontend can format for display
- Backend queries use `date` column for filtering

---

## Common Issues & Fixes

- If you add or change models (e.g., Budget), run migrations:

```powershell
# PowerShell (Windows)
$env:FLASK_APP="app"
flask db migrate -m "update models"
flask db upgrade
```

```bash
# bash/zsh (macOS/Linux)
export FLASK_APP=app
flask db migrate -m "update models"
flask db upgrade
```

- CORS/session errors: ensure frontend requests include `credentials: 'include'` and that the backend `CORS(..., supports_credentials=True, origins=[http://localhost:5173, http://localhost:5174])` matches your dev port.

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

- [ ] User registration endpoint
- [ ] Delete/edit transactions
- [ ] Charts/graphs for visualizations
- [ ] Budget reporting (update existing category/month and summaries)
- [ ] Better error handling
- [ ] Filter transactions

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

Last updated: November 10, 2025
