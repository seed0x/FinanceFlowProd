import { useState, useEffect } from 'react';
import './Budget.css';

function Budget({ monthlyTotal }) {
  const [budget, setBudget] = useState(null);
  const [budgetInput, setBudgetInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch current budget from analytics api (commented out until routes setup)
 /* useEffect(() => {
    const fetchBudget = async () => {
      try {
        const response = await fetch(`/api/analytics/getBudget`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.budget) {
            setBudget(data.budget);
            setBudgetInput(data.budget.toString());
          }
        }
      } catch (error) {
        console.error('Error fetching budget:', error);
      }
    };

    fetchBudget();
  }, []);
*/
  const handleSetBudget = async (e) => {
    e.preventDefault();
    
    const budgetAmount = parseFloat(budgetInput);
    
    // Validate input
    if (isNaN(budgetAmount) || budgetAmount <= 0) {
      alert('Please enter a valid budget amount');
      return;
    }
   setBudget(budgetAmount);

  //  all commented out until routes set up
 //   setLoading(true);
 /*    try {
      const response = await fetch(`api/analytics/setBudget`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ budget: budgetAmount })
      });

      if (response.ok) {
        const data = await response.json();
        setBudget(data.budget);
        alert('Budget set successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to set budget');
      }
    } catch (error) {
      console.error('Error setting budget:', error);
      alert('Error setting budget. Please try again.');
    } finally {
      setLoading(false);
    }
*/
  };

  return (
    <div className="budget-section">
      <div className="budget-header">
        <h2>Monthly Budget</h2>
      </div>
<div className="budget-content-wrapper">
      <form onSubmit={handleSetBudget} className="budget-form">
        <div className="form-group">
          <label htmlFor="budget-amount">Monthly Budget ($)</label>
          <input
            type="number"
            id="budget-amount"
            value={budgetInput}
            onChange={(e) => setBudgetInput(e.target.value)}
            placeholder="Enter monthly budget"
            min="0"
            step="0.01"
            required
            disabled={loading}
          />
        </div>
        <button type="submit" className="set-budget-btn" disabled={loading}>
          {loading ? 'Setting...' : 'Set Budget'}
        </button>
      </form>

      {/* Display current budget and spending if budget is set */}
      {budget && (
        <div className="budget-display">
          <div className="budget-info">
            <p>Budget: <span className="budget-amount">${budget.toFixed(2)}</span></p>
            <p>Spent: <span className="spent-amount">${monthlyTotal.toFixed(2)}</span></p>
            <p>Remaining: <span className={`remaining-amount ${(budget - monthlyTotal) < 0 ? 'over-budget' : ''}`}>
              ${(budget - monthlyTotal).toFixed(2)}
            </span></p>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default Budget;
