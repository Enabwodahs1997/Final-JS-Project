import { categories } from './objects.js';

const STORAGE_KEY = 'financeTransactions';

document.addEventListener('DOMContentLoaded', () => {
  initializeDateField();
  setupCategoryDropdown();
  setupFormSubmit();
  setupTypeChange();
}); // This is all the DOM content so it will listen for the form submit and type change events after the page has loaded

function initializeDateField() {
  const dateInput = document.getElementById('date');
  const today = new Date().toISOString().split('T')[0];
  dateInput.value = today;
} // This function initializes the date field to the current date when the page loads, making it easier for users to enter transactions for the current day.

function setupTypeChange() {
  const typeSelect = document.getElementById('transactionType');
  typeSelect.addEventListener('change', updateCategories);
} // This function sets up an event listener for changes to the transaction type dropdown. When the user selects a different type (income or expense), it calls the updateCategories function to refresh the category options based on the selected type.
// The updateCategories function dynamically updates the category dropdown options based on the selected transaction type. 
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
} // This function initializes the category dropdown when the page loads by calling updateCategories.

function setupFormSubmit() {
  const form = document.getElementById('transactionForm');
  form.addEventListener('submit', handleFormSubmit);
} // This function sets up an event listener for the form submission. 

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
  } //Loads the form data into an object and validates it. If the validation fails, it shows an alert to the user.

  const transaction = {
    id: Date.now(),
    description: `${formData.category} - ${formData.notes || 'No notes'}`,
    amount: formData.amount,
    type: formData.transactionType,
    date: new Date(formData.date).toISOString(), //logic that has to do with the date field to make it work. Date isn't stored as a string, but as an ISO string to make it easier to sort and display later on. (don't ask me why the date stuff is dumb).
    category: formData.category,
    notes: formData.notes
  };

  addTransactionToStorage(transaction);
  showSuccessMessage();
  resetForm();
}//runs these functions after a transaction is successfully added to storage: shows a success message and resets the form for the next entry.

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
} //local storage so it doesn't get lost when refreshing the page. 

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
