import React, { useState, useEffect, useRef } from 'react';
import { Grid, ChevronRight, ChevronDown, Plus, Trash2, Bold, Italic, AlignLeft, AlignCenter, AlignRight, Save, Upload, BarChart } from 'lucide-react';
import Spreadsheet from './components/Spreadsheet';
import Toolbar from './components/Toolbar';
import FormulaBar from './components/FormulaBar';
import { Cell, SpreadsheetData } from './types';
import { evaluateFormula } from './utils/formulaEvaluator';
import './App.css';

function App() {
  const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null);
  const [data, setData] = useState<SpreadsheetData>({});
  const [formulaBarValue, setFormulaBarValue] = useState('');
  const [selectedRange, setSelectedRange] = useState<{ startRow: number; startCol: number; endRow: number; endCol: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [fileName, setFileName] = useState('');
  const [savedFiles, setSavedFiles] = useState<string[]>([]);
  const [showLoadModal, setShowLoadModal] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialize with empty data
    const initialData: SpreadsheetData = {};
    for (let row = 0; row < 100; row++) {
      for (let col = 0; col < 26; col++) {
        const cellId = `${String.fromCharCode(65 + col)}${row + 1}`;
        initialData[cellId] = {
          value: '',
          formula: '',
          formatted: false,
          style: {
            bold: false,
            italic: false,
            fontSize: 14,
            color: '#000000',
            backgroundColor: '#ffffff',
            textAlign: 'left',
          },
        };
      }
    }
    setData(initialData);

    // Load saved files from localStorage
    const files = localStorage.getItem('spreadsheetFiles');
    if (files) {
      setSavedFiles(JSON.parse(files));
    }
  }, []);

  useEffect(() => {
    if (activeCell) {
      const cellId = `${String.fromCharCode(65 + activeCell.col)}${activeCell.row + 1}`;
      const cell = data[cellId];
      if (cell) {
        setFormulaBarValue(cell.formula || cell.value);
      } else {
        setFormulaBarValue('');
      }
    } else {
      setFormulaBarValue('');
    }
  }, [activeCell, data]);

  const handleCellChange = (row: number, col: number, value: string) => {
    const cellId = `${String.fromCharCode(65 + col)}${row + 1}`;
    
    // Check if it's a formula
    const isFormula = value.startsWith('=');
    
    let newData = { ...data };
    
    if (isFormula) {
      try {
        const result = evaluateFormula(value.substring(1), newData);
        newData[cellId] = {
          ...newData[cellId],
          value: result,
          formula: value,
        };
      } catch (error) {
        newData[cellId] = {
          ...newData[cellId],
          value: '#ERROR',
          formula: value,
        };
      }
    } else {
      newData[cellId] = {
        ...newData[cellId],
        value: value,
        formula: '',
      };
    }
    
    // Update dependent cells
    newData = updateDependentCells(newData, cellId);
    
    setData(newData);
  };

  const updateDependentCells = (currentData: SpreadsheetData, changedCellId: string): SpreadsheetData => {
    const newData = { ...currentData };
    
    // Find all cells that depend on the changed cell
    Object.keys(newData).forEach(cellId => {
      const cell = newData[cellId];
      if (cell.formula && cell.formula.includes(changedCellId)) {
        try {
          const result = evaluateFormula(cell.formula.substring(1), newData);
          newData[cellId] = {
            ...newData[cellId],
            value: result,
          };
          
          // Recursively update cells that depend on this cell
          updateDependentCells(newData, cellId);
        } catch (error) {
          newData[cellId] = {
            ...newData[cellId],
            value: '#ERROR',
          };
        }
      }
    });
    
    return newData;
  };

  const handleFormulaBarChange = (value: string) => {
    setFormulaBarValue(value);
    if (activeCell) {
      handleCellChange(activeCell.row, activeCell.col, value);
    }
  };

  const handleCellClick = (row: number, col: number) => {
    setActiveCell({ row, col });
    setSelectedRange({ startRow: row, startCol: col, endRow: row, endCol: col });
  };

  const handleCellDoubleClick = (row: number, col: number) => {
    setActiveCell({ row, col });
  };

  const handleCellDragStart = (row: number, col: number) => {
    setIsDragging(true);
    setSelectedRange({ startRow: row, startCol: col, endRow: row, endCol: col });
  };

  const handleCellDragOver = (row: number, col: number) => {
    if (isDragging && selectedRange) {
      setSelectedRange({
        ...selectedRange,
        endRow: row,
        endCol: col,
      });
    }
  };

  const handleCellDragEnd = () => {
    setIsDragging(false);
  };

  const applyFormatting = (formatting: Partial<Cell['style']>) => {
    if (!selectedRange) return;
    
    const { startRow, startCol, endRow, endCol } = selectedRange;
    const minRow = Math.min(startRow, endRow);
    const maxRow = Math.max(startRow, endRow);
    const minCol = Math.min(startCol, endCol);
    const maxCol = Math.max(startCol, endCol);
    
    const newData = { ...data };
    
    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        const cellId = `${String.fromCharCode(65 + col)}${row + 1}`;
        newData[cellId] = {
          ...newData[cellId],
          formatted: true,
          style: {
            ...newData[cellId].style,
            ...formatting,
          },
        };
      }
    }
    
    setData(newData);
  };

  const addRow = () => {
    if (!activeCell) return;
    
    const { row } = activeCell;
    const newData = { ...data };
    
    // Shift all rows below down by one
    for (let r = 99; r > row; r--) {
      for (let col = 0; col < 26; col++) {
        const oldCellId = `${String.fromCharCode(65 + col)}${r}`;
        const newCellId = `${String.fromCharCode(65 + col)}${r + 1}`;
        newData[newCellId] = { ...newData[oldCellId] };
      }
    }
    
    // Add empty row
    for (let col = 0; col < 26; col++) {
      const cellId = `${String.fromCharCode(65 + col)}${row + 1}`;
      newData[cellId] = {
        value: '',
        formula: '',
        formatted: false,
        style: {
          bold: false,
          italic: false,
          fontSize: 14,
          color: '#000000',
          backgroundColor: '#ffffff',
          textAlign: 'left',
        },
      };
    }
    
    setData(newData);
  };

  const deleteRow = () => {
    if (!activeCell) return;
    
    const { row } = activeCell;
    const newData = { ...data };
    
    // Shift all rows below up by one
    for (let r = row; r < 99; r++) {
      for (let col = 0; col < 26; col++) {
        const oldCellId = `${String.fromCharCode(65 + col)}${r + 2}`;
        const newCellId = `${String.fromCharCode(65 + col)}${r + 1}`;
        newData[newCellId] = { ...newData[oldCellId] };
      }
    }
    
    // Clear the last row
    for (let col = 0; col < 26; col++) {
      const cellId = `${String.fromCharCode(65 + col)}100`;
      newData[cellId] = {
        value: '',
        formula: '',
        formatted: false,
        style: {
          bold: false,
          italic: false,
          fontSize: 14,
          color: '#000000',
          backgroundColor: '#ffffff',
          textAlign: 'left',
        },
      };
    }
    
    setData(newData);
  };

  const addColumn = () => {
    if (!activeCell) return;
    
    const { col } = activeCell;
    const newData = { ...data };
    
    // Shift all columns to the right by one
    for (let c = 25; c > col; c--) {
      for (let row = 0; row < 100; row++) {
        const oldCellId = `${String.fromCharCode(65 + c - 1)}${row + 1}`;
        const newCellId = `${String.fromCharCode(65 + c)}${row + 1}`;
        newData[newCellId] = { ...newData[oldCellId] };
      }
    }
    
    // Add empty column
    for (let row = 0; row < 100; row++) {
      const cellId = `${String.fromCharCode(65 + col)}${row + 1}`;
      newData[cellId] = {
        value: '',
        formula: '',
        formatted: false,
        style: {
          bold: false,
          italic: false,
          fontSize: 14,
          color: '#000000',
          backgroundColor: '#ffffff',
          textAlign: 'left',
        },
      };
    }
    
    setData(newData);
  };

  const deleteColumn = () => {
    if (!activeCell) return;
    
    const { col } = activeCell;
    const newData = { ...data };
    
    // Shift all columns to the right by one
    for (let c = col; c < 25; c++) {
      for (let row = 0; row < 100; row++) {
        const oldCellId = `${String.fromCharCode(65 + c + 1)}${row + 1}`;
        const newCellId = `${String.fromCharCode(65 + c)}${row + 1}`;
        newData[newCellId] = { ...newData[oldCellId] };
      }
    }
    
    // Clear the last column
    for (let row = 0; row < 100; row++) {
      const cellId = `Z${row + 1}`;
      newData[cellId] = {
        value: '',
        formula: '',
        formatted: false,
        style: {
          bold: false,
          italic: false,
          fontSize: 14,
          color: '#000000',
          backgroundColor: '#ffffff',
          textAlign: 'left',
        },
      };
    }
    
    setData(newData);
  };

  const removeDuplicates = () => {
    if (!selectedRange) return;
    
    const { startRow, startCol, endRow, endCol } = selectedRange;
    const minRow = Math.min(startRow, endRow);
    const maxRow = Math.max(startRow, endRow);
    const minCol = Math.min(startCol, endCol);
    const maxCol = Math.max(startCol, endCol);
    
    const newData = { ...data };
    const seen = new Set();
    const duplicateRows = new Set();
    
    // Find duplicate rows
    for (let row = minRow; row <= maxRow; row++) {
      let rowValues = '';
      for (let col = minCol; col <= maxCol; col++) {
        const cellId = `${String.fromCharCode(65 + col)}${row + 1}`;
        rowValues += newData[cellId].value + '|';
      }
      
      if (seen.has(rowValues)) {
        duplicateRows.add(row);
      } else {
        seen.add(rowValues);
      }
    }
    
    // Remove duplicate rows (from bottom to top to avoid shifting issues)
    const duplicateRowsArray = Array.from(duplicateRows).sort((a, b) => b - a);
    for (const row of duplicateRowsArray) {
      // Shift all rows below up by one
      for (let r = row; r < 99; r++) {
        for (let col = 0; col < 26; col++) {
          const oldCellId = `${String.fromCharCode(65 + col)}${r + 2}`;
          const newCellId = `${String.fromCharCode(65 + col)}${r + 1}`;
          newData[newCellId] = { ...newData[oldCellId] };
        }
      }
      
      // Clear the last row
      for (let col = 0; col < 26; col++) {
        const cellId = `${String.fromCharCode(65 + col)}100`;
        newData[cellId] = {
          value: '',
          formula: '',
          formatted: false,
          style: {
            bold: false,
            italic: false,
            fontSize: 14,
            color: '#000000',
            backgroundColor: '#ffffff',
            textAlign: 'left',
          },
        };
      }
    }
    
    setData(newData);
  };

  const findAndReplace = () => {
    const find = prompt('Find:');
    if (find === null) return;
    
    const replace = prompt('Replace with:');
    if (replace === null) return;
    
    const newData = { ...data };
    
    if (selectedRange) {
      const { startRow, startCol, endRow, endCol } = selectedRange;
      const minRow = Math.min(startRow, endRow);
      const maxRow = Math.max(startRow, endRow);
      const minCol = Math.min(startCol, endCol);
      const maxCol = Math.max(startCol, endCol);
      
      for (let row = minRow; row <= maxRow; row++) {
        for (let col = minCol; col <= maxCol; col++) {
          const cellId = `${String.fromCharCode(65 + col)}${row + 1}`;
          const cell = newData[cellId];
          
          if (typeof cell.value === 'string' && cell.value.includes(find)) {
            newData[cellId] = {
              ...cell,
              value: cell.value.replaceAll(find, replace),
            };
          }
        }
      }
    } else {
      // Apply to all cells if no range is selected
      Object.keys(newData).forEach(cellId => {
        const cell = newData[cellId];
        if (typeof cell.value === 'string' && cell.value.includes(find)) {
          newData[cellId] = {
            ...cell,
            value: cell.value.replaceAll(find, replace),
          };
        }
      });
    }
    
    setData(newData);
  };

  const saveSpreadsheet = () => {
    if (!fileName.trim()) {
      alert('Please enter a file name');
      return;
    }
    
    const spreadsheetData = {
      data,
      name: fileName,
      date: new Date().toISOString(),
    };
    
    localStorage.setItem(`spreadsheet_${fileName}`, JSON.stringify(spreadsheetData));
    
    // Update saved files list
    const updatedFiles = [...savedFiles];
    if (!updatedFiles.includes(fileName)) {
      updatedFiles.push(fileName);
      setSavedFiles(updatedFiles);
      localStorage.setItem('spreadsheetFiles', JSON.stringify(updatedFiles));
    }
    
    setShowSaveModal(false);
    setFileName('');
    alert('Spreadsheet saved successfully!');
  };

  const loadSpreadsheet = (name: string) => {
    const savedData = localStorage.getItem(`spreadsheet_${name}`);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setData(parsedData.data);
      setShowLoadModal(false);
      alert(`Spreadsheet "${name}" loaded successfully!`);
    }
  };

  const exportToCSV = () => {
    if (!selectedRange) {
      alert('Please select a range to export');
      return;
    }
    
    const { startRow, startCol, endRow, endCol } = selectedRange;
    const minRow = Math.min(startRow, endRow);
    const maxRow = Math.max(startRow, endRow);
    const minCol = Math.min(startCol, endCol);
    const maxCol = Math.max(startCol, endCol);
    
    let csvContent = '';
    
    for (let row = minRow; row <= maxRow; row++) {
      const rowValues = [];
      for (let col = minCol; col <= maxCol; col++) {
        const cellId = `${String.fromCharCode(65 + col)}${row + 1}`;
        const cellValue = data[cellId]?.value || '';
        // Escape quotes and wrap in quotes if contains comma
        const formattedValue = typeof cellValue === 'string' && (cellValue.includes(',') || cellValue.includes('"')) 
          ? `"${cellValue.replace(/"/g, '""')}"` 
          : cellValue;
        rowValues.push(formattedValue);
      }
      csvContent += rowValues.join(',') + '\n';
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'spreadsheet.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importFromCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const rows = content.split('\n');
      
      if (!activeCell) {
        alert('Please select a cell where to start importing');
        return;
      }
      
      const { row: startRow, col: startCol } = activeCell;
      const newData = { ...data };
      
      rows.forEach((rowStr, rowIndex) => {
        if (!rowStr.trim()) return; // Skip empty rows
        
        // Handle CSV parsing with quotes and commas
        const rowValues: string[] = [];
        let inQuotes = false;
        let currentValue = '';
        
        for (let i = 0; i < rowStr.length; i++) {
          const char = rowStr[i];
          
          if (char === '"') {
            if (inQuotes && rowStr[i + 1] === '"') {
              // Handle escaped quotes
              currentValue += '"';
              i++;
            } else {
              // Toggle quote state
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            // End of field
            rowValues.push(currentValue);
            currentValue = '';
          } else {
            currentValue += char;
          }
        }
        
        // Add the last value
        rowValues.push(currentValue);
        
        rowValues.forEach((value, colIndex) => {
          const cellRow = startRow + rowIndex;
          const cellCol = startCol + colIndex;
          
          if (cellRow < 100 && cellCol < 26) {
            const cellId = `${String.fromCharCode(65 + cellCol)}${cellRow + 1}`;
            newData[cellId] = {
              ...newData[cellId],
              value,
              formula: '',
            };
          }
        });
      });
      
      setData(newData);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    
    reader.readAsText(file);
  };

  return (
    <div className="app">
      <div className="header">
        <div className="logo">
          <Grid size={24} />
          <span>Google Sheets Clone</span>
        </div>
        <div className="header-buttons">
          <button onClick={() => setShowSaveModal(true)} className="header-button">
            <Save size={16} />
            <span>Save</span>
          </button>
          <button onClick={() => setShowLoadModal(true)} className="header-button">
            <Upload size={16} />
            <span>Load</span>
          </button>
          <button onClick={exportToCSV} className="header-button">
            <ChevronDown size={16} />
            <span>Export CSV</span>
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="header-button">
            <ChevronRight size={16} />
            <span>Import CSV</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".csv"
            onChange={importFromCSV}
          />
          <button className="header-button">
            <BarChart size={16} />
            <span>Charts</span>
          </button>
        </div>
      </div>
      
      <Toolbar
        onBoldClick={() => applyFormatting({ bold: true })}
        onItalicClick={() => applyFormatting({ italic: true })}
        onAlignLeftClick={() => applyFormatting({ textAlign: 'left' })}
        onAlignCenterClick={() => applyFormatting({ textAlign: 'center' })}
        onAlignRightClick={() => applyFormatting({ textAlign: 'right' })}
        onAddRow={addRow}
        onDeleteRow={deleteRow}
        onAddColumn={addColumn}
        onDeleteColumn={deleteColumn}
        onRemoveDuplicates={removeDuplicates}
        onFindAndReplace={findAndReplace}
      />
      
      <FormulaBar value={formulaBarValue} onChange={handleFormulaBarChange} />
      
      <Spreadsheet
        data={data}
        activeCell={activeCell}
        selectedRange={selectedRange}
        onCellChange={handleCellChange}
        onCellClick={handleCellClick}
        onCellDoubleClick={handleCellDoubleClick}
        onCellDragStart={handleCellDragStart}
        onCellDragOver={handleCellDragOver}
        onCellDragEnd={handleCellDragEnd}
      />
      
      {showSaveModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Save Spreadsheet</h2>
            <input
              type="text"
              placeholder="File name"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="modal-input"
            />
            <div className="modal-buttons">
              <button onClick={saveSpreadsheet} className="modal-button save">Save</button>
              <button onClick={() => setShowSaveModal(false)} className="modal-button cancel">Cancel</button>
            </div>
          </div>
        </div>
      )}
      
      {showLoadModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Load Spreadsheet</h2>
            {savedFiles.length > 0 ? (
              <ul className="file-list">
                {savedFiles.map((file) => (
                  <li key={file} onClick={() => loadSpreadsheet(file)} className="file-item">
                    <Grid size={16} />
                    <span>{file}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No saved spreadsheets found.</p>
            )}
            <div className="modal-buttons">
              <button onClick={() => setShowLoadModal(false)} className="modal-button cancel">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;