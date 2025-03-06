// CommentsPage.js
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Button, Form } from 'react-bootstrap';
import './CommentsPage.css'; // Optional: Create a CSS file for styling
import Navbar from '../../../../../Shared/Sales-ExecutiveNavbar/Navbar';
import { useNavigate } from 'react-router-dom';
import { baseURL } from '../../../../../Apiservices/Api';
import { AuthContext } from '../../../../../AuthContext/AuthContext';

const CommentsPage = () => {
  const { authToken, userRole, userId, userName, assignManager } = useContext(AuthContext);
  const { leadid } = useParams(); // Gets the lead ID from the URL
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch comments based on lead ID when the component mounts
    const fetchComments = async () => {
      try {
        const response = await axios.get(`${baseURL}/comments/${leadid}`);

        // Log the full response to the console
        console.log("API Response:", response);

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
      name: `${userName} (Sales)`,
      leadid: leadid,
      timestamp: new Date().toISOString(),
      text: newComment.trim(),
    };
    console.log(JSON.stringify(comment, null, 2));
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

  // An array of colors to choose from
  const COLORS = [
    '#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231',
    '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe'
  ];

  // Function to deterministically get a color based on the name string
  function getNameColor(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    // Use modulo to pick a color from the COLORS array
    const index = Math.abs(hash) % COLORS.length;
    return COLORS[index];
  }

  return (
    <div className="salesViewLeadsContainer">
      <Navbar onToggleSidebar={setCollapsed} />
      <div className={`salesViewLeads ${collapsed ? "collapsed" : ""}`}>
        <div className="comment-form-container">
          <h3 className='comment-form-header'>Comments</h3>

          {/* Input Field for New Comment */}
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

          {/* Display Existing Comments */}
          <div style={{ maxHeight: "300px", overflowY: "auto", border: "1px solid #ddd", padding: "10px", borderRadius: "5px" }}>
            {[...comments]
              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) // Sort latest comments on top
              .map((comment, index) => (
                <div key={index} className="mb-3 d-flex justify-content-between align-items-start">
                  <p>
                    {/* Wrap the name in <strong> to bold it and style it with a specific color */}
                    <strong style={{ color: getNameColor(comment.name) }}>
                      {comment.name}
                    </strong>
                    : {comment.text}
                  </p>
                </div>
              ))}
          </div>

          {/* Close Button */}
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