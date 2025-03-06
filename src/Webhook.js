import React, { useEffect } from 'react';
import io from 'socket.io-client';

const EnquiryList = () => {
  useEffect(() => {
    const tableBody = document.getElementById('enquiryTable');

    // Fetch initial data
    fetch('http://175.29.21.7:94/enquiries')
      .then((response) => response.json())
      .then((data) => {
        tableBody.innerHTML = ''; // Clear any existing rows
        data.forEach((enquiry, index) => {
          const row = `
            <tr>
              <td>${index + 1}</td>
              <td>${enquiry.name}</td>
              <td>${enquiry.email}</td>
              <td>${enquiry.phone_number}</td>
              <td>${enquiry.subject} - ${enquiry.message}</td>
            </tr>
          `;
          tableBody.innerHTML += row; // Add the row to the table
        });
      })
      .catch((error) => console.error('Error fetching enquiries:', error));

    // WebSocket connection
    const socket = io('http://175.29.21.7:94');

    socket.on('newEnquiry', (enquiry) => {
      const newRow = `
        <tr>
          <td>1</td> <!-- This will be updated later -->
          <td>${enquiry.name}</td>
          <td>${enquiry.email}</td>
          <td>${enquiry.phone_number}</td>
          <td>${enquiry.subject} - ${enquiry.message}</td>
        </tr>
      `;
      // Insert the new row at the top of the table
      tableBody.insertAdjacentHTML('afterbegin', newRow);
      
      // Update the row numbers
      updateRowNumbers();
    });

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    // Cleanup
    return () => {
      socket.disconnect();
    };
  }, []);

  const updateRowNumbers = () => {
    const tableBody = document.getElementById('enquiryTable');
    const rows = tableBody.getElementsByTagName('tr');
    for (let i = 0; i < rows.length; i++) {
      rows[i].cells[0].innerText = i + 1; // Update the row number
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center">Enquiries</h2>
      <table className="table table-bordered">
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody id="enquiryTable">
          {/* Rows will be dynamically added here */}
        </tbody>
      </table>
    </div>
  );
};

export default EnquiryList;