import React, { useState, useEffect } from 'react';
import DataTable from './../../../Layout/Table/TableLayout';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../../Shared/Navbar/Navbar';
import { FaTrash ,FaEdit} from "react-icons/fa";
import { baseURL } from '../../../Apiservices/Api';
import axios from 'axios';

const TeamMembers = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [message, setMessage] = useState("");
  const [teamMembers, setTeamMembers] = useState(location.state?.teamMembers || []);

  useEffect(() => {
    if (!location.state?.teamMembers) {
     
      console.warn("No team members found in state.");
    }
  }, [location.state]);

  const handleDeleteEmployee = async (id) => {
    try {
      const response = await axios.delete(`${baseURL}/employees/${id}`);
      if (response.status === 204) {
        setTeamMembers(prevMembers => prevMembers.filter(member => member.id !== id));
        setMessage("Employee deleted successfully!");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
      setMessage("Failed to delete employee. Please try again.");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const memberColumns = [
    {
      Header: "Employee ID",
      accessor: "id",
      Cell: ({ value }) => `EMP${String(value).padStart(5, "0")}`,
    },
    { Header: "Name", accessor: "name" },
    { Header: "Mobile", accessor: "mobile" },
    { Header: "Email", accessor: "email" },
    {
      Header: "Designation",
      accessor: "role",
      Cell: ({ value }) => (value === "employee" ? "Associate - Sales & Operations" : value),
    },
    {
      Header: "Actions",
      Cell: ({ row }) => (
        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
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
            <div className="back-button mt-3 d-flex justify-content-start">
              <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                Back
              </button>
            </div>
            <h2 className='text-center'>Team Members</h2>
            {message && <div className="alert alert-success">{message}</div>}
            <DataTable columns={memberColumns} data={teamMembers} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamMembers;
