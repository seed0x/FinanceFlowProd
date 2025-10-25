import { useState } from 'react';
import './AddTransaction.css';

function AddTransaction({ onAddTransaction }) {
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [transactionType, setTransactionType] = useState('expense');

  const categories = ['Food', 'Transport', 'Entertainment', 'Utilities', 'Shopping', 'Healthcare', 'Education', 'Other'];

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
      type: transactionType
    };

    // Call the parent function to add the transaction
    onAddTransaction(transactionData);

    // Reset form
    setCategory('');
    setDescription('');
    setAmount('');
    setTransactionType('expense');
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
