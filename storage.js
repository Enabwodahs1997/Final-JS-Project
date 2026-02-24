// Centralized localStorage operations
import { STORAGE_KEY } from './constants.js';

export function getTransactions() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveTransactions(transactions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

export function clearTransactions() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getTransaction(id) {
  const transactions = getTransactions();
  return transactions.find(t => t.id === parseInt(id));
}

export function deleteTransaction(id) {
  const transactions = getTransactions();
  const filtered = transactions.filter(t => t.id !== parseInt(id));
  saveTransactions(filtered);
}

export function addTransaction(transaction) {
  const transactions = getTransactions();
  transactions.push(transaction);
  saveTransactions(transactions);
  return transaction;
}

// Process recurring transactions and create new instances that are due
export function processRecurringTransactions() {
  const transactions = getTransactions();
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
  
  let newTransactionsCreated = false;
  
  // Find all base recurring transactions (ones that have recurring > 0 and are not themselves recurring instances)
  const recurringBases = transactions.filter(t => 
    t.reoccuring && t.reoccuring > 0 && !t.isRecurring
  );
  
  recurringBases.forEach(baseTransaction => {
    // Find the last generated instance for this recurring transaction
    const relatedTransactions = transactions.filter(t => 
      t.parentId === baseTransaction.id || t.id === baseTransaction.id
    );
    
    // Sort by date to find the most recent
    relatedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    const lastTransaction = relatedTransactions[0];
    const lastDate = new Date(lastTransaction.date);
    lastDate.setHours(0, 0, 0, 0);
    
    // Calculate the next due date
    const nextDueDate = new Date(lastDate);
    nextDueDate.setDate(nextDueDate.getDate() + baseTransaction.reoccuring);
    
    // Create new instances for all dates that have passed
    while (nextDueDate <= today) {
      const newRecurringTransaction = {
        ...baseTransaction,
        id: Date.now() + Math.random(), // Ensure unique ID
        date: new Date(nextDueDate).toISOString(),
        isRecurring: true,
        parentId: baseTransaction.id
      };
      
      transactions.push(newRecurringTransaction);
      newTransactionsCreated = true;
      
      // Move to next interval
      nextDueDate.setDate(nextDueDate.getDate() + baseTransaction.reoccuring);
      
      // Small delay to ensure unique timestamps
      const timestamp = Date.now();
      while (Date.now() === timestamp) {} // Wait for next millisecond
    }
  });
  
  // Save if any new transactions were created
  if (newTransactionsCreated) {
    saveTransactions(transactions);
  }
  
  return getTransactions();
}
