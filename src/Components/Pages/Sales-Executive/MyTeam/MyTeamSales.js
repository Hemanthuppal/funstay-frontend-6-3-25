import React, { useState, useEffect, useContext } from "react";
import DataTable from "./../../../Layout/Table/TableLayout"; // Import DataTable component
import Navbar from "../../../Shared/Sales-ExecutiveNavbar/Navbar";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import "./MyTeamSales.css";
import { AuthContext } from "../../../../Components/AuthContext/AuthContext";
import axios from "axios";
import { baseURL } from "../../../Apiservices/Api";

const MyTeamSales = () => {
  const { userId } = useContext(AuthContext); // Get the userId from context
  const [collapsed, setCollapsed] = useState(false);
  const [managerData, setManagerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setError("User ID is missing");
      setLoading(false);
      return;
    }

    axios
      .get(`${baseURL}/${userId}`)
      .then((response) => {
        console.log("API Response:", response.data); // Debugging: Check API data
        setManagerData(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data: ", err);
        setError("Failed to fetch data.");
        setLoading(false);
      });
  }, [userId]);

  // Columns for DataTable component
  const columns = React.useMemo(
    () => [
      {
        Header: "S.no",
        accessor: (_row, index) => index + 1,
      },
      {
        Header: "Name",
        accessor: "name",
      },
      {
        Header: "Mobile",
        accessor: "mobile",
      },
      {
        Header: "Email",
        accessor: "email",
      },
      {
        Header: "Designation",
        accessor: "designation",
      },
    ],
    []
  );

  // Handle Loading and Error states
  if (loading) {
    return <div>Loading data...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  // Prepare data for the table (Check if managerData exists)
  const data =
    managerData && managerData.manager
      ? [
          {
            employeeId: managerData.manager?.id || "N/A",
            name: managerData.manager?.name || "N/A",
            mobile: managerData.manager?.mobile || "N/A",
            email: managerData.manager?.email || "N/A",
            designation: "Manager - Sales & Operations",
          },
          ...(managerData.assignedEmployees
            ? managerData.assignedEmployees.map((emp) => ({
                employeeId: emp?.id || "N/A",
                name: emp?.name || "N/A",
                mobile: emp?.mobile || "N/A",
                email: emp?.email || "N/A",
                designation: "Associate - Sales & Operations",
              }))
            : []),
        ]
      : [];

  return (
    <div className="salesmyteamcontainer">
      <Navbar onToggleSidebar={setCollapsed} />
      <div className={`salesmyteam ${collapsed ? "collapsed" : ""}`}>
        <div className="Sales-myteam-container mb-5">
          <div className="Sales-myteam-table-container">
            <h3 className="d-flex justify-content-between align-items-center"></h3>
            <DataTable columns={columns} data={data} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTeamSales;
