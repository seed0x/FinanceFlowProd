import { useState } from 'react';
import editIcon from '../assets/edit.svg';
import './BudgetCard.css';

function BudgetCard({ budgetItem }) {
  const API_URL = import.meta.env.VITE_API_URL;

  const percentage = budgetItem.budget > 0  ? Math.min((budgetItem.spent / budgetItem.budget) * 100, 100) : 0;
  const isOverBudget = budgetItem.spent > budgetItem.budget;
  const [isEditing, setIsEditing] = useState(false);
  const [editAmount, setEditAmount] = useState('');

// function to delete budget card     
  const handleDelete = async () => {
    if (!confirm('Delete this budget?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/budgets/${budgetItem.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        alert('budget deleted successfully')
      } else {
        alert('Failed to delete budget');
      }
    } catch (error) {
      console.error('Error deleting budget:', error);
      alert('Error deleting budget');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditAmount(budgetItem.budget.toString());
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditAmount('');
  };

  const handleSaveEdit = async () => {
    const amount = parseFloat(editAmount);

    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid budget amount');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/budgets/${budgetItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ amount })
      });

      if (response.ok) {
        alert('Budget updated successfully!');
        setIsEditing(false);
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to update budget');
      }
    } catch (error) {
      console.error('Error updating budget:', error);
      alert('Error updating budget. Please try again.');
    }
  };

  return (
    <div className="budget-card">
      <div className="budget-card-header">
        <h3 className="budget-title">{budgetItem.category} Budget</h3>
        <div className="budget-actions">
         <button 
           onClick={handleEdit}
            className="edit-btn"
          >
            <img src={editIcon} alt="Edit" />
          </button>
          <button 
            onClick={handleDelete} 
            className="delete-btn"
          >
            ×
          </button>
        </div>
      </div>
      <div className="budget-info">
        {isEditing ? (
          <div className="edit-budget-form">
            <label>Update Budget Amount:</label>
            <input
              type="number"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              min="0"
              step="0.01"
              className="edit-budget-input"
            />
            <div className="edit-budget-buttons">
              <button onClick={handleSaveEdit} className="save-btn">
                Save
              </button>
              <button onClick={handleCancelEdit} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <p>Budget:<span className="budget-amount">${budgetItem.budget.toFixed(2)}</span></p>
            <p>Spent: <span className="spent-amount">${budgetItem.spent.toFixed(2)}</span></p>

            <div className="budget-progress">
              <div
                className={`budget-progress-bar ${isOverBudget ? 'danger' : percentage >= 75 ? 'warning' : ''}`}
                style={{ width: `${percentage}%` }}
              />
            </div>

            <p>Remaining: <span className={`remaining-amount ${isOverBudget ? 'over-budget' : ''}`}>
              ${budgetItem.remaining.toFixed(2)}
            </span></p>
          </>
        )}
      </div>
    </div>
  );
}

export default BudgetCard;
