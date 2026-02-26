//JS adds info into the html so you dont have to hard code it in the html file. 
// It also adds functionality to the buttons and forms on the page. 
// It also allows us to store data in local storage so that it persists across sessions. 
// This way, users can see their transaction history even after closing and reopening the browser. 
// The code is organized into functions that handle specific tasks, such as adding transactions, calculating totals, 
// and updating the financial overview. Event listeners are set up to respond to user interactions, 
// making the application interactive and user-friendly.

import { initializeChart, updateChart } from './chart.js';
import { getSelectedCurrency, convertCurrency, formatCurrency } from './currency.js';
import { setupCurrencySelectors } from './currencySelector.js';
import { getTransactions, saveTransactions, processRecurringTransactions } from './storage.js';
import { STORAGE_KEY } from './constants.js';
document.addEventListener('DOMContentLoaded', async () => {
  await setupCurrencySelectors('currencySelect', loadAndDisplayData);
  await loadAndDisplayData();
  setupEventListeners();
});
async function loadAndDisplayData() {
  // Process recurring transactions to create new instances if due
  processRecurringTransactions();
  
  const transactions = getTransactions();
  await updateFinancialOverview(transactions);
  initializeChart(transactions);
}
// The loadAndDisplayData function is responsible for fetching the transaction data from local storage and updating the financial overview section of the page. It calls the getTransactions function to retrieve the stored transactions and then passes that data to the updateFinancialOverview function, which calculates totals and updates the display accordingly. This function is called when the DOM content is loaded to ensure that the user sees their current financial status as soon as they access the page.

