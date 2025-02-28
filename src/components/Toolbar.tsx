import React from 'react';
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight, Plus, Trash2, Search, List } from 'lucide-react';

interface ToolbarProps {
  onBoldClick: () => void;
  onItalicClick: () => void;
  onAlignLeftClick: () => void;
  onAlignCenterClick: () => void;
  onAlignRightClick: () => void;
  onAddRow: () => void;
  onDeleteRow: () => void;
  onAddColumn: () => void;
  onDeleteColumn: () => void;
  onRemoveDuplicates: () => void;
  onFindAndReplace: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onBoldClick,
  onItalicClick,
  onAlignLeftClick,
  onAlignCenterClick,
  onAlignRightClick,
  onAddRow,
  onDeleteRow,
  onAddColumn,
  onDeleteColumn,
  onRemoveDuplicates,
  onFindAndReplace,
}) => {
  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <button className="toolbar-button" onClick={onBoldClick} title="Bold">
          <Bold size={16} />
        </button>
        <button className="toolbar-button" onClick={onItalicClick} title="Italic">
          <Italic size={16} />
        </button>
      </div>
      
      <div className="toolbar-group">
        <button className="toolbar-button" onClick={onAlignLeftClick} title="Align Left">
          <AlignLeft size={16} />
        </button>
        <button className="toolbar-button" onClick={onAlignCenterClick} title="Align Center">
          <AlignCenter size={16} />
        </button>
        <button className="toolbar-button" onClick={onAlignRightClick} title="Align Right">
          <AlignRight size={16} />
        </button>
      </div>
      
      <div className="toolbar-group">
        <button className="toolbar-button" onClick={onAddRow} title="Add Row">
          <Plus size={16} />
          <span style={{ fontSize: '10px', marginLeft: '2px' }}>Row</span>
        </button>
        <button className="toolbar-button" onClick={onDeleteRow} title="Delete Row">
          <Trash2 size={16} />
          <span style={{ fontSize: '10px', marginLeft: '2px' }}>Row</span>
        </button>
      </div>
      
      <div className="toolbar-group">
        <button className="toolbar-button" onClick={onAddColumn} title="Add Column">
          <Plus size={16} />
          <span style={{ fontSize: '10px', marginLeft: '2px' }}>Col</span>
        </button>
        <button className="toolbar-button" onClick={onDeleteColumn} title="Delete Column">
          <Trash2 size={16} />
          <span style={{ fontSize: '10px', marginLeft: '2px' }}>Col</span>
        </button>
      </div>
      
      <div className="toolbar-group">
        <button className="toolbar-button" onClick={onFindAndReplace} title="Find and Replace">
          <Search size={16} />
        </button>
        <button className="toolbar-button" onClick={onRemoveDuplicates} title="Remove Duplicates">
          <List size={16} />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;