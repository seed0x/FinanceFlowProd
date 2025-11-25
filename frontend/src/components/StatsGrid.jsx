import StatsCard from './StatsCard';

function StatsGrid({ totalBalance, monthlyTotal, monthlyIncome }) {
  const monthlyNet = monthlyIncome - monthlyTotal;

  return (
    <div className="stats-grid">
      <StatsCard 
        title="Income This Month" 
        amount={monthlyIncome} 
        isPositive={true} 
        showSign={true}
      />
      <StatsCard 
        title="Spent This Month" 
        amount={monthlyTotal} 
        isPositive={false} 
        showSign={false}
      />
      <StatsCard 
        title="Net This Month" 
        amount={monthlyNet} 
        isPositive={monthlyNet >= 0}
        showSign={true}
      />
    </div>
  );
}

export default StatsGrid; 
