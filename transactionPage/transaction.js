import { categories } from './objects.js';
import axios from 'axios';
import { addTransaction as addTransactionStorage, getTransactions, saveTransactions, processRecurringTransactions } from '../storage.js';
import { API_URL, CATEGORY_BUDGETS_KEY, REMAINING_BUDGETS_KEY } from '../constants.js';
import { delay, showMessage } from '../utils.js';

document.addEventListener('DOMContentLoaded', () => {
  initializeDateField();
  setupCategoryDropdown();
  setupFormSubmit();
  setupTypeChange();
  setupBudgetOverdraftWarning();
  setupCategoryBudgetAutoFill();
  setupRecurringIntervalToggle();
  setupBudgetRefresh();
});
// The above code sets up event listeners and initializes the form when the DOM is fully loaded. 
// It ensures that the date field is set to today's date, the category dropdown is populated based 
// on the selected transaction type, and the form submission is handled properly.

function setupBudgetRefresh() {
  // Listen for visibility changes and refresh budget when page becomes visible
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      // Page is now visible, refresh the budget display
      const categorySelect = document.getElementById('category');
      const selectedCategory = categorySelect.value;
      if (selectedCategory) {
        const budgetInput = document.getElementById('budget');
        const remainingBudget = getRemainingBudget(selectedCategory);
        
        // Update the budget field with the remaining budget
        budgetInput.value = remainingBudget;
      }
    }
  });
}

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
    
    // Hide/show elements based on transaction type
    const overdraftWarning = document.getElementById('overdraftWarning');
    const budgetInput = document.getElementById('budget');
    const budgetGroup = budgetInput.closest('.form-group');
    
    if (typeSelect.value !== 'expense') {
      overdraftWarning.style.display = 'none';
    }
    
    // Hide budget field for debt and debtPayment types
    if (typeSelect.value === 'debt' || typeSelect.value === 'debtPayment') {
      budgetGroup.style.display = 'none';
    } else {
      budgetGroup.style.display = 'block';
    }
    
    // Update amount label for clarity
    const amountLabel = document.querySelector('label[for="amount"]');
    if (typeSelect.value === 'debt') {
      amountLabel.textContent = 'Amount Owed';
    } else if (typeSelect.value === 'debtPayment') {
      amountLabel.textContent = 'Payment Amount';
    } else {
      amountLabel.textContent = 'Amount';
    }
  });
}

function clearFormInputs() {
  // Clear input fields when switching transaction type
  document.getElementById('amount').value = '';
  document.getElementById('notes').value = '';
  document.getElementById('category').value = '';
  document.getElementById('budget').value = '';
  document.getElementById('recurringInterval').value = 'none';
  document.getElementById('recurringAmount').value = '';
  document.getElementById('recurringAmountGroup').style.display = 'none';
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
      option.textContent = `${cat.icon} ${cat.name}`; //cat is the category object from objects.js, it has the name and the icon for each category, so this will show the icon and the name in the dropdown.
      option.dataset.color = cat.color;
      option.dataset.description = cat.description;
      categorySelect.appendChild(option);
    });
  }
}
// The setupTypeChange function adds an event listener to the transaction type dropdown. Whenever the user changes the transaction type (e.g., from "Income" to "Expense"), the updateCategories function is called to refresh the category dropdown options based on the selected type. This ensures that users only see relevant categories for the type of transaction they are logging, improving the user experience and making it easier to categorize transactions accurately.

function setupBudgetOverdraftWarning() {
  const amountInput = document.getElementById('amount');
  const budgetInput = document.getElementById('budget');
  const categorySelect = document.getElementById('category');
  //this is the function I am calling above of overdraft warning, 
  // it checks if the amount entered exceeds the remaining budget for the selected category 
  // and shows a warning message if it does.

  // Function to check and display warning
  const checkBudgetOverdraft = () => {
    const amount = parseFloat(amountInput.value);
    const budget = parseFloat(budgetInput.value);
    const transactionType = document.getElementById('transactionType').value;
    const category = categorySelect.value;
    const overdraftWarning = document.getElementById('overdraftWarning');
    
    if (transactionType === 'expense' && !isNaN(amount) && category && !isNaN(budget) && budget !== 0) {
      if (amount > budget) {
        overdraftWarning.textContent = `Warning: This will exceed your budget limit of $${budget.toFixed(2)}!`;
        overdraftWarning.style.display = 'block';
      } else {
        overdraftWarning.style.display = 'none';
      }
    } else {
      overdraftWarning.style.display = 'none';
    }
  };
  
  // Listen to changes on amount, budget, and category
  amountInput.addEventListener('input', checkBudgetOverdraft);
  budgetInput.addEventListener('input', checkBudgetOverdraft);
  categorySelect.addEventListener('change', checkBudgetOverdraft);
}

