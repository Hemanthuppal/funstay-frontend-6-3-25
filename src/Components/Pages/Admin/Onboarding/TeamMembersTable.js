import React, { useState, useEffect } from "react";
import DataTable from "./../../../Layout/Table/TableLayout";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../../Shared/Navbar/Navbar";
import axios from "axios";
import { baseURL } from "../../../Apiservices/Api";

const TeamMembers = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);

  const { id } = location.state || {};
  console.log("id", id);
 
  useEffect(() => {
    console.log("id", id); // Log the id to check if it's defined
    if (id) {
      axios
        .get(`${baseURL}/addmanager/${id}`) // Ensure this endpoint is correct
        .then((response) => {
          // Check if the response is valid
          if (response.data) {
            setTeamMembers([response.data]); // Wrap in an array if needed
            console.log("Team member data fetched:", response.data);
          } else {
            alert("No data found for this ID.");
          }
        })
        .catch((error) => {
          console.error("Error fetching team member data: ", error);
          alert("Failed to fetch team member data. Please try again later.");
        });
    } else {
      alert("No ID provided to fetch team member data.");
    }
  }, [id]);

  // Define columns for the DataTable.
// Define columns for the DataTable including all JSON keys.
const memberColumns = [
  {
    Header: "ID",
    accessor: "id",
    Cell: ({ value }) => `EMP${String(value).padStart(5, "0")}`,
  },
  { Header: "Salutation", accessor: "salutation" },
  { Header: "Employee Name", accessor: "employee_name" },
  { Header: "Employee Status", accessor: "employee_status" },
  { Header: "Office Mail", accessor: "office_mail" },
  { Header: "Office Mobile Number", accessor: "office_mobile_number" },
  { Header: "Employee ID", accessor: "employee_id" },
  { Header: "Personal Mobile Number", accessor: "personal_mobile_number" },
  { Header: "Designation", accessor: "designation" },
  { Header: "Department", accessor: "department" },
  { Header: "Role", accessor: "role" },
  { Header: "Assign Manager", accessor: "assign_manager" },
  { Header: "Manager ID", accessor: "managerid" },
  { Header: "Reporting To", accessor: "reporting_to" },
  { Header: "Father's Name", accessor: "fathers_name" },
  {
    Header: "Date of Birth",
    accessor: "dob",
    Cell: ({ value }) => new Date(value).toLocaleDateString(),
  },
  { Header: "Gender", accessor: "gender" },
  { Header: "Marital Status", accessor: "marital_status" },
  { Header: "Aadhar", accessor: "aadhar" },
  { Header: "PAN", accessor: "pan" },
  { Header: "Religion", accessor: "religion" },
  { Header: "Blood Group", accessor: "blood_group" },
  { Header: "Personal Email", accessor: "personal_email" },
  { Header: "CTC", accessor: "ctc" },
  { Header: "GSTIN", accessor: "gstin" },
  { Header: "Emergency Contact", accessor: "emergency_contact" },
  { Header: "Branch", accessor: "branch" },
  { Header: "UAN Number", accessor: "uan_number" },
  { Header: "ESI Number", accessor: "esi_number" },
  {
    Header: "Date of Joining",
    accessor: "date_of_joining",
    Cell: ({ value }) => new Date(value).toLocaleDateString(),
  },
  { Header: "Check In Time", accessor: "check_in_time" },
  { Header: "Check Out Time", accessor: "check_out_time" },
  {
    Header: "Date of Exit",
    accessor: "date_of_exit",
    Cell: ({ value }) => new Date(value).toLocaleDateString(),
  },
  { Header: "Password", accessor: "password" },
  { Header: "Upload Image", accessor: "upload_image" },
  { Header: "Address Line 1", accessor: "address_line_1" },
  { Header: "Address Line 2", accessor: "address_line_2" },
  { Header: "City", accessor: "city" },
  { Header: "Pincode", accessor: "pincode" },
  { Header: "Select State", accessor: "select_state" },
  { Header: "Country", accessor: "country" },
  { Header: "Present Address Line 1", accessor: "present_address_line_1" },
  { Header: "Present Address Line 2", accessor: "present_address_line_2" },
  { Header: "Present City", accessor: "present_city" },
  { Header: "Present Pincode", accessor: "present_pincode" },
  { Header: "Present Select State", accessor: "present_select_state" },
  { Header: "Present Country", accessor: "present_country" },
  { Header: "Account Number", accessor: "account_number" },
  { Header: "Account Name", accessor: "account_name" },
  { Header: "Bank Name", accessor: "bank_name" },
  { Header: "IFSC Code", accessor: "ifsc_code" },
  { Header: "Account Type", accessor: "account_type" },
  { Header: "Branch Name", accessor: "branch_name" },
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
            <h2 className="text-center">Team Members</h2>
            <DataTable columns={memberColumns} data={teamMembers} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamMembers;
