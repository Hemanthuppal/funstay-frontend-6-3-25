import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../Shared/Navbar/Navbar";
import axios from "axios";
import DataTable from "../../../Layout/Table/TableLayout";
import { baseURL } from "../../../Apiservices/Api";
import "bootstrap/dist/css/bootstrap.min.css";
// import "./Destinations.css";
import { FaEye, FaEdit, FaTrash, FaCopy } from "react-icons/fa";

const Destinations = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [destination, setDestination] = useState("");
  const [destinationsList, setDestinationsList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/destinations`);
      setDestinationsList(response.data);
    } catch (error) {
      console.error("Error fetching destinations:", error);
    }
  };

  const handleAddOrUpdateDestination = async () => {
    if (destination.trim() === "") return;

    try {
      if (editingId) {
        await axios.put(`${baseURL}/api/destinations/${editingId}`, {
          value: destination,
          label: destination,
        });
      } else {
        await axios.post(`${baseURL}/api/destinations`, {
          value: destination,
          label: destination,
        });
      }
      fetchDestinations();
      setDestination("");
      setEditingId(null);
    } catch (error) {
      console.error("Error saving destination:", error);
    }
  };

  const handleEditDestination = (id, label) => {
    setDestination(label);
    setEditingId(id);
  };

  const handleCancelEdit = () => {
    setDestination("");
    setEditingId(null);
  };

  const handleDeleteDestination = async (id) => {
    try {
      await axios.delete(`${baseURL}/api/destinations/${id}`);
      fetchDestinations();
    } catch (error) {
      console.error("Error deleting destination:", error);
    }
  };

  // Define columns for DataTable
  const columns = [
    { Header: "S.No", accessor: "serial" },
    { Header: "Destination", accessor: "label" },
    {
      Header: "Actions",
      Cell: ({ row }) => (
        <div className="btn-group">
  
          <FaTrash
            style={{ color: "#ff9966", cursor: "pointer",marginRight:"10px" }}
            onClick={() => handleDeleteDestination(row.original.id)}
          />
          <FaEdit
            style={{ color: "#ff9966", cursor: "pointer" }}
            onClick={() => handleEditDestination(row.original.id, row.original.label)}
          />
        </div>
      ),
    },
  ];

  // Format data for DataTable
  const data = destinationsList.map((dest, index) => ({
    serial: index + 1,
    id: dest.id,
    label: dest.label,
  }));

  return (
    <div className="salesViewLeadsContainer">
      <Navbar onToggleSidebar={setCollapsed} />
      <div className={`salesViewLeads ${collapsed ? "collapsed" : ""}`}>
        <h1>Destinations</h1>

        <div className="container mt-3">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter New Destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
                <button className="btn btn-success px-3" onClick={handleAddOrUpdateDestination}>
                  {editingId ? "Update" : "Add"}
                </button>
                {editingId && (
                  <button className="btn btn-secondary px-3" onClick={handleCancelEdit}>
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>


        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
};

export default Destinations;
