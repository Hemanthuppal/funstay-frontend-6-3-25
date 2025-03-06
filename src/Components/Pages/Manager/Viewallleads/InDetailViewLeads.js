import React, { useState, useEffect,useContext } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../../Shared/ManagerNavbar/Navbar";
import "./InDetailViewLeads.css";
import axios from "axios";
import { baseURL } from "../../../Apiservices/Api";
import { FaCopy } from "react-icons/fa";
import { ThemeContext } from "../../../Shared/Themes/ThemeContext";




const InDetailViewLeads = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { themeColor } = useContext(ThemeContext);
  const { leadid } = location.state;
  const [collapsed, setCollapsed] = useState(false);
  const [formData, setFormData] = useState({
    lead_type: "",
    name: "",
    email: "",
    country_code: "",
    phone_number: "",
    sources: "",
    origincity: "",
    destination: "",
    description: "",
    another_name: "",
    another_email: "",
    another_phone_number: "",
    corporate_id: "",
    primaryStatus: "",
    secondaryStatus: "",
    primarySource: "",
    secondarysource: "",
    channel: "",
    created_at: "",
  });
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setMessage("Copied to clipboard!");
      setTimeout(() => setMessage(""), 1000); // Optional: Show a message
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };
  useEffect(() => {
    const fetchLeadData = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/leads/${leadid}`);
        const leadData = response.data;

        setFormData((prev) => ({
          ...prev,
          leadid: leadData.leadid || "",
          lead_type: leadData.lead_type || "",
          leadcode: leadData.leadcode || "",
          name: leadData.name || "",
          email: leadData.email || "",
          country_code: leadData.country_code || "",
          phone_number: leadData.phone_number || "",
          origincity: leadData.origincity || "",
          destination: leadData.destination || "",
          description: leadData.description || "",
          another_name: leadData.another_name || "",
          another_email: leadData.another_email || "",
          another_phone_number: leadData.another_phone_number || "",
          corporate_id: leadData.corporate_id || "",
          primaryStatus: leadData.primaryStatus || "",
          secondaryStatus: leadData.secondaryStatus || "",
          primarySource: leadData.primarySource || "",
          secondarysource: leadData.secondarysource || "",
          channel: leadData.channel || "",
          created_at: leadData.created_at || "",
        }));
      } catch (err) {
        console.error("Error fetching lead data:", err);
        setError("Failed to fetch lead data.");
      }
    };

    if (leadid) {
      fetchLeadData();
    }
  }, [leadid]);

  return (
    <div className="indeatilleadcontainer">
      <Navbar onToggleSidebar={setCollapsed} />
      <div className={`indeatilleadcontent ${collapsed ? "collapsed" : ""}`}>
        <div className="indetail-container">
          <div className="card mt-4">
            <div className="card-body">
              <h2 className="lead-details-header" style={{ "--theme-color": themeColor }}>Lead Details</h2>
              {message && <div className="alert alert-info">{message}</div>}
              {leadid ? (
                <div className="row">
                  <div className="col-md-6">

                    <div className="mb-3 d-flex flex-wrap">
                      <span className="fw-bold me-2" style={{ minWidth: "150px" }}>
                        Lead ID:
                      </span>
                      <span>{formData.leadid}</span>
                    </div>
                    <div className="mb-3 d-flex flex-wrap">
                      <span className="fw-bold me-2" style={{ minWidth: "150px" }}>
                        Name:
                      </span>
                      <span>{formData.name}</span>
                    </div>
                    <div className="mb-3 d-flex flex-wrap">
                      <span className="fw-bold me-2" style={{ minWidth: "150px" }}>
                        Email:
                      </span>
                      <span>{formData.email}</span>
                      <FaCopy
                        style={{ marginLeft: "8px", cursor: "pointer", color: "#ff9966" }}
                        onClick={() => copyToClipboard(formData.email)}
                        title="Copy Email"
                      />
                    </div>

                    <div className="mb-3 d-flex flex-wrap">
  <span className="fw-bold me-2" style={{ minWidth: "150px" }}>
    Phone Number:
  </span>
  <a 
    href={`https://wa.me/${formData.country_code}${formData.phone_number}`} 
    target="_blank" 
    rel="noopener noreferrer"
    style={{ textDecoration: "none", color: "blue" }}
  >
    {formData.country_code}{formData.phone_number}
  </a>
  <FaCopy
    style={{ marginLeft: "8px", cursor: "pointer", color: "#ff9966" }}
    onClick={() => copyToClipboard(`${formData.country_code}${formData.phone_number}`)}
    title="Copy Phone Number"
  />
</div>

                    <div className="mb-3 d-flex flex-wrap">
                      <span className="fw-bold me-2" style={{ minWidth: "150px" }}>
                        Primary Source:
                      </span>
                      <span>{formData.primarySource}</span>
                    </div>
                    <div className="mb-3 d-flex flex-wrap">
                      <span className="fw-bold me-2" style={{ minWidth: "150px" }}>
                        Secondary Source:
                      </span>
                      <span>{formData.secondarysource}</span>
                    </div>
                    <div className="mb-3 d-flex flex-wrap">
                      <span className="fw-bold me-2" style={{ minWidth: "150px" }}>
                        Origin City:
                      </span>
                      <span>{formData.origincity}</span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3 d-flex flex-wrap">
                      <span className="fw-bold me-2" style={{ minWidth: "150px" }}>
                        Destination:
                      </span>
                      <span>{formData.destination}</span>
                    </div>

                    <div className="mb-3 d-flex flex-wrap">
                      <span className="fw-bold me-2" style={{ minWidth: "150px" }}>
                        Secondary Email:
                      </span>
                      <span>{formData.another_email}</span>
                    </div>
                    <div className="mb-3 d-flex flex-wrap">
                      <span className="fw-bold me-2" style={{ minWidth: "150px" }}>
                        Secondary Phone Number:
                      </span>
                      <span>{formData.another_phone_number}</span>
                    </div>

                    <div className="mb-3 d-flex flex-wrap">
                      <span className="fw-bold me-2" style={{ minWidth: "150px" }}>
                        Description:
                      </span>
                      <span>{formData.description}</span>
                    </div>
                    <div className="mb-3 d-flex flex-wrap">
                      <span className="fw-bold me-2" style={{ minWidth: "150px" }}>
                        Primary Status:
                      </span>
                      <span>{formData.primaryStatus}</span>
                    </div>
                    <div className="mb-3 d-flex flex-wrap">
                      <span className="fw-bold me-2" style={{ minWidth: "150px" }}>
                        Secondary Status:
                      </span>
                      <span>{formData.secondaryStatus}</span>
                    </div>
                    <div className="mb-3 d-flex flex-wrap">
                      <span className="fw-bold me-2" style={{ minWidth: "150px" }}>
                        channel:
                      </span>
                      <span>{formData.channel}</span>
                    </div>
                    <div className="mb-3 d-flex flex-wrap">
                      <span className="fw-bold me-2" style={{ minWidth: "150px" }}>
                        Created Date:
                      </span>
                      <span>{new Date(formData.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</span>
                    </div>

                  </div>
                </div>
              ) : (
                !error && <p>Loading lead details...</p>
              )}
            </div>
          </div>
          <div className="back-button mt-3">
            <button className="btn btn-secondary" onClick={() => navigate(-1)}>
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InDetailViewLeads;