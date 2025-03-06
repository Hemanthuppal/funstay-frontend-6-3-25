import React, { useState, useMemo, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "./../../../../Layout/Table/TableLayoutOpp";
import { FaEdit, FaTrash, FaEye, FaUserPlus, FaComment, FaCopy, FaCalendarAlt, FaTimes } from "react-icons/fa";
import { Button, Row, Col } from "react-bootstrap";
import Navbar from "../../../../Shared/Sales-ExecutiveNavbar/Navbar";
import "./ViewLeads.css";
import axios from 'axios';
import { baseURL } from "../../../../Apiservices/Api";
import { io } from 'socket.io-client';
import { AuthContext } from '../../../../AuthContext/AuthContext';
import { webhookUrl } from "../../../../Apiservices/Api";
import { FontSizeContext } from "../../../../Shared/Font/FontContext";

const ViewLeads = () => {
  const { authToken, userId } = useContext(AuthContext);
  const [message, setMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [data, setData] = useState([]);

  // Filtering states
  const [searchTerm, setSearchTerm] = useState(localStorage.getItem("searchTerm-1") || "");
  const [filterStatus, setFilterStatus] = useState(localStorage.getItem("filterStatus-1") || "");
  const [filterDestination, setFilterDestination] = useState(localStorage.getItem("destination-1") || "");
  const [filterOppStatus1, setFilterOppStatus1] = useState(localStorage.getItem("opp1-1") || "");
  const [filterOppStatus2, setFilterOppStatus2] = useState(localStorage.getItem("opp2-1") || "");
  const [showDateRange, setShowDateRange] = useState(false);
  const [filterStartDate, setFilterStartDate] = useState(localStorage.getItem("startdate-1") || "");
  const [filterEndDate, setFilterEndDate] = useState(localStorage.getItem("enddate-1") || "");
  const [appliedFilterStartDate, setAppliedFilterStartDate] = useState(localStorage.getItem("appliedstart-1") || "");
  const [appliedFilterEndDate, setAppliedFilterEndDate] = useState(localStorage.getItem("appliesend-1") || "");




  const generateWhatsAppLink = (phoneNumber) => {
    return `https://wa.me/${phoneNumber}`;
  };

  const handleEdit = (leadId) => {
    navigate(`/edit-lead/${leadId}`, {
      state: { leadid: leadId },
    });
  };

  const handleAddUser = (lead) => {
    navigate(`/create-customer-opportunity/${lead.leadid}`);
  };

  const handleAddLead = () => {
    navigate('/add-lead');
  };

  const handleViewLeads = (lead) => {
    navigate(`/view-lead/${lead.leadid}`, {
      state: { leadid: lead.leadid },
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setMessage("Copied to clipboard!");
      setTimeout(() => setMessage(""), 1000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
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
    console.log(JSON.stringify(body, null, 2));
    try {
      const response = await axios.put(`${baseURL}/api/leads/status/${leadId}`, body);
      if (response.status === 200) {
        setMessage(response.data.message);
        setTimeout(() => setMessage(""), 3000);
        console.log('Status updated:', response.data);
      } else {
        console.error('Failed to update status:', response.data);
        setMessage('Failed to update status. Please try again.');
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setMessage(' An error occurred while updating the status. Please try again.');
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const initializeSocket = () => {
    const socket = io(`${webhookUrl}`, {
      transports: ['websocket'],
    });
    socket.on('connect', () => {
      console.log('Connected to WebSocket');
      setIsConnected(true);
    });
    socket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setIsConnected(false);
    });
    socket.on('newEnquiry', (newEnquiry) => {
      console.log('Received new enquiry:', newEnquiry);
      setData((prevEnquiries) => [...prevEnquiries, newEnquiry]);
    });
    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
      setIsConnected(false);
    });

    return socket;
  };

  useEffect(() => {
    const socket = initializeSocket();
    return () => {
      console.log('Component unmounted. Disconnecting WebSocket...');
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchEnquiries = async () => {
      // console.log("userid=",userId) 
      if (!userId) {
        // console.log("not exist userid=",userId) 
        return;
      }

      try {
        const response = await fetch(`${webhookUrl}/api/enquiries`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        const data = await response.json();
        const filteredData = data.filter(
          (enquiry) => enquiry.assignedSalesId == userId && enquiry.status == 'lead'
        );
        console.log("filterd data=", filteredData.length);
        setData(filteredData);
      } catch (error) {
        console.error('Error fetching enquiries:', error);
      }
    };

    fetchEnquiries();
  }, [userId, authToken]);

  useEffect(() => {
    localStorage.setItem("searchTerm-1", searchTerm);
    localStorage.setItem("filterStatus-1", filterStatus);
    localStorage.setItem("destination-1", filterDestination);
    localStorage.setItem("opp1-1", filterOppStatus1);
    localStorage.setItem("opp2-1", filterOppStatus2);
   
 
    localStorage.setItem("startdate-1", filterStartDate);
    localStorage.setItem("enddate-1", filterEndDate);
    localStorage.setItem("appliedstart-1", appliedFilterStartDate);
    localStorage.setItem("appliesend-1", appliedFilterEndDate);
  }, [
    searchTerm, filterStatus, filterDestination, filterOppStatus1, filterOppStatus2,
   filterStartDate, filterEndDate,
    appliedFilterStartDate, appliedFilterEndDate
  ]);

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("");
    setFilterDestination("");
    setFilterOppStatus1("");
    setFilterOppStatus2("");
    
   
    setFilterStartDate("");
    setFilterEndDate("");
    setAppliedFilterStartDate("");
    setAppliedFilterEndDate("");
    localStorage.removeItem("potentialLeadsFilters");
  };


  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearchTerm =
        !searchTerm ||
        Object.values(item).some(
          (val) =>
            val &&
            val.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesPrimaryStatus =
        !filterOppStatus1 || (item.primaryStatus && item.primaryStatus.toLowerCase() === filterOppStatus1.toLowerCase());
      const matchesSecondaryStatus =
        !filterOppStatus2 || (item.secondaryStatus && item.secondaryStatus.toLowerCase() === filterOppStatus2.toLowerCase());
      const matchesDestination = !filterDestination || (item.destination && item.destination.toLowerCase() == filterDestination.toLowerCase());
      const matchesDateRange = (() => {
        if (appliedFilterStartDate && appliedFilterEndDate) {
          const start = new Date(appliedFilterStartDate);
          const end = new Date(appliedFilterEndDate);
          const createdAt = new Date(item.created_at);
          return createdAt >= start && createdAt <= end;
        }
        return true;
      })();

      return matchesSearchTerm && matchesPrimaryStatus && matchesDestination && matchesSecondaryStatus && matchesDateRange;
    });
  }, [searchTerm, filterOppStatus1, filterOppStatus2, filterDestination, appliedFilterStartDate, appliedFilterEndDate, data]);

  const uniqueDestinations = useMemo(() => {
    // Filter out empty destinations and normalize valid ones
    const normalizedDestinations = data
      .map(item => item.destination?.trim()) // Trim spaces and handle potential undefined/null values
      .filter(dest => dest) // Remove empty values
      .map(dest => dest.toLowerCase()); // Convert to lowercase for uniqueness

    // Get unique values and format them
    return [...new Set(normalizedDestinations)]
      .map(dest => dest.charAt(0).toUpperCase() + dest.slice(1)); // Capitalize first letter
  }, [data]);

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
              onClick={() => handleViewLeads(row.original)}
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
              justifyContent: "space-between",
              width: "100%",
              maxWidth: "200px",
            }}
          >
            <div
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "150px",
              }}
              title={row.original.email}
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
          const { fontSize } = useContext(FontSizeContext);
          const primaryStatus = row.original.primaryStatus;
          const secondaryStatus = row.original.secondaryStatus;
          const secondaryOptions = dropdownOptions.secondary[primaryStatus] || [];
          const isSecondaryDisabled = !primaryStatus || secondaryOptions.length === 0;

          return (
            <div className="d-flex align-items-center" style={{ fontSize: fontSize }}>
              <select
                value={primaryStatus}
                onChange={(e) =>
                  handlePrimaryStatusChange(e.target.value, row.original.leadid)
                }
                className="form-select me-2"style={{ fontSize: fontSize }}
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
                disabled={isSecondaryDisabled}style={{ fontSize: fontSize }}
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
        Header: "Source",
        accessor: "sources",
      },
      {
        Header: "Customer Status",
        accessor: "customer_status",
      },
      {
        Header: "Actions",
        Cell: ({ row }) => (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FaEdit
              style={{ color: "#ff9966", cursor: "pointer" }}
              onClick={() => handleEdit(row.original.leadid)}
            />
            <FaEye
              style={{ color: "#ff9966", cursor: "pointer" }}
              onClick={() => handleViewLeads(row.original)}
            />
            <FaUserPlus
              style={{ color: "#ff9966", cursor: "pointer" }}
              onClick={() => handleAddUser(row.original)}
            />
            <FaComment
              style={{ color: "#ff9966", cursor: "pointer" }}
              onClick={() => navigate(`/comments/${row.original.leadid}`, { state: { leadid: row.original.leadid } })}
            />
          </div>
        ),
      }
    ],
    [data]
  );

  return (
    <div className="salesViewLeadsContainer">
      <Navbar onToggleSidebar={setCollapsed} />
      <div className={`salesViewLeads ${collapsed ? "collapsed" : ""}`}>
        <div className="ViewLead-container mb-5">
          <div className="ViewLead-table-container">
            <Row className="mb-3">
              <Col className="d-flex justify-content-between align-items-center">
                <h3>Lead Details</h3>
                {message && <div className="alert alert-info">{message}</div>}
                <Button onClick={handleAddLead}>Add Leads</Button>
              </Col>
            </Row>
            <Row className="mb-3 align-items-center">
              <Col md={6} className="d-flex align-items-center gap-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Free Text Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {showDateRange ? (
                  <FaTimes
                    onClick={() => {
                      setShowDateRange(false);
                      setFilterStartDate("");
                      setFilterEndDate("");
                      setAppliedFilterStartDate("");
                      setAppliedFilterEndDate("");
                    }}
                    style={{ cursor: "pointer", fontSize: "1.5rem" }}
                    title="Hide Date Range"
                  />
                ) : (
                  <FaCalendarAlt
                    onClick={() => setShowDateRange(true)}
                    style={{ cursor: "pointer", fontSize: "1.5rem" }}
                    title="Show Date Range"
                  />
                )}
                {showDateRange && (
                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="date"
                      className="form-control"
                      value={filterStartDate}
                      onChange={(e) => setFilterStartDate(e.target.value)}
                    />
                    <span>to</span>
                    <input
                      type="date"
                      className="form-control"
                      value={filterEndDate}
                      onChange={(e) => setFilterEndDate(e.target.value)}
                    />
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setAppliedFilterStartDate(filterStartDate);
                        setAppliedFilterEndDate(filterEndDate);
                      }}
                    >
                      OK
                    </button>
                  </div>
                )}
              </Col>
              <Col md={6} className="d-flex justify-content-end">
              <button className="btn btn-secondary" onClick={clearFilters}>Clear Filters</button></Col>
            </Row>
            <Row className="mb-3">
              <Col md={3}>
                <select className="form-select" value={filterDestination} onChange={(e) => setFilterDestination(e.target.value)}>
                  <option value="">Destinations</option>
                  {uniqueDestinations.map((dest) => (
                    <option key={dest} value={dest}>{dest}</option>
                  ))}
                </select>
              </Col>
              <Col md={3}>
                <select
                  className="form-select"
                  value={filterOppStatus1}
                  onChange={(e) => {
                    setFilterOppStatus1(e.target.value);
                    setFilterOppStatus2(""); // Reset secondary filter when primary changes
                  }}
                >
                  <option value="">Primary Status</option>
                  {dropdownOptions.primary.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </Col>
              <Col md={3}>
                <select
                  className="form-select"
                  value={filterOppStatus2}
                  onChange={(e) => setFilterOppStatus2(e.target.value)}
                >
                  <option value="">Secondary Status</option>
                  {dropdownOptions.secondary[filterOppStatus1]?.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </Col>
            </Row>
            <DataTable columns={columns} data={filteredData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewLeads;