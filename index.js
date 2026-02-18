//JS adds info into the html so you dont have to hard code it in the html file. 
// It also adds functionality to the buttons and forms on the page. 
// It also allows us to store data in local storage so that it persists across sessions. 
// This way, users can see their transaction history even after closing and reopening the browser. 
// The code is organized into functions that handle specific tasks, such as adding transactions, calculating totals, 
// and updating the financial overview. Event listeners are set up to respond to user interactions, 
// making the application interactive and user-friendly.

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
// The delay function is a utility that allows us to pause execution for a specified amount of time. It returns a Promise that resolves after the given number of milliseconds, which can be used with async/await to create delays in our code, such as showing a success message for a few seconds before hiding it again.
document.addEventListener('DOMContentLoaded', async () => {
  await loadAndDisplayData();
  setupEventListeners();
});
// The above code sets up an event listener for when the DOM content is fully loaded. Once the page is ready, it calls the loadAndDisplayData function to fetch and display the transaction data, and then sets up event listeners for user interactions such as adding a new transaction or viewing transaction history. This ensures that the application is initialized properly and ready for user interaction as soon as the page loads.
async function loadAndDisplayData() {
  const transactions = await getTransactions();
  await updateFinancialOverview(transactions);
}
// The loadAndDisplayData function is responsible for fetching the transaction data from local storage and updating the financial overview section of the page. It calls the getTransactions function to retrieve the stored transactions and then passes that data to the updateFinancialOverview function, which calculates totals and updates the display accordingly. This function is called when the DOM content is loaded to ensure that the user sees their current financial status as soon as they access the page.
async function getTransactions() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}
// The getTransactions function retrieves the transaction data from local storage. If there is data stored under the specified key, it parses the JSON string into an array of transaction objects and returns it. If there is no data (i.e., the user has not logged any transactions yet), it returns an empty array. This function is essential for accessing the stored transactions when displaying them in the transaction history or performing calculations based on the transaction data.
async function saveTransactions(transactions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}
// The saveTransactions function takes an array of transaction objects and saves it to local storage under the specified key. It converts the array into a JSON string before storing it, allowing for easy retrieval and parsing later. This function is used whenever a new transaction is added or when transactions are updated, ensuring that the data in local storage remains current and accurate.
async function addTransaction(description, amount, type) {
  const transactions = await getTransactions();
  const transaction = {
    id: Date.now(),
    description,
    amount: parseFloat(amount),
    type,
    date: new Date().toISOString(), //date code is easier to just copy and paste from the internet because it can be a hard thing to run through all the rules someone before has already done and figured out.
  };
  // Save the transaction to local storage and provide feedback to the user
  transactions.push(transaction);
  await saveTransactions(transactions);
  await loadAndDisplayData();
  
  return transaction;
}
// The addTransaction function creates a new transaction object with a unique ID, description, amount, type, and date. It retrieves the existing transactions from local storage, adds the new transaction to the array, saves the updated array back to local storage, and then calls loadAndDisplayData to refresh the financial overview. This function is typically called when a user submits a new transaction through the form.
function calculateTotals(transactions) {
  let totalIncome = 0;
  let totalExpenses = 0;
  // Loop through all transactions and calculate total income and expenses
  transactions.forEach(transaction => {
    if (transaction.type === 'income') {
      totalIncome += transaction.amount;
    } else if (transaction.type === 'expense') {
      totalExpenses += transaction.amount;
    }
  });
  // Return an object containing the total income, total expenses, and remaining balance
  return {
    totalIncome,
    totalExpenses,
    remainingBalance: totalIncome - totalExpenses,
  };
}
// The calculateTotals function takes an array of transaction objects and calculates the total income, total expenses, and remaining balance. It iterates through each transaction, adding the amount to either totalIncome or totalExpenses based on the transaction type. Finally, it returns an object containing these calculated values, which can be used to update the financial overview display on the page.
async function updateFinancialOverview(transactions) {
  const { totalIncome, totalExpenses, remainingBalance } = calculateTotals(transactions);
  // Update the DOM elements with the calculated totals
  document.getElementById('totalIncome').textContent = `$${totalIncome.toFixed(2)}`;
  document.getElementById('totalExpenses').textContent = `$${totalExpenses.toFixed(2)}`;
  document.getElementById('remainingBalance').textContent = `$${remainingBalance.toFixed(2)}`;
  // Change the color of the remaining balance based on whether it's positive or negative
  const balanceElement = document.getElementById('remainingBalance');
  if (remainingBalance >= 0) {
    balanceElement.style.color = '#28a745';
  } else {
    balanceElement.style.color = '#dc3545';
  }
}
// The updateFinancialOverview function updates the financial overview section of the page with the calculated totals. It sets the text content of the total income, total expenses, and remaining balance elements to display the respective values formatted as currency. Additionally, it changes the color of the remaining balance to green if it's positive or red if it's negative, providing a visual cue to the user about their financial status.
// Setup event listeners for buttons
function setupEventListeners() {
  const addTransactionBtn = document.getElementById('addTransactionBtn');
  const transactionHistoryBtn = document.getElementById('transactionHistoryBtn');
  // Add click event listeners to the buttons to handle user interactions
  if (addTransactionBtn) {
    addTransactionBtn.addEventListener('click', handleAddTransaction);
  }
  // The setupEventListeners function adds click event listeners to the "Add Transaction" and "View History" buttons. When the user clicks the "Add Transaction" button, it calls the handleAddTransaction function, which redirects the user to the transaction form page. When the user clicks the "View History" button, it calls the handleViewHistory function, which redirects the user to the transaction history page. This allows users to easily navigate between different sections of the application based on their needs.
  if (transactionHistoryBtn) {
    transactionHistoryBtn.addEventListener('click', handleViewHistory);
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
// The handleViewHistory function is called when the user clicks the "View History" button. It redirects the user to the transaction history page where they can see a list of all their logged transactions. Similar to handleAddTransaction, it uses window.location.href to navigate to the specified page.
export { addTransaction, getTransactions, calculateTotals };
