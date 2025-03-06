import React, { useState, useMemo, useEffect,useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import Navbar from '../../../Shared/Navbar/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import { FaEdit, FaEye, FaComment ,FaTrash,FaTimes,FaCalendarAlt} from 'react-icons/fa';
import { Button, Row, Col, Modal } from 'react-bootstrap';
import DataTable from '../../../Layout/Table/TableLayoutOpp'; 

import './PotentialLeads.css';

import axios from 'axios';
import {baseURL} from "../../../Apiservices/Api";

const AdminDashboard = () => {
  const [message, setMessage] = useState('');

  const [collapsed, setCollapsed] = useState(false);

  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isPrimaryChanged, setIsPrimaryChanged] = useState(false);
  const [isSecondaryChanged, setIsSecondaryChanged] = useState(false);
  const [customerIdMap, setCustomerIdMap] = useState({}); 


   const [searchTerm, setSearchTerm] = useState("");
     const [filterStatus, setFilterStatus] = useState("");
     const [filterDestination, setFilterDestination] = useState("");
     const [filterOppStatus1, setFilterOppStatus1] = useState("");
     const [filterOppStatus2, setFilterOppStatus2] = useState("");
     
     // Date filter states for input and applied values
     const [filterStartDate, setFilterStartDate] = useState("");
     const [filterEndDate, setFilterEndDate] = useState("");
     const [appliedFilterStartDate, setAppliedFilterStartDate] = useState("");
     const [appliedFilterEndDate, setAppliedFilterEndDate] = useState("");
     const [showDateRange, setShowDateRange] = useState(false);
  
  const [leadIds, setLeadIds] = useState([]);


  const fetchLeads = async () => {
    try {
      setLoading(true); 
      const response = await axios.get(`${baseURL}/api/fetch-data`);
      if (response.status === 200) {
        const leads = response.data;
        const filteredLeads = leads.filter((lead) => lead.status === 'opportunity');
        setData(filteredLeads);
        console.log('Fetched Leads:', filteredLeads);
      } else {
        console.error('Error fetching leads:', response.statusText);
      
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
     
    } finally {
      setLoading(false); 
    }
  };

    
      useEffect(() => {
        if (data.length > 0) {
          const ids = data.map(lead => lead.leadid);
          setLeadIds(ids);
          console.log("Lead IDs:", ids);
        }
      }, [data]); 

  useEffect(() => {
    fetchLeads();
  }, []);

 
  const [opportunityIdMap, setOpportunityIdMap] = useState({});

 
  
  const fetchCustomerData = async (leadid) => {
    try {
      const response = await axios.get(`${baseURL}/api/customers/by-lead/${leadid}`);
      if (response.status === 200) {
        const customerData = response.data;
        setCustomerIdMap((prev) => ({
          ...prev,
          [leadid]: {
            customerId: customerData.id || "N/A",
          },
        }));
      }
    } catch (error) {
      console.error("Error fetching customer data:", error);
    }
  };


  const fetchOpportunityData = async () => {
    try {
      const response = await axios.get(`${baseURL}/travel-opportunity`);
      if (response.status === 200) {
        const mapping = response.data.reduce((acc, opportunity) => {
          acc[opportunity.leadid] = {
            opportunityId: opportunity.id || "N/A",
          };
          return acc;
        }, {});
        setOpportunityIdMap(mapping);
      }
    } catch (error) {
      console.error("Error fetching travel opportunities:", error);
    }
  };

  useEffect(() => {
    
    const leadIds = data.map(item => item.leadid); 

   
    leadIds.forEach(leadid => {
      fetchCustomerData(leadid);
    });

    fetchOpportunityData();
  }, [data]);




  

  const [dropdownOptions] = useState({
    primary: ["In Progress", "Confirmed", "Lost", "Duplicate"],
    secondary: {
      "In Progress": [
        "Understood Requirement",
        "Sent first quote",
        "Sent amended quote",
        "Negotiation Process",
        "Verbally Confirmed-Awaiting token amount",
      ],
      Confirmed: ["Upcoming Trip", "Ongoing Trip", "Trip Completed"],
      Lost: [
        "Plan Cancelled",
        "Plan Postponed",
        "High Quote",
        "Low Budget",
        "No response",
        "Options not available",
        "just checking price",
        "Booked from other source",
        "Delay in quote",
        "Concern about reliability/trust",
        "Did not like payment terms",
        "Did not like cancellation policy",
        "Booked different option from us",
      ],
      Duplicate: ["Duplicate"],
     
    },
  });

  const handlePrimaryStatusChange = (value, rowId) => {
    setData((prevData) => {
      const updatedData = prevData.map((row) =>
        row.leadid === rowId
          ? {
            ...row,
            opportunity_status1: value,
            opportunity_status2: "",
          }
          : row
      );
   
      handleUpdateStatus(rowId, value, ""); 
      setIsPrimaryChanged(true); 
      return updatedData;
    });
  };

  const handleSecondaryStatusChange = (value, rowId) => {
    setData((prevData) => {
      const updatedData = prevData.map((row) =>
        row.leadid === rowId ? { ...row, opportunity_status2: value } : row
      );
      const primaryStatus = updatedData.find((row) => row.leadid === rowId).opportunity_status1;
      
      handleUpdateStatus(rowId, primaryStatus, value);
      setIsSecondaryChanged(true); 
      return updatedData;
    });
  };


  const handleUpdateStatus = async (leadId, primaryStatus, secondaryStatus) => {
    const body = {
      opportunity_status1: primaryStatus,
      opportunity_status2: secondaryStatus,
    };
  console.log(JSON.stringify(body, null, 2));
    try {
      const response = await axios.put(`${baseURL}/api/update-status/${leadId}`, body);
      
      if (response.status === 200) {
       
        let statusChangeMessage = '';
  
        if (primaryStatus && secondaryStatus) {
          statusChangeMessage = 'Both statuses updated successfully!';
        } else if (primaryStatus) {
          statusChangeMessage = 'Primary status updated successfully!';
        } else if (secondaryStatus) {
          statusChangeMessage = 'Secondary status updated successfully!';
        }
  
        if (primaryStatus && secondaryStatus) {
        
          setMessage(statusChangeMessage)
          setTimeout(() => setMessage(""), 3000);
        }
  
        console.log('Status updated:', response.data);
      } else {
        console.error('Failed to update status:', response.data);
        
        setMessage('Failed to update status. Please try again.')
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    
    
      setMessage('An error occurred while updating the status. Please try again.')
      setTimeout(() => setMessage(""), 3000);
    }
  };
  

  const navigateToLead = (leadId) => {
    navigate(`/a-details/${leadId}`, {
      state: { leadid: leadId },
    });
  };

  const handleEdit = (leadId) => {
    navigate(`/a-edit-opportunity/${leadId}`, {
     
        state: { leadid: leadId },
   
    });
  };

  const formattedData = useMemo(() => {
    return data.map(item => {
      const customerData = customerIdMap[item.leadid] || { customerId: "N/A" };
      const opportunityData = opportunityIdMap[item.leadid] || { opportunityId: "N/A" };
  
      return {
        ...item,
        formattedOppId: opportunityData.opportunityId !== "N/A" ? 
          `OPP${String(opportunityData.opportunityId).padStart(4, '0')}` : "N/A",
        formattedCustomerId: customerData.customerId !== "N/A" ? 
          `CUS${String(customerData.customerId).padStart(4, '0')}` : "N/A"
      };
    });
  }, [data, customerIdMap, opportunityIdMap]); 
    const uniqueDestinations = useMemo(() => {
      const destinations = formattedData
        .map((item) => item.travel_destination)
        .filter((dest) => dest && dest.trim() !== "");
      return Array.from(new Set(destinations));
    }, [formattedData]);
  
  
     const staticOppStatus2Options = useMemo(() => {
        if (filterOppStatus1) {
          return dropdownOptions.secondary[filterOppStatus1] || [];
        }
        const allSecondary = Object.values(dropdownOptions.secondary).flat();
        return Array.from(new Set(allSecondary));
      }, [filterOppStatus1, dropdownOptions]);
  
    // Use appliedFilterStartDate and appliedFilterEndDate for filtering by date.
    const filteredData = useMemo(() => {
      return formattedData.filter((item) => {
        const matchesFreeText =
          !searchTerm ||
          Object.values(item).some(
            (val) =>
              val &&
              val
                .toString()
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
          );
  
        const matchesStatus =
          !filterStatus ||
          (item.status &&
            item.status.toLowerCase() == filterStatus.toLowerCase());
        const matchesDestination =
          !filterDestination ||
          (item.travel_destination &&
            item.travel_destination.toLowerCase() == filterDestination.toLowerCase());
        const matchesOppStatus1 =
          !filterOppStatus1 ||
          (item.opportunity_status1 &&
            item.opportunity_status1.toLowerCase() == filterOppStatus1.toLowerCase());
        const matchesOppStatus2 =
          !filterOppStatus2 ||
          (item.opportunity_status2 &&
            item.opportunity_status2.toLowerCase() == filterOppStatus2.toLowerCase());
        
        const matchesDateRange = (() => {
          if (appliedFilterStartDate && appliedFilterEndDate) {
            const start = new Date(appliedFilterStartDate);
            const end = new Date(appliedFilterEndDate);
            const createdAt = new Date(item.created_at);
            return createdAt >= start && createdAt <= end;
          } else if (appliedFilterStartDate) {
            const start = new Date(appliedFilterStartDate);
            const createdAt = new Date(item.created_at);
            return createdAt >= start;
          } else if (appliedFilterEndDate) {
            const end = new Date(appliedFilterEndDate);
            const createdAt = new Date(item.created_at);
            return createdAt <= end;
          }
          return true;
        })();
  
        return (
          matchesFreeText &&
          matchesStatus &&
          matchesDestination &&
          matchesOppStatus1 &&
          matchesOppStatus2 &&
          matchesDateRange
        );
      });
    }, [
      searchTerm,
      filterStatus,
      filterDestination,
      filterOppStatus1,
      filterOppStatus2,
      appliedFilterStartDate,
      appliedFilterEndDate,
      formattedData,
    ]);
  

   const handleDelete = async (leadid) => {
      try {
        const response = await fetch(`${baseURL}/api/opportunity/${leadid}`, {
          method: 'DELETE',
        });
    
        if (response.ok) {
          setData((prevData) => prevData.filter((item) => item.leadid !== leadid));
          setMessage('Opportunity has been deleted successfully.');
          setTimeout(() => {
            setMessage('');
          }, 1000);
        } else {
          console.error('Error deleting record');
          setMessage('Failed to delete the opportunity. Please try again.');
          setTimeout(() => {
            setMessage('');
          }, 1000);
        }
      } catch (error) {
        console.error('Error:', error);
        setMessage('An error occurred while deleting the opportunity.');
        setTimeout(() => {
          setMessage('');
        }, 1000);
      }
    };


 

  const columns = useMemo(
    () => [
     
      {
        Header: "Opp Id",
        accessor: "leadid", 
      },
      // {
      //   Header: "Customer Id",
      //   accessor: "customerid",
      
      // },
   
      {
        Header: "Name",
        accessor: "name",
        Cell: ({ row }) => (
          <div style={{ cursor: "pointer" }} onClick={() => navigateToLead(row.original.leadid)}>
            <div style={{ color: "blue", textDecoration: "underline" }}>{row.original.name}</div>
         
          </div>
        ),
      },
      {
        Header: "Mobile",
        accessor: "phone_number",
        Cell: ({ row }) => (
          <div >
            {row.original.phone_number}
          </div>
        ),
      },
  
      {
        Header: "Email",
        accessor: "email",
        Cell: ({ row }) => (
          <div
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "200px" 
            }}
            title={row.original.email} 
          >
            {row.original.email}
          </div>
        ),
      },
      
      {
        Header: "Opportunity Status",
        accessor: "opportunityStatus",
        Cell: ({ row }) => {
          const primaryStatus = row.original.opportunity_status1;
          const secondaryStatus = row.original.opportunity_status2;
          const secondaryOptions = dropdownOptions.secondary[primaryStatus] || [];
          const isSecondaryDisabled = !primaryStatus || secondaryOptions.length === 0;
      
          return (
            <div className="d-flex align-items-center gap-2">
              <select
                value={primaryStatus}
                onChange={(e) =>
                  handlePrimaryStatusChange(e.target.value, row.original.leadid)
                }
                className="form-select"
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
      


      { Header: 'Manager', accessor: 'assign_to_manager' },
      {
        Header: "Associate ",
        accessor: "assignedSalesName",
        
       
      },
    

    {
      Header: "Action",
      Cell: ({ row }) => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <FaEdit
            style={{ color: "#ff9966", cursor: "pointer" }}
            onClick={() => handleEdit(row.original.leadid)}
          />
          <FaEye
            style={{ color: "ff9966", cursor: "pointer" }}
            onClick={() => navigateToLead(row.original.leadid)}
          />
          <FaTrash
            style={{ color: "ff9966", cursor: "pointer" }}
            onClick={() => handleDelete(row.original.leadid)}
          />
        </div>
      ),
    },
           {
             Header: 'Comments',
             accessor: 'comments',
             Cell: ({ row }) => (
              <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
              <FaComment
            style={{ color: "ff9966", cursor: "pointer" }}
            onClick={() => {
              navigate(`/a-opportunity-comments/${row.original.leadid}`);
            }}
          />
          </div>
              
             ),
           }
    ],
    [dropdownOptions, navigate, customerIdMap]
  );
  

 
 

  return (
    <div className="Admin-ViewOpportunitycontainer">
      <Navbar onToggleSidebar={setCollapsed} />
      <div className={`Admin-ViewOpportunity ${collapsed ? 'collapsed' : ''}`}>
        <div className="Admin-ViewOpportunity-table-container">
          <Row className="mb-3">
            <Col className="d-flex justify-content-between align-items-center">
              <h3>Opportunity Leads</h3>
              {message && <div className="alert alert-info">{message}</div>}
            </Col>
          </Row>
           <div>
                    {/* Free text search and calendar toggle */}
                    <Row className="mb-3 align-items-center">
            <Col md={6} className="d-flex align-items-center gap-2">
              {/* Free text search input */}
              <input
                type="text"
                className="form-control"
                placeholder="Free Text Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              
              {/* Calendar/X toggle */}
              {showDateRange ? (
                <FaTimes
                  onClick={() => setShowDateRange(false)}
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
          
              {/* Date range inputs */}
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
          </Row>
          
                    {/* Other filters */}
                    <Row className="mb-3">
                      <Col md={3}>
                        <select
                          className="form-select"
                          value={filterDestination}
                          onChange={(e) => setFilterDestination(e.target.value)}
                        >
                          <option value="">All Destinations</option>
                          {uniqueDestinations.map((dest) => (
                            <option key={dest} value={dest}>
                              {dest}
                            </option>
                          ))}
                        </select>
                      </Col>
                      <Col md={3}>
                      <select
                          className="form-select"
                          value={filterOppStatus1}
                          onChange={(e) => {
                            setFilterOppStatus1(e.target.value);
                            // Reset secondary filter when primary changes
                            setFilterOppStatus2("");
                          }}
                        >
                          <option value="">All Opportunity Status1</option>
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
                          <option value="">All Opportunity Status2</option>
                          {staticOppStatus2Options.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </Col>
                    </Row>
                  </div>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <DataTable columns={columns} data={filteredData} />
          )}
        </div>
        
      </div>
    </div>
  );
};

export default AdminDashboard;
