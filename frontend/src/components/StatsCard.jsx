function StatsCard({ title, amount, isPositive }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount));
  };

  return (
    <div className="stat-card">
      <h3>{title}</h3>
      <p className={`stat-amount ${isPositive ? 'positive' : 'negative'}`}>
        {isPositive ? '+' : ''}{formatCurrency(amount)}
      </p>
    </div>
  );
}

export default StatsCard;