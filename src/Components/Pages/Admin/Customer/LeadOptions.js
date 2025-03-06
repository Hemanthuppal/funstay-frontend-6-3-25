import React, { useState, useEffect,useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Row, Col, Card, Accordion } from "react-bootstrap";
import "../Potentialleads/LeadDetails.css";
import Navbar from "../../../Shared/Navbar/Navbar";
import { FaPhone, FaEnvelope, FaCopy } from "react-icons/fa";
import { ThemeContext } from "../../../Shared/Themes/ThemeContext";
import { baseURL } from "../../../Apiservices/Api";


const LeadOppView = () => {
        const [collapsed, setCollapsed] = useState(false);
        const [customer, setCustomer] = useState(null);
        const [travelOpportunity, setTravelOpportunity] = useState([]);
        const [loading, setLoading] = useState(true);
        const [travelLoading, setTravelLoading] = useState(true);
        const { themeColor } = useContext(ThemeContext);
        const [error, setError] = useState(null);
        const [travelError, setTravelError] = useState(null);
        const [activeKey, setActiveKey] = useState("0");
        const location = useLocation();
        const navigate = useNavigate();
        const customerId = location.state?.id || null;
        console.log("customerId=", customerId);
        const [message, setMessage] = useState('');

        const copyToClipboard = (text) => {
                navigator.clipboard.writeText(text).then(() => {
                        setMessage("Copied to clipboard!");
                        setTimeout(() => setMessage(""), 1000); // Optional: Show a message
                }).catch(err => {
                        console.error('Failed to copy: ', err);
                });
        };

        const fetchCustomerDetails = async (id) => {
                try {
                        const response = await axios.get(`${baseURL}/api/customers/${id}`);
                        console.log("API Response for Customer:", response.data);


                        if (response.data && typeof response.data === "object") {
                                setCustomer(response.data.customer || response.data);
                        } else {
                                throw new Error("Invalid API response structure");
                        }
                } catch (err) {
                        console.error("Error fetching customer details:", err);
                        setError("Failed to fetch customer details");
                } finally {
                        setLoading(false);
                }
        };

        const fetchopportunityDetails = async (id) => {
                try {
                        const response = await axios.get(`${baseURL}/api/travel-opportunities/${id}`);
                        const opportunities = response.data;


                        const opportunitiesWithComments = await Promise.all(
                                opportunities.map(async (trip) => {
                                        const commentsResponse = await axios.get(`${baseURL}/comments/${trip.leadid}`);
                                        return {
                                                ...trip,
                                                comments: commentsResponse.data,
                                        };
                                })
                        );

                        setTravelOpportunity(opportunitiesWithComments);
                        console.log("TravelOpportunity with Comments=", opportunitiesWithComments);
                } catch (err) {
                        setTravelError("Failed to fetch TravelOpportunity details");
                } finally {
                        setTravelLoading(false);
                }
        };

        useEffect(() => {
                if (!customerId) {
                        console.error("No customer ID found! Redirecting...");

                        return;
                }
                fetchCustomerDetails(customerId);
                fetchopportunityDetails(customerId)
        }, [customerId]);



        return (
                <div className="salesViewLeadsContainer">
                        <Navbar onToggleSidebar={setCollapsed} />
                        <div className={`salesViewLeads ${collapsed ? "collapsed" : ""}`}>
                                <div className="lead-opportunity-view">
                                        <Card className="mb-4">
                                                <Card.Header className="s-LeadOppView-modal-header" style={{ "--theme-color": themeColor }}>
                                                        <h2> Customer Details</h2>
                                                </Card.Header>
                                                <Card.Body>
                                                        {message && <div className="alert alert-info">{message}</div>}
                                                        <Row>
                                                                {/* Customer Details Section */}
                                                                <Col md={6}>
                                                                        <h5>Customer Details</h5>
                                                                        {loading ? (
                                                                                <p>Loading customer details...</p>
                                                                        ) : error ? (
                                                                                <p style={{ color: "red" }}>{error}</p>
                                                                        ) : customer ? (
                                                                                <>
                                                                                        <Row>
                                                                                                <Col md={6}>
                                                                                                        <p><strong>Customer Id:</strong>  {customer.id || "N/A"}</p>
                                                                                                </Col>
                                                                                                <Col md={6}>
                                                                                                        <p><strong>Name:</strong> {customer.name || "N/A"}</p>
                                                                                                </Col>
                                                                                        </Row>
                                                                                        <Row>
                                                                                                <Col md={6}>
                                                                                                <p>
  <strong><FaPhone /> Phone:</strong> 
  <a 
    href={`https://wa.me/${customer.country_code || "91"}${customer.phone_number || ""}`} 
    target="_blank" 
    rel="noopener noreferrer"
    style={{ textDecoration: "none", color: "blue",  marginLeft: "5px" }}
  >
    {customer.country_code || "+91"} {customer.phone_number || "N/A"}
  </a>
  <FaCopy
    style={{ marginLeft: "8px", cursor: "pointer", color: "#ff9966" }}
    onClick={() => copyToClipboard(`${customer.country_code || "+91"}${customer.phone_number || ""}`)}
    title="Copy Phone Number"
  />
</p>

                                                                                                </Col>
                                                                                                <Col md={6}>
                                                                                                        <div style={{ display: "flex", alignItems: "center", overflow: "hidden" }}>
                                                                                                                <p style={{ margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flexGrow: 1 }}>
                                                                                                                        <strong><FaEnvelope /> Email:</strong> {customer.email || "N/A"}
                                                                                                                </p>
                                                                                                                <FaCopy
                                                                                                                        style={{ marginLeft: "8px", cursor: "pointer", color: "#ff9966" }}
                                                                                                                        onClick={() => copyToClipboard(customer.email || "")}
                                                                                                                        title="Copy Email"
                                                                                                                />
                                                                                                        </div>
                                                                                                </Col>
                                                                                        </Row>
                                                                                </>
                                                                        ) : (
                                                                                <p>No customer data found.</p>
                                                                        )}

                                                                        <hr />
                                                                        <h5>Opportunity Details</h5>
                                                                        <h5>History</h5>
                                                                        {Array.isArray(travelOpportunity) && travelOpportunity.length > 0 ? (
                                                                                <Accordion
                                                                                        defaultActiveKey="0"
                                                                                        activeKey={activeKey}
                                                                                        onSelect={(key) => setActiveKey(key)}
                                                                                >
                                                                                        {travelOpportunity.map((trip, index) => (
                                                                                                <Accordion.Item eventKey={index.toString()} key={index}>
                                                                                                        <Accordion.Header>
                                                                                                                InProgress to {trip.destination} on {new Date(trip.start_date).toLocaleDateString("en-US", { month: "short", day: "2-digit" })}
                                                                                                        </Accordion.Header>
                                                                                                        <Accordion.Body>
                                                                                                                <Row>
                                                                                                                        <Col md={6}><p><strong>Origin City:</strong> {trip.origincity}</p></Col>
                                                                                                                        <Col md={6}><p><strong>Destination:</strong> {trip.destination}</p></Col>

                                                                                                                </Row>
                                                                                                                <Row>
                                                                                                                        <Col md={6}><p><strong>Start Date:</strong> {new Date(trip.start_date).toLocaleDateString("en-GB")}</p></Col>
                                                                                                                        <Col md={6}><p><strong>End Date:</strong> {new Date(trip.end_date).toLocaleDateString("en-GB")}</p></Col>

                                                                                                                </Row>
                                                                                                                <Row>
                                                                                                                        <Col md={6}><p><strong>Duration:</strong> {trip.duration}</p></Col>
                                                                                                                        <Col md={6}><p><strong>Adults:</strong> {trip.adults_count}</p></Col>

                                                                                                                </Row>
                                                                                                                <Row>
                                                                                                                        <Col md={6}><p><strong>Children:</strong> {trip.children_count}</p></Col>
                                                                                                                        <Col md={6}><p><strong>Child Age:</strong> {trip.child_ages || "N/A"} Years</p></Col>

                                                                                                                </Row>
                                                                                                                <Row>
                                                                                                                        <Col md={6}><p><strong>Approx Budget:</strong> &nbsp;Rs {trip.approx_budget}</p></Col>
                                                                                                                        <Col md={6}>

                                                                                                                                <p>
                                                                                                                                        <strong>Reminder Setting:</strong> {new Date(trip.reminder_setting).toLocaleString("en-IN", {
                                                                                                                                                day: "2-digit",
                                                                                                                                                month: "2-digit",
                                                                                                                                                year: "numeric",
                                                                                                                                                hour: "2-digit",
                                                                                                                                                minute: "2-digit",
                                                                                                                                                second: "2-digit",
                                                                                                                                                hour12: true
                                                                                                                                        })}
                                                                                                                                </p>
                                                                                                                        </Col>
                                                                                                                </Row>
                                                                                                        </Accordion.Body>
                                                                                                </Accordion.Item>
                                                                                        ))}
                                                                                </Accordion>
                                                                        ) : (
                                                                                <p>No travel opportunities available.</p>
                                                                        )}


                                                                </Col>


                                                                {/* <Col md={3}>
                                                                        <h5>Additional Details</h5>
                                                                        <p><strong>Status:</strong> Confirmed</p>
                                                                        <p><strong>Recent Quote:</strong> Qu0003</p>
                                                                        <p><strong>Amount Paid:</strong> 10000</p>
                                                                        <p><strong>Amount Due:</strong> 5000</p>
                                                                        <p><strong>Reminder date:</strong> 05/02/2025</p>
                                                                </Col> */}
                                                                {travelOpportunity.length > 0 && activeKey !== null ? (
                                                                        <Col md={6}>
                                                                                <h5>Customer Interaction Log</h5>
                                                                                <p><strong>Notes:</strong></p>
                                                                                <div className="s-Opp-Commentsection">
                                                                                        <p>{travelOpportunity[activeKey]?.notes || "No notes available"}</p>
                                                                                </div>
                                                                                <p><strong>Comments:</strong></p>
                                                                                <div className="s-Opp-Commentsection">
                                                                                        {travelOpportunity[activeKey]?.comments?.length > 0 ? (
                                                                                                travelOpportunity[activeKey].comments.map((comment, index) => (
                                                                                                        <div key={index} className="comment" style={{ marginBottom: "10px" }}>
                                                                                                                <p>
                                                                                                                        <strong>{comment.name}</strong> (
                                                                                                                        {new Date(comment.timestamp).toLocaleString("en-IN", {
                                                                                                                                day: "2-digit",
                                                                                                                                month: "2-digit",
                                                                                                                                year: "numeric",
                                                                                                                                hour: "2-digit",
                                                                                                                                minute: "2-digit",
                                                                                                                                second: "2-digit",
                                                                                                                                hour12: true,
                                                                                                                        })}
                                                                                                                        )
                                                                                                                </p>
                                                                                                                <p>{comment.text}</p>
                                                                                                        </div>
                                                                                                ))
                                                                                        ) : (
                                                                                                <p>No comments available</p>
                                                                                        )}
                                                                                </div>
                                                                        </Col>
                                                                ) : null}
                                                        </Row>
                                                </Card.Body>
                                                <Card.Footer className="s-LeadOppView-footer">
                                                        <button className="btn btn-secondary" onClick={() => navigate(-1)}>Back</button>

                                                </Card.Footer>
                                        </Card>
                                </div>
                        </div>
                </div>
        );
};

export default LeadOppView;
