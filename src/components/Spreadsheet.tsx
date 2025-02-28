import React, { useRef, useEffect } from 'react';
import { SpreadsheetData } from '../types';

interface SpreadsheetProps {
  data: SpreadsheetData;
  activeCell: { row: number; col: number } | null;
  selectedRange: { startRow: number; startCol: number; endRow: number; endCol: number } | null;
  onCellChange: (row: number, col: number, value: string) => void;
  onCellClick: (row: number, col: number) => void;
  onCellDoubleClick: (row: number, col: number) => void;
  onCellDragStart: (row: number, col: number) => void;
  onCellDragOver: (row: number, col: number) => void;
  onCellDragEnd: () => void;
}

const Spreadsheet: React.FC<SpreadsheetProps> = ({
  data,
  activeCell,
  selectedRange,
  onCellChange,
  onCellClick,
  onCellDoubleClick,
  onCellDragStart,
  onCellDragOver,
  onCellDragEnd,
}) => {
  const activeCellRef = useRef<HTMLTableCellElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const editingRef = useRef<boolean>(false);

  useEffect(() => {
    if (activeCell && activeCellRef.current) {
      activeCellRef.current.focus();
    }
  }, [activeCell]);

  const handleCellChange = (row: number, col: number, e: React.FormEvent<HTMLTableCellElement>) => {
    const value = e.currentTarget.textContent || '';
    onCellChange(row, col, value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTableCellElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      editingRef.current = false;
      if (activeCell) {
        // Move to the cell below
        onCellClick(activeCell.row + 1, activeCell.col);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      editingRef.current = false;
      if (activeCell) {
        // Move to the next cell
        onCellClick(activeCell.row, activeCell.col + 1);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      editingRef.current = false;
      if (activeCellRef.current && activeCell) {
        // Revert to the original value
        const cellId = `${String.fromCharCode(65 + activeCell.col)}${activeCell.row + 1}`;
        const cell = data[cellId];
        activeCellRef.current.textContent = cell?.value?.toString() || '';
      }
    } else if (!editingRef.current) {
      editingRef.current = true;
    }
  };

  const isCellSelected = (row: number, col: number) => {
    if (!selectedRange) return false;
    
    const { startRow, startCol, endRow, endCol } = selectedRange;
    const minRow = Math.min(startRow, endRow);
    const maxRow = Math.max(startRow, endRow);
    const minCol = Math.min(startCol, endCol);
    const maxCol = Math.max(startCol, endCol);
    
    return row >= minRow && row <= maxRow && col >= minCol && col <= maxCol;
  };

  const getCellStyle = (row: number, col: number) => {
    const cellId = `${String.fromCharCode(65 + col)}${row + 1}`;
    const cell = data[cellId];
    
    if (!cell || !cell.formatted) {
      return {};
    }
    
    return {
      fontWeight: cell.style.bold ? 'bold' : 'normal',
      fontStyle: cell.style.italic ? 'italic' : 'normal',
      fontSize: `${cell.style.fontSize}px`,
      color: cell.style.color,
      backgroundColor: cell.style.backgroundColor,
      textAlign: cell.style.textAlign,
    };
  };

  // Generate column headers (A, B, C, ...)
  const columnHeaders = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

  // Generate rows (1, 2, 3, ...)
  const rows = Array.from({ length: 100 }, (_, i) => i);

  return (
    <div className="spreadsheet">
      <table className="spreadsheet-table" ref={tableRef}>
        <thead>
          <tr>
            <th className="corner-header"></th>
            {columnHeaders.map((header) => (
              <th key={header} className="col-header">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row}>
              <th className="row-header">{row + 1}</th>
              {columnHeaders.map((_, col) => {
                const cellId = `${String.fromCharCode(65 + col)}${row + 1}`;
                const cell = data[cellId];
                const isActive = activeCell?.row === row && activeCell?.col === col;
                const isSelected = isCellSelected(row, col);
                
                return (
                  <td
                    key={cellId}
                    className={`cell ${isActive ? 'active' : ''} ${isSelected ? 'selected' : ''}`}
                    contentEditable
                    suppressContentEditableWarning
                    ref={isActive ? activeCellRef : null}
                    onClick={() => onCellClick(row, col)}
                    onDoubleClick={() => onCellDoubleClick(row, col)}
                    onBlur={(e) => handleCellChange(row, col, e)}
                    onKeyDown={handleKeyDown}
                    onMouseDown={() => onCellDragStart(row, col)}
                    onMouseOver={() => onCellDragOver(row, col)}
                    onMouseUp={onCellDragEnd}
                    style={getCellStyle(row, col)}
                  >
                    {cell?.value?.toString() || ''}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Spreadsheet;