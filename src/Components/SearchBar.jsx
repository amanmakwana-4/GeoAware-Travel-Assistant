import React, { useState } from 'react';
import { Search, Crosshair } from 'lucide-react';

const SearchBar = ({ onSearch, onLocate }) => {
  const [input, setInput] = useState('');

  const handleSearch = () => {
    if (input.trim()) {
      onSearch(input.trim());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="w-full shadow-sm py-6 px-4 flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Search Input */}
      <div className="flex flex-1 items-center border border-gray-300 dark:border-gray-700 rounded-md overflow-hidden">
        <input
          type="text"
          placeholder="Search for places..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 px-4 py-2 text-sm bg-transparent text-gray-900 dark:text-white focus:outline-none"
        />
        <button
          onClick={handleSearch}
          className="px-3 py-2  text-white dark:text-gray-900"
        >
          <Search size={18} />
        </button>
      </div>

      {/* Locate Me Button */}
      <button
        onClick={onLocate}
        className="flex items-center gap-2 px-4 py-2 rounded-md text-white shadow hover:opacity-90"
      >
        <Crosshair size={18} />
        <span className="text-sm font-medium">Use My Location</span>
      </button>
    </div>
  );
};

export default SearchBar;
