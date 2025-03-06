import React, { useEffect } from 'react';
import { useTable, usePagination, useGlobalFilter, useSortBy } from 'react-table';
import 'bootstrap/dist/css/bootstrap.min.css';

// Global Search Filter Component
function GlobalFilter({ globalFilter, setGlobalFilter }) {
  return (
    <input
      value={globalFilter || ''}
      onChange={(e) => setGlobalFilter(e.target.value)}
      className="form-control"
      placeholder="Search..."
      style={{ maxWidth: '200px' }} // Fixed width for search input
    />
  );
}

// Reusable DataTable Component
export default function DataTable({ columns, data, initialSearchValue }) {
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
    setGlobalFilter,
    state: { pageIndex, pageSize, globalFilter },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 5, globalFilter: initialSearchValue }
 // Set initial global filter
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  // Set the global filter to the initial value when the component mounts
  useEffect(() => {
    if (initialSearchValue) {
      setGlobalFilter(initialSearchValue);
    }
  }, [initialSearchValue, setGlobalFilter]);

  return (
    <div className="dataTable_wrapper container-fluid">
      {/* Page Size Selector and Global Search Filter */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        {/* Page Size Selector */}
        <div>
          <select
            className="form-select form-select-sm"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            style={{ maxWidth: '120px' }} // Optional: Adjust width
          >
            {[5, 10, 20].map((size) => (
              <option key={size} value={size}>
                Show {size}
              </option>
            ))}
          </select>
        </div>

        {/* Global Search Filter */}
        <GlobalFilter globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table {...getTableProps()} className="table table-striped">
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()} className="dataTable_headerRow">
                {headerGroup.headers.map((column) => (
                  <th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    className="dataTable_headerCell"
                    style={{
                      backgroundColor: '#f7941e', // Updated background color
                      color: 'white',
                      border: '2px solid',
                      borderImage: 'linear-gradient(to right, #ff9966, #ff5e62) 1',
                      textAlign: 'center',
                    }}
                  >
                    {column.render('Header')}
                    <span>
                      {column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}
                    </span>
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
                    <td
                      {...cell.getCellProps()}
                      className="dataTable_cell"
                      style={{
                        borderTop: '2px solid #ff9966',
                        borderBottom: '2px solid #ff9966',
                        borderLeft: '2px solid #ff9966',
                        borderRight: '2px solid #ff9966',
                        borderImage: 'linear-gradient(to right, #ff9966, #ff5e62) 1',
                      }}
                    >
                      {cell.render('Cell')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="d-flex align-items-center justify-content-between mt-3">
        <div className="dataTable_pageInfo">
          Page{' '}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>
        </div>
        <div className="pagebuttons">
          <button
            className="btn btn-primary me-2 btn1"
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
          >
            Prev
          </button>
          <button
            className="btn btn-primary btn1"
            onClick={() => nextPage()}
            disabled={!canNextPage}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
