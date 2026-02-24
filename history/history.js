import { getSelectedCurrency, convertCurrency, formatCurrency } from '../currency.js';
import { setupCurrencySelectors } from '../currencySelector.js';
import { getTransactions, saveTransactions, clearTransactions, deleteTransaction, processRecurringTransactions } from '../storage.js';
import { REMAINING_BUDGETS_KEY } from '../constants.js';

// Helper functions for budget management
function getRemainingBudgets() {
  const data = localStorage.getItem(REMAINING_BUDGETS_KEY);
  return data ? JSON.parse(data) : {};
}

function saveRemainingBudget(category, remaining) {
  const remainingBudgets = getRemainingBudgets();
  remainingBudgets[category] = parseFloat(remaining);
  localStorage.setItem(REMAINING_BUDGETS_KEY, JSON.stringify(remainingBudgets));
}

function restoreBudgetFromExpense(category, amount) {
  const remainingBudgets = getRemainingBudgets();
  if (remainingBudgets[category] !== undefined) {
    const newRemaining = remainingBudgets[category] + amount;
    saveRemainingBudget(category, newRemaining);
    return newRemaining;
  }
  return null;
}

let displayedTransactions = []; // Store the currently displayed transactions

document.addEventListener('DOMContentLoaded', async () => {
  await setupCurrencySelectors('currencySelect', () => displayTransactions(displayedTransactions));
  await loadAndDisplayTransactions();
  setupFilterListener();
  setupClearButton();
  setupDeleteListeners();
});

//this is to load transactions and display them on the page.
async function loadAndDisplayTransactions() {
  // Process recurring transactions to create new instances if due
  processRecurringTransactions();
  
  const transactions = getTransactions();
  await displayTransactions(transactions);
}
//this function takes the array of transactions and creates HTML for each. 
async function displayTransactions(transactions) {
  displayedTransactions = transactions; // Store for currency changes
  const container = document.getElementById('transactionsList');
//returns a message if there is nothing to show. Otherwise it skips the message and shows the transactions.
  if (transactions.length === 0) {
    container.innerHTML = '<p class="no-transactions">No transactions yet. Add one to get started!</p>';
    return;
  }
// Sort transactions by date in descending order (newest first)
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
// Generate HTML for each transaction and join them into a single string to set as innerHTML of the container.
  container.innerHTML = await Promise.all(sortedTransactions.map(transaction => createTransactionCard(transaction))).then(html => html.join(''));
}
//this function creates the HTML for a single transaction card, it formats the date and amount based on the type of transaction (income, expense, debt, or debtPayment).
async function createTransactionCard(transaction) {
  const date = new Date(transaction.date).toLocaleDateString();
  
  // Determine sign and CSS class based on transaction type
  let sign = '+';
  let amountClass = 'income-amount';
  let displayAmount = Math.abs(transaction.amount);
  
  if (transaction.type === 'income') {
    sign = '+';
    amountClass = 'income-amount';
  } else if (transaction.type === 'expense') {
    sign = '-';
    amountClass = 'expense-amount';
  } else if (transaction.type === 'debt') {
    sign = '-';
    amountClass = 'expense-amount';
  } else if (transaction.type === 'debtPayment') {
    sign = '-';
    amountClass = 'debt-payment-amount';
  }
  
  // Get selected currency and convert amount
  const selectedCurrency = getSelectedCurrency();
  let convertedAmount = displayAmount;
  
  if (selectedCurrency !== 'USD') {
    convertedAmount = await convertCurrency(displayAmount, 'USD', selectedCurrency);
  }
  
  const formattedAmount = formatCurrency(convertedAmount, selectedCurrency);
  
  // Get transaction type label for display
  const typeLabel = transaction.type === 'debt' ? 'Debt' : transaction.type === 'debtPayment' ? 'Debt Payment' : transaction.category;
  
//this is what it will return for each transaction, it will be a card with the category, date, notes, amount and a delete button.
  return `
    <div class="transaction-card ${transaction.type}">
      <div class="transaction-left">
        <div class="transaction-info">
          <h3 class="transaction-category">${typeLabel}</h3>
          <p class="transaction-date">${date}</p>
          <p class="transaction-notes">${transaction.notes || 'No notes'}</p>
        </div>
      </div>
      <div class="transaction-right">
        <p class="transaction-amount ${amountClass}">${sign}${formattedAmount}</p>
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
    // Restore all budgets by adding back all expenses before clearing
    const transactions = getTransactions();
    transactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        restoreBudgetFromExpense(transaction.category, transaction.amount);
      }
    });
    
    clearTransactions();
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
  // Get the transaction before deleting to restore budget if it's an expense
  const transactions = getTransactions();
  const transaction = transactions.find(t => t.id === parseInt(transactionId));
  
  if (transaction && transaction.type === 'expense') {
    // Restore the budget by adding the expense amount back
    const restoredAmount = restoreBudgetFromExpense(transaction.category, transaction.amount);
    if (restoredAmount !== null) {
      console.log(`Budget restored for ${transaction.category}: $${restoredAmount.toFixed(2)}`);
    }
  }
  
  deleteTransaction(transactionId);
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
