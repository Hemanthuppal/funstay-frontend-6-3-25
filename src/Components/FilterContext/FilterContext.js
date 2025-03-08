import React, { createContext, useContext, useState, useEffect } from 'react';

const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
  const [filters, setFilters] = useState(() => {
    // Load filters from localStorage when the app starts
    const storedFilters = localStorage.getItem('filters');
    return storedFilters ? JSON.parse(storedFilters) : {};
  });

  useEffect(() => {
    // Save filters to localStorage whenever they change
    localStorage.setItem('filters', JSON.stringify(filters));
  }, [filters]);

  const setFilter = (tableId, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [tableId]: value, // Store search input per table
    }));
  };

  return (
    <FilterContext.Provider value={{ filters, setFilter }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = () => useContext(FilterContext);
