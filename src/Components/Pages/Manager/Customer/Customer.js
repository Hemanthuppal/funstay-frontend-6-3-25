import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import DataTable from './../../../Layout/Table/TableLayout';
import Navbar from "../../../Shared/ManagerNavbar/Navbar";
import "./Customer.css";
import { FaEye, FaEdit, FaTrash, FaCopy } from "react-icons/fa";
import { baseURL } from "../../../Apiservices/Api";
import { useNavigate } from 'react-router-dom';
import { AuthContext } from "../../../AuthContext/AuthContext";


const SalesCustomer = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const { authToken, userId } = useContext(AuthContext);
  const [message, setMessage] = useState(null);
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setMessage("Copied to clipboard!");
      setTimeout(() => setMessage(""), 1000);  // Optional: Show a message
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };


  useEffect(() => {
    const fetchCustomersAndLeads = async () => {
      try {

        const leadsResponse = await axios.get(`${baseURL}/api/allleads`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (leadsResponse.status === 200) {
          const leadsData = leadsResponse.data;


          const filteredLeads = leadsData.filter(
            (lead) => lead.managerid == userId && lead.status == 'opportunity'
          );


          const customersResponse = await axios.get(`${baseURL}/api/customers`, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          });

          if (customersResponse.status === 200) {
            const customersData = customersResponse.data;


            const matchedCustomers = customersData
              .filter(customer =>
                filteredLeads.some(lead => lead.customerid == customer.id)
              )
              .map(customer => ({
                ...customer,
                formattedId: `CUS${String(customer.id).padStart(4, '0')}`
              }));

            setData(matchedCustomers);
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

  const handleDeleteCustomer = async (customerId) => {


    try {
      const response = await axios.delete(`${baseURL}/api/customers/${customerId}`);
      setMessage(response.data.message);
      setTimeout(() => setMessage(""), 3000);


      setData((prevCustomers) => prevCustomers.filter(customer => customer.id !== customerId));

    } catch (error) {
      console.error("Error deleting customer:", error);
      setMessage("Failed to delete customer. Please try again.");
      setTimeout(() => setMessage(""), 3000);
    }
  };


  const navigateToLead = (id) => {
    navigate(`/m-customerdetails/${id}`, {
      state: { id: id },
    });
  };
  const navigateToEditLead = (id) => {
    navigate(`/m-editcustomerdetails/${id}`, {
      state: { id: id },
    });
  };



  const columns = React.useMemo(
    () => [
      // {
      //   Header: "S.No",
      //   accessor: (row, index) => index + 1,
      // },
      {
        Header: "Customer ID",
        accessor: "id",

      },
      {
        Header: "Name",
        accessor: "name",
        Cell: ({ row }) => (
          <div
            style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}
            onClick={() => navigateToLead(row.original.id)}
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
        Header: "Origin City",
        accessor: "origincity",

      },

      {
        Header: "Actions",
        Cell: ({ row }) => (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FaEye
              style={{ color: "#ff9966", cursor: "pointer" }}
              onClick={() => navigateToLead(row.original.id)}
            />
            <FaTrash
              style={{ color: "#ff9966", cursor: "pointer" }}
              onClick={() => handleDeleteCustomer(row.original.id)}
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
    <div className="ManagerCustomercontainer">
      <Navbar onToggleSidebar={setCollapsed} />
      <div className={`ManagerCustomer ${collapsed ? "collapsed" : ""}`}>
        <div className="ManagerCustomer-container mb-5">
          <div className="ManagerCustomer-table-container">
            <h3 className="d-flex justify-content-between align-items-center">
              Customer Details
            </h3>
            {message && <div className="alert alert-success">{message}</div>}
            <DataTable columns={columns} data={data} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesCustomer;