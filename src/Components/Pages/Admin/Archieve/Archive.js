import React, { useState, useEffect } from "react";
import Navbar from "../../../Shared/Navbar/Navbar";
import axios from "axios";
import DataTable from "../../../Layout/Table/TableLayout";
import { baseURL } from "../../../Apiservices/Api";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaUndo } from "react-icons/fa";

const Archive = () => {
  const [archivedData, setArchivedData] = useState([]);
  const [collapsed, setCollapsed] = useState(false);
  const [message, setMessage] = useState(null);

  // Fetch Archived Leads from API
  useEffect(() => {
    const fetchArchivedLeads = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/getArchivedLeads`);
        setArchivedData(response.data); // Set archived leads in state
      } catch (error) {
        console.error("Error fetching archived leads:", error);
      }
    };

    fetchArchivedLeads();
  }, []);

  const handleRestore = async (leadid) => {
    try {
      const response = await fetch(`${baseURL}/api/restoreByLeadId/${leadid}`, {
        method: 'PUT',
      });

      if (response.ok) {
        setArchivedData((prevData) => prevData.filter((item) => item.leadid !== leadid)); // Remove from archive list
        setMessage('The lead has been restored successfully.');
      } else {
        setMessage('Failed to restore the lead. Please try again later.');
      }
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error:", error);
      setMessage('An unexpected error occurred while restoring the lead.');
      setTimeout(() => setMessage(""), 3000);
    }
  };



  // Define columns for DataTable
  const columns = [
    { Header: "Lead ID", accessor: "leadid" },
    { Header: "Name", accessor: "name" },
    { Header: "Email", accessor: "email" },
    { Header: "Mobile", accessor: "phone_number" },
    // { Header: "Archived Date", accessor: "archived_at" },
    { Header: "Source", accessor: "sources" },
    { Header: "Customer Status", accessor: "customer_status" },
    {
      Header: "Actions",
      Cell: ({ row }) => (
        <div className="btn-group">
          <FaUndo
            style={{ color: "green", cursor: "pointer" }}
            onClick={() => handleRestore(row.original.leadid)}
          />

        </div>
      ),
    },


  ];

  return (
    <div className="salesViewLeadsContainer">
      <Navbar onToggleSidebar={setCollapsed} />
      <div className={`salesViewLeads ${collapsed ? "collapsed" : ""}`}>
        <h1>Archived Leads</h1>

        <div className="container mt-3">
          <DataTable columns={columns} data={archivedData} />
        </div>
      </div>
    </div>
  );
};

export default Archive;
