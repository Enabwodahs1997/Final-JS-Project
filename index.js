// Transaction storage key
const STORAGE_KEY = 'financeTransactions';

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  loadAndDisplayData();
  setupEventListeners();
});

// Load transactions from localStorage and display financial overview
function loadAndDisplayData() {
  const transactions = getTransactions();
  updateFinancialOverview(transactions);
}

// Get all transactions from localStorage
function getTransactions() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

// Save transactions to localStorage
function saveTransactions(transactions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

// Add a new transaction
function addTransaction(description, amount, type) {
  const transactions = getTransactions();
  const transaction = {
    id: Date.now(),
    description,
    amount: parseFloat(amount),
    type, // 'income' or 'expense'
    date: new Date().toISOString(),
  };
  
  transactions.push(transaction);
  saveTransactions(transactions);
  loadAndDisplayData();
  
  return transaction;
}

// Calculate totals
function calculateTotals(transactions) {
  let totalIncome = 0;
  let totalExpenses = 0;
  
  transactions.forEach(transaction => {
    if (transaction.type === 'income') {
      totalIncome += transaction.amount;
    } else if (transaction.type === 'expense') {
      totalExpenses += transaction.amount;
    }
  });
  
  return {
    totalIncome,
    totalExpenses,
    remainingBalance: totalIncome - totalExpenses,
  };
}

// Update financial overview display
function updateFinancialOverview(transactions) {
  const { totalIncome, totalExpenses, remainingBalance } = calculateTotals(transactions);
  
  document.getElementById('totalIncome').textContent = `$${totalIncome.toFixed(2)}`;
  document.getElementById('totalExpenses').textContent = `$${totalExpenses.toFixed(2)}`;
  document.getElementById('remainingBalance').textContent = `$${remainingBalance.toFixed(2)}`;
  
  // Color code the balance
  const balanceElement = document.getElementById('remainingBalance');
  if (remainingBalance >= 0) {
    balanceElement.style.color = '#28a745';
  } else {
    balanceElement.style.color = '#dc3545';
  }
}

// Setup event listeners for buttons
function setupEventListeners() {
  const addTransactionBtn = document.getElementById('addTransactionBtn');
  const transactionHistoryBtn = document.getElementById('transactionHistoryBtn');
  
  if (addTransactionBtn) {
    addTransactionBtn.addEventListener('click', handleAddTransaction);
  }
  
  if (transactionHistoryBtn) {
    transactionHistoryBtn.addEventListener('click', handleViewHistory);
  }
}

// Handle adding a transaction (navigate to transaction page)
function handleAddTransaction() {
  window.location.href = './transactionPage/transaction.html';
}

// Handle viewing transaction history
function handleViewHistory() {
  const transactions = getTransactions();
  
  if (transactions.length === 0) {
    alert('No transactions yet. Add one to get started!');
    return;
  }
  
  let historyText = 'Transaction History:\n\n';
  transactions.forEach(transaction => {
    const date = new Date(transaction.date).toLocaleDateString();
    const sign = transaction.type === 'income' ? '+' : '-';
    historyText += `${date} | ${transaction.description} | ${sign}$${transaction.amount.toFixed(2)}\n`;
  });
  
  alert(historyText);
}

// Export functions for testing/external use
export { addTransaction, getTransactions, calculateTotals };
