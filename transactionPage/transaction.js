import { categories } from './objects.js';

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

document.addEventListener('DOMContentLoaded', () => {
  initializeDateField();
  setupCategoryDropdown();
  setupFormSubmit();
  setupTypeChange();
});

function initializeDateField() {
  const dateInput = document.getElementById('date');
  const today = new Date().toISOString().split('T')[0];
  dateInput.value = today;
}

function setupTypeChange() {
  const typeSelect = document.getElementById('transactionType');
  typeSelect.addEventListener('change', updateCategories);
} 
function updateCategories() {
  const typeSelect = document.getElementById('transactionType');
  const categorySelect = document.getElementById('category');
  const selectedType = typeSelect.value;

  categorySelect.innerHTML = '<option value="">Select Category</option>';

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

function setupCategoryDropdown() {
  updateCategories();
}

function setupFormSubmit() {
  const form = document.getElementById('transactionForm');
  form.addEventListener('submit', async (e) => await handleFormSubmit(e));
} 

async function handleFormSubmit(e) {
  e.preventDefault();

  const formData = {
    transactionType: document.getElementById('transactionType').value,
    category: document.getElementById('category').value,
    amount: parseFloat(document.getElementById('amount').value),
    date: document.getElementById('date').value,
    notes: document.getElementById('notes').value
  };

  if (!validateFormData(formData)) {
    alert('Please fill in all required fields');
    return;
  }

  const transaction = {
    id: Date.now(),
    description: `${formData.category} - ${formData.notes || 'No notes'}`,
    amount: formData.amount,
    type: formData.transactionType,
    date: new Date(formData.date).toISOString(),
    category: formData.category,
    notes: formData.notes
  };

  await addTransactionToStorage(transaction);
  await showSuccessMessage();
  resetForm();
}

function validateFormData(data) {
  return (
    data.transactionType &&
    data.category &&
    data.amount > 0 &&
    data.date
  );
}

async function addTransactionToStorage(transaction) {
  const transactions = getTransactions();
  transactions.push(transaction);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
} 

function getTransactions() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

async function showSuccessMessage() {
  const message = document.getElementById('successMessage');
  message.style.display = 'block';
  await delay(3000);
  message.style.display = 'none';
}

function resetForm() {
  const form = document.getElementById('transactionForm');
  form.reset();
  initializeDateField();
  updateCategories();
}

export { addTransactionToStorage, getTransactions };
