import {useState} from 'react';
import editIcon from '../assets/edit.svg'

function TransactionItem({ transaction, onDelete, onUpdate }) {
  const API_URL = import.meta.env.VITE_API_URL;

  const [isEditing, setIsEditing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(transaction.category)

 const categories = ['Food', 'Transport', 'Entertainment', 'Utilities', 'Shopping', 'Healthcare', 'Education', 'Other'];

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

  //update category 
  const handleCategoryUpdate = async (newCategory) => {
    try {
      const response = await fetch(`${API_URL}/transactions/${transaction.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({category: newCategory})
      });

      if (response.ok){
        const data = await response.json();
        onUpdate(data.transaction);
        setIsEditing(false);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Error updating category');
    }
  };

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setSelectedCategory(newCategory);
    handleCategoryUpdate(newCategory);
  }

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
        {isEditing ? (
        <select 
          value = {selectedCategory}
          onChange = {handleCategoryChange}
          onBlur = {() => setIsEditing(false)}
          autoFocus
          className="category-select"
         >
          {categories.map(cat => (
          <option key = {cat} value = {cat}>{cat}</option>
          ))}
          </select>
        ): (

        <span className={transaction.type === 'income' ? 'transaction-category-green' : 'transaction-category-red'}>{transaction.category}</span>

        )}
        <span className="transaction-description">{transaction.description}</span>
        <span className="transaction-date">{formatDate(transaction.timestamp)}</span>
      </div>
      <div className="transaction-actions">
        <span className={`transaction-amount ${transaction.amount >= 0 ? 'positive' : 'negative'}`}>
          {transaction.amount >= 0 ? '+' : ''}{formatCurrency(transaction.amount)}
        </span>
        <button onClick={() => setIsEditing(!isEditing)} className="edit-btn">
          <img src={editIcon} alt="Edit"/>
        </button>
        <button onClick={handleDelete} className="delete-btn">×</button>
      </div>
    </div>
  );
}

export default TransactionItem;
