import React, { useState, useEffect, useContext } from "react";
import "./Profile.css";
import Navbar from "../../../Shared/ManagerNavbar/Navbar";
import { AuthContext } from "../../../AuthContext/AuthContext";
import { baseURL } from "../../../Apiservices/Api";
import { useNavigate } from "react-router-dom";

const ProfileForm = () => {
  const { authToken, userId } = useContext(AuthContext);
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    role: "",
    dob: "",
    qualification: "",
    address: "",
    image: null,
    imageUrl: "",
  });

  useEffect(() => {
    fetch(`${baseURL}/employee/${userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setFormData({
          name: data.name || "",
          email: data.email || "",
          mobile: data.mobile || "",
          role: data.role || "",
          dob: data.dob ? data.dob.split("T")[0] : "",
          qualification: data.qualification || "",
          address: data.address || "",
          imageUrl: data.image || "",
        });
      })
      .catch((error) => console.error("Error fetching profile:", error));
  }, [userId, authToken]);

  const handleChange = (e) => {
    if (e.target.name === "image") {
      setFormData({ ...formData, image: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e, navigateToProfile = false) => {
    e.preventDefault();

    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("mobile", formData.mobile);
    data.append("role", formData.role);
    data.append("dob", formData.dob);
    data.append("qualification", formData.qualification);
    data.append("address", formData.address);
    if (formData.image) {
      data.append("image", formData.image);
    }

    try {
      const response = await fetch(`${baseURL}/employee/update/${userId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: data,
      });

      const result = await response.json();
      if (response.ok) {
        setMessage("Profile updated successfully!");
        setTimeout(() => setMessage(""), 3000);
        setIsEditing(false);

        // Update UI with new data
        setFormData((prevData) => ({
          ...prevData,
          ...result,
          imageUrl: result.image || prevData.imageUrl,
        }));

        // If "Update & Close" was clicked, navigate to another page
        if (navigateToProfile) {
          setTimeout(() => navigate("/m-dashboard"), 1000);
        }

      } else {
        setMessage(result.message || "Error updating profile");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("An error occurred. Please try again.");
      setTimeout(() => setMessage(""), 3000);
    }
  };



  return (
    <div className="SaleCustomercontainer">
      <Navbar onToggleSidebar={setCollapsed} />
      <div className={`SaleCustomer ${collapsed ? "collapsed" : ""}`}>
        <div className="profile-form-container">
          <div className="profile-form-header">
            <h2>Profile Details</h2>

          </div>
          {message && <div className="alert alert-info mt-2">{message}</div>}
          <form onSubmit={handleSubmit} className="profile-form-body p-3">
            <div className="profile-form-grid">
              <div className="profile-input-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
              <div className="profile-input-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="profile-form-grid">
              <div className="profile-input-group">
                <label htmlFor="mobile">Mobile Number</label>
                <input
                  type="text"
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
              <div className="profile-input-group">
                <label htmlFor="dob">Date of Birth</label>
                <input
                  type="date"
                  id="dob"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="profile-form-grid">
              <div className="profile-input-group">
                <label htmlFor="role">Role</label>
                <input
                  type="text"
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  disabled={!isEditing}
                  readOnly
                />
              </div>
              <div className="profile-input-group">
                <label htmlFor="image">Upload Image</label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {formData.imageUrl && (
              <div className="image-preview">
                <img
                  src={`${baseURL}${formData.imageUrl}`}
                  alt="Profile"
                  width="150"
                  height="150"
                />
              </div>
            )}

            <div className="profile-form-grid">
              <div className="profile-input-group full-width">
                <label htmlFor="address">Address</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={!isEditing}
                ></textarea>
              </div>
            </div>

            <div className="profile-form-footer">
              {/* Back Button */}
              <button type="button" className="profile-btn profile-btn-secondary" onClick={() => navigate(-1)}>
                Back
              </button>

              {isEditing ? (
                <>
                  {/* Cancel Button */}
                  <button type="button" className="profile-btn profile-btn-secondary" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>

                  {/* Update Button */}
                  <button type="submit" className="profile-btn profile-btn-primary" onClick={(e) => handleSubmit(e, false)}>
                    Update
                  </button>

                  {/* Update & Close Button */}
                  <button type="submit" className="btn btn-success" onClick={(e) => handleSubmit(e, true)}>
                    Update & Close
                  </button>
                </>
              ) : (
                <button type="button" className="profile-btn profile-btn-primary" onClick={() => setIsEditing(true)}>
                  Edit
                </button>
              )}
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};
export default ProfileForm;
