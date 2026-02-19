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
