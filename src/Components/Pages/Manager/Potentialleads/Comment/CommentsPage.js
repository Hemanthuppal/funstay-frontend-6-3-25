
import React, { useEffect, useState,useContext } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Button, Form } from 'react-bootstrap';
import './CommentsPage.css'; 
import Navbar from '../../../../../Shared/ManagerNavbar/Navbar';
import { useNavigate } from 'react-router-dom';
import {baseURL} from '../../../../../Apiservices/Api';
import { AuthContext } from '../../../../../AuthContext/AuthContext';

const CommentsPage = () => {
  const { authToken, userRole, userId, userName, assignManager } = useContext(AuthContext);
  const { leadid } = useParams(); 
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
const [collapsed, setCollapsed] = useState(false);
const navigate = useNavigate();
  useEffect(() => {
  
    const fetchComments = async () => {
      try {
        const response = await axios.get(`${baseURL}/comments/${leadid}`);
        const sortedComments = response.data.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );
        setComments(sortedComments);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchComments();
  }, [leadid]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const comment = {
      name: `${userName} (Manager)`,
      leadid: leadid,
      timestamp: new Date().toISOString(),
      text: newComment.trim(),
    };

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

  const COLORS = [
    '#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231',
    '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe'
  ];
  
  
  function getNameColor(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % COLORS.length;
    return COLORS[index];
  }

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
                <div key={index} className="mb-3 d-flex justify-content-between align-items-start">
                     <div>
      <p className="text-muted mb-1">
        {new Date(comment.timestamp).toLocaleString()}
      </p>
      <p>
     
        <strong style={{ color: getNameColor(comment.name) }}>
          {comment.name}
        </strong>
        : {comment.text}
      </p>
    </div>
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