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
- Delete transactions
- Edit transaction categories
- See income, spending, and net balance for current month
- Track budgets by category
- **Connect bank accounts via Plaid** for automatic transaction import
- Visualize spending with charts

---

## Tech Stack

### Backend (Flask + Python)

- **Flask** - Web framework
- **Flask-CORS** - Handle cross-origin requests from frontend
- **Flask Sessions** - User authentication with cookies
- **Flask-SQLAlchemy** - Database ORM
- **Flask-Migrate** - Database migrations
- **SQLite** - Persistent local database
- **Plaid API** - Bank account integration for automatic transaction import

### Frontend (React + Vite)

- **React 19** - UI framework
- **Vite 7** - Dev server and build tool
- **React Router** - Navigation between pages
- **react-plaid-link** - Plaid bank connection UI
- **Recharts** - Spending visualization charts
- **CSS** - Custom styling

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
   PLAID_CLIENT_ID=your_plaid_client_id
   PLAID_SECRET=your_plaid_secret
   PLAID_ENV=sandbox
   ```
   Get Plaid credentials at [https://dashboard.plaid.com](https://dashboard.plaid.com)

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
| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/api/login` | User login | `{username, password}` | `{message, user}` |
| POST | `/api/logout` | User logout | - | `{message}` |

### Transaction Routes (`/api`)
| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/transactions` | Get user's transactions | - | `{transactions: [...]}` |
| POST | `/api/transactions` | Add new transaction | `{category, description, amount, type, account_id}` | `{transaction: {...}}` |
| PUT | `/api/transactions/<id>` | Update transaction category | `{category}` | `{transaction: {...}}` |
| DELETE | `/api/transactions/<id>` | Delete transaction | - | `{success: true}` |
| GET | `/api/accounts` | Get user's bank accounts | - | `{accounts: [...]}` |

### Analytics Routes (`/api`)
| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| GET | `/api/totalBalance` | Get user's total balance | `{totalBalance: number}` |
| GET | `/api/totalIncome` | Get total income | `{totalIncome: number}` |
| GET | `/api/totalExpense` | Get total expenses | `{totalExpense: number}` |
| GET | `/api/monthlyExpenses` | Get current month expenses | `{monthlyTotal: number}` |
| GET | `/api/monthlyIncome` | Get current month income | `{monthlyIncome: number}` |
| GET | `/api/totalTransactions` | Get current month transaction count | `{monthlyTransactions: number}` |

### Budgets Routes (`/api/budgets`)
| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/budgets/getBudgets` | List budgets for current month | - | `{month, budgets: [...]}` |
| POST | `/api/budgets/setBudget` | Create a budget for a category/month | `{category, budget}` | `{id, category, budget, month}` |

### Plaid Routes (`/api/plaid`)
| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/api/plaid/create-link-token` | Create Plaid Link token | - | `{link_token}` |
| POST | `/api/plaid/exchange` | Exchange public token, sync accounts | `{public_token}` | `{success, new_transactions}` |
| POST | `/api/plaid/sync` | Manually sync transactions from Plaid | - | `{success, new_transactions}` |

---

## Key Features

### Dashboard Cards
- **Income This Month** - Shows current month income
- **Spent This Month** - Shows current month expenses
- **Net This Month** - Shows profit/loss for current month

### Plaid Integration
- Sandbox mode for testing (no real bank data)
- Automatically categorizes transactions using merchant names
- Stores `plaid_tx_id` to prevent duplicate imports
- Syncs last 30 days of transactions on connect
- 100+ merchant keywords for smart categorization

### Budget Tracking
- Set monthly budgets per category
- Real-time spending tracking
- Visual progress bars showing budget usage

---

## What Still Needs Work

- [ ] User registration endpoint
- [ ] Edit transaction UI (backend endpoint exists)
- [ ] Filter/search transactions
- [ ] Export transactions to CSV
- [ ] Multiple Plaid bank connections
- [ ] Better error handling

---

Last updated: November 25, 2025
