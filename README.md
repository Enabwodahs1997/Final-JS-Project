# Final-JS-Project

## 🚀 Live Demo

**[View Live App](https://final-js-project-zeta.vercel.app)**

## Project Description

Final-JS-Project is a personal finance management application built with vanilla JavaScript, HTML, and CSS. This app helps users track their income and expenses, view their financial overview, and maintain a complete transaction history.

### Features

- **Dashboard/Homepage**: View your total income, total expenses, and remaining balance at a glance
- **Add Transaction Page**: Record new income or expense transactions with:
  - Transaction type selection (Income/Expense)
  - Dynamic category dropdown
  - Amount input
  - Customizable date
  - Optional notes
  - Category-based organization with icons and colors
- **Transaction History Page**: View all transactions with:
  - Filter by transaction type (Income/Expense)
  - Individual transaction deletion
  - Clear all transaction history option
  - Sorted transactions by date (newest first)
- **Local Storage**: All transactions are saved locally in the browser, persisting across sessions
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark Mode Support**: Automatic dark mode detection and styling

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Enabwodahs1997/Final-JS-Project.git
cd Final-JS-Project
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The app will open automatically in your browser at `http://localhost:`

### Project Structure

```
Final-JS-Project/
├── index.html              # Dashboard homepage
├── index.js                # Dashboard logic
├── index.css               # Dashboard styles
├── variables.css           # Global color variables and reusable styles
├── transactionPage/
│   ├── transaction.html    # Add transaction form
│   ├── transaction.js      # Form logic and local storage handling
│   ├── transaction.css     # Form styles
│   └── objects.js          # Category data objects
├── history/
│   ├── history.html        # Transaction history view
│   ├── history.js          # History logic
│   └── history.css         # History styles
├── package.json            # Project dependencies
└── vite.config.js          # Vite configuration
```

## Build and Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

### Deployment Options

#### GitHub Pages (Recommended)

1. Build the project:

```bash
npm run build
```

2. Push the `dist/` folder to GitHub Pages:

```bash
git add dist/
git commit -m "deploy: production build"
git push origin main
```

3. Enable GitHub Pages in repository settings and select the `dist/` folder as the source.

#### Vercel (Current Deployment)

This project is currently deployed on Vercel at [https://final-js-project-zeta.vercel.app](https://final-js-project-zeta.vercel.app)

To deploy updates:

1. Connect your GitHub repository to Vercel
2. Vercel will automatically build and deploy on every push
3. Configure build command: `npm run build`
4. Configure output directory: `dist`

#### Netlify

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Deploy!

## Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Build Tool**: Vite
- **Storage**: Browser LocalStorage API
- **Styling**: CSS Custom Properties (Variables)

## Features Implementation Details

### Local Storage

All transaction data is stored in the browser's localStorage under the key `financeTransactions`. The data structure is:

```javascript
{
  id: timestamp,
  description: string,
  amount: number,
  type: 'income' | 'expense',
  date: ISO string,
  category: string,
  notes: string
}
```

### Category System

Categories are organized in `transactionPage/objects.js` with:

- ID and name
- Icon and color for visual distinction
- Description for context

### Responsive Design

The app uses CSS Grid and Flexbox with media queries for:

- Desktop: Multi-column layouts
- Tablet: Adjusted spacing and sizing
- Mobile: Single-column, touch-friendly interface

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

- [ ] Backend integration for cloud sync
- [ ] Budget planning and alerts
- [ ] Data export (CSV/PDF)
- [ ] Monthly/yearly reports
- [ ] Recurring transactions
- [ ] Multi-user support
- [ ] Data visualization charts

## Contributing

Feel free to fork this project and submit pull requests for any improvements!

## License

ISC

## Author

Enabwodahs1997
