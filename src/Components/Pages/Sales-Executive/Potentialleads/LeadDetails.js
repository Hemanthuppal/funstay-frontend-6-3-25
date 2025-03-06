import React, { useState, useEffect, useContext } from "react";
import { Row, Col, Card, Button, Form } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import './LeadDetails.css';
import Navbar from '../../../Shared/Sales-ExecutiveNavbar/Navbar';
import { baseURL } from "../../../Apiservices/Api";
import { FaCopy } from "react-icons/fa";
import { AuthContext } from '../../../AuthContext/AuthContext';
import { adminMail } from '../../../Apiservices/Api';

const LeadOppView = () => {
    const { authToken, userRole, userId, userName, assignManager, managerId } = useContext(AuthContext);
    const [collapsed, setCollapsed] = useState(false);
    const [lead, setLead] = useState(null);
    const location = useLocation();
    const { leadid } = location.state;
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [newComment, setNewComment] = useState('');
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            setMessage("Copied to clipboard!");
            setTimeout(() => setMessage(""), 1000);  // Optional: Show a message
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    };

    useEffect(() => {
        const fetchLeadDetails = async () => {
            try {
                const response = await fetch(`${baseURL}/api/leadsoppcomment/${leadid}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                console.log(data); // Log the data to see its structure
                setLead(data);
            } catch (error) {
                console.error('Error fetching lead details:', error);
            }
        };

        fetchLeadDetails();
    }, [leadid]);

    if (!lead) {
        return <div>Loading...</div>; // Show a loading state while fetching data
    }

    const addComment = async () => {
        if (!newComment.trim()) return;
        const trimmedComment = newComment.trim();
        const commentName = `${userName} (Sales)`;
        
        const comment = {
          name: commentName,
          leadid: leadid,
          timestamp: new Date().toISOString(),
          text: trimmedComment,
          notificationmessage: `${commentName} :${trimmedComment}  `,
          // notificationmessage: `${commentName} :${trimmedComment}  ${leadid}`,
          // userId, // Uncomment if needed
          managerId: managerId,
          email: `${adminMail}`
        };
        console.log(JSON.stringify(comment, null, 2));
        try {
          const response = await fetch(`${baseURL}/comments/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(comment),
          });
    
          if (!response.ok) {
            throw new Error("Failed to add comment");
          }
    
          const savedComment = await response.json();
    
          // Update the state to display the new comment
          setLead((prevLead) => ({
            ...prevLead,
            comments: [...prevLead.comments, savedComment]
          }));
    
          setNewComment(''); // Clear input after submission
        } catch (error) {
          console.error('Error adding comment:', error);
        }
      };
    

    const handleEdit = (leadId) => {
        navigate(`/edit-opportunity/${leadId}`, {
            state: { leadid: leadId }, // Pass leadid to the edit page
        });
    };

    // Sort comments by timestamp in descending order
    const sortedComments = lead.comments ? lead.comments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) : [];

    return (
        <div className="salesViewLeadsContainer">
            <Navbar onToggleSidebar={setCollapsed} />
            <div className={`salesViewLeads ${collapsed ? "collapsed" : ""}`}>
                <div className="lead-opportunity-view">
                    <Card className="mb-4">
                        <Card.Header className='s-LeadOppView-modal-header'>
                            <h2> Customer and Opportunity Details</h2>
                        </Card.Header>
                        <Card.Body>
                            {message && <div className="alert alert-info">{message}</div>}
                            <Row>
                                {/* Customer Details Section */}
                                <Col md={6}>
                                    <h5>Customer Details</h5>
                                    {/* <p><strong>Lead Type:</strong> {lead.lead.lead_type || 'N/A'}</p> */}
                                    {/* {lead.travelOpportunities && lead.travelOpportunities.length > 0 && (
  <>
    <p>
      <strong>Opp Id:</strong> {`OPP${String(lead.travelOpportunities[0].id).padStart(4, '0')}`}
    </p>
  </>
)} */}

                                    <p><strong>Opp Id:</strong> {lead.lead.leadid || 'N/A'}</p>
                                    <p><strong>Name:</strong> {lead.lead.name || 'N/A'}</p>
                                    <p>
                                        <strong>Phone Number:</strong>
                                        <a
                                            href={`https://wa.me/${lead.lead.country_code}${lead.lead.phone_number}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ textDecoration: "none", color: "blue", marginLeft: "5px" }}
                                        >
                                            {lead.lead.country_code} {lead.lead.phone_number || 'N/A'}
                                        </a>
                                        <FaCopy
                                            style={{ marginLeft: "8px", cursor: "pointer", color: "#ff9966" }}
                                            onClick={() => copyToClipboard(`${lead.lead.country_code}${lead.lead.phone_number}`)}
                                            title="Copy Phone Number"
                                        />
                                    </p>
                                    <p>
                                        <strong>Email ID:</strong> {lead.lead.email || 'N/A'}
                                        <FaCopy
                                            style={{ marginLeft: "8px", cursor: "pointer", color: "#ff9966" }}
                                            onClick={() => copyToClipboard(lead.lead.email)}
                                            title="Copy Email"
                                        />
                                    </p>
                                    <p><strong>Primary Source:</strong> {lead.lead.primarySource || 'N/A'}</p>
                                    <p><strong>Secondary Source:</strong> {lead.lead.secondarysource || 'N/A'}</p>
                                    <p><strong>Primary Status:</strong> {lead.lead.opportunity_status1 || 'N/A'}</p>
                                    <p><strong>Secondary Status:</strong> {lead.lead.opportunity_status2 || 'N/A'}</p>
                                    <p><strong>Travel Type:</strong> {lead.lead.travel_type || 'N/A'}</p>
                                    <p><strong>Channel:</strong> {lead.lead.channel || 'N/A'}</p>
                                    <hr />

                                    <h5>Opportunity Details</h5>
                                    {lead.travelOpportunities && lead.travelOpportunities.length > 0 && (
                                        <>
                                            <p><strong>Origin City:</strong> {lead.travelOpportunities[0].origincity || 'N/A'}</p>
                                            <p><strong>Destination:</strong> {lead.travelOpportunities[0].destination || 'N/A'}</p>
                                            <p>
                                                <strong>Start Date:</strong>{" "}
                                                {lead.travelOpportunities[0].start_date
                                                    ? new Date(lead.travelOpportunities[0].start_date).toLocaleDateString("en-IN", {
                                                        timeZone: "Asia/Kolkata"
                                                    })
                                                    : "N/A"}
                                            </p>

                                            <p>
                                                <strong>End Date:</strong>{" "}
                                                {lead.travelOpportunities[0].end_date
                                                    ? new Date(lead.travelOpportunities[0].end_date).toLocaleDateString("en-IN", {
                                                        timeZone: "Asia/Kolkata"
                                                    })
                                                    : "N/A"}
                                            </p>
                                            <p><strong>Duration:</strong> {lead.travelOpportunities[0].duration || 'N/A'}</p>
                                            <p><strong>Number of Adults:</strong> {lead.travelOpportunities[0].adults_count || 'N/A'}</p>
                                            <p><strong>Number of Children:</strong> {lead.travelOpportunities[0].children_count || 'N/A'}</p>
                                            <p><strong>Child Age:</strong> {lead.travelOpportunities[0].child_ages || 'N/A'}</p>
                                            <p><strong>Approx Budget:</strong>&nbsp;Rs  {lead.travelOpportunities[0].approx_budget || 'N/A'}</p>
                                            {/* <p><strong>Notes:</strong> {lead.travelOpportunities[0].notes || 'N/A'}</p> */}
                                            <p><strong>Reminder Setting:</strong> {lead.travelOpportunities[0].reminder_setting ? new Date(lead.travelOpportunities[0].reminder_setting).toLocaleString() : 'N/A'}</p>

                                            <p>
                                                <strong>Created Date:</strong>{" "}
                                                {lead.travelOpportunities[0].created_at
                                                    ? new Date(lead.travelOpportunities[0].created_at).toLocaleString("en-IN", {
                                                        timeZone: "Asia/Kolkata"
                                                    })
                                                    : "N/A"}
                                            </p>
                                        </>
                                    )}
                                </Col>

                                <Col md={6}>
                                    <h5>Additional Details</h5>
                                    <p><strong>Notes:</strong></p>
                                    <div className="s-Opp-Commentsection">
                                        {lead.travelOpportunities && lead.travelOpportunities.length > 0 && (
                                            <>
                                                <p> {lead.travelOpportunities[0].notes || 'N/A'}</p>
                                            </>
                                        )}
                                    </div>
                                    <div className="comment-section-container">
                                        <p><strong>Comments:</strong></p>

                                        {/* Comment Input Section */}
                                        <div className="comment-input-container">
                                            <Form.Group>
                                                <Form.Label><strong>Add a New Comment</strong></Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={4}
                                                    placeholder="Write your comment here..."
                                                    value={newComment}
                                                    onChange={(e) => setNewComment(e.target.value)}
                                                    autoFocus
                                                />
                                                <Button
                                                    className="mt-2 btn-warning text-white"
                                                    onClick={addComment}
                                                    disabled={!newComment.trim()}
                                                >
                                                    Add Comment
                                                </Button>
                                            </Form.Group>
                                        </div>

                                        {/* Display Comments */}
                                        <div className="comment-list" style={{ maxHeight: "300px", overflowY: "auto", border: "1px solid #ddd", padding: "10px", borderRadius: "5px", marginTop:"15px",backgroundColor:"#f1f7ff" }}>
                                            {sortedComments.length > 0 ? (
                                                sortedComments.map((comment) => (
                                                    <div key={comment.id} className="comment-item">
                                                        <p className="comment-timestamp">
                                                            {new Date(comment.timestamp).toLocaleString("en-IN", {
                                                                timeZone: "Asia/Kolkata",
                                                                day: "2-digit",
                                                                month: "2-digit",
                                                                year: "numeric",
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                                second: "2-digit",
                                                                hour12: true,
                                                            })}
                                                        </p>
                                                        <p className="comment-text">
                                                            <strong>{comment.name}</strong>: {comment.text}
                                                        </p>
                                                        <hr />
                                                    </div>
                                                ))
                                            ) : (
                                                <p>No comments available.</p>
                                            )}
                                        </div>
                                    </div>

                                </Col>
                            </Row>
                        </Card.Body>
                        <Card.Footer className='s-LeadOppView-footer'>
                            <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                                Back
                            </button>
                            <button className='btn btn-primary' onClick={() => handleEdit(leadid)}>Edit</button>
                        </Card.Footer>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default LeadOppView; 