import { useState, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import './ConnectBank.css';

function ConnectBank({ onConnectionSuccess }) {
  const API_URL = import.meta.env.VITE_API_URL;
  const [linkToken, setLinkToken] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [message, setMessage] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [accounts, setAccounts] = useState([]);

  // Fetch connected accounts
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

  // Load accounts on mount
  useEffect(() => {
    fetchAccounts();
  }, []);

  // Sync transactions from Plaid
  const syncTransactions = async () => {
    setIsSyncing(true);
    setMessage('Syncing transactions...');
    
    try {
      const response = await fetch(`${API_URL}/plaid/sync`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessage(`Success! Added ${data.new_transactions} new transactions`);
        
        if (onConnectionSuccess) {
          onConnectionSuccess();
        }
      } else {
        const error = await response.json();
        setMessage(error.error || 'Error: Sync failed');
      }
    } catch (error) {
      console.error('Error syncing:', error);
      setMessage('Error: Sync failed');
    }
    
    setIsSyncing(false);
  };

  // Create Plaid Link token
  const createLinkToken = async () => {
    setIsConnecting(true);
    setMessage('');
    
    try {
      const response = await fetch(`${API_URL}/plaid/create-link-token`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setLinkToken(data.link_token);
      } else {
        setMessage('Error: Could not connect to bank');
        setIsConnecting(false);
      }
    } catch (error) {
      console.error('Error creating link token:', error);
      setMessage('Error: Could not connect to bank');
      setIsConnecting(false);
    }
  };

  // Handle successful Plaid Link
  const onSuccess = async (publicToken) => {
    setMessage('Connecting your bank and importing transactions...');
    
    try {
      // Exchange public token (auto-syncs transactions)
      const response = await fetch(`${API_URL}/plaid/exchange`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ public_token: publicToken }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessage(`Success! Connected bank and added ${data.new_transactions} transactions`);
        
        // Refresh accounts and notify parent
        fetchAccounts();
        if (onConnectionSuccess) {
          setTimeout(() => {
            onConnectionSuccess();
          }, 1500);
        }
      } else {
        setMessage('Error: Could not connect bank');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error: Something went wrong');
    }
    
    setIsConnecting(false);
    setLinkToken(null);
  };

  // Handle when user closes Plaid Link without connecting
  const onExit = () => {
    setIsConnecting(false);
    setLinkToken(null);
  };

  // Initialize Plaid Link
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
    onExit,
  });

  // Auto-open Plaid Link when ready
  if (ready && linkToken && isConnecting) {
    open();
    setIsConnecting(false); // Stop showing "Connecting..." once modal opens
  }

  return (
    <div className="connect-bank">
      <h2>Bank Connection</h2>
      <p>Connect your bank account to automatically import transactions</p>
      
      {accounts.length > 0 && (
        <div className="connected-accounts">
          <h3>Connected Accounts</h3>
          <div className="accounts-list">
            {accounts.map(acc => (
              <div key={acc.id} className="account-item">
                <span className="account-name">{acc.name}</span>
                {acc.mask && <span className="account-mask">...{acc.mask}</span>}
                <span className="account-type">{acc.subtype || acc.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="bank-actions">
        <button 
          onClick={createLinkToken} 
          disabled={isConnecting}
          className="connect-button"
        >
          {isConnecting ? 'Connecting...' : 'Connect Bank Account'}
        </button>
        
        <button 
          onClick={syncTransactions} 
          disabled={isSyncing}
          className="sync-button"
        >
          {isSyncing ? 'Syncing...' : 'Sync Transactions'}
        </button>
      </div>
      
      {message && (
        <div className={message.includes('Error') ? 'error-message' : 'success-message'}>
          {message}
        </div>
      )}
    </div>
  );
}

export default ConnectBank;
