import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../../Layout/Table/TableLayout';
import { FaEdit, FaTrash, FaEye, FaComment, FaUserPlus, FaCopy } from 'react-icons/fa';
import { Button, Row, Col, Modal } from 'react-bootstrap';
import Navbar from '../../../Shared/ManagerNavbar/Navbar';
import { baseURL, webhookUrl } from '../../../Apiservices/Api';
import axios from 'axios';

import './Alllead.css'

const AdminViewLeads = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [message, setMessage] = useState(null);


  const [data, setData] = useState([]);


  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setMessage("Copied to clipboard!");
      setTimeout(() => setMessage(""), 1000);  // Optional: Show a message
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };



  const handleViewLeads = (lead) => {
    navigate(`/m-viewallleads/${lead.leadid}`, {
      state: { leadid: lead.leadid },
    });
  };






  const dropdownOptions = {
    primary: ["New", "No Response", "Duplicate", "False Lead", "Lost"],
    secondary: {
      New: ["Yet to Contact", "Not picking up call", "Asked to call later"],
      "No Response": [],
      Duplicate: [],
      "False Lead": [],
      Lost: ["Plan Cancelled", "Plan Delayed", "Already Booked", "Others"],
    },
  };




  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        const response = await fetch(`${webhookUrl}/api/enquiries`);
        const data = await response.json();

        const filteredData = data.filter((enquiry) => enquiry.status == 'lead');
        setData(filteredData);
      } catch (error) {
        console.error('Error fetching enquiries:', error);
      }
    };
    fetchEnquiries();
  }, []);

  const [managers, setManagers] = useState([]); // State to store fetched managers
  const [loading, setLoading] = useState(true); // Loading state for API call
  const [error, setError] = useState(null); // Error state for API call


  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const response = await fetch(`${baseURL}/managers`);
        if (!response.ok) {
          throw new Error("Failed to fetch managers");
        }
        const result = await response.json(); // Parse JSON directly from response
        console.log("Fetched data:", result.data); // Log fetched data
        console.log(JSON.stringify(result.data, null, 2)); // Log fetched data in pretty format
        setManagers(result.data); // Update the managers state
        setLoading(false); // Set loading to false after successful fetch
      } catch (err) {
        console.error("Error fetching managers:", err.message); // Log the error
        setError(err.message); // Update error state
        setLoading(false); // Stop loading on error
      }
    };

    fetchManagers();
  }, []);










  const columns = useMemo(
    () => [
      {
        Header: "Lead ID",
        accessor: 'leadid',
      },

      {
        Header: "lead Name",
        accessor: "name",
        Cell: ({ row }) => (
          <div>
            <div
              style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}
              onClick={() => handleViewLeads(row.original)} // Navigate on click
            >
              {row.original.name}
            </div>
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
        Header: 'Source',
        accessor: 'sources',
      },


      {
        Header: "Actions",
        Cell: ({ row }) => (
          <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
            <FaEye
              style={{ color: "#ff9966", cursor: "pointer" }}
              onClick={() => handleViewLeads(row.original)}
            />
          </div>
        ),
      },

    ],
    [dropdownOptions, managers]
  );



  return (
    <div className="admin-ViewLeadcontainer">
      <Navbar onToggleSidebar={setCollapsed} />
      <div className={`admin-ViewLead ${collapsed ? "collapsed" : ""}`}>
        <div className="admin-ViewLead-container mb-5">
          <div className="admin-ViewLead-table-container">
            <Row className="mb-3">
              <Col className="d-flex justify-content-between align-items-center">
                <h3>Lead Details</h3>
                {message && <div className="alert alert-info">{message}</div>}
                {/* <Button onClick={handleAddLead}>Add Leads</Button> */}
              </Col>
            </Row>
            <DataTable columns={columns} data={data} />
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminViewLeads;
