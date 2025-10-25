import TransactionItem from './TransactionItem';

function TransactionList({ transactions}) {
  return (
    <div className="recent-transactions">
            <h2>Recent Transactions</h2>
            <div className="transactions-list">
              {transactions.length === 0 ? (
                <div className="no-transactions">
                  <p>No transactions yet. Add your first transaction above!</p>
                </div>
              ) : (
                transactions.map(transaction => (
                    <TransactionItem key={transaction.id} transaction={transaction} />
          ))
        )}
            </div>
    </div>
  );
}

export default TransactionList;