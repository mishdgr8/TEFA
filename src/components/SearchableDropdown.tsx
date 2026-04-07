import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

interface Option {
  label: string;
  value: string;
  icon?: string;
  searchStr?: string;
}

interface SearchableDropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
}

export const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  searchPlaceholder = "Search..."
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => {
    const term = searchTerm.toLowerCase();
    const searchString = opt.searchStr || opt.label;
    return searchString.toLowerCase().includes(term) || opt.value.toLowerCase().includes(term);
  });

  return (
    <div className="searchable-dropdown" ref={wrapperRef}>
      <div
        className={`dropdown-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="trigger-text">
          {selectedOption ? (
            <span className="selected-val">
              {selectedOption.icon && <span className="opt-icon">{selectedOption.icon}</span>}
              {selectedOption.label}
            </span>
          ) : (
            <span className="placeholder">{placeholder}</span>
          )}
        </span>
        <ChevronDown size={16} className="chevron" />
      </div>

      {isOpen && (
        <div className="dropdown-menu">
          <div className="search-box">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>
          <div className="options-list">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, i) => (
                <div
                  key={`${opt.value}-${i}`}
                  className={`option-item ${value === opt.value ? 'selected' : ''}`}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                >
                  {opt.icon && <span className="opt-icon">{opt.icon}</span>}
                  <span className="opt-label">{opt.label}</span>
                </div>
              ))
            ) : (
              <div className="no-options">No matches found</div>
            )}
          </div>
        </div>
      )}
      <style>{`
        .searchable-dropdown {
          position: relative;
          width: 100%;
          font-family: 'Quicksand', sans-serif;
        }
        .dropdown-trigger {
          width: 100%;
          min-height: 54px;
          padding: 10px 14px;
          background: #f9f9f9;
          border: 1px solid #eee;
          border-radius: 12px;
          font-size: 0.95rem;
          color: #1a1a1a;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
          user-select: none;
        }
        .dropdown-trigger:hover, .dropdown-trigger.open {
          background: white;
          border-color: #c69b7b;
        }
        .trigger-text {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin-right: 8px;
        }
        .placeholder {
          color: #999;
        }
        .selected-val {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .opt-icon {
          font-size: 1.25rem;
          flex-shrink: 0;
          display: flex;
          align-items: center;
        }
        .chevron {
          color: #999;
          transition: transform 0.2s;
          flex-shrink: 0;
        }
        .dropdown-trigger.open .chevron {
          transform: rotate(180deg);
        }
        .dropdown-menu {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          width: 100%;
          background: white;
          border: 1px solid #eee;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.12);
          z-index: 1000;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .search-box {
          padding: 10px 14px;
          border-bottom: 1px solid #eee;
          display: flex;
          align-items: center;
          gap: 10px;
          background: white;
        }
        .search-icon {
          color: #999;
          flex-shrink: 0;
        }
        .search-box input {
          border: none;
          background: transparent;
          outline: none;
          width: 100%;
          font-family: inherit;
          font-size: 0.95rem;
          padding: 4px 0;
        }
        .options-list {
          max-height: 280px;
          overflow-y: auto;
          overflow-x: hidden;
        }
        /* Custom Scrollbar */
        .options-list::-webkit-scrollbar {
          width: 6px;
        }
        .options-list::-webkit-scrollbar-track {
          background: #fdfaf7;
        }
        .options-list::-webkit-scrollbar-thumb {
          background: #e0d0c0;
          border-radius: 10px;
        }
        .option-item {
          padding: 12px 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .option-item.selected {
          background: #f4eee8;
          color: #2c1810;
          font-weight: 600;
        }
        .option-item:hover {
          background: #fdfaf7;
        }
        .opt-label {
          font-size: 0.95rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .no-options {
          padding: 20px 14px;
          color: #999;
          text-align: center;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
};
