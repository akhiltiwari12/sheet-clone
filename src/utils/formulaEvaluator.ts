import { SpreadsheetData } from '../types';

// Helper function to get cell value
const getCellValue = (cellId: string, data: SpreadsheetData): number => {
  if (!data[cellId]) {
    throw new Error(`Cell ${cellId} not found`);
  }
  
  const value = data[cellId].value;
  
  if (typeof value === 'number') {
    return value;
  }
  
  if (typeof value === 'string' && !isNaN(Number(value))) {
    return Number(value);
  }
  
  throw new Error(`Cell ${cellId} does not contain a number`);
};

// Helper function to get range of cells
const getCellRange = (range: string, data: SpreadsheetData): string[] => {
  const [start, end] = range.split(':');
  
  if (!start || !end) {
    throw new Error(`Invalid range: ${range}`);
  }
  
  const startCol = start.charCodeAt(0) - 65; // A = 0, B = 1, etc.
  const startRow = parseInt(start.substring(1)) - 1;
  
  const endCol = end.charCodeAt(0) - 65;
  const endRow = parseInt(end.substring(1)) - 1;
  
  const cells: string[] = [];
  
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      const cellId = `${String.fromCharCode(65 + col)}${row + 1}`;
      cells.push(cellId);
    }
  }
  
  return cells;
};

// Mathematical functions
const sum = (range: string, data: SpreadsheetData): number => {
  const cells = getCellRange(range, data);
  return cells.reduce((acc, cellId) => {
    try {
      return acc + getCellValue(cellId, data);
    } catch (error) {
      return acc;
    }
  }, 0);
};

const average = (range: string, data: SpreadsheetData): number => {
  const cells = getCellRange(range, data);
  let sum = 0;
  let count = 0;
  
  cells.forEach(cellId => {
    try {
      sum += getCellValue(cellId, data);
      count++;
    } catch (error) {
      // Skip non-numeric cells
    }
  });
  
  if (count === 0) {
    throw new Error('No numeric cells in range');
  }
  
  return sum / count;
};

const max = (range: string, data: SpreadsheetData): number => {
  const cells = getCellRange(range, data);
  let maxValue = Number.NEGATIVE_INFINITY;
  let found = false;
  
  cells.forEach(cellId => {
    try {
      const value = getCellValue(cellId, data);
      maxValue = Math.max(maxValue, value);
      found = true;
    } catch (error) {
      // Skip non-numeric cells
    }
  });
  
  if (!found) {
    throw new Error('No numeric cells in range');
  }
  
  return maxValue;
};

const min = (range: string, data: SpreadsheetData): number => {
  const cells = getCellRange(range, data);
  let minValue = Number.POSITIVE_INFINITY;
  let found = false;
  
  cells.forEach(cellId => {
    try {
      const value = getCellValue(cellId, data);
      minValue = Math.min(minValue, value);
      found = true;
    } catch (error) {
      // Skip non-numeric cells
    }
  });
  
  if (!found) {
    throw new Error('No numeric cells in range');
  }
  
  return minValue;
};

const count = (range: string, data: SpreadsheetData): number => {
  const cells = getCellRange(range, data);
  let count = 0;
  
  cells.forEach(cellId => {
    try {
      getCellValue(cellId, data);
      count++;
    } catch (error) {
      // Skip non-numeric cells
    }
  });
  
  return count;
};

// Data quality functions
const trim = (cellId: string, data: SpreadsheetData): string => {
  if (!data[cellId]) {
    throw new Error(`Cell ${cellId} not found`);
  }
  
  const value = data[cellId].value;
  
  if (typeof value !== 'string') {
    return value.toString();
  }
  
  return value.trim();
};

const upper = (cellId: string, data: SpreadsheetData): string => {
  if (!data[cellId]) {
    throw new Error(`Cell ${cellId} not found`);
  }
  
  const value = data[cellId].value;
  
  if (typeof value !== 'string') {
    return value.toString().toUpperCase();
  }
  
  return value.toUpperCase();
};

const lower = (cellId: string, data: SpreadsheetData): string => {
  if (!data[cellId]) {
    throw new Error(`Cell ${cellId} not found`);
  }
  
  const value = data[cellId].value;
  
  if (typeof value !== 'string') {
    return value.toString().toLowerCase();
  }
  
  return value.toLowerCase();
};

// Function to evaluate a formula
export const evaluateFormula = (formula: string, data: SpreadsheetData): string | number => {
  // Check for SUM function
  const sumMatch = formula.match(/SUM\(([A-Z][0-9]+:[A-Z][0-9]+)\)/i);
  if (sumMatch) {
    return sum(sumMatch[1], data);
  }
  
  // Check for AVERAGE function
  const avgMatch = formula.match(/AVERAGE\(([A-Z][0-9]+:[A-Z][0-9]+)\)/i);
  if (avgMatch) {
    return average(avgMatch[1], data);
  }
  
  // Check for MAX function
  const maxMatch = formula.match(/MAX\(([A-Z][0-9]+:[A-Z][0-9]+)\)/i);
  if (maxMatch) {
    return max(maxMatch[1], data);
  }
  
  // Check for MIN function
  const minMatch = formula.match(/MIN\(([A-Z][0-9]+:[A-Z][0-9]+)\)/i);
  if (minMatch) {
    return min(minMatch[1], data);
  }
  
  // Check for COUNT function
  const countMatch = formula.match(/COUNT\(([A-Z][0-9]+:[A-Z][0-9]+)\)/i);
  if (countMatch) {
    return count(countMatch[1], data);
  }
  
  // Check for TRIM function
  const trimMatch = formula.match(/TRIM\(([A-Z][0-9]+)\)/i);
  if (trimMatch) {
    return trim(trimMatch[1], data);
  }
  
  // Check for UPPER function
  const upperMatch = formula.match(/UPPER\(([A-Z][0-9]+)\)/i);
  if (upperMatch) {
    return upper(upperMatch[1], data);
  }
  
  // Check for LOWER function
  const lowerMatch = formula.match(/LOWER\(([A-Z][0-9]+)\)/i);
  if (lowerMatch) {
    return lower(lowerMatch[1], data);
  }
  
  // Check for cell references (e.g., A1, B2)
  const cellRefRegex = /([A-Z][0-9]+)/g;
  let cellRefs = formula.match(cellRefRegex);
  
  if (cellRefs) {
    let evaluatedFormula = formula;
    
    cellRefs.forEach(cellId => {
      try {
        const cellValue = data[cellId]?.value || '';
        evaluatedFormula = evaluatedFormula.replace(cellId, cellValue.toString());
      } catch (error) {
        throw new Error(`Error evaluating cell reference ${cellId}: ${error}`);
      }
    });
    
    // Evaluate the resulting expression
    try {
      // eslint-disable-next-line no-eval
      return eval(evaluatedFormula);
    } catch (error) {
      throw new Error(`Error evaluating formula: ${error}`);
    }
  }
  
  // If no function or cell reference is found, try to evaluate as a mathematical expression
  try {
    // eslint-disable-next-line no-eval
    return eval(formula);
  } catch (error) {
    throw new Error(`Error evaluating formula: ${error}`);
  }
};