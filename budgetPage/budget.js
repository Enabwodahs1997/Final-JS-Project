import { categories } from '../transactionPage/objects.js';
import { showMessage } from '../utils.js';

const CATEGORY_BUDGETS_KEY = 'categoryBudgets';
const REMAINING_BUDGETS_KEY = 'remainingBudgets';

document.addEventListener('DOMContentLoaded', () => {
  loadAndDisplayBudgets();
});

// Get all category budgets (limits)
function getCategoryBudgets() {
  const data = localStorage.getItem(CATEGORY_BUDGETS_KEY);
  return data ? JSON.parse(data) : {};
}

// Get remaining budgets
function getRemainingBudgets() {
  const data = localStorage.getItem(REMAINING_BUDGETS_KEY);
  return data ? JSON.parse(data) : {};
}

// Save category budget limit
function saveCategoryBudget(category, limit) {
  const budgets = getCategoryBudgets();
  budgets[category] = parseFloat(limit);
  localStorage.setItem(CATEGORY_BUDGETS_KEY, JSON.stringify(budgets));
}

// Save remaining budget
function saveRemainingBudget(category, remaining) {
  const remainingBudgets = getRemainingBudgets();
  remainingBudgets[category] = parseFloat(remaining);
  localStorage.setItem(REMAINING_BUDGETS_KEY, JSON.stringify(remainingBudgets));
}

// Reset remaining budget to the limit
function resetBudget(category) {
  const budgets = getCategoryBudgets();
  const limit = budgets[category];
  if (limit) {
    saveRemainingBudget(category, limit);
    loadAndDisplayBudgets();
    showMessage('successMessage', 2000);
  }
}

// Update budget limit and reset remaining
function updateBudget(category, newLimit) {
  saveCategoryBudget(category, newLimit);
  saveRemainingBudget(category, newLimit);
  loadAndDisplayBudgets();
  showMessage('successMessage', 2000);
}

// Update remaining budget only
function updateRemainingBudget(category, newRemaining) {
  saveRemainingBudget(category, newRemaining);
  loadAndDisplayBudgets();
  showMessage('successMessage', 2000);
}

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
}

// Load and display all budgets
function loadAndDisplayBudgets() {
  const budgetList = document.getElementById('budgetList');
  const budgets = getCategoryBudgets();
  const remainingBudgets = getRemainingBudgets();
  const expenseCategories = getAllExpenseCategories();

  if (Object.keys(budgets).length === 0 && expenseCategories.length === 0) {
    budgetList.innerHTML = '<p class="no-budgets">No budgets set yet. Add a transaction with a budget to get started!</p>';
    return;
  }

  // Create a set of all categories that have budgets or are expense categories
  const allCategories = new Set([...Object.keys(budgets), ...expenseCategories.map(c => c.id)]);
  
  budgetList.innerHTML = '';

  allCategories.forEach(categoryId => {
    const categoryInfo = expenseCategories.find(c => c.id === categoryId);
    const categoryName = categoryInfo ? categoryInfo.name : categoryId;
    const categoryIcon = categoryInfo ? categoryInfo.icon : '💰';
    
    const limit = budgets[categoryId] || 0;
    const remaining = remainingBudgets[categoryId] !== undefined ? remainingBudgets[categoryId] : limit;
    
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
}

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
