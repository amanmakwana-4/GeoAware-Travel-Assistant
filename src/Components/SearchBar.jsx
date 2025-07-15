import React, { useState } from 'react';
import { Search, Crosshair } from 'lucide-react';

const SearchBar = ({ onSearch, onLocate }) => {
  const [input, setInput] = useState('');

  const handleSearch = () => {
    if (input.trim()) {
      console.log(`🔍 Searching for: ${input.trim()}`);
      onSearch(input.trim());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleLocate = () => {
    console.log('📍 Getting user location...');
    onLocate();
  };

  return (
    <div className="w-full shadow-sm py-6 px-4 flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Search Input */}
      <div className="flex flex-1 items-center border border-gray-800 dark:border-gray-700 rounded-md overflow-hidden bg-gray-800 dark:bg-gray-800">
        <input
          type="text"
          placeholder="Search for places..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 px-4 py-2 text-sm bg-gray-800 text-white dark:text-white focus:outline-none"
        />
        <button
          onClick={handleSearch}
          className="px-3 py-2 text-sky-600 hover:text-sky-400 dark:text-white bg-gray-800"
          aria-label="Search"
        >
          <Search size={18} />
        </button>
      </div>

      {/* Locate Me Button */}
      <button
        onClick={handleLocate}
        className="flex items-center gap-2 px-4 py-2 rounded-md bg-sky-600 hover:bg-sky-700 text-white transition-colors duration-200"
        aria-label="Use My Location"
      >
        <Crosshair size={18} />
        <span className="text-sm font-medium">Use My Location</span>
      </button>
    </div>
  );
};

export default SearchBar;
