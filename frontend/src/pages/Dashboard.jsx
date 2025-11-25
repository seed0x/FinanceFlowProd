import { useEffect, useState } from 'react';
import AddTransaction from '../components/addTransaction';
import Header from '../components/Header';
import StatsGrid from '../components/StatsGrid';
import TransactionList from '../components/TransactionList';
import Budget from '../components/Budget'
import SpendingChart from '../components/SpendingChart'
import ConnectBank from '../components/ConnectBank';
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
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [spendingData, setSpendingData] = useState([]);

  useEffect(() => {
    // Calculate spending by category from transactions
    const spendingByCategory = {};
    
    transactions.forEach(transaction => {
      // Only count expenses (negative amounts)
      if (transaction.amount < 0) {
        const category = transaction.category || 'Other';
        const amount = Math.abs(transaction.amount);
        spendingByCategory[category] = (spendingByCategory[category] || 0) + amount;
      }
    });
    
    // Convert to array format for the chart
    const chartData = Object.entries(spendingByCategory).map(([category, amount]) => ({
      category,
      amount: parseFloat(amount.toFixed(2))
    }));
    
    setSpendingData(chartData);
  }, [transactions]);

// Extract fetch function so it can be called from multiple places
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

useEffect(() => {
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

        // Fetch monthly income
        const incomeResponse = await fetch(`${API_URL}/monthlyIncome`, {
          credentials: 'include',
        });
        if (incomeResponse.ok) {
          const incomeData = await incomeResponse.json();
          setMonthlyIncome(incomeData.monthlyIncome);
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
            console.log('Transaction added successfully:', data);
          } else {
           alert('Invalid transaction data');
          }
      } catch (error) {
	       console.error('Error:', error);
      }
  };

  // Function to delete transaction
  const deleteTransaction = (transactionId) => {
    setTransactions(prev => prev.filter(t => t.id !== transactionId));
  };

  // Callback for when bank connection succeeds
  const handleBankConnectionSuccess = () => {
    fetchTransactions();  // Refetch transactions
    // Also refetch analytics
    const refetchAnalytics = async () => {
      try {
        const balanceResponse = await fetch(`${API_URL}/totalBalance`, {
          credentials: 'include',
        });
        if (balanceResponse.ok) {
          const balanceData = await balanceResponse.json();
          setTotalBalance(balanceData.totalBalance);
        }

        const monthlyResponse = await fetch(`${API_URL}/monthlyExpenses`, {
          credentials: 'include',
        });
        if (monthlyResponse.ok) {
          const monthlyData = await monthlyResponse.json();
          setMonthlyTotal(monthlyData.monthlyTotal);
        }

        const incomeResponse = await fetch(`${API_URL}/monthlyIncome`, {
          credentials: 'include',
        });
        if (incomeResponse.ok) {
          const incomeData = await incomeResponse.json();
          setMonthlyIncome(incomeData.monthlyIncome);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
    };
    refetchAnalytics();
  };

// UI
  return (
    <div className="dashboard">
      <Header user={user} />
      
      <div className="dashboard-content">
        <StatsGrid 
          totalBalance={totalBalance}
          monthlyTotal={monthlyTotal}
          monthlyIncome={monthlyIncome}
        />
        
        <ConnectBank onConnectionSuccess={handleBankConnectionSuccess} />
        
        <div className="main-content">
          <div className="add-transaction-section">
            <h2>Add New Transaction</h2>
            <AddTransaction onAddTransaction={addTransaction} />
          </div>
          
          <TransactionList transactions={transactions} onDeleteTransaction={deleteTransaction} />
        </div>
        <div className="budget-section">
          <Budget monthlyTotal={monthlyTotal}/>
        </div>
        <div className="spending-chart-section">
          <SpendingChart spendingData={spendingData} /> 
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