function setupCategoryDropdown() {
  updateCategories();
}
// The setupCategoryDropdown function is called when the DOM content is loaded to initially populate the category dropdown based on the default selected transaction type. This ensures that when the user first opens the form, they see the appropriate categories without having to change the transaction type first. It calls the updateCategories function, which handles the logic of populating the category options based on the selected transaction type.

// Functions for managing category budgets
function getCategoryBudgets() {
  const data = localStorage.getItem(CATEGORY_BUDGETS_KEY);
  return data ? JSON.parse(data) : {};
}

function saveCategoryBudget(category, budget) {
  const budgets = getCategoryBudgets();
  budgets[category] = budget;
  localStorage.setItem(CATEGORY_BUDGETS_KEY, JSON.stringify(budgets));
}

function getCategoryBudget(category) {
  const budgets = getCategoryBudgets();
  return budgets[category] || '';
}

// Functions for managing remaining budgets
function getRemainingBudgets() {
  const data = localStorage.getItem(REMAINING_BUDGETS_KEY);
  return data ? JSON.parse(data) : {};
}

function saveRemainingBudget(category, remaining) {
  const remainingBudgets = getRemainingBudgets();
  remainingBudgets[category] = parseFloat(remaining);
  localStorage.setItem(REMAINING_BUDGETS_KEY, JSON.stringify(remainingBudgets));
}

function getRemainingBudget(category) {
  const remainingBudgets = getRemainingBudgets();
  const budgets = getCategoryBudgets();
  
  // If no remaining budget is set, use the full budget limit
  if (remainingBudgets[category] !== undefined) {
    return remainingBudgets[category];
  } else if (budgets[category] !== undefined) {
    return budgets[category];
  }
  return 0;
}

function deductFromRemainingBudget(category, amount) {
  const currentRemaining = getRemainingBudget(category);
  const newRemaining = currentRemaining - amount;
  saveRemainingBudget(category, newRemaining);
  return newRemaining;
}

function setupRecurringIntervalToggle() {
  const intervalSelect = document.getElementById('recurringInterval');
  const amountGroup = document.getElementById('recurringAmountGroup');
  const amountLabel = document.getElementById('recurringAmountLabel');
  
  intervalSelect.addEventListener('change', () => {
    const selectedInterval = intervalSelect.value;
    
    if (selectedInterval === 'none') {
      amountGroup.style.display = 'none';
      document.getElementById('recurringAmount').value = '';
    } else {
      amountGroup.style.display = 'block';
      amountLabel.textContent = selectedInterval === 'days' ? 'Recurring Every (Days)' : 'Recurring Every (Weeks)';
    }
  });
}

