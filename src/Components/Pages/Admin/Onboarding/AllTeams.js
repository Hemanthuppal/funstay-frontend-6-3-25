import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import DataTable from "../../../Layout/Table/TableLayout";
import Navbar from "../../../Shared/Navbar/Navbar";
import "../Customer/Customer.css";
import "./AllTeams.css";
import { baseURL } from "../../../Apiservices/Api";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AdminCustomer = () => {
  const [data, setData] = useState([]);
  const [message, setMessage] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Navigate to add employee page
  const handleAddEmployee = () => {
    navigate("/a-onboarding");
  };

  // Fetch all managers from the API using Fetch API
  useEffect(() => {
    fetch(`${baseURL}/api/addmanager`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((result) => {
        setData(Array.isArray(result) ? result : [result]);
        console.log("Managers fetched:", result);
      })
      .catch((error) => {
        console.error("Error fetching data: ", error.message);
        setError("Failed to fetch managers. Please try again later.");
      });
  }, []);

  const handleDeleteEmployee = async (id) => {
    try {
      const response = await axios.delete(`${baseURL}/api/addmanager/${id}`);
      if (response.status === 200) {
        // Update the state to remove the deleted manager
        setData(data.filter(manager => manager.id !== id));
        setMessage("Employee deleted successfully!");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
      setMessage("Failed to delete employee. Please try again.");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // Define columns for the DataTable.
  const columns = [
    {
      Header: "Employee ID",
      accessor: "id",
      Cell: ({ value }) => `EMP${String(value).padStart(5, "0")}`,
    },
    { Header: "Name", accessor: "employee_name" },
    { Header: "Mobile No", accessor: "office_mobile_number" },
    { Header: "Email", accessor: "office_mail" },
    { Header: "Designation", accessor: "designation" },
    {
      Header: "Actions",
      accessor: "actions",
      Cell: ({ row }) => (
        <div className="action-buttons">
        <FaEye
  style={{
    color: "#ff9966",
    marginRight: "10px",
    cursor: "pointer",
  }}
  onClick={() => {
    const id = row.original.id; // Get the ID from the row
    navigate(`/a-viewonboarding/${id}`, { state: { id } }); // Pass the ID in the state
  }}
/>
          <FaEdit
            onClick={() => console.log("Edit", row.original.id)}
            style={{
              color: "#ff9966",
              marginRight: "10px",
              cursor: "pointer",
            }}
          />
          <FaTrash
            style={{ color: "#ff9966", cursor: "pointer" }}
            onClick={() => handleDeleteEmployee(row.original.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="Admin-myteamcontainer">
      <Navbar onToggleSidebar={setCollapsed} />
      <div className={`Admin-myteam ${collapsed ? "collapsed" : ""}`}>
        <div className="ViewCustomer-container mb-5">
          <div className="ViewCustomer-table-container">
            <h3 className="d-flex justify-content-between align-items-center w-100">
              <span>Onboarding Employees</span>
              <button className="btn btn-primary" onClick={handleAddEmployee}>
                + Add Employee
              </button>
            </h3>
            {message &&  <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-danger">{error}</div>}
            <DataTable columns={columns} data={data} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomer;