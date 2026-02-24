// NOTE: This test file was added by AI to demonstrate unit testing.
// Unit tests verify individual functions work correctly in isolation.
// This file tests the storage.js module's addTransaction function.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { addTransaction, getTransactions, clearTransactions } from './storage.js';

// STEP 1: describe() - Creates a test suite (a group of related tests)
// All tests below are grouped under 'addTransaction' for organization
describe('addTransaction', () => {
  
  // STEP 2: beforeEach() - Runs before EACH test to set up a fresh state
  // WHY: We need a clean localStorage mock for every test so tests don't affect each other
  beforeEach(() => {
    // Creates a fake localStorage object (the real one requires a browser)
    // This allows tests to run in Node.js without a browser environment
    global.localStorage = {
      data: {}, // Internal storage to hold data
      
      // getItem(key) - Retrieves a value from storage
      getItem(key) { 
        return this.data[key] || null; 
      },
      
      // setItem(key, value) - Stores a value
      setItem(key, value) { 
        this.data[key] = value; //makes an array of key value pairs to store the data in local storage.
      },
      
      // removeItem(key) - Deletes a value
      removeItem(key) { 
        delete this.data[key]; // Removes the key array from storage
      },
      
      // clear() - Deletes everything
      clear() { 
        this.data = {}; 
      }
    };
  });

  // STEP 3: it() - Defines a single test
  // 'should add a transaction and return it' describes what we're testing
  it('should add a transaction and return it', () => {
    // Step 3a: ARRANGE - Set up test data
    const transaction = {
      id: 1,
      amount: 50,
      category: 'Food',
      type: 'expense'
    };
    
    // Step 3b: ACT - Call the function we're testing
    const result = addTransaction(transaction);
    
    // Step 3c: ASSERT - Verify the result is what we expected
    // expect(result).toEqual(transaction) checks if the returned transaction matches our input
    expect(result).toEqual(transaction);
  });

  // STEP 4: it() - Second test - verifies data actually gets saved
  // WHY: We need to verify not just that the function returns a value,
  // but that the transaction was actually persisted to storage
  it('should persist transaction to storage', () => {
    // Step 4a: ARRANGE - Create a transaction
    const transaction = { id: 1, amount: 100, type: 'income' };
    
    // Step 4b: ACT - Add it to storage
    addTransaction(transaction);
    
    // Step 4c: ASSERT - Retrieve it and verify it exists
    const stored = getTransactions();
    
    // Verify the array has 1 item
    expect(stored).toHaveLength(1);
    
    // Verify the item matches what we added
    expect(stored[0]).toEqual(transaction);
  });

  // OPTIONAL: afterEach() - Cleanup after each test
  // WHY: Ensures localStorage is empty before the next test runs
  // This prevents test #2 from affecting test #3
  afterEach(() => {
    global.localStorage.clear();
  });
});