async function addTransaction(description, amount, type) {
  const transactions = getTransactions();
  const transaction = {
    id: Date.now(),
    description,
    amount: parseFloat(amount),
    type,
    date: new Date().toISOString(), //date code is easier to just copy and paste from the internet because it can be a hard thing to run through all the rules someone before has already done and figured out.
  };
  // Save the transaction to local storage and provide feedback to the user
  transactions.push(transaction);
  saveTransactions(transactions);
  await loadAndDisplayData();
  updateChart(transactions);
  
  return transaction;
}
// The addTransaction function creates a new transaction object with a unique ID, description, amount, type, and date. It retrieves the existing transactions from local storage, adds the new transaction to the array, saves the updated array back to local storage, and then calls loadAndDisplayData to refresh the financial overview. This function is typically called when a user submits a new transaction through the form.
function calculateTotals(transactions) {
  let totalIncome = 0;
  let totalExpenses = 0;
  let totalDebt = 0;
  let totalDebtPayments = 0; // Track debt payments separately
  // Loop through all transactions and calculate totals by type
  transactions.forEach(transaction => {
    if (transaction.type === 'income') {
      totalIncome += transaction.amount;
    } else if (transaction.type === 'expense') {
      totalExpenses += transaction.amount;
    } else if (transaction.type === 'debt') {
      // Debt is stored as negative, so adding it increases the debt owed
      totalDebt += transaction.amount; // e.g., totalDebt += (-100) = -100
    } else if (transaction.type === 'debtPayment') {
      // Debt payments are positive, so adding them reduces the debt owed
      totalDebt += transaction.amount; // e.g., totalDebt += 50 makes it -50
      totalDebtPayments += transaction.amount; // Track payments for remaining balance
    }
  });
  // Return an object containing the total income, total expenses, total debt, and remaining balance
  // Debt is tracked separately and only changes with debt/debtPayment transactions
  // Remaining balance = income - expenses - debt payments (shows money paid toward debt, not debt balance)
  const debtBalance = Math.abs(totalDebt); // Convert debt to positive for calculation
  return {
    totalIncome,
    totalExpenses,
    totalDebt: debtBalance, // Display debt as positive number
    remainingBalance: totalIncome - totalExpenses - totalDebtPayments, // Subtract payments, not balance
  };
}
// The calculateTotals function takes an array of transaction objects and calculates the total income, total expenses, and remaining balance. 
// It iterates through each transaction, adding the amount to either totalIncome or totalExpenses based on the transaction type. Finally, 
// it returns an object containing these calculated values, which can be used to update the financial overview display on the page.
async function updateFinancialOverview(transactions) {
  const { totalIncome, totalExpenses, totalDebt, remainingBalance } = calculateTotals(transactions);
  const selectedCurrency = getSelectedCurrency();
  
  // Convert amounts to the selected currency if not USD
  let displayIncome = totalIncome;
  let displayExpenses = totalExpenses;
  let displayDebt = totalDebt;
  let displayBalance = remainingBalance;
  
  if (selectedCurrency !== 'USD') {
    displayIncome = await convertCurrency(totalIncome, 'USD', selectedCurrency);
    displayExpenses = await convertCurrency(totalExpenses, 'USD', selectedCurrency);
    displayDebt = await convertCurrency(totalDebt, 'USD', selectedCurrency);
    displayBalance = await convertCurrency(remainingBalance, 'USD', selectedCurrency);
  }
  
  // Update the DOM elements with the converted amounts
  document.getElementById('totalIncome').textContent = formatCurrency(displayIncome, selectedCurrency);
  document.getElementById('totalExpenses').textContent = formatCurrency(displayExpenses, selectedCurrency);
  document.getElementById('totalDebt').textContent = formatCurrency(displayDebt, selectedCurrency);
  document.getElementById('remainingBalance').textContent = formatCurrency(displayBalance, selectedCurrency);
  
  // Change the color of the remaining balance based on whether it's positive or negative
  const balanceElement = document.getElementById('remainingBalance');
  if (displayBalance >= 0) {
    balanceElement.style.color = '#28a745';
  } else {
    balanceElement.style.color = '#dc3545';
  }
}
// Setup event listeners for buttons
function setupEventListeners() {
  const addTransactionBtn = document.getElementById('addTransactionBtn');
  const transactionHistoryBtn = document.getElementById('transactionHistoryBtn');
  const budgetManagementBtn = document.getElementById('budgetManagementBtn');
  
  // Add click event listeners to the buttons to handle user interactions
  if (addTransactionBtn) {
    addTransactionBtn.addEventListener('click', handleAddTransaction);
  }
  // The setupEventListeners function adds click event listeners to the "Add Transaction" and "View History" buttons. When the user clicks the "Add Transaction" button, it calls the handleAddTransaction function, which redirects the user to the transaction form page. When the user clicks the "View History" button, it calls the handleViewHistory function, which redirects the user to the transaction history page. This allows users to easily navigate between different sections of the application based on their needs.
  if (transactionHistoryBtn) {
    transactionHistoryBtn.addEventListener('click', handleViewHistory);
  }
  
  if (budgetManagementBtn) {
    budgetManagementBtn.addEventListener('click', handleBudgetManagement);
  }
}
// The setupEventListeners function adds click event listeners to the "Add Transaction" and "View History" buttons. When the user clicks the "Add Transaction" button, it calls the handleAddTransaction function, which redirects the user to the transaction form page. When the user clicks the "View History" button, it calls the handleViewHistory function, which redirects the user to the transaction history page. This allows users to easily navigate between different sections of the application based on their needs.
function handleAddTransaction() {
  window.location.href = './transactionPage/transaction.html';
}
// The handleAddTransaction function is called when the user clicks the "Add Transaction" button. It redirects the user to the transaction form page where they can input details for a new transaction. This function uses window.location.href to change the current URL, effectively navigating the user to the specified page.
function handleViewHistory() {
  window.location.href = './history/history.html';
}

function handleBudgetManagement() {
  window.location.href = './budgetPage/budget.html';
}


// The handleViewHistory function is called when the user clicks the "View History" button. It redirects the user to the transaction history page where they can see a list of all their logged transactions. Similar to handleAddTransaction, it uses window.location.href to navigate to the specified page.
export { addTransaction, getTransactions, calculateTotals };
