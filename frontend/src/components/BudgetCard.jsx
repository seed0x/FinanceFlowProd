import { useState } from 'react';
import editIcon from '../assets/edit.svg';
import './BudgetCard.css';

function BudgetCard({ budgetItem }) {
  const API_URL = import.meta.env.VITE_API_URL;

  const percentage = budgetItem.budget > 0  ? Math.min((budgetItem.spent / budgetItem.budget) * 100, 100) : 0;
  const isOverBudget = budgetItem.spent > budgetItem.budget;

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

  // need to add funtion to edit

  return (
    <div className="budget-card">
      <div className="budget-card-header">
        <h3 className="budget-title">{budgetItem.category} Budget</h3>
        <div className="budget-actions">
         <button 
           // onClick={() => isEditing ? handleSaveEdit() : setIsEditing(true)} 
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
      </div>
    </div>
  );
}

export default BudgetCard;
