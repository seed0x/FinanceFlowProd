// Calculate stats from transactiions and month totals 
  const totalBalance = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const thisMonthTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    const currentDate = new Date();
    return transactionDate.getMonth() === currentDate.getMonth() && 
           transactionDate.getFullYear() === currentDate.getFullYear();
  });
  const thisMonthTotal = thisMonthTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);