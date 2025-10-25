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
  const [totalBalance, setTotalBalance] = useState(0);
  const [monthlyTotal, setMonthlyTotal] = useState(0);

useEffect(() => {
  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${API_URL}/transactions`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Backend returned:', data);  // Debug
        setTransactions(data.transactions || []);  // Default to empty array if undefined
      } else {
        console.log('Response not ok:', response.status);  // Debug
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };
  
  fetchTransactions();
}, []);  // Run once to fetch transactions

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Fetch total balance
        const balanceResponse = await fetch(`${API_URL}/totalBalance`, {
          credentials: 'include',
        });
        if (balanceResponse.ok) {
          const balanceData = await balanceResponse.json();
          setTotalBalance(balanceData.totalBalance);
        }

        // Fetch monthly expenses
        const monthlyResponse = await fetch(`${API_URL}/monthlyExpenses`, {
          credentials: 'include',
        });
        if (monthlyResponse.ok) {
          const monthlyData = await monthlyResponse.json();
          setMonthlyTotal(monthlyData.monthlyTotal);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
    };

    fetchAnalytics();
  }, [transactions]);  // Re-fetch when transactions change

  // Function to add new transaction
  const addTransaction = async (newTransaction) => {
    try {
      const response = await fetch(`${API_URL}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(newTransaction),
      });
          if (response.ok) {
            const data = await response.json();
            setTransactions(prev => [data.transaction, ...prev]);
            console.log(data);
            alert('Transaction added successfully');
          } else {

            alert('Invalid transaction data');
          }
      } catch (error) {
	       console.error('Error:', error);
      }
  };

// UI
  return (
    <div className="dashboard">
      <Header user={user} />
      
      <div className="dashboard-content">
        <StatsGrid 
          totalBalance={totalBalance}
          monthlyTotal={monthlyTotal}
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