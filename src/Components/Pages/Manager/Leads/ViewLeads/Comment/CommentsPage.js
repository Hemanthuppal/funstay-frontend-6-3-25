
import React, { useEffect, useState,useContext } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Button, Form } from 'react-bootstrap';
import './CommentsPage.css'; 
import Navbar from '../../../../../Shared/ManagerNavbar/Navbar'; 
import { useNavigate } from 'react-router-dom';
import {baseURL} from '../../../../../Apiservices/Api';
import { AuthContext } from '../../../../../AuthContext/AuthContext';
import { adminMail } from '../../../../../Apiservices/Api';

const CommentsPage = () => {
  const { authToken, userRole, userId, userName, assignManager,managerId} = useContext(AuthContext);
  const { leadid } = useParams(); 
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
const [collapsed, setCollapsed] = useState(false);
const [assignedSalesId, setAssignedSalesId] = useState(null);
const navigate = useNavigate();

  useEffect(() => {
   
    const fetchComments = async () => {
      try {
        const response = await axios.get(`${baseURL}/comments/${leadid}`);
        const sortedComments = response.data.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );
        setComments(sortedComments);
        console.log(response)
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchComments();
  }, [leadid]);

 
  useEffect(() => {
    const fetchLeadDetails = async () => {
      try {
        const leadResponse = await axios.get(`${baseURL}/api/leads/${leadid}`);
        
        setAssignedSalesId(leadResponse.data.assignedSalesId);
        
      } catch (error) {
        console.error("Error fetching lead details:", error);
      }
    };

    fetchLeadDetails();
  }, [leadid]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    const trimmedComment = newComment.trim();
    const commentName = `${userName} (Manager)`;
    
    const comment = {
      name: commentName,
      leadid: leadid,
      timestamp: new Date().toISOString(),
      text: trimmedComment,
      notificationmessage: `${commentName}: ${trimmedComment}  `,
     
      userId: assignedSalesId,
      email: `${adminMail}`
    };
    
   
    console.log(JSON.stringify(comment, null, 2));
    console.log(assignedSalesId)
    try {
      const commenturl = `${baseURL}/comments/add`;
      const response = await fetch(commenturl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(comment),
      });

      if (response.ok) {
        const addedComment = await response.json();
        setComments((prevComments) => [...prevComments, addedComment]);
        setNewComment("");
      } else {
        console.error("Failed to add comment");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

 
  


  return (
    <div className="salesViewLeadsContainer">
    <Navbar onToggleSidebar={setCollapsed} />
    <div className={`salesViewLeads ${collapsed ? "collapsed" : ""}`}>
    <div className="comment-form-container">
    <h3 className='comment-form-header'>Comments</h3>

   
    <div className="mb-3 opp-modal-footer">
        <Form.Group>
            <Form.Label>Add a New Comment</Form.Label>
            <Form.Control
             as ="textarea"
             rows={4}
                type="text"
                placeholder="Write your comment here..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                autoFocus
            />
            <Button
                className="mt-2 opp-comment-btn-primary"
                onClick={handleAddComment}
                disabled={!newComment.trim()}
            >
                Add Comment
            </Button>
        </Form.Group>
    </div>

   
    <div style={{ maxHeight: "300px", overflowY: "auto", border: "1px solid #ddd", padding: "10px", borderRadius: "5px" }}>
  {[...comments]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) 
    .map((comment, index) => (
      <div key={index} className="mb-3">
        
         <p style={{ fontSize: "13px", color: "gray" }}>
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

      
        <p>
         
          <strong>{comment.name}</strong>: {comment.text}
        </p>
       
       
      </div>
    ))}
</div>

    <div className="mt-3">
        <Button className="comment-close-btn comment-btn" onClick={() => navigate(-1)}>
            Back
        </Button>
    </div>
</div>
    </div>
    </div>
  );
};

export default CommentsPage;