// SpendingChart.jsx using recharts library
import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './SpendingChart.css'; // import css file for styles

function SpendingChart({ transactions }) {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly'); // set period to either weekly or monthly, 'monthly' by default

  // Calculate spending by category based on selected period
  const spendingData = useMemo(() => {
    const now = new Date();
    let startDate;

    if (selectedPeriod === 'weekly') {
      // Get start of current week 
      startDate = new Date(now);
      startDate.setDate(now.getDate() - now.getDay()); // Go back to Sunday
      startDate.setHours(0, 0, 0, 0);
    } else {
      // Get start of current month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const spendingByCategory = {};
    
    transactions.forEach(transaction => {
      // Only count expenses (negative amounts)
      if (transaction.amount < 0) {
        const transactionDate = new Date(transaction.timestamp || transaction.date);
        
        // Filter by date range
        if (transactionDate >= startDate) {
          const category = transaction.category || 'Other';
          const amount = Math.abs(transaction.amount);
          spendingByCategory[category] = (spendingByCategory[category] || 0) + amount;
        }
      }
    });
    
    // Convert to array format for the chart
    return Object.entries(spendingByCategory).map(([category, amount]) => ({
      category,
      amount: parseFloat(amount.toFixed(2))
    }));
  }, [transactions, selectedPeriod]);

  return (
    <div className="spending-chart-section">
      <h2>Spending By Category</h2>
      
      {/* tab buttons */}
      <div className="chart-tabs">
        <button 
          className={`tab-button ${selectedPeriod === 'monthly' ? 'active' : ''}`}
          onClick={() => setSelectedPeriod('monthly')}
        >
          Monthly
        </button>
        <button 
          className={`tab-button ${selectedPeriod === 'weekly' ? 'active' : ''}`}
          onClick={() => setSelectedPeriod('weekly')}
        >
          Weekly
        </button>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={spendingData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
          <Bar dataKey="amount" fill="#2ecc71" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SpendingChart; 
