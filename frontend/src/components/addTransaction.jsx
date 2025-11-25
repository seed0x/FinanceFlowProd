import { useState, useEffect } from 'react';
import './AddTransaction.css';

function AddTransaction({ onAddTransaction }) {
  const API_URL = import.meta.env.VITE_API_URL;
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [transactionType, setTransactionType] = useState('expense');
  const [accountId, setAccountId] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState(['Food', 'Transport', 'Entertainment', 'Utilities', 'Shopping', 'Healthcare', 'Education', 'Other']);

  // Fetch accounts and categories when component loads
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch(`${API_URL}/accounts`, {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setAccounts(data.accounts || []);
        }
      } catch (error) {
        console.error('Error fetching accounts:', error);
      }
    };
    
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/transactions`, {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          const txs = data.transactions || [];
          // Get unique categories from existing transactions
          const uniqueCategories = [...new Set(txs.map(t => t.category).filter(Boolean))];
          if (uniqueCategories.length > 0) {
            // Filter out 'Other' if it exists, then add it at the end
            const filteredCategories = uniqueCategories.filter(cat => cat !== 'Other');
            setCategories([...filteredCategories.sort(), 'Other']);
          }
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    
    fetchAccounts();
    fetchCategories();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!category || !description || !amount) {
      alert('Please fill in all fields');
      return;
    }

    const transactionData = {
      category,
      description,
      amount: transactionType === 'expense' ? -Math.abs(parseFloat(amount)) : Math.abs(parseFloat(amount)),
      type: transactionType,
      account_id: accountId ? parseInt(accountId) : null
    };

    // Call the parent function to add the transaction
    onAddTransaction(transactionData);

    // Reset form
    setCategory('');
    setDescription('');
    setAmount('');
    setTransactionType('expense');
    setAccountId('');
  };

  return (
    <form className="add-transaction-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="transaction-type">Transaction Type</label>
        <div className="transaction-type-toggle">
          <button
            type="button"
            className={`toggle-btn ${transactionType === 'expense' ? 'active' : ''}`}
            onClick={() => setTransactionType('expense')}
          >
            Expense
          </button>
          <button
            type="button"
            className={`toggle-btn ${transactionType === 'income' ? 'active' : ''}`}
            onClick={() => setTransactionType('income')}
          >
            Income
          </button>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="account">Account (Optional)</label>
        <select 
          id="account"
          value={accountId} 
          onChange={(e) => setAccountId(e.target.value)}
        >
          <option value="">No Account</option>
          {accounts.map(acc => (
            <option key={acc.id} value={acc.id}>
              {acc.name} {acc.mask ? `(...${acc.mask})` : ''}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
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

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <input 
          id="description"
          type="text"
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          placeholder="Enter transaction description"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="amount">Amount</label>
        <div className="amount-input-container">
          <span className="currency-symbol">$</span>
          <input 
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            placeholder="0.00"
            required
          />
        </div>
      </div>

      <button type="submit" className="submit-btn">
        <span>Add Transaction</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </button>
    </form>
  );
}

export default AddTransaction;
