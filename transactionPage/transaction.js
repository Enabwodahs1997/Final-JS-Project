const STORAGE_KEY = 'financeTransactions';

const categories = {
  income: ['Salary', 'Freelance', 'Investment', 'Bonus', 'Other Income'],
  expense: ['Food', 'Rent', 'Utilities', 'Transportation', 'Entertainment', 'Healthcare', 'Shopping', 'Other Expense']
};

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
      option.value = cat.toLowerCase();
      option.textContent = cat;
      categorySelect.appendChild(option);
    });
  }
}

function setupCategoryDropdown() {
  updateCategories();
}

function setupFormSubmit() {
  const form = document.getElementById('transactionForm');
  form.addEventListener('submit', handleFormSubmit);
}

function handleFormSubmit(e) {
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

  addTransactionToStorage(transaction);
  showSuccessMessage();
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

function addTransactionToStorage(transaction) {
  const transactions = getTransactions();
  transactions.push(transaction);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function getTransactions() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function showSuccessMessage() {
  const message = document.getElementById('successMessage');
  message.style.display = 'block';

  setTimeout(() => {
    message.style.display = 'none';
  }, 3000);
}

function resetForm() {
  const form = document.getElementById('transactionForm');
  form.reset();
  initializeDateField();
  updateCategories();
}

export { addTransactionToStorage, getTransactions };
