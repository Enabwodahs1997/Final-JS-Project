// Reusable currency selector setup
import { getSelectedCurrency, setSelectedCurrency } from './currency.js';

export function initializeCurrencySelector(selectElementId) {
  const currencySelect = document.getElementById(selectElementId);
  if (currencySelect) {
    const savedCurrency = getSelectedCurrency();
    currencySelect.value = savedCurrency;
  }
}

export function setupCurrencyListener(selectElementId, onCurrencyChange) {
  const currencySelect = document.getElementById(selectElementId);
  if (currencySelect) {
    currencySelect.addEventListener('change', async (e) => {
      setSelectedCurrency(e.target.value);
      if (onCurrencyChange) {
        await onCurrencyChange(e.target.value);
      }
    });
  }
}

export function setupCurrencySelectors(selectElementId, onCurrencyChange) {
  initializeCurrencySelector(selectElementId);
  setupCurrencyListener(selectElementId, onCurrencyChange);
}
