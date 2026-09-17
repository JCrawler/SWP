import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  count: number;
  totalCount: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  count,
  totalCount,
}) => {
  return (
    <div className="w-full max-w-xl mx-auto mb-8">
      <div className="relative flex items-center">
        <div className="absolute left-4 pointer-events-none text-[#6b6580]">
          <Search className="w-5 h-5" />
        </div>
        <input
          id="search-nicknames-input"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search student nicknames..."
          className="w-full pl-11 pr-24 py-3.5 bg-white border border-[#e3e0f5] rounded-2xl text-[#1e1b2e] placeholder-[#6b6580] focus:outline-none focus:ring-2 focus:ring-[#3e29bd] focus:border-transparent transition-all shadow-sm text-sm"
        />
        <div className="absolute right-3 flex items-center gap-2">
          {value && (
            <button
              id="clear-search-btn"
              type="button"
              onClick={() => onChange('')}
              className="p-1 rounded-full text-[#6b6580] hover:bg-[#eeeafd] hover:text-[#3e29bd] transition-colors"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-xs px-2 py-1 rounded-md bg-[#eeeafd] text-[#3e29bd] font-medium select-none">
            {count} {count === 1 ? 'student' : 'students'}
          </span>
        </div>
      </div>
      {value && count !== totalCount && (
        <p className="text-xs text-[#6b6580] mt-2 text-center">
          Showing {count} of {totalCount} registered students
        </p>
      )}
    </div>
  );
};
