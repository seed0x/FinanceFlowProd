import { useState } from 'react';
import AddTransaction from '../components/addTransaction';
import './Dashboard.css';

function Dashboard() {
  // Sample initial transactions until backend is implemented 
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      category: 'Food',
      description: 'Grocery shopping',
      amount: -100.20,
      type: 'expense',
      date: '2024-01-15T10:30:00.000Z'
    },
    {
      id: 2,
      category: 'Transport',
      description: 'Uber ride',
      amount: -12.50,
      type: 'expense',
      date: '2024-01-15T14:20:00.000Z'
    },
    {
      id: 3,
      category: 'Income',
      description: 'Freelance work',
      amount: 27000.00,
      type: 'income',
      date: '2024-01-14T16:45:00.000Z'
    }
  ]);

  // Calculate stats from transactiions and month totals 
  const totalBalance = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const thisMonthTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    const currentDate = new Date();
    return transactionDate.getMonth() === currentDate.getMonth() && 
           transactionDate.getFullYear() === currentDate.getFullYear();
  });
  const thisMonthTotal = thisMonthTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);

  // Function to add new transaction
  const addTransaction = (newTransaction) => {
    const transaction = {
      id: Date.now(), // Simple ID generation
      ...newTransaction,
      date: new Date().toISOString() // turn date to simple string 
    };
    setTransactions(prev => [transaction, ...prev]); // use state to add new transaction
  };

  // Format currency function
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount)); 
  };

  // Format date funcition
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
// UI
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>FinanceFlow</h1>
        <div className="user-info">
          <span className="welcome-text">Welcome back!</span>
          <div className="user-avatar">U</div>
        </div>
      </header>
      
      <div className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Balance</h3>
            <p className={`stat-amount ${totalBalance >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(totalBalance)}
            </p>
          </div>
          <div className="stat-card">
            <h3>This Month</h3>
            <p className={`stat-amount ${thisMonthTotal >= 0 ? 'positive' : 'negative'}`}>
              {thisMonthTotal >= 0 ? '+' : ''}{formatCurrency(thisMonthTotal)}
            </p>
          </div>
          <div className="stat-card">
            <h3>Transactions</h3>
            <p className="stat-amount">{transactions.length}</p>
          </div>
        </div>
        
        <div className="main-content">
          <div className="add-transaction-section">
            <h2>Add New Transaction</h2>
            <AddTransaction onAddTransaction={addTransaction} />
          </div>
          
          <div className="recent-transactions">
            <h2>Recent Transactions</h2>
            <div className="transactions-list">
              {transactions.length === 0 ? (
                <div className="no-transactions">
                  <p>No transactions yet. Add your first transaction above!</p>
                </div>
              ) : (
                transactions.map(transaction => (
                  <div key={transaction.id} className="transaction-item">
                    <div className="transaction-info">
                      <span className="transaction-category">{transaction.category}</span>
                      <span className="transaction-description">{transaction.description}</span>
                      <span className="transaction-date">{formatDate(transaction.date)}</span>
                    </div>
                    <span className={`transaction-amount ${transaction.amount >= 0 ? 'positive' : 'negative'}`}>
                      {transaction.amount >= 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;