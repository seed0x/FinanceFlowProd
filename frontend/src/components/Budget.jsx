import { useState, useEffect, useMemo } from 'react';
import './Budget.css';

function Budget({ monthlyTotal }) {
  const API_URL = import.meta.env.VITE_API_URL; // e.g., http://localhost:5000/api
  const [category, setCategory] = useState('');
  const [budgets, setBudgets] = useState([]);   // array of budgets from backend
  const [budgetInput, setBudgetInput] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = ['Food', 'Transport', 'Entertainment', 'Utilities', 'Shopping', 'Healthcare', 'Education', 'Other'];

//---------------------------------------------------------------------------
  
 const monthKey = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }, []); 
  
//---------------------------------------------------------------------------
      
  // Fetch all budgets from budgets api 
  // COMMENTED OUT FOR STYLING - USING DUMMY DATA
  // useEffect(() => {
  //   const fetchBudgets = async () => {
  //     try {
  //       const response = await fetch(`${API_URL}/budgets/getBudgets`, {
  //         credentials: 'include'
  //       });
  //       
  //       if (response.ok) {
  //         const data = await response.json();
  //         if (data.budgets && Array.isArray(data.budgets)) {
  //           setBudgets(data.budgets);
  //         }
  //       }
  //     } catch (error) {
  //       console.error('Error fetching budgets:', error);
  //     }
  //   };

  //   fetchBudgets();
  // }, []);

  // DUMMY DATA FOR STYLING
  useEffect(() => {
    setBudgets([
      {
        category: 'Food',
        month: '2024-01',
        budget: 500.00,
        spent: 320.50,
        remaining: 179.50
      },
      {
        category: 'Transport',
        month: '2024-01',
        budget: 200.00,
        spent: 185.00,
        remaining: 15.00
      },
      {
        category: 'Entertainment',
        month: '2024-01',
        budget: 150.00,
        spent: 45.00,
        remaining: 105.00
      }
    ]);
  }, []);
  

  const handleSetBudget = async (e) => {
    e.preventDefault();
    
    const budgetAmount = parseFloat(budgetInput);
    
    // Validate input
    if (isNaN(budgetAmount) || budgetAmount <= 0) {
      alert('Please enter a valid budget amount');
      return;
    }

    if (!category) {
      alert('Please select a category');
      return;
    }

    // COMMENTED OUT BACKEND CALL - USING DUMMY DATA FOR STYLING
    // setLoading(true);
    //  
    // try {
    //   const response = await fetch(`${API_URL}/budgets/setBudget`, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     credentials: 'include',
    //     body: JSON.stringify({ budget: budgetAmount, category })
    //   });

    //   if (response.ok) {
    //     // Refresh the budgets list
    //     const budgetsResponse = await fetch(`${API_URL}/budgets/getBudgets`, {
    //       credentials: 'include'
    //     });
    //     
    //     if (budgetsResponse.ok) {
    //       const budgetsData = await budgetsResponse.json();
    //       if (budgetsData.budgets && Array.isArray(budgetsData.budgets)) {
    //         setBudgets(budgetsData.budgets);
    //       }
    //     }
    //     
    //     setBudgetInput('');
    //     setCategory('');
    //     alert('Budget set successfully!');
    //   } else {
    //     const errorData = await response.json();
    //     alert(errorData.error || 'Failed to set budget');
    //   }
    // } catch (error) {
    //   console.error('Error setting budget:', error);
    //   alert('Error setting budget. Please try again.');
    // } finally {
    //   setLoading(false);
    // }

    // DUMMY DATA - Add to local state for styling
    const newBudget = {
      category: category,
      month: monthKey,
      budget: budgetAmount,
      spent: 0,
      remaining: budgetAmount
    };

    // Check if budget already exists for this category
    const existingIndex = budgets.findIndex(b => b.category === category && b.month === monthKey);
    
    if (existingIndex >= 0) {
      // Update existing budget
      const updatedBudgets = [...budgets];
      updatedBudgets[existingIndex] = { 
        ...updatedBudgets[existingIndex], 
        budget: budgetAmount, 
        remaining: budgetAmount - updatedBudgets[existingIndex].spent 
      };
      setBudgets(updatedBudgets);
    } else {
      // Add new budget
      setBudgets([...budgets, newBudget]);
    }

    setBudgetInput('');
    setCategory('');
   

  };
  
//------------------------------------------------------------------
  
  return (
    <>
      <div className="budget-header">
        <h2>Monthly Budgets</h2>
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
          <label htmlFor="category">Category</label>
          <select 
            id="category"
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          </div>
          <button type="submit" className="set-budget-btn" disabled={loading}>
            {loading ? 'Setting...' : 'Set Budget'}
          </button>
        </form>

        {/* Display all budgets */}
        <div className="budget-display">
          {budgets.length > 0 ? (
            budgets.map((budgetItem) => {
              const percentage = budgetItem.budget > 0 
                ? Math.min((budgetItem.spent / budgetItem.budget) * 100, 100) 
                : 0;
              const isOverBudget = budgetItem.spent > budgetItem.budget;
              
              return (
                <div key={`${budgetItem.category}-${budgetItem.month}`} className="budget-card">
                  <div className="budget-card-header">
                    <h3 className="budget-title">{budgetItem.category} Budget</h3>
                  </div>
                  <div className="budget-info">
                    <p>Budget: <span className="budget-amount">${budgetItem.budget.toFixed(2)}</span></p>
                    <p>Spent: <span className="spent-amount">${budgetItem.spent.toFixed(2)}</span></p>
                    
                    {/* Progress bar */}
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
            })
          ) : (
            <p style={{ color: '#6c757d', fontStyle: 'italic' }}>No budgets set yet. Create one above!</p>
          )}
        </div>
      </div>
    </>
  );
}

export default Budget;