import React, { useEffect, useState } from 'react';
import { useTable, usePagination, useGlobalFilter, useSortBy } from 'react-table';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaCalendarAlt, FaTimes } from "react-icons/fa";
import './TableLayout.css';

// Global Search Filter Component
function GlobalFilter({ globalFilter, setGlobalFilter, handleDateFilter }) {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showDateFilters, setShowDateFilters] = useState(false);

  const applyDateFilter = () => {
    handleDateFilter(fromDate, toDate);
  };

  const clearDateFilter = () => {
    setFromDate('');
    setToDate('');
    handleDateFilter('', '');
    setShowDateFilters(false);
  };

  return (
    <div className="dataTable_search mb-3 d-flex align-items-center gap-2">
      <input
        value={globalFilter || ''}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className="form-control search-input"
        placeholder="Search..."
      />
      {showDateFilters || fromDate || toDate ? (
        <button className="btn btn-light clear-btn" onClick={clearDateFilter}>
          <FaTimes color="#ff5e62" size={20} />
        </button>
      ) : (
        <button className="btn btn-light calendar-btn" onClick={() => setShowDateFilters(!showDateFilters)}>
          <FaCalendarAlt color="#ff5e62" size={20} />
        </button>
      )}
      {showDateFilters && (
        <div className="date-filters d-flex gap-2 align-items-center">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              if (toDate && e.target.value > toDate) {
                setToDate('');
              }
            }}
            className="form-control date-input"
          />
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="form-control date-input"
            min={fromDate}
          />
          <button onClick={applyDateFilter} className="btn btn-primary apply-btn">
            OK
          </button>
        </div>
      )}
    </div>
  );
}

// Reusable DataTable Component
export default function DataTable({ columns, data }) {
  const [filteredData, setFilteredData] = useState(data);
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    applyGlobalSearch(searchInput);
  }, [searchInput, data]);

  // Filter Data Based on Global Search
  const applyGlobalSearch = (searchValue) => {
    if (!searchValue) {
      setFilteredData(data);
      return;
    }

    const filtered = data.filter((item) => {
      return Object.values(item)
        .join(' ')
        .toLowerCase()
        .includes(searchValue.toLowerCase());
    });

    setFilteredData(filtered);
  };

  // Date Filter Logic
  const handleDateFilter = (fromDate, toDate) => {
    if (fromDate || toDate) {
      const filtered = data.filter((item) => {
        const itemDate = new Date(item.updated_at).setHours(0, 0, 0, 0);
        const from = fromDate ? new Date(fromDate).setHours(0, 0, 0, 0) : null;
        const to = toDate ? new Date(toDate).setHours(0, 0, 0, 0) : null;

        return (!from || itemDate >= from) && (!to || itemDate <= to);
      });
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  };

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageOptions,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data: filteredData,
      initialState: { pageIndex: 0, pageSize: 20 },
    },
    useSortBy,
    usePagination
  );

  return (
    <div className="dataTable_wrapper container-fluid">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <select
            className="form-select form-select-sm filter-div"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            {[20, 50, 100].map((size) => (
              <option key={size} value={size}>
                Show {size}
              </option>
            ))}
          </select>
          <span className="fw-bold">Total Records: {filteredData.length}</span>
        </div>
        <GlobalFilter globalFilter={searchInput} setGlobalFilter={setSearchInput} handleDateFilter={handleDateFilter} />
      </div>

      <div className="table-responsive">
        <table {...getTableProps()} className="table table-striped">
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()} className="dataTable_headerRow">
                {headerGroup.headers.map((column) => (
                  <th {...column.getHeaderProps(column.getSortByToggleProps())} className="dataTable_headerCell"
                  style={{
                    backgroundColor: '#f7941e', // Updated background color
                    color: 'white',
                    border: '2px solid',
                    borderImage: 'linear-gradient(to right, #ff9966, #ff5e62) 1',
                    textAlign: 'center',
                  }}>
                    {column.render('Header')}
                    <span>{column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}</span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()} className="dataTable_body">
            {page.map((row) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} className="dataTable_row">
                  {row.cells.map((cell) => (
                    <td {...cell.getCellProps()} className="dataTable_cell"
                    style={{
                      borderTop: '2px solid #ff9966',
                      borderBottom: '2px solid #ff9966',
                      borderLeft: '2px solid #ff9966',
                      borderRight: '2px solid #ff9966',
                      borderImage: 'linear-gradient(to right, #ff9966, #ff5e62) 1',
                    }}>
                      {cell.render('Cell')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="d-flex align-items-center justify-content-between mt-3">
        <div className="dataTable_pageInfo">
          Page <strong>{pageIndex + 1} of {pageOptions.length}</strong>
        </div>
        <div className="pagebuttons">
          <button className="btn btn-primary me-2 btn1" onClick={() => previousPage()} disabled={!canPreviousPage}>
            Prev
          </button>
          <button className="btn btn-primary btn1" onClick={() => nextPage()} disabled={!canNextPage}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
