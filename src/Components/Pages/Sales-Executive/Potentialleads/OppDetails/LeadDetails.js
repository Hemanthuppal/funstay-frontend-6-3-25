import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "../../../../Shared/Sales-ExecutiveNavbar/Navbar";
import "./LeadDetails.css";
import axios from "axios";
import { useLocation } from "react-router-dom";
import {baseURL} from "../../../../Apiservices/Api";

const LeadDetails = () => {
    const location = useLocation();
    const { leadid } = location.state;
    console.log("leadId=", leadid);
    const [collapsed, setCollapsed] = useState(false);
    const [leadData, setLeadData] = useState(null); // State to store lead data
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state

    useEffect(() => {
        const fetchLeadData = async () => {
            try {
                const leadoppcomment = `${baseURL}/api/lead-opp-comment/${leadid}`;
                console.log("API URL:", leadoppcomment);
                const response = await axios.get(leadoppcomment);
                console.log("API Response:", response.data);
console.log("API Response:", response);
                setLeadData(response.data); // Update state with fetched data
                setLoading(false);
            } catch (err) {
                console.error("Error fetching lead data:", err);
                setError("Failed to fetch lead data.");
                setLoading(false);
            }
        };

        fetchLeadData();
    }, [leadid]);

    const handleAddQuotation = () => {
        console.log("Add Quotation clicked");
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="salesOpportunitycontainer">
            <Navbar onToggleSidebar={setCollapsed} />
            <div className={`salesOpportunity ${collapsed ? "collapsed" : ""}`}>
                <div className="container py-4">
                    <div className="d-flex justify-content-end mb-3 gap-2">
                        <button className="btn btn-gradient-right" onClick={handleAddQuotation}>
                            Add Quotation
                        </button>
                    </div>

                    <div className="card mb-4">
                        <div className="card-body">
                            <h2 className="card-title">Lead Details</h2>
                            {leadData ? (
                                <div className="row mb-4">
                                    <div className="col-md-6">
                                        {/* <div className="mb-3 d-flex flex-wrap">
                                            <span className="fw-bold me-2" style={{ minWidth: "150px" }}>
                                                Lead Type:
                                            </span>
                                            <span className="text-muted">{leadData.lead_type}</span>
                                        </div> */}
                                        <div className="mb-3 d-flex flex-wrap">
                                            <span className="fw-bold me-2" style={{ minWidth: "150px" }}>
                                                Name:
                                            </span>
                                            <span className="text-muted">{leadData.name}</span>
                                        </div>
                                        <div className="mb-3 d-flex flex-wrap">
                                            <span className="fw-bold me-2" style={{ minWidth: "150px" }}>
                                                Email:
                                            </span>
                                            <span className="text-muted">{leadData.email}</span>
                                        </div>
                                        <div className="d-flex flex-wrap">
                                            <span className="fw-bold me-2" style={{ minWidth: "150px" }}>
                                                Phone Number:
                                            </span>
                                            <span className="text-muted">{leadData.phone_number}</span>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3 d-flex flex-wrap">
                                            <span className="fw-bold me-2" style={{ minWidth: "150px" }}>
                                                Source:
                                            </span>
                                            <span className="text-muted">{leadData.sources}</span>
                                        </div>
                                        <div className="mb-3 d-flex flex-wrap">
                                            <span className="fw-bold me-2" style={{ minWidth: "150px" }}>
                                                Primary Status:
                                            </span>
                                            <span className="text-muted">{leadData.primaryStatus}</span>
                                        </div>
                                        <div className="mb-3 d-flex flex-wrap">
                                            <span className="fw-bold me-2" style={{ minWidth: "150px" }}>
                                                Secondary Status:
                                            </span>
                                            <span className="text-muted">{leadData.secondaryStatus}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p>No lead data available</p>
                            )}
                        </div>
                    </div>

                    <div className="card mb-4">
                        <div className="card-body">
                            <h2 className="card-title">Opportunity Details</h2>
                            {leadData ? (
                                <div className="row mb-4">
                                    <div className="col-md-6">
                                        <div className="mb-3 d-flex flex-wrap">
                                            <span className="fw-bold me-2" style={{ minWidth: "150px" }}>
                                                Opportunity Status 1:
                                            </span>
                                            <span className="text-muted">{leadData.opportunity_status1}</span>
                                        </div>
                                        <div className="mb-3 d-flex flex-wrap">
                                            <span className="fw-bold me-2" style={{ minWidth: "150px" }}>
                                                Opportunity Status 2:
                                            </span>
                                            <span className="text-muted">{leadData.opportunity_status2}</span>
                                        </div>
                                        <div className="mb-3 d-flex flex-wrap">
                                            <span className="fw-bold me-2" style={{ minWidth: "150px" }}>
                                                Travel Type:
                                            </span>
                                            <span className="text-muted">{leadData.travel_type}</span>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3 d-flex flex-wrap">
                                            <span className="fw-bold me-2" style={{ minWidth: "150px" }}>
                                                Passport Number:
                                            </span>
                                            <span className="text-muted">{leadData.passport_number}</span>
                                        </div>
                                        <div className="mb-3 d-flex flex-wrap">
                                            <span className="fw-bold me-2" style={{ minWidth: "150px" }}>
                                                Preferred Contact Method:
                                            </span>
                                            <span className="text-muted">{leadData.preferred_contact_method}</span>
                                        </div>
                                        <div className="mb-3 d-flex flex-wrap">
                                            <span className="fw-bold me-2" style={{ minWidth: "150px" }}>
                                                Special Requirement:
                                            </span>
                                            <span className="text-muted">{leadData.special_requirement}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p>No opportunity data available</p>
                            )}
                        </div>
                    </div>

                    <div className="card mb-4">
                        <div className="card-body">
                            <h2 className="card-title">Travel Details</h2>
                            {leadData ? (
                                <div className="row mb-4">
                                    <div className="col-md-6">
                                        <div className="mb-3 d-flex flex-wrap">
                                            <span className="fw-bold me-2" style={{ minWidth: "150px" }}>
                                                Destination:
                                            </span>
                                            <span className="text-muted">{leadData.destination}</span>
                                        </div>
                                        <div className="mb-3 d-flex flex-wrap">
                                            <span className="fw-bold me-2" style={{ minWidth: "150px" }}>
                                                Start Date:
                                            </span>
                                            <span className="text-muted">
                                                {leadData.start_date
                                                    ? new Intl.DateTimeFormat('en-IN', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                    }).format(new Date(leadData.start_date))
                                                    : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="mb-3 d-flex flex-wrap">
                                            <span className="fw-bold me-2" style={{ minWidth: "150px" }}>
                                                End Date:
                                            </span>
                                            <span className="text-muted">
                                                {leadData.end_date
                                                    ? new Intl.DateTimeFormat('en-IN', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                    }).format(new Date(leadData.end_date))
                                                    : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="mb-3 d-flex flex-wrap">
                                            <span className="fw-bold me-2" style={{ minWidth: "150px" }}>
                                                Budget:
                                            </span>
                                            <span className="text-muted">{leadData.approx_budget}</span>
                                        </div>
                                        <div className="mb-3 d-flex flex-wrap">
                                            <span className="fw-bold me-2" style={{ minWidth: "150px" }}>
                                                Notes:
                                            </span>
                                            <span className="text-muted">{leadData.notes}</span>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3 d-flex flex-wrap">
                                            <span className="fw-bold me-2" style={{ minWidth: "150px" }}>
                                                Duration:
                                            </span>
                                            <span className="text-muted">{leadData.duration}</span>
                                        </div>
                                        <div className="mb-3 d-flex flex-wrap">
                                            <span className="fw-bold me-2" style={{ minWidth: "150px" }}>
                                                Adults:
                                            </span>
                                            <span className="text-muted">{leadData.adults_count}</span>
                                        </div>
                                        <div className="mb-3 d-flex flex-wrap">
                                            <span className="fw-bold me-2" style={{ minWidth: "150px" }}>
                                                Children:
                                            </span>
                                            <span className="text-muted">{leadData.children_count}</span>
                                        </div>
                                        <div className="mb-3 d-flex flex-wrap">
                                            <span className="fw-bold me-2" style={{ minWidth: "150px" }}>
                                                Child Age:
                                            </span>
                                            <span className="text-muted">{leadData.child_ages}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p>No travel data available</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeadDetails;