//this is just all my objects to try to keep the code organized and clean, it is imported into the history.js file to be used 
// for the categories of transactions.

export const categories = {
  income: [
    {
      id: 'salary',
      name: 'Salary',
      icon: '💼',
      color: '#10B981',
      description: 'Regular employment income'
    },
    {
      id: 'freelance',
      name: 'Freelance',
      icon: '💻',
      color: '#3B82F6',
      description: 'Freelance work and side projects'
    },
    {
      id: 'investment',
      name: 'Investment',
      icon: '📈',
      color: '#F59E0B',
      description: 'Returns from investments'
    },
    {
      id: 'bonus',
      name: 'Bonus',
      icon: '🎁',
      color: '#8B5CF6',
      description: 'Bonuses and incentives'
    },
    {
      id: 'other_income',
      name: 'Other Income',
      icon: '💰',
      color: '#6B7280',
      description: 'Other sources of income'
    }
  ],
  expense: [
    {
      id: 'food',
      name: 'Food',
      icon: '🍔',
      color: '#EF4444',
      description: 'Groceries and dining'
    },
    {
      id: 'rent',
      name: 'Rent',
      icon: '🏠',
      color: '#DC2626',
      description: 'Housing and rent payments'
    },
    {
      id: 'utilities',
      name: 'Utilities',
      icon: '⚡',
      color: '#F97316',
      description: 'Electricity, water, gas'
    },
    {
      id: 'transportation',
      name: 'Transportation',
      icon: '🚗',
      color: '#06B6D4',
      description: 'Gas, public transit, car maintenance'
    },
    {
      id: 'entertainment',
      name: 'Entertainment',
      icon: '🎬',
      color: '#EC4899',
      description: 'Movies, games, hobbies'
    },
    {
      id: 'healthcare',
      name: 'Healthcare',
      icon: '⚕️',
      color: '#EF4444',
      description: 'Medical expenses and insurance'
    },
    {
      id: 'shopping',
      name: 'Shopping',
      icon: '🛍️',
      color: '#A855F7',
      description: 'Clothing and general shopping'
    },
    {
      id: 'other_expense',
      name: 'Other Expense',
      icon: '📝',
      color: '#6B7280',
      description: 'Other miscellaneous expenses'
    }
  ],
  debt: [
    {
      id: 'credit_card',
      name: 'Credit Card',
      icon: '💳',
      color: '#DC2626',
      description: 'Credit card debt'
    },
    {
      id: 'student_loan',
      name: 'Student Loan',
      icon: '🎓',
      color: '#F97316',
      description: 'Student loan debt'
    },
    {
      id: 'personal_loan',
      name: 'Personal Loan',
      icon: '💰',
      color: '#EF4444',
      description: 'Personal loan debt'
    },
    {
      id: 'car_loan',
      name: 'Car Loan',
      icon: '🚗',
      color: '#DC2626',
      description: 'Auto loan debt'
    },
    {
      id: 'mortgage',
      name: 'Mortgage',
      icon: '🏠',
      color: '#DC2626',
      description: 'Home mortgage debt'
    },
    {
      id: 'other_debt',
      name: 'Other Debt',
      icon: '📊',
      color: '#6B7280',
      description: 'Other types of debt'
    }
  ],
  debtPayment: [
    {
      id: 'credit_card_payment',
      name: 'Credit Card Payment',
      icon: '💳',
      color: '#06B6D4',
      description: 'Payment towards credit card debt'
    },
    {
      id: 'student_loan_payment',
      name: 'Student Loan Payment',
      icon: '🎓',
      color: '#06B6D4',
      description: 'Payment towards student loan'
    },
    {
      id: 'personal_loan_payment',
      name: 'Personal Loan Payment',
      icon: '💰',
      color: '#06B6D4',
      description: 'Payment towards personal loan'
    },
    {
      id: 'car_loan_payment',
      name: 'Car Loan Payment',
      icon: '🚗',
      color: '#06B6D4',
      description: 'Payment towards car loan'
    },
    {
      id: 'mortgage_payment',
      name: 'Mortgage Payment',
      icon: '🏠',
      color: '#06B6D4',
      description: 'Payment towards mortgage'
    },
    {
      id: 'other_debt_payment',
      name: 'Other Debt Payment',
      icon: '📊',
      color: '#06B6D4',
      description: 'Payment towards other debt'
    }
  ]
};
