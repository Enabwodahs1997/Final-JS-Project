const STORAGE_KEY = 'financeTransactions';
document.addEventListener('DOMContentLoaded', async () => {
  await loadAndDisplayTransactions();
  setupFilterListener();
  setupClearButton();
  setupDeleteListeners();
});
//this retrieves transactions from local storage.
function getTransactions() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : []; //this will return an empty array if there are no transactions stored.
}
//this is to load transactions and display them on the page.
async function loadAndDisplayTransactions() {
  const transactions = await getTransactions();
  await displayTransactions(transactions);
}
//this function takes the array of transactions and creates HTML for each. 
async function displayTransactions(transactions) {
  const container = document.getElementById('transactionsList');
//returns a message if there is nothing to show. Otherwise it skips the message and shows the transactions.
  if (transactions.length === 0) {
    container.innerHTML = '<p class="no-transactions">No transactions yet. Add one to get started!</p>';
    return;
  }
// Sort transactions by date in descending order (newest first)
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
// Generate HTML for each transaction and join them into a single string to set as innerHTML of the container.
  container.innerHTML = sortedTransactions.map(transaction => createTransactionCard(transaction)).join('');
}
//this function creates the HTML for a single transaction card, it formats the date and amount based on the type of transaction (income or expense).
function createTransactionCard(transaction) {
  const date = new Date(transaction.date).toLocaleDateString();
  const sign = transaction.type === 'income' ? '+' : '-';
  const amountClass = transaction.type === 'income' ? 'income-amount' : 'expense-amount';
//this is what it will return for each transaction, it will be a card with the category, date, notes, amount and a delete button.
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
//listens for changes in the filter dropdown and calls the handleFilter function to update the displayed transactions.
function setupFilterListener() {
  const filterSelect = document.getElementById('filterType');
  filterSelect.addEventListener('change', async () => await handleFilter());
}
//this function filters the transactions based on the selected type (income, expense, or all) and updates the displayed transactions accordingly.
async function handleFilter() {
  const filterSelect = document.getElementById('filterType');
  const filterValue = filterSelect.value;
  const allTransactions = await getTransactions();
//above sets the logic and the below runs the logic to filter the transactions and display them. If the filter is set to 'all', it will show all transactions, otherwise it will filter by the selected type.
  const filtered = filterValue ? allTransactions.filter(t => t.type === filterValue) : allTransactions;
  await displayTransactions(filtered);
  setupDeleteListeners();
}
//this sets up the clear button to listen for clicks and calls the handleClearHistory function when clicked.
function setupClearButton() {
  const clearBtn = document.getElementById('clearHistoryBtn');
  clearBtn.addEventListener('click', async () => await handleClearHistory());
}
//this function prompts the user for confirmation before clearing all transaction history and then deletes it via API or falls back to localStorage.
async function handleClearHistory() {
  const confirm = window.confirm('Are you sure you want to clear all transaction history? This cannot be undone.');
//if the user confirms, it will remove the transactions and reload the displayed transactions, which will show the message that there are no transactions.
  if (confirm) {
    localStorage.removeItem(STORAGE_KEY);
    await loadAndDisplayTransactions();
  }
}
//this listens for clicks on the delete buttons and calls the handleDeleteTransaction function with the transaction ID when a delete button is clicked.
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('btn-delete')) {
    handleDeleteTransaction(e.target.dataset.id);
  }
});
//this function deletes a specific transaction by its ID from localStorage, then reloads the displayed transactions.
async function handleDeleteTransaction(transactionId) {
  const transactions = getTransactions();
  const filtered = transactions.filter(t => t.id !== parseInt(transactionId));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  await loadAndDisplayTransactions();
  setupDeleteListeners();
}
//this function sets up event listeners for all delete buttons, it is called after transactions are displayed to ensure that the delete buttons are functional.
function setupDeleteListeners() {
  const deleteButtons = document.querySelectorAll('.btn-delete');
  deleteButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      handleDeleteTransaction(btn.dataset.id); // Pass the transaction ID to the delete handler
    });
  });
}

export { getTransactions };
