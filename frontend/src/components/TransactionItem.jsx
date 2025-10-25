function TransactionItem({ transaction }) {
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

  return (
    <div className="transaction-item">
      <div className="transaction-info">
        <span className="transaction-category">{transaction.category}</span>
        <span className="transaction-description">{transaction.description}</span>
        <span className="transaction-date">{formatDate(transaction.timestamp)}</span>
      </div>
      <span className={`transaction-amount ${transaction.amount >= 0 ? 'positive' : 'negative'}`}>
        {transaction.amount >= 0 ? '+' : ''}{formatCurrency(transaction.amount)}
      </span>
    </div>
  );
}

export default TransactionItem;