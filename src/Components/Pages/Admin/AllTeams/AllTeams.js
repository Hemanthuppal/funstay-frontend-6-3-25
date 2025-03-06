import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import DataTable from './../../../Layout/Table/TableLayout';
import Navbar from "../../../Shared/Navbar/Navbar";
import '../Customer/Customer.css';
import './AllTeams.css';

import axios from 'axios';
import { baseURL } from "../../../Apiservices/Api";
import { useNavigate } from "react-router-dom";

const AdminCustomer = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const [managers, setManagers] = useState([]);

  const handleAddEmployee = () => {
    navigate('/addemployee');
  };

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const response = await axios.get(`${baseURL}/employees/managers`);
        setManagers(response.data.data);
      } catch (error) {
        console.error("Error fetching managers:", error);
      }
    };
    fetchManagers();
  }, []);

  const handleDeleteEmployee = async (id) => {
    try {
      const response = await axios.delete(`${baseURL}/employees/${id}`);
      if (response.status === 204) {
        setManagers(managers.filter(manager => manager.id !== id));
        setMessage("Employee deleted successfully!");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
      setMessage("Failed to delete employee. Please try again.");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const columns = [
    {
      Header: "Employee ID",
      accessor: "id",
      Cell: ({ value }) => `EMP${String(value).padStart(5, "0")}`,
    },
    { Header: "Name", accessor: "name" },
    { Header: "Mobile No", accessor: "mobile" },
    { Header: "Email", accessor: "email" },
 
      {
        Header: "Designation",
        accessor: "role",
        Cell: ({ value }) => (value === "manager" ? "Manager - Sales & Operations" : value),
      },
   
    
    {
      Header: "No. of Team Members",
      accessor: "teamMembers",
      Cell: ({ row }) => (
        <button
  className="btn btn-link"
  onClick={() => navigate('/team-members', { state: { teamMembers: row.original.teamMembers } })}
>
  {row.original.employeeCount}
</button>
      ),
    },
    {
      Header: "Actions",
      Cell: ({ row }) => (
        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
          <FaEye
            style={{ color: "#ff9966", cursor: "pointer" }}
            onClick={() => navigate('/team-members', { state: { teamMembers: row.original.teamMembers } })}
          />
          <FaEdit
                          style={{ color: "#ff9966", cursor: "pointer" }}
                          onClick={() => navigate(`/editemployee/${row.original.id}`)}
                        />
          <FaTrash
            style={{ color: "#ff9966", cursor: "pointer" }}
            onClick={() => handleDeleteEmployee(row.original.id)}
          />
        </div>
      ),
    }
  ];

  return (
    <div className="Admin-myteamcontainer">
      <Navbar onToggleSidebar={setCollapsed} />
      <div className={`Admin-myteam ${collapsed ? "collapsed" : ""}`}>
        <div className="ViewCustomer-container mb-5">
          <div className="ViewCustomer-table-container">
            <h3 className="d-flex justify-content-between align-items-center w-100">
              <span></span>
              <button
                className="btn btn-primary"
                onClick={handleAddEmployee}
              >
                + Add Employee
              </button>
            </h3>
            {message && <div className="alert alert-success">{message}</div>}
            <DataTable columns={columns} data={managers} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomer;