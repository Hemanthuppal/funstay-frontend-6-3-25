import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from './../../../../Layout/Table/TableLayout';
import { FaEdit, FaTrash, FaEye, FaComment, FaUserPlus, FaCopy } from 'react-icons/fa';
import { Button, Row, Col, Modal } from 'react-bootstrap';
import Navbar from '../../../../Shared/Navbar/Navbar';
import { baseURL, webhookUrl } from '../../../../Apiservices/Api';
import axios from 'axios';

import { HiUserGroup } from "react-icons/hi"; // Import icon

import './ViewLeads.css'

const AdminViewLeads = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [message, setMessage] = useState(null);


  const [data, setData] = useState([]);

  const handleEdit = (leadId) => {
    navigate(`/a-edit-lead/${leadId}`, {
      state: { leadid: leadId },
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setMessage("Copied to clipboard!");
      setTimeout(() => setMessage(""), 1000);  // Optional: Show a message
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });


  };

  const handleAddUser = (lead) => {
    navigate(`/a-create-customer-opportunity/${lead.leadid}`);
  };



  const handleViewLeads = (lead) => {
    navigate(`/a-view-lead/${lead.leadid}`, {
      state: { leadid: lead.leadid },
    });
  };

  const handleDelete = async (leadid) => {
    try {
      const response = await fetch(`${baseURL}/api/deleteByLeadId/${leadid}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setData((prevData) => prevData.filter((item) => item.leadid !== leadid));
        setMessage('The lead has been deleted successfully.');
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage('Failed to delete the lead. Please try again later.');
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage('An unexpected error occurred while deleting the lead.');
      setTimeout(() => setMessage(""), 3000);
    }
  };




  const dropdownOptions = {
    primary: ["New", "No Response", "Duplicate", "False Lead", "Junk", "Plan Cancelled"],
    secondary: {
      New: ["Yet to Contact", "Not picking up call", "Asked to call later"],
      "No Response": [],
      Duplicate: [],
      "False Lead": [],
      Junk: ["Plan Cancelled", "Plan Delayed", "Already Booked", "Others"],
      "Plan Cancelled": [],
    },
  };

  const handlePrimaryStatusChange = (value, rowId) => {
    setData((prevData) =>
      prevData.map((row) =>
        row.leadid === rowId
          ? {
            ...row,
            primaryStatus: value,
            secondaryStatus: "",
          }
          : row
      )
    );
    updateLeadStatus(rowId, value, "");
  };

  const handleSecondaryStatusChange = (value, rowId) => {
    setData((prevData) =>
      prevData.map((row) =>
        row.leadid === rowId ? { ...row, secondaryStatus: value } : row
      )
    );
    const lead = data.find((lead) => lead.leadid === rowId);
    updateLeadStatus(rowId, lead?.primaryStatus || "", value);
  };
  const updateLeadStatus = async (leadId, primaryStatus, secondaryStatus) => {
    const body = {
      primaryStatus: primaryStatus,
      secondaryStatus: secondaryStatus,
    };
    console.log('JSON:', JSON.stringify(body, null, 2));
    try {
      const response = await axios.put(`${baseURL}/api/leads/status/${leadId}`, body);

      if (response.status === 200) {

        setMessage(response.data.message || 'Status updated successfully.');
        setTimeout(() => setMessage(""), 3000);
        console.log('Status updated:', response.data);
      } else {
        console.error('Failed to update status:', response.data);

        setMessage('Failed to update status. Please try again.');
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error('Error updating status:', error);

      setMessage('An error occurred while updating the status. Please try again.');
      setTimeout(() => setMessage(""), 3000);
    }
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

  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const handleAddLead = () => {
    navigate('/a-add-leads');
  };

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const response = await fetch(`${baseURL}/managers`);
        if (!response.ok) {
          throw new Error("Failed to fetch managers");
        }
        const result = await response.json();
        console.log("Fetched data:", result.data);
        console.log(JSON.stringify(result.data, null, 2));
        setManagers(result.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching managers:", err.message);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchManagers();
  }, []);

  const handleAssignToChange = async (assignee, leadid, managerid) => {
    try {
      const response = await fetch(`${baseURL}/update-assignee`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadid,
          assignee,
          managerid,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        setTimeout(() => setMessage(""), 3000);

        setData((prevData) =>
          prevData.map((lead) =>
            lead.leadid === leadid
              ? { ...lead, assign_to_manager: assignee }
              : lead
          )
        );
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      console.error('Error updating assignee:', error);
    }
  };









  const columns = useMemo(
    () => [

      {
        Header: "Lead Id",
        accessor: "leadid",

      },
      {
        Header: "Name",
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
        Header: "Lead Status",
        Cell: ({ row }) => {
          const primaryStatus = row.original.primaryStatus;
          const secondaryStatus = row.original.secondaryStatus;
          const secondaryOptions = dropdownOptions.secondary[primaryStatus] || [];
          const isSecondaryDisabled = !primaryStatus || secondaryOptions.length === 0;

          return (
            <div className="d-flex align-items-center"
            >
              <select
                value={primaryStatus}
                onChange={(e) =>
                  handlePrimaryStatusChange(e.target.value, row.original.leadid)
                }
                className="form-select me-2"
              >
                {!primaryStatus && <option value="">Select Primary Status</option>}
                {dropdownOptions.primary.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <select
                value={secondaryStatus}
                onChange={(e) =>
                  handleSecondaryStatusChange(e.target.value, row.original.leadid)
                }
                className="form-select"
                disabled={isSecondaryDisabled}
              >
                {!secondaryStatus && <option value="">Select Secondary Status</option>}
                {secondaryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          );
        },
      },

      {
        Header: 'Source',
        accessor: 'sources',
      },
      {
        Header: "Customer Status",
        accessor: "customer_status",


      },



      {
        Header: "Manager ",
        Cell: ({ row }) => {
          const assignedManagerId = row.original.managerid || "";
          const assignedManagerName = row.original.assign_to_manager || "";

          const [selectedManager, setSelectedManager] = useState(
            assignedManagerId ? `${assignedManagerId}|${assignedManagerName}` : ""
          );
          const [showIcon, setShowIcon] = useState(false);

          useEffect(() => {
            setSelectedManager(
              assignedManagerId ? `${assignedManagerId}|${assignedManagerName}` : ""
            );
            setShowIcon(false);
          }, [assignedManagerId, assignedManagerName]);

          const handleChange = (e) => {
            const newValue = e.target.value;
            setSelectedManager(newValue);
            setShowIcon(newValue !== `${assignedManagerId}|${assignedManagerName}`);
          };

          const handleAssignClick = async () => {
            if (selectedManager) {
              const [managerid, assignee] = selectedManager.split("|");

              await handleAssignToChange(assignee, row.original.leadid, managerid);

              // ✅ Update row data manually to trigger re-render
              row.original.managerid = managerid;
              row.original.assign_to_manager = assignee;

              // ✅ Update state to reflect change instantly
              setSelectedManager(`${managerid}|${assignee}`);
              setShowIcon(false);
            }
          };

          return (
            <div className="d-flex align-items-center">
              <select
                value={selectedManager}
                onChange={handleChange}
                className="form-select me-2"
                style={{ maxWidth: "150px" }}
              >
                <option value="">Select Assignee</option>
                {managers.map((manager, index) => (
                  <option key={index} value={`${manager.id}|${manager.name}`}>
                    {manager.name}
                  </option>
                ))}
              </select>
              {showIcon && (
                <HiUserGroup
                  style={{ color: "#ff9966", cursor: "pointer", fontSize: "18px" }}
                  onClick={handleAssignClick}
                />
              )}
            </div>
          );
        },
      },




      ,
      {
        Header: "Associate ",
        accessor: "assignedSalesName",


      },

      {
        Header: "Actions",
        Cell: ({ row }) => (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FaEdit
              style={{ color: "#ff9966", cursor: "pointer" }}
              onClick={() => handleEdit(row.original.leadid)}
            />
            <FaTrash
              style={{ color: "ff9966", cursor: "pointer" }}
              onClick={() => handleDelete(row.original.leadid)}
            />
            <FaEye
              style={{ color: "ff9966", cursor: "pointer" }}
              onClick={() => handleViewLeads(row.original)}
            />
            <FaUserPlus
              style={{ color: "ff9966", cursor: "pointer" }}
              onClick={() => handleAddUser(row.original)}
            />
          </div>
        ),
      }

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
                <Button onClick={handleAddLead}>Add Leads</Button>
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