function setupCategoryBudgetAutoFill() {
  const categorySelect = document.getElementById('category');
  const budgetInput = document.getElementById('budget');
  
  categorySelect.addEventListener('change', () => {
    const selectedCategory = categorySelect.value;
    if (selectedCategory) {
      const remainingBudget = getRemainingBudget(selectedCategory);
      
      // Show the remaining budget in the budget field
      budgetInput.value = remainingBudget;
    } else {
      budgetInput.value = '';
    }
  });
}
function setupFormSubmit() {
  const form = document.getElementById('transactionForm');
  form.addEventListener('submit', async (e) => await handleFormSubmit(e));
} 
// The setupFormSubmit function adds an event listener to the transaction form. When the form is submitted, it prevents the default form submission behavior and calls the handleFormSubmit function to process the form data. This allows for custom handling of the form submission, such as validating the input, saving the transaction to local storage, and providing feedback to the user without reloading the page.
async function handleFormSubmit(e) {
  e.preventDefault();
// Gather form data into an object for easier handling
  const recurringInterval = document.getElementById('recurringInterval').value;
  const recurringAmount = parseInt(document.getElementById('recurringAmount').value) || 0;
  
  // Convert to days for storage
  let recurringDays = 0;
  if (recurringInterval === 'days' && recurringAmount > 0) {
    recurringDays = recurringAmount;
  } else if (recurringInterval === 'weeks' && recurringAmount > 0) {
    recurringDays = recurringAmount * 7; // Convert weeks to days
  }
  
  const formData = {
    transactionType: document.getElementById('transactionType').value,
    category: document.getElementById('category').value,
    amount: parseFloat(document.getElementById('amount').value),
    date: document.getElementById('date').value,
    recurringDays: recurringDays,
    recurringInterval: recurringInterval,
    recurringAmount: recurringAmount,
    notes: document.getElementById('notes').value,
    budget: parseFloat(document.getElementById('budget').value) || 0
  };
// Validate the form data before proceeding
  if (!validateFormData(formData)) {
    alert('Please fill in all required fields');
    return;
  }
// Save budget limit for this category if provided
  if (formData.budget > 0) {
    saveCategoryBudget(formData.category, formData.budget);
    
    // Initialize remaining budget if not already set
    const remainingBudgets = getRemainingBudgets();
    if (remainingBudgets[formData.category] === undefined) {
      saveRemainingBudget(formData.category, formData.budget);
    }
  }
  
  // Deduct from remaining budget if this is an expense
  if (formData.transactionType === 'expense') {
    const newRemaining = deductFromRemainingBudget(formData.category, formData.amount);
    
    // Optional: Log the budget update for user feedback
    console.log(`Budget updated for ${formData.category}: $${newRemaining.toFixed(2)} remaining`);
  }

  // Calculate the final amount based on transaction type
  // Debt amounts are automatically negative (money owed)
  // Debt payments are positive (reducing debt)
  let finalAmount = formData.amount;
  if (formData.transactionType === 'debt') {
    finalAmount = -Math.abs(formData.amount); // Make debt negative
  } else if (formData.transactionType === 'debtPayment') {
    finalAmount = Math.abs(formData.amount); // Make payment positive (reduces negative debt)
  }

// Create a transaction object with the form data and additional metadata
  const transaction = {
    id: Date.now(),
    amount: finalAmount,
    type: formData.transactionType,
    date: new Date(formData.date).toISOString(),
    category: formData.category,
    notes: formData.notes,
    reoccuring: formData.recurringDays, // Store in days
    recurringInterval: formData.recurringInterval,
    recurringAmount: formData.recurringAmount
  };
// Save the transaction to local storage and provide feedback to the user
  await addTransactionToStorage(transaction);
  resetForm();
  showSuccessMessage(transaction.reoccuring, transaction.recurringInterval, transaction.recurringAmount);
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

function addTransactionToStorage(transaction) {
  // Just save the base transaction - recurring instances will be created dynamically based on current date
  addTransactionStorage(transaction);
  
  // Send to API in background without blocking UI (demonstrates axios logic)
  axios.post(API_URL, transaction).catch(() => {
    console.log('API unavailable, transaction saved to localStorage');
  });
}

// The addTransactionToStorage function saves a transaction to localStorage immediately for fast UI updates. 
// It also attempts to send the transaction to the API in the background without blocking, demonstrating axios usage.
// If the API call fails, it logs a message but the transaction is already safely stored locally.
async function showSuccessMessage(recurringDays, interval, amount) {
  const messageElement = document.getElementById('successMessage');
  
  if (recurringDays && recurringDays > 0 && interval !== 'none') {
    const intervalText = interval === 'weeks' ? `${amount} week${amount > 1 ? 's' : ''}` : `${amount} day${amount > 1 ? 's' : ''}`;
    messageElement.textContent = `Transaction saved successfully! This will recur every ${intervalText} automatically.`;
  } else {
    messageElement.textContent = 'Transaction saved successfully!';
  }
  
  showMessage('successMessage', 3000);
}
//  The showSuccessMessage function displays a success message to the user when a transaction is successfully added. It makes the message visible, waits for 3 seconds, and then hides the message again. This provides feedback to the user that their transaction has been logged without requiring them to take any additional action.
function resetForm() {
  const form = document.getElementById('transactionForm');
  form.reset();
  initializeDateField();
  updateCategories();
}
// The resetForm function resets the transaction form to its default state after a transaction has been successfully added. It clears all input fields, reinitializes the date field to today's date, and updates the category dropdown to reflect the default transaction type. This ensures that the form is ready for the next transaction entry without any leftover data from the previous submission.
export { addTransactionToStorage, getTransactions };
