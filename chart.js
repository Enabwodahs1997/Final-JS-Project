import Chart from 'chart.js/auto';

let chartInstance = null;

// Initialize and create the chart
export function initializeChart(transactions) { //pulls the transactions data from index.js to use in the chart
  const ctx = document.getElementById('transactionChart');
  
  if (!ctx) {
    console.warn('Chart canvas element not found');
    return;
  }

  // Destroy existing chart if it exists
  if (chartInstance) {
    chartInstance.destroy();
  } //keeps brain studder from happening for the computer when you add a new transaction

  const chartData = prepareChartData(transactions);

  chartInstance = new Chart(ctx, { //had to use AI to help pull this part from previous code others have made I wasnt sure about the logic of building but I have worked it backwards and it makes sense
    type: 'doughnut',
    data: {
      labels: chartData.labels,
      datasets: [
        {
          data: chartData.data,
          backgroundColor: chartData.colors,
          borderColor: '#ffffff',
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 15,
            font: {
              size: 12,
            },
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || '';
              const value = '$' + context.parsed.toFixed(2);
              const percentage = ((context.parsed / chartData.total) * 100).toFixed(1);
              return `${label}: ${value} (${percentage}%)`;
            },
          },
        },
      },
    },
  });
}

// Prepare data for the chart by categorizing transactions
function prepareChartData(transactions) {
  const categories = {};

  transactions.forEach((transaction) => {
    // Extract just the category part without the notes (everything before the " - " or use fallback)
    let key = transaction.category || 'Other';
    
    if (transaction.type === 'income') {
      key = 'Income';
    } else if (transaction.type === 'debt') {
      key = `Debt - ${transaction.category || 'Other'}`;
    } else if (transaction.type === 'debtPayment') {
      key = `Debt Payment - ${transaction.category || 'Other'}`;
    }
    
    if (!categories[key]) {
      categories[key] = 0;
    }
    // Use absolute value for chart so negatives display as positive
    categories[key] += Math.abs(transaction.amount);
  });

  const labels = Object.keys(categories);
  const data = Object.values(categories);
  const total = data.reduce((sum, val) => sum + val, 0);

  // Color palette
  const colors = [
    '#4CAF50', // Green for income
    '#FF6384', // Red
    '#36A2EB', // Blue
    '#FFCE56', // Yellow
    '#228B22', // Forest Green
    '#FF9F40', // Orange
    '#00BCD4', // Cyan
    '#F44336', // Dark Red
  ];

  // Cycle through colors if more categories than colors
  const cycledColors = labels.map((_, index) => colors[index % colors.length]);

  return {
    labels,
    data,
    colors: cycledColors,
    total,
  };
}

// Update chart with new transaction data
export function updateChart(transactions) {
  if (chartInstance) {
    const chartData = prepareChartData(transactions);
    chartInstance.data.labels = chartData.labels;
    chartInstance.data.datasets[0].data = chartData.data;
    chartInstance.data.datasets[0].backgroundColor = chartData.colors;
    chartInstance.update();
  }
}
