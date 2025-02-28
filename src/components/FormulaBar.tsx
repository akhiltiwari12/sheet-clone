import React from 'react';

interface FormulaBarProps {
  value: string;
  onChange: (value: string) => void;
}

const FormulaBar: React.FC<FormulaBarProps> = ({ value, onChange }) => {
  return (
    <div className="formula-bar">
      <span className="formula-label">fx</span>
      <input
        type="text"
        className="formula-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter a formula or value"
      />
    </div>
  );
};

export default FormulaBar;