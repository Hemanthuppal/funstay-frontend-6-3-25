import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { baseURL } from "../../../../Apiservices/Api";
import Navbar from "../../../../Shared/Navbar/Navbar";
import "./EditEmployee.css";

const EditEmployee = () => {
  const { id } = useParams(); // Get employee ID from URL
  const navigate = useNavigate();
  const [selectedManagerId, setSelectedManagerId] = useState("");
  const [selectedManagerName, setSelectedManagerName] = useState("");

  const [collapsed, setCollapsed] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
    role: "",
    managerId: "",
    assign_manager: "",
  });

  const [managers, setManagers] = useState([]); // Store manager list
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Fetch employee data
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await axios.get(`${baseURL}/employee/${id}`);
        setNewEmployee(response.data);

        // Set selectedManagerId based on the fetched employee's managerId
        if (response.data.managerId) {
          setSelectedManagerId(response.data.managerId);
          setSelectedManagerName(response.data.assign_manager); // Assuming assign_manager holds the manager's name
        }
      } catch (error) {
        setError("Failed to fetch employee data");
      }
    };

    const fetchManagers = async () => {
      try {
        const response = await axios.get(`${baseURL}/managers`);
        console.log("Managers API Response:", response.data);
        const fetchedManagers = Array.isArray(response.data.data) ? response.data.data : [];
        setManagers(fetchedManagers);
      } catch (error) {
        console.error("Failed to fetch managers", error);
      }
    };

    fetchEmployee();
    fetchManagers();
  }, [id]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    const updatedEmployee = {
      ...newEmployee,
      assign_manager: newEmployee.role === "manager" ? null : newEmployee.assign_manager,
      managerId: newEmployee.role === "manager" ? null : newEmployee.managerId,
    };
    try {
      await axios.put(`${baseURL}/updateemployee/${id}`, updatedEmployee);
      console.log(JSON.stringify(updatedEmployee));
      setMessage("Employee updated successfully");
    } catch (error) {
      setError("Error updating employee");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAndClose = async (e) => {
    await handleSubmit(e);
    navigate("/a-allteams"); // Change to your actual employee list route
  };
  

  return (
    <div className="salesViewLeadsContainer">
      <Navbar onToggleSidebar={setCollapsed} />
      <div className={`salesViewLeads ${collapsed ? "collapsed" : ""}`}>
        <div className="editemployee-form-container">
          <h2 className="editemployee-form-header">Edit Employee</h2>

          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="editemployee-form-grid">
              <div className="editemployee-input-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter Name"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                  required
                />
              </div>

              <div className="editemployee-input-group">
                <label>Mobile</label>
                <input
                  type="text"
                  name="mobile"
                  placeholder="Enter Mobile"
                  value={newEmployee.mobile}
                  onChange={(e) => setNewEmployee({ ...newEmployee, mobile: e.target.value })}
                  required
                />
              </div>

              <div className="editemployee-input-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter Email"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                  required
                />
              </div>

              {/* <div className="editemployee-input-group">
                <label>Password</label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter Password"
                    value={newEmployee.password}
                    onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                    required
                  />
                  <span className="password-eye-icon" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </div> */}

              <div className="editemployee-input-group">
                <label>Role</label>
                <select
                  name="role"
                  value={newEmployee.role}
                  onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                  required
                >
                  <option value="">Select Role</option>
                  {/* <option value="admin">Admin</option> */}
                  <option value="manager">Manager- Sales & Operations</option>
                  <option value="employee">Associate- Sales & Operations</option>
                </select>
              </div>

              {newEmployee.role === "employee" && (
                <div className="editemployee-input-group">
                  <label>Assign Manager</label>
                  <select
                    name="assignManager"
                    value={selectedManagerId}
                    onChange={(e) => {
                      const selectedId = Number(e.target.value);
                      const selectedManager = managers.find((manager) => manager.id === selectedId);

                      setSelectedManagerId(selectedId);
                      setSelectedManagerName(selectedManager ? selectedManager.name : "");

                      setNewEmployee((prev) => ({
                        ...prev,
                        assign_manager: selectedManager ? selectedManager.name : "",
                        managerId: selectedId,
                      }));
                    }}
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

            <div className="editemployee-form-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate(-1)}
              >
                Back
              </button>

              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update"}
              </button>

              <button
                className="btn btn-success"
                type="button"
                disabled={loading}
                onClick={handleSubmitAndClose}
              >
                {loading ? "Updating..." : "Update & Close"}
              </button>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditEmployee;