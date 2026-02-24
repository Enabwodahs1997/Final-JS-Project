import { categories } from '../transactionPage/objects.js'; //links to the other pages being used
import { showMessage } from '../utils.js';

const CATEGORY_BUDGETS_KEY = 'categoryBudgets'; // Key for storing category budgets (limits) in local storage
const REMAINING_BUDGETS_KEY = 'remainingBudgets'; // Key for storing remaining budgets in local storage

document.addEventListener('DOMContentLoaded', () => {
  loadAndDisplayBudgets(); // Load and display budgets when the page is loaded
});

// Get all category budgets (limits)
function getCategoryBudgets() {
  const data = localStorage.getItem(CATEGORY_BUDGETS_KEY);
  return data ? JSON.parse(data) : {};
} // this is pulling the limits that were set for each category from local storage, 
// if there is nothing it will return an empty object so the rest of the code can work without errors.

// Get remaining budgets
function getRemainingBudgets() {
  const data = localStorage.getItem(REMAINING_BUDGETS_KEY);
  return data ? JSON.parse(data) : {};
} // this is pulling the remaining budgets for each category from local storage, 
// if there is nothing it will return an empty object so the rest of the code can work without errors.

// Save category budget limit
function saveCategoryBudget(category, limit) {
  const budgets = getCategoryBudgets();
  budgets[category] = parseFloat(limit);
  localStorage.setItem(CATEGORY_BUDGETS_KEY, JSON.stringify(budgets));
} //saving it to local storage, it first gets the existing budgets, 
// updates the limit for the specified category, and then saves the updated budgets back to local storage.

// Save remaining budget
function saveRemainingBudget(category, remaining) {
  const remainingBudgets = getRemainingBudgets();
  remainingBudgets[category] = parseFloat(remaining);
  localStorage.setItem(REMAINING_BUDGETS_KEY, JSON.stringify(remainingBudgets));
} //saves the difference between the limit and the amount spent for each category, 
// it first gets the existing remaining budgets, updates the remaining budget for the specified category, 
// and then saves the updated remaining budgets back to local storage.

// Reset remaining budget to the limit
function resetBudget(category) {
  const budgets = getCategoryBudgets();
  const limit = budgets[category];
  if (limit) {
    saveRemainingBudget(category, limit);
    loadAndDisplayBudgets();
    showMessage('successMessage', 2000);
  }
} //this is for the reset button, it resets the remaining budget back to the original limit,

// Update budget limit and reset remaining
function updateBudget(category, newLimit) {
  saveCategoryBudget(category, newLimit);
  saveRemainingBudget(category, newLimit);
  loadAndDisplayBudgets();
  showMessage('successMessage', 2000);
} //this is for the update limit button, it updates the limit and also resets the remaining budget 
// to match the new limit.

// Update remaining budget only
function updateRemainingBudget(category, newRemaining) {
  saveRemainingBudget(category, newRemaining);
  loadAndDisplayBudgets();
  showMessage('successMessage', 2000);
} //this is for the update remaining button, it only updates the remaining budget without changing the limit.

// Get all expense categories from objects.js
function getAllExpenseCategories() {
  if (categories.expense) {
    return categories.expense.map(cat => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      color: cat.color
    }));
  }
  return [];
} //this function is pulling all the expense categories from the objects.js file,
// it checks if there are any expense categories defined and then maps them to a 
// new array with the relevant information (id, name, icon, color) that can be used to 
// display the categories on the budget page.

