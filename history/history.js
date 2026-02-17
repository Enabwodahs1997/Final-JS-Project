const STORAGE_KEY = 'financeTransactions';

document.addEventListener('DOMContentLoaded', () => {
  loadAndDisplayTransactions();
  setupFilterListener();
  setupClearButton();
});

function getTransactions() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function loadAndDisplayTransactions() {
  const transactions = getTransactions();
  displayTransactions(transactions);
}

function displayTransactions(transactions) {
  const container = document.getElementById('transactionsList');

  if (transactions.length === 0) {
    container.innerHTML = '<p class="no-transactions">No transactions yet. Add one to get started!</p>';
    return;
  }

  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

  container.innerHTML = sortedTransactions.map(transaction => createTransactionCard(transaction)).join('');
}

function createTransactionCard(transaction) {
  const date = new Date(transaction.date).toLocaleDateString();
  const sign = transaction.type === 'income' ? '+' : '-';
  const amountClass = transaction.type === 'income' ? 'income-amount' : 'expense-amount';

  return `
    <div class="transaction-card ${transaction.type}">
      <div class="transaction-left">
        <div class="transaction-info">
          <h3 class="transaction-category">${transaction.category}</h3>
          <p class="transaction-date">${date}</p>
          <p class="transaction-notes">${transaction.notes || 'No notes'}</p>
        </div>
      </div>
      <div class="transaction-right">
        <p class="transaction-amount ${amountClass}">${sign}$${transaction.amount.toFixed(2)}</p>
        <button class="btn-delete" data-id="${transaction.id}" title="Delete transaction">×</button>
      </div>
    </div>
  `;
}

function setupFilterListener() {
  const filterSelect = document.getElementById('filterType');
  filterSelect.addEventListener('change', handleFilter);
}

function handleFilter() {
  const filterSelect = document.getElementById('filterType');
  const filterValue = filterSelect.value;
  const allTransactions = getTransactions();

  const filtered = filterValue ? allTransactions.filter(t => t.type === filterValue) : allTransactions;
  displayTransactions(filtered);
  setupDeleteListeners();
}

function setupClearButton() {
  const clearBtn = document.getElementById('clearHistoryBtn');
  clearBtn.addEventListener('click', handleClearHistory);
}

function handleClearHistory() {
  const confirm = window.confirm('Are you sure you want to clear all transaction history? This cannot be undone.');

  if (confirm) {
    localStorage.removeItem(STORAGE_KEY);
    loadAndDisplayTransactions();
  }
}

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('btn-delete')) {
    handleDeleteTransaction(e.target.dataset.id);
  }
});

function handleDeleteTransaction(transactionId) {
  const transactions = getTransactions();
  const filtered = transactions.filter(t => t.id !== parseInt(transactionId));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  loadAndDisplayTransactions();
  setupDeleteListeners();
}

function setupDeleteListeners() {
  const deleteButtons = document.querySelectorAll('.btn-delete');
  deleteButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
    });
  });
}

document.addEventListener('DOMContentLoaded', setupDeleteListeners);

export { getTransactions };
