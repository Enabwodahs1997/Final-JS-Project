const STORAGE_KEY = 'financeTransactions';

function delay(ms) {
  // Returns a Promise that waits for 'ms' milliseconds before continuing
  return new Promise(function(resolve) {
    // setTimeout calls resolve after the delay is done
    setTimeout(function() {
      resolve();
    }, ms);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadAndDisplayData();
  setupEventListeners();
});

async function loadAndDisplayData() {
  const transactions = await getTransactions();
  await updateFinancialOverview(transactions);
}

async function getTransactions() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

async function saveTransactions(transactions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

async function addTransaction(description, amount, type) {
  const transactions = await getTransactions();
  const transaction = {
    id: Date.now(),
    description,
    amount: parseFloat(amount),
    type,
    date: new Date().toISOString(),
  };
  
  transactions.push(transaction);
  await saveTransactions(transactions);
  await loadAndDisplayData();
  
  return transaction;
}

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

async function updateFinancialOverview(transactions) {
  const { totalIncome, totalExpenses, remainingBalance } = calculateTotals(transactions);
  
  document.getElementById('totalIncome').textContent = `$${totalIncome.toFixed(2)}`;
  document.getElementById('totalExpenses').textContent = `$${totalExpenses.toFixed(2)}`;
  document.getElementById('remainingBalance').textContent = `$${remainingBalance.toFixed(2)}`;
  
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

function handleAddTransaction() {
  window.location.href = './transactionPage/transaction.html';
}

function handleViewHistory() {
  window.location.href = './history/history.html';
}

export { addTransaction, getTransactions, calculateTotals };
