export interface CellStyle {
  bold: boolean;
  italic: boolean;
  fontSize: number;
  color: string;
  backgroundColor: string;
  textAlign: 'left' | 'center' | 'right';
}

export interface Cell {
  value: string | number;
  formula: string;
  formatted: boolean;
  style: CellStyle;
}

export interface SpreadsheetData {
  [cellId: string]: Cell;
}