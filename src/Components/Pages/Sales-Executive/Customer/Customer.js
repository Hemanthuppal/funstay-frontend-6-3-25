import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import DataTable from "./../../../Layout/Table/TableLayout"; // Ensure this path is correct
import Navbar from "../../../Shared/Sales-ExecutiveNavbar/Navbar";
import "./Customer.css";
import { FaEye, FaEdit, FaTrash, FaCopy } from "react-icons/fa";
import { baseURL } from "../../../Apiservices/Api";
import { AuthContext } from '../../../AuthContext/AuthContext';
import { useNavigate } from 'react-router-dom';

const SalesCustomer = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [data, setData] = useState([]); // State for storing matched customer data
  const { authToken, userId } = useContext(AuthContext);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    const fetchCustomersAndLeads = async () => {
      try {
        // Fetch all leads
        const leadsResponse = await axios.get(`${baseURL}/api/allleads`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (leadsResponse.status === 200) {
          const leadsData = leadsResponse.data;

          // Filter leads matching criteria
          const filteredLeads = leadsData.filter(
            (lead) => lead.assignedSalesId == userId && lead.status === "opportunity"
          );

          // Fetch all customers
          const customersResponse = await axios.get(`${baseURL}/api/customers`, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          });

          if (customersResponse.status === 200) {
            const customersData = customersResponse.data;

            // Find matching customers based on customerid in filtered leads
            const matchedCustomers = customersData
              .filter(customer =>
                filteredLeads.some(lead => lead.customerid == customer.id)
              )
              .map(customer => ({
                ...customer,
                formattedId: `CUS${String(customer.id).padStart(4, '0')}` // Format the ID here
              }));

            setData(matchedCustomers); // Update state with matched customer data
          } else {
            console.error("Error fetching customers:", customersResponse.statusText);
          }
        } else {
          console.error("Error fetching leads:", leadsResponse.statusText);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setMessage("Failed to fetch data.");
      }
    };

    fetchCustomersAndLeads();
  }, [authToken, userId]);


  // const navigateToLead = (leadId) => {
  //   navigate(`/sales-details/${leadId}`, {
  //     state: { leadid: leadId },
  //   });
  // };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setMessage("Copied to clipboard!"); // Optional: Show a message
      setTimeout(() => setMessage(""), 1000); // Clear message after 3 seconds
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  const navigateToLead = (id) => {
    navigate(`/customerdetails/${id}`, {
      state: { id: id },
    });
  };
  const navigateToEditLead = (id) => {
    navigate(`/editcustomerdetails/${id}`, {
      state: { id: id },
    });
  };


  // Columns for DataTable component
  const columns = React.useMemo(
    () => [
      {
        Header: "S.No",
        accessor: (row, index) => index + 1,  // This will generate the serial number based on the row index
      },
      {
        Header: "Customer ID",
        accessor: "id", // This is the key in your customer data

      },
      {
        Header: "Name",
        accessor: "name", // Ensure this matches the key in your customer data
        Cell: ({ row }) => (
          <div
            style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}
            onClick={() => navigateToLead(row.original.id)} // Navigate on click
          >
            {row.original.name}
          </div>
        ),
      },
      {
        Header: "Mobile",
        accessor: "phone_number",
        Cell: ({ row }) => (
          <div style={{ display: "flex", alignItems: "center" }}>
            <a
              href={`https://wa.me/${row.original.phone_number}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none", color: "blue", cursor: "pointer" }}
              title="Chat on WhatsApp"
            >
              {row.original.phone_number}
            </a>
            <FaCopy
              style={{ marginLeft: "8px", cursor: "pointer", color: "#ff9966" }}
              onClick={() => copyToClipboard(row.original.phone_number)}
              title="Copy Phone Number"
            />
          </div>
        ),
      },
      {
        Header: "Email",
        accessor: "email",
        Cell: ({ row }) => (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between", // Push copy button to the right
              width: "100%",
              maxWidth: "200px", // Adjust width as needed
            }}
          >
            <div
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "150px",
              }}
              title={row.original.email} // Show full email on hover
            >
              {row.original.email}
            </div>
            <FaCopy
              style={{ cursor: "pointer", color: "#ff9966" }}
              onClick={() => copyToClipboard(row.original.email)}
              title="Copy Email"
            />
          </div>
        ),
      },



      {
        Header: "Actions",
        Cell: ({ row }) => (
          <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
            <FaEye
              style={{ color: "#ff9966", cursor: "pointer" }}
              onClick={() => navigateToLead(row.original.id)}
            />
            <FaEdit
              style={{ color: "#ff9966", cursor: "pointer" }}
              onClick={() => navigateToEditLead(row.original.id)}
            />
          </div>
        ),
      }
    ],
    []
  );

  return (
    <div className="SaleCustomercontainer">
      <Navbar onToggleSidebar={setCollapsed} />
      <div className={`SaleCustomer ${collapsed ? "collapsed" : ""}`}>
        <div className="SaleCustomer-container mb-5">
          <div className="SaleCustomer-table-container">
            <h3 className="d-flex justify-content-between align-items-center">
              Customer Details
            </h3>
            {message && <div className="alert alert-info">{message}</div>}
            <DataTable columns={columns} data={data} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesCustomer;