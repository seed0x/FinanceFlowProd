// SpendingChart.jsx using recharts library
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function SpendingChart({ spendingData }) {
  // [{ category: 'Food', amount: 320.50 }, { category: 'Transport', amount: 185.00 }, ...]
 // sample data  
  return (
    <div className="spending-chart-section">
      <h2>Monthly Spending by Category</h2>
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