// Load and display all budgets
function loadAndDisplayBudgets() {
  const budgetList = document.getElementById('budgetList');
  const budgets = getCategoryBudgets();
  const remainingBudgets = getRemainingBudgets();
  const expenseCategories = getAllExpenseCategories();

  if (Object.keys(budgets).length === 0 && expenseCategories.length === 0) {
    budgetList.innerHTML = '<p class="no-budgets">No budgets set yet. Add a transaction with a budget to get started!</p>'; //this is the html data for that message
    return;
  }
  //this loads the budgets and remaining budgets from local storage, as well as the expense categories.
  // If there are no budgets and no expense categories, it shows a message prompting the user to add a transaction with a budget to get started.

  // Create a set of all categories that have budgets or are expense categories
  const allCategories = new Set([...Object.keys(budgets), ...expenseCategories.map(c => c.id)]);
  
  budgetList.innerHTML = '';
// Loop through all categories and create budget cards
  allCategories.forEach(categoryId => {
    const categoryInfo = expenseCategories.find(c => c.id === categoryId);
    const categoryName = categoryInfo ? categoryInfo.name : categoryId;
    const categoryIcon = categoryInfo ? categoryInfo.icon : '💰';
    
    const limit = budgets[categoryId] || 0;
    const remaining = remainingBudgets[categoryId] !== undefined ? remainingBudgets[categoryId] : limit;
    // above we are getting the category name and icon from the expense categories, if it exists.
    // We also get the limit and remaining budget for that category, if they exist. 
    // If not, we default to 0 for the limit and the same as the limit for the remaining budget.

    // Only show categories that have a budget set
    if (limit > 0) {
      const card = createBudgetCard(categoryId, categoryName, categoryIcon, limit, remaining);
      budgetList.appendChild(card);
    }
  });

  if (budgetList.innerHTML === '') {
    budgetList.innerHTML = '<p class="no-budgets">No budgets set yet. Add a transaction with a budget to get started!</p>';
  }
}

// Create budget card element
function createBudgetCard(categoryId, categoryName, categoryIcon, limit, remaining) {
  const card = document.createElement('div');
  card.className = 'budget-card';

  const percentage = limit > 0 ? (remaining / limit) * 100 : 0;
  let progressClass = '';
  if (percentage < 25) {
    progressClass = 'danger';
  } else if (percentage < 50) {
    progressClass = 'warning';
  }
// this is calculating the percentage of the budget that is remaining and assigning 
// a class for styling the progress bar based on how much of the budget is left 
// (green for >50%, yellow for 25-50%, red for <25%).

  card.innerHTML = `
    <div class="budget-card-header">
      <div class="budget-category">${categoryIcon} ${categoryName}</div>
    </div>
    
    <div class="budget-progress-container">
      <div class="budget-progress-bar">
        <div class="budget-progress-fill ${progressClass}" style="width: ${Math.min(percentage, 100)}%"></div>
      </div>
      <div class="budget-amounts">
        <span>Remaining: $${remaining.toFixed(2)}</span>
        <span>Limit: $${limit.toFixed(2)}</span>
      </div>
      <div class="budget-amounts">
        <span>Used: $${(limit - remaining).toFixed(2)} (${(100 - percentage).toFixed(1)}%)</span>
      </div>
    </div>

    <div class="budget-edit-form">
      <div class="budget-input-group">
        <label for="limit-${categoryId}">Budget Limit</label>
        <input type="number" id="limit-${categoryId}" step="0.01" min="0" value="${limit}" placeholder="0.00">
      </div>
      <div class="budget-input-group">
        <label for="remaining-${categoryId}">Remaining Budget</label>
        <input type="number" id="remaining-${categoryId}" step="0.01" min="0" value="${remaining}" placeholder="0.00">
      </div>
      <div class="budget-actions">
        <button class="btn-small btn-update" onclick="window.updateBudgetFromUI('${categoryId}')">Update Limit</button>
        <button class="btn-small btn-update" onclick="window.updateRemainingFromUI('${categoryId}')">Update Remaining</button>
        <button class="btn-small btn-reset" onclick="window.resetBudgetFromUI('${categoryId}')">Reset to Limit</button>
      </div>
    </div>
  `;

  return card;
}//this is the HTML structure for each budget card, it includes the category name and icon, 
// a progress bar showing how much of the budget is remaining, the remaining amount and limit, 
// and input fields with buttons to update the limit and remaining budget or reset it to the original limit.

// UI wrapper functions (exposed to global scope for onclick handlers)
window.updateBudgetFromUI = (categoryId) => {
  const limitInput = document.getElementById(`limit-${categoryId}`);
  const newLimit = parseFloat(limitInput.value);
  
  if (newLimit >= 0) {
    updateBudget(categoryId, newLimit);
  } else {
    alert('Please enter a valid budget limit');
  }
};

window.updateRemainingFromUI = (categoryId) => {
  const remainingInput = document.getElementById(`remaining-${categoryId}`);
  const newRemaining = parseFloat(remainingInput.value);
  
  if (newRemaining >= 0) {
    updateRemainingBudget(categoryId, newRemaining);
  } else {
    alert('Please enter a valid remaining budget');
  }
};

window.resetBudgetFromUI = (categoryId) => {
  resetBudget(categoryId);
};

export { getCategoryBudgets, getRemainingBudgets, saveRemainingBudget };
