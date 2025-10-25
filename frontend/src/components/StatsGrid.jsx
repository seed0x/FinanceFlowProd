import StatsCard from './StatsCard';

function StatsGrid({ totalBalance, monthlyTotal, transactionCount }) {

  return (
    <div className="stats-grid">
      <StatsCard 
        title="Total Balance" 
        amount={totalBalance} 
        isPositive={totalBalance >= 0}
        showSign={true} 
      />
      <StatsCard 
        title="This Month" 
        amount={monthlyTotal} 
        isPositive={monthlyTotal >= 0} 
        showSign={true}
      />
      <div className="stat-card">
        <h3>Transactions</h3>
        <p className="stat-amount">{transactionCount}</p>
      </div>
    </div>
  );
}

export default StatsGrid; 
