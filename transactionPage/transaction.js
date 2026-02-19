import { categories } from './objects.js';
import axios from 'axios';

const STORAGE_KEY = 'financeTransactions';
const API_URL = 'http://localhost:3001/api/transactions';

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
document.addEventListener('DOMContentLoaded', () => {
  initializeDateField();
  setupCategoryDropdown();
  setupFormSubmit();
  setupTypeChange();
  setupBudgetOverdraftWarning();
});
// The above code sets up event listeners and initializes the form when the DOM is fully loaded. It ensures that the date field is set to today's date, the category dropdown is populated based on the selected transaction type, and the form submission is handled properly.
function initializeDateField() {
  const dateInput = document.getElementById('date');
  const today = new Date().toISOString().split('T')[0];
  dateInput.value = today;
}
// The initializeDateField function sets the value of the date input field to today's date in the format 'YYYY-MM-DD'. This ensures that when the user opens the form, the date field is pre-filled with the current date, making it more convenient for them to log transactions without having to manually select the date each time.
function setupTypeChange() {
  const typeSelect = document.getElementById('transactionType');
  typeSelect.addEventListener('change', () => {
    clearFormInputs();
    updateCategories();
    // Hide overdraft warning if switching away from expense
    const overdraftWarning = document.getElementById('overdraftWarning');
    if (typeSelect.value !== 'expense') {
      overdraftWarning.style.display = 'none';
    }
  });
}

function clearFormInputs() {
  // Clear input fields when switching transaction type
  document.getElementById('amount').value = '';
  document.getElementById('notes').value = '';
  document.getElementById('category').value = '';
  // Reset date to today
  initializeDateField();
} 
function updateCategories() {
  const typeSelect = document.getElementById('transactionType');
  const categorySelect = document.getElementById('category');
  const selectedType = typeSelect.value;
// Clear existing options
  categorySelect.innerHTML = '<option value="">Select Category</option>';
// Populate categories based on selected transaction type
  if (selectedType && categories[selectedType]) {
    categories[selectedType].forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.id;
      option.textContent = `${cat.icon} ${cat.name}`;
      option.dataset.color = cat.color;
      option.dataset.description = cat.description;
      categorySelect.appendChild(option);
    });
  }
}
// The setupTypeChange function adds an event listener to the transaction type dropdown. Whenever the user changes the transaction type (e.g., from "Income" to "Expense"), the updateCategories function is called to refresh the category dropdown options based on the selected type. This ensures that users only see relevant categories for the type of transaction they are logging, improving the user experience and making it easier to categorize transactions accurately.

function setupBudgetOverdraftWarning() {
  const amountInput = document.getElementById('amount');
  amountInput.addEventListener('input', function() {
    const amount = parseFloat(this.value);
    const budget = parseFloat(document.getElementById('budget').value);
    const transactionType = document.getElementById('transactionType').value;
    const overdraftWarning = document.getElementById('overdraftWarning');
    
    if (transactionType === 'expense' && amount > budget) {
      overdraftWarning.textContent = 'You are exceeding your budget!';
      overdraftWarning.style.display = 'block';
    } else {
      overdraftWarning.style.display = 'none';
    }
  });
}

function setupCategoryDropdown() {
  updateCategories();
}
// The setupCategoryDropdown function is called when the DOM content is loaded to initially populate the category dropdown based on the default selected transaction type. This ensures that when the user first opens the form, they see the appropriate categories without having to change the transaction type first. It calls the updateCategories function, which handles the logic of populating the category options based on the selected transaction type.
function setupFormSubmit() {
  const form = document.getElementById('transactionForm');
  form.addEventListener('submit', async (e) => await handleFormSubmit(e));
} 
// The setupFormSubmit function adds an event listener to the transaction form. When the form is submitted, it prevents the default form submission behavior and calls the handleFormSubmit function to process the form data. This allows for custom handling of the form submission, such as validating the input, saving the transaction to local storage, and providing feedback to the user without reloading the page.
async function handleFormSubmit(e) {
  e.preventDefault();
// Gather form data into an object for easier handling
  const formData = {
    transactionType: document.getElementById('transactionType').value,
    category: document.getElementById('category').value,
    amount: parseFloat(document.getElementById('amount').value),
    date: document.getElementById('date').value,
    notes: document.getElementById('notes').value
  };
// Validate the form data before proceeding
  if (!validateFormData(formData)) {
    alert('Please fill in all required fields');
    return;
  }
// Create a transaction object with the form data and additional metadata
  const transaction = {
    id: Date.now(),
    description: `${formData.category} - ${formData.notes || 'No notes'}`,
    amount: formData.amount,
    type: formData.transactionType,
    date: new Date(formData.date).toISOString(),
    category: formData.category,
    notes: formData.notes
  };
// Save the transaction to local storage and provide feedback to the user
  await addTransactionToStorage(transaction);
  await showSuccessMessage();
  resetForm();
}
// The handleFormSubmit function is responsible for processing the form data when the user submits the transaction form. It first prevents the default form submission behavior, then gathers the input values into a structured object. It validates the form data to ensure all required fields are filled and that the amount is a positive number. If validation passes, it creates a transaction object with a unique ID and saves it to local storage. Finally, it shows a success message to the user and resets the form for the next entry.
function validateFormData(data) {
  return (
    data.transactionType &&
    data.category &&
    data.amount > 0 &&
    data.date
  );
}
// The validateFormData function checks if the required fields in the form data are filled out correctly. It ensures that the transaction type and category are selected, the amount is a positive number, and a date is provided. If any of these conditions are not met, the function returns false, indicating that the form data is invalid and should not be processed further.
async function addTransactionToStorage(transaction) {
  try {
    // Try to save transaction to the backend API using axios
    const response = await axios.post(API_URL, transaction);
    console.log('Transaction saved to API:', response.data);
  } catch (error) {
    // If the API call fails, fall back to localStorage
    console.warn('API unavailable, saving to localStorage:', error.message);
    const transactions = getTransactions();
    transactions.push(transaction);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }
}
// The addTransactionToStorage function attempts to save a single transaction to a backend API using axios with a POST request. If the API is unavailable or returns an error, it retrieves the existing transactions from localStorage, adds the new transaction, and saves the updated array back to localStorage. This ensures reliable data persistence.
function getTransactions() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}
// The getTransactions function retrieves the transaction data from local storage. If there is data stored under the specified key, it parses the JSON string into an array of transaction objects and returns it. If there is no data (i.e., the user has not logged any transactions yet), it returns an empty array. This function is essential for accessing the stored transactions when displaying them in the transaction history or performing calculations based on the transaction data.
async function showSuccessMessage() {
  const message = document.getElementById('successMessage');
  message.style.display = 'block';
  await delay(3000);
  message.style.display = 'none';
}
//  The showSuccessMessage function displays a success message to the user when a transaction is successfully added. It makes the message visible, waits for 3 seconds using the delay function, and then hides the message again. This provides feedback to the user that their transaction has been logged without requiring them to take any additional action.
function resetForm() {
  const form = document.getElementById('transactionForm');
  form.reset();
  initializeDateField();
  updateCategories();
}
// The resetForm function resets the transaction form to its default state after a transaction has been successfully added. It clears all input fields, reinitializes the date field to today's date, and updates the category dropdown to reflect the default transaction type. This ensures that the form is ready for the next transaction entry without any leftover data from the previous submission.
export { addTransactionToStorage, getTransactions };
