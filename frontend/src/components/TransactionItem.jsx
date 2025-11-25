function TransactionItem({ transaction, onDelete }) {
  const API_URL = import.meta.env.VITE_API_URL;

  // Format currency function
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount)); 
  };

  // Format date function
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Delete transaction
  const handleDelete = async () => {
    if (!confirm('Delete this transaction?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/transactions/${transaction.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        onDelete(transaction.id);
      } else {
        alert('Failed to delete transaction');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Error deleting transaction');
    }
  };

  return (
    <div className={`transaction-item ${transaction.type === 'income' ? 'income-card' : 'expense-card'}`}>
      <div className="transaction-info">
        <span className={transaction.type === 'income' ? 'transaction-category-green' : 'transaction-category-red'}>{transaction.category}</span>
        <span className="transaction-description">{transaction.description}</span>
        <span className="transaction-date">{formatDate(transaction.timestamp)}</span>
      </div>
      <div className="transaction-actions">
        <span className={`transaction-amount ${transaction.amount >= 0 ? 'positive' : 'negative'}`}>
          {transaction.amount >= 0 ? '+' : ''}{formatCurrency(transaction.amount)}
        </span>
        <button onClick={handleDelete} className="delete-btn">×</button>
      </div>
    </div>
  );
}

export default TransactionItem;
