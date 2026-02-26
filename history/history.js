import { getSelectedCurrency, convertCurrency, formatCurrency } from '../currency.js';
import { setupCurrencySelectors } from '../currencySelector.js';
import { getTransactions, saveTransactions, clearTransactions, deleteTransaction, processRecurringTransactions } from '../storage.js';
import { REMAINING_BUDGETS_KEY } from '../constants.js';
import { categories } from '../transactionPage/objects.js';

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
  setupEditListeners();
  setupEditModal();
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
        <button class="btn-edit" data-id="${transaction.id}" title="Edit transaction">✏️</button>
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
    
    // Clear the tracking start date
    localStorage.removeItem('beginningInputDate');
    
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

// Set up edit button listeners
function setupEditListeners() {
  const editButtons = document.querySelectorAll('.btn-edit');
  editButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      handleEditTransaction(btn.dataset.id);
    });
  });
}

// Set up the edit modal
function setupEditModal() {
  const modal = document.getElementById('editModal');
  const closeBtn = document.getElementById('closeEditModal');
  const cancelBtn = document.getElementById('cancelEditBtn');
  const saveBtn = document.getElementById('saveEditBtn');

  closeBtn.addEventListener('click', () => closeEditModal());
  cancelBtn.addEventListener('click', () => closeEditModal());
  
  // Close modal when clicking outside of it
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeEditModal();
    }
  });

  saveBtn.addEventListener('click', () => saveEditedTransaction());
}

let currentEditingTransactionId = null;

// Handle edit transaction
function handleEditTransaction(transactionId) {
  const transactions = getTransactions();
  const transaction = transactions.find(t => t.id === parseInt(transactionId));
  
  if (!transaction) return;
  
  currentEditingTransactionId = parseInt(transactionId);
  
  // Populate category dropdown based on transaction type
  const categorySelect = document.getElementById('editCategory');
  const transactionCategories = categories[transaction.type] || [];
  
  categorySelect.innerHTML = '';
  transactionCategories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat.id;
    option.textContent = `${cat.icon} ${cat.name}`;
    if (cat.id === transaction.category) {
      option.selected = true;
    }
    categorySelect.appendChild(option);
  });
  
  // Set the amount
  document.getElementById('editAmount').value = Math.abs(transaction.amount);
  
  // Set the notes
  document.getElementById('editNotes').value = transaction.notes || '';
  
  // Show the modal
  document.getElementById('editModal').style.display = 'flex';
}

// Close the edit modal
function closeEditModal() {
  document.getElementById('editModal').style.display = 'none';
  currentEditingTransactionId = null;
}

// Save edited transaction
async function saveEditedTransaction() {
  if (currentEditingTransactionId === null) return;
  
  const newCategory = document.getElementById('editCategory').value;
  const newAmount = parseFloat(document.getElementById('editAmount').value);
  const newNotes = document.getElementById('editNotes').value;
  
  if (!newCategory || isNaN(newAmount) || newAmount < 0) {
    alert('Please enter valid category and amount');
    return;
  }
  
  const transactions = getTransactions();
  const transactionIndex = transactions.findIndex(t => t.id === currentEditingTransactionId);
  
  if (transactionIndex === -1) return;
  
  const transaction = transactions[transactionIndex];
  const oldAmount = transaction.amount;
  const oldCategory = transaction.category;
  
  // Update the transaction
  if (transaction.type === 'expense') {
    // For expenses, preserve the negative sign
    transaction.amount = -Math.abs(newAmount);
  } else if (transaction.type === 'debt') {
    // For debt, preserve the negative sign
    transaction.amount = -Math.abs(newAmount);
  } else {
    // For income and debt payments, preserve positive
    transaction.amount = Math.abs(newAmount);
  }
  
  transaction.category = newCategory;
  transaction.notes = newNotes;
  
  // Update budget tracking if this is an expense
  if (transaction.type === 'expense') {
    // Restore old amount to budget
    restoreBudgetFromExpense(oldCategory, oldAmount);
    
    // Deduct new amount from budget
    const remainingBudgets = getRemainingBudgets();
    if (remainingBudgets[newCategory] !== undefined) {
      const currentRemaining = remainingBudgets[newCategory];
      const newRemaining = currentRemaining + oldAmount - newAmount; // Restore old, then deduct new
      saveRemainingBudget(newCategory, newRemaining);
    }
  }
  
  // Save updated transactions
  saveTransactions(transactions);
  
  closeEditModal();
  await loadAndDisplayTransactions();
  setupDeleteListeners();
  setupEditListeners();
}

export { getTransactions };
