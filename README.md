# Google Sheets Clone

A fully-featured spreadsheet application built with React and TypeScript that mimics the functionality of Google Sheets.

![Google Sheets Clone](https://images.unsplash.com/photo-1544383835-bda2bc66a55d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80)

## Features

### Spreadsheet Interface
- Google Sheets-like UI with toolbar, formula bar, and cell structure
- Cell selection and range selection with drag functionality
- Cell dependencies that update automatically when referenced cells change
- Cell formatting (bold, italic, text alignment)
- Add, delete, and manipulate rows and columns

### Mathematical Functions
- `SUM(A1:B5)` - Calculates the sum of a range of cells
- `AVERAGE(A1:B5)` - Calculates the average of a range of cells
- `MAX(A1:B5)` - Returns the maximum value from a range
- `MIN(A1:B5)` - Returns the minimum value from a range
- `COUNT(A1:B5)` - Counts the number of cells with numerical values

### Data Quality Functions
- `TRIM(A1)` - Removes leading and trailing whitespace
- `UPPER(A1)` - Converts text to uppercase
- `LOWER(A1)` - Converts text to lowercase
- Remove duplicates functionality
- Find and replace functionality

### Additional Features
- Save and load spreadsheets to/from local storage
- Import and export data in CSV format
- Cell referencing in formulas
- Basic data validation

## Installation

### Prerequisites
- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)

### Dependencies
This application requires the following dependencies:
- React (v18.3.1 or higher)
- React DOM (v18.3.1 or higher)
- Lucide React (for icons)
- TypeScript
- Vite (for development and building)
- Tailwind CSS (for styling)

### Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/yourusername/google-sheets-clone.git
cd google-sheets-clone
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

5. Preview the production build:
```bash
npm run preview
```

## Usage Guide

### Basic Operations
- **Enter Data**: Click on any cell and start typing
- **Navigate**: Use arrow keys, Tab, or Enter to navigate between cells
- **Select Range**: Click and drag to select multiple cells
- **Format Cells**: Select cells and use the toolbar buttons to apply formatting

### Working with Formulas
1. Click on a cell where you want to enter a formula
2. Type an equals sign (=) followed by your formula
3. Examples:
   - `=SUM(A1:A5)` - Sum values in cells A1 through A5
   - `=AVERAGE(B1:B10)` - Calculate average of values in cells B1 through B10
   - `=A1+B1` - Add values in cells A1 and B1
   - `=MAX(C1:C20)` - Find maximum value in range C1 through C20

### Managing Rows and Columns
- Use the toolbar buttons to add or delete rows and columns
- Select a cell in the row/column you want to modify first

### Data Management
- **Save**: Click the Save button in the header, enter a filename, and click Save
- **Load**: Click the Load button in the header and select a previously saved spreadsheet
- **Export CSV**: Select a range of cells, then click Export CSV
- **Import CSV**: Click Import CSV and select a CSV file to import

### Data Cleaning
- **Remove Duplicates**: Select a range, then click the Remove Duplicates button
- **Find and Replace**: Click the Find and Replace button, enter search and replace terms

## Browser Compatibility
This application works best in modern browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License
MIT

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.