import React, { useState, useEffect } from "react";
import { baseURL } from "../../../Apiservices/Api";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../Shared/Navbar/Navbar";
import "./AddEmployeeModal.css";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons



const AddEmployeeModal = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [message, setMessage] = useState("");
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
    role: "",
    assignManager: "",
  });

  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const response = await fetch(`${baseURL}/managers`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();

        if (response.ok) {
          setManagers(data.data || []);
        } else {
          throw new Error(data.message || "Failed to fetch managers.");
        }
      } catch (error) {
        setError(error.message);
      }
    };

    fetchManagers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { name, mobile, email, password, role, assignManager } = newEmployee;
    
    // Validate required fields
    if (!name || !mobile || !email || !password || !role || (role === "employee" && !assignManager)) {
      setError("All fields are required."); // Set error message for missing fields
      setTimeout(() => setError(""), 1000);
      return false; // Prevent form submission
    }
  
    try {
      setLoading(true);
      setError(null);
  
      const response = await fetch(`${baseURL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(newEmployee),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Failed to add employee.");
      }
  
      // Reset form on successful submission
      setNewEmployee({
        name: "",
        mobile: "",
        email: "",
        password: "",
        role: "",
        assignManager: "",
      });
  
      setMessage("Employee added successfully.");
      setTimeout(() => setMessage(""), 1000); // Show success message
      return true; // Indicate success
    } catch (error) {
      setError(error.message);
      return false; // Indicate failure
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmitAndClose = async (e) => {
    const isSuccess = await handleSubmit(e);
    if (isSuccess) {
      navigate("/a-allteams"); // Only navigate if submission was successful
    }
  };
  
  

  return (
    <div className="salesViewLeadsContainer">
      <Navbar onToggleSidebar={setCollapsed} />
      <div className={`salesViewLeads ${collapsed ? "collapsed" : ""}`}>
        <div className="addleads-form-container">
          <h2 className="addleads-form-header">Add New Employee</h2>

          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="addemployee-form-grid">
              <div className="addemployee-input-group">
                <label>Name<span style={{ color: "red" }}> *</span></label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter Name"
                  value={newEmployee.name}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="addemployee-input-group">
                <label>Mobile<span style={{ color: "red" }}> *</span></label>
                <input
                  type="text"
                  name="mobile"
                  placeholder="Enter Mobile"
                  value={newEmployee.mobile}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, mobile: e.target.value })
                  }
                  required
                />
              </div>
              <div className="addemployee-input-group">
                <label>Email<span style={{ color: "red" }}> *</span></label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter Email"
                  value={newEmployee.email}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="addemployee-input-group">
                <label>Password<span style={{ color: "red" }}> *</span></label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter Password"
                    value={newEmployee.password}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, password: e.target.value })
                    }
                    required
                  />
                  <span
                    className="password-eye-icon"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </div>
              <div className="addemployee-input-group">
                <label>Role<span style={{ color: "red" }}> *</span></label>
                <select
                  name="role"
                  value={newEmployee.role}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, role: e.target.value })
                  }
                  required
                >
                  <option value="">Select Role</option>
                  {/* <option value="admin">Admin
                  </option> */}
                  <option value="manager">Manager- Sales & Operations
                  </option>
                  <option value="employee">Associate- Sales & Operations
                  </option>
                </select>
              </div>
              {newEmployee.role === "employee" && (
                <div className="addemployee-input-group">
                  <label>Assign Manager<span style={{ color: "red" }}> *</span></label>
                  <select
                    name="assignManager"
                    value={newEmployee.assignManager}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        assignManager: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Manager</option>
                    {managers.map((manager) => (
                      <option key={manager.id} value={manager.id}>
                        {manager.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="addleads-form-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate(-1)}
              >
                Back
              </button>

              <button
                className="btn btn-primary"
                type="submit"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>

              <button
                className="btn btn-success"
                type="button"
                disabled={loading}
                onClick={handleSubmitAndClose}
              >
                {loading ? "Submitting..." : "Submit & Close"}
              </button>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEmployeeModal;
