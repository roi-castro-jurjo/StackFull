import React, { useState, useCallback } from 'react';
import { debounce } from 'lodash';
import { useImages } from '../../hooks'; 

const SearchBar = ({ setResults }) => {
    const [query, setQuery] = useState('');
  
    const debouncedSearch = useCallback(
      debounce((q) => {
        setResults(q);
      }, 500),
      []
    );
  
    const handleInputChange = (event) => {
      const value = event.target.value;
      setQuery(value);
      debouncedSearch(value);
    };
  
    return (
      <div className="flex items-center justify-center">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search..."
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    );
  };
  
  export default SearchBar;