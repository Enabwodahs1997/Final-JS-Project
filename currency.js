import axios from 'axios';

const CURRENCY_STORAGE_KEY = 'selectedCurrency';
const EXCHANGE_RATES_KEY = 'exchangeRates';
const RATES_CACHE_TIME = 'ratesCacheTime';
const CACHE_DURATION_MS = 86400000; // 24 hours

// Supported currencies for conversion
const SUPPORTED_CURRENCIES = {
  USD: { name: 'US Dollar', symbol: '$' },
  EUR: { name: 'Euro', symbol: '€' },
  GBP: { name: 'British Pound', symbol: '£' },
  JPY: { name: 'Japanese Yen', symbol: '¥' },
  CAD: { name: 'Canadian Dollar', symbol: 'C$' },
  AUD: { name: 'Australian Dollar', symbol: 'A$' },
  CHF: { name: 'Swiss Franc', symbol: 'CHF' },
  CNY: { name: 'Chinese Yuan', symbol: '¥' },
  INR: { name: 'Indian Rupee', symbol: '₹' },
  MXN: { name: 'Mexican Peso', symbol: '$' },
};

// Get selected currency or default to USD
export function getSelectedCurrency() {
  const saved = localStorage.getItem(CURRENCY_STORAGE_KEY);
  return saved || 'USD';
}

// Set selected currency
export function setSelectedCurrency(currency) {
  if (SUPPORTED_CURRENCIES[currency]) {
    localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
    return true;
  }
  return false;
}

// Get all supported currencies
export function getSupportedCurrencies() {
  return SUPPORTED_CURRENCIES;
}

// Fetch exchange rates from api.exchangerate-api.com
async function fetchExchangeRates() {
  try {
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
    const rates = response.data.rates;
    
    // Cache the rates with timestamp
    localStorage.setItem(EXCHANGE_RATES_KEY, JSON.stringify(rates));
    localStorage.setItem(RATES_CACHE_TIME, Date.now().toString());
    
    return rates;
  } catch (error) {
    console.warn('Failed to fetch exchange rates:', error.message);
    return null;
  }
}

// Get exchange rates (from cache if available, otherwise fetch)
async function getExchangeRates() {
  const cachedRates = localStorage.getItem(EXCHANGE_RATES_KEY);
  const cacheTime = localStorage.getItem(RATES_CACHE_TIME);
  
  // If cache is still valid, use it
  if (cachedRates && cacheTime && Date.now() - parseInt(cacheTime) < CACHE_DURATION_MS) {
    return JSON.parse(cachedRates);
  }
  
  // Otherwise, fetch fresh rates
  return await fetchExchangeRates();
}

// Convert amount from one currency to another
export async function convertCurrency(amount, fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  const rates = await getExchangeRates();
  
  if (!rates) {
    console.warn('Unable to convert currency, using original amount');
    return amount;
  }
  
  // Convert to USD first, then to target currency
  const amountInUSD = amount / (rates[fromCurrency] || 1);
  const convertedAmount = amountInUSD * (rates[toCurrency] || 1);
  
  return convertedAmount;
}

// Format currency display
export function formatCurrency(amount, currency = 'USD') {
  const currencyInfo = SUPPORTED_CURRENCIES[currency];
  const symbol = currencyInfo?.symbol || '$';
  
  return `${symbol}${amount.toFixed(2)}`;
}

// Get exchange rate between two currencies
export async function getExchangeRate(fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) {
    return 1;
  }
  
  const rates = await getExchangeRates();
  
  if (!rates) {
    return 1;
  }
  
  // Convert to USD first, then to target currency
  const rateToUSD = rates[fromCurrency] || 1;
  const rateFromUSD = rates[toCurrency] || 1;
  
  return rateFromUSD / rateToUSD;
}
