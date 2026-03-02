import { resolve } from 'path';

export default {
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    minify: 'esbuild',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        transaction: resolve(__dirname, 'transactionPage/transaction.html'),
        history: resolve(__dirname, 'history/history.html'),
        budget: resolve(__dirname, 'budgetPage/budget.html'),
        privacy: resolve(__dirname, 'privacy-policy.html'),
        terms: resolve(__dirname, 'terms-of-service.html'),
      },
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
  },
};
