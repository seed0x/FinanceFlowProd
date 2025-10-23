import { useEffect, useState } from 'react';
import AddTransaction from '../components/addTransaction';
import Header from '../components/Header';
import StatsGrid from '../components/StatsGrid';
import TransactionList from '../components/TransactionList';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
  
function Dashboard() {

const API_URL = import.meta.env.VITE_API_URL; // API URL prefix
const navigate = useNavigate();
const user = localStorage.getItem('user');


  // Sample initial transactions until backend is implemented 
  const [transactions, setTransactions] = useState([]);

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

// UI
  return (
    <div className="dashboard">
      <Header user={user} />
      
      <div className="dashboard-content">
        <StatsGrid 
          totalBalance={totalBalance}
          monthlyTotal={thisMonthTotal}
          transactionCount={transactions.length}
        />
        
        <div className="main-content">
          <div className="add-transaction-section">
            <h2>Add New Transaction</h2>
            <AddTransaction onAddTransaction={addTransaction} />
          </div>
          
          <TransactionList transactions={transactions} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;