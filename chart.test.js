import { describe, it, expect } from 'vitest';
import { prepareChartData } from './chart.js';

describe('chart rules', () => {
    it('should prepare chart data correctly', () => {
        const transactions = [
            { amount: 50, category: 'Food', type: 'expense' },
            { amount: 30, category: 'Transport', type: 'expense' },
            { amount: 20, category: 'Entertainment', type: 'expense' },
            { amount: 100, category: 'Food', type: 'expense' },
        ];
        
        const result = prepareChartData(transactions);
        
        expect(result.labels).toContain('Food');
        expect(result.labels).toContain('Transport');
        expect(result.labels).toContain('Entertainment');
        
        const foodIndex = result.labels.indexOf('Food');
        const transportIndex = result.labels.indexOf('Transport');
        const entertainmentIndex = result.labels.indexOf('Entertainment');
        
        expect(result.data[foodIndex]).toBe(150);
        expect(result.data[transportIndex]).toBe(30);
        expect(result.data[entertainmentIndex]).toBe(20);
        expect(result.total).toBe(200);
    });

    it('should handle empty transactions', () => {
        const transactions = [];
        const result = prepareChartData(transactions);
        
        expect(result.labels).toEqual([]);
        expect(result.data).toEqual([]);
        expect(result.total).toBe(0);
    });

    it('should categorize income transactions', () => {
        const transactions = [
            { amount: 1000, category: 'Salary', type: 'income' },
            { amount: 50, category: 'Food', type: 'expense' },
        ];
        
        const result = prepareChartData(transactions);
        
        expect(result.labels).toContain('Income');
        expect(result.labels).toContain('Food');
        
        const incomeIndex = result.labels.indexOf('Income');
        expect(result.data[incomeIndex]).toBe(1000);
    });

    it('should categorize debt transactions', () => {
        const transactions = [
            { amount: 500, category: 'Credit Card', type: 'debt' },
        ];
        
        const result = prepareChartData(transactions);
        
        expect(result.labels).toContain('Debt - Credit Card');
        const debtIndex = result.labels.indexOf('Debt - Credit Card');
        expect(result.data[debtIndex]).toBe(500);
        expect(result.colors[debtIndex]).toBe('#8B0000'); // Dark red for debt
    });
}); //I forgot to add in my commit message that this tests the debt to be sure it passes the correct color for the chart 
// as well as categorizes it correctly

// should prepare chart data correctly
// should handle empty transactions
// should categorize income transactions
// should categorize debt transactions