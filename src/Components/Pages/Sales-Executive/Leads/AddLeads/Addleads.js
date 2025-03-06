import React, { useState, useRef, useContext, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import Select from "react-select";
import "./AddLeads.css";
import Navbar from "../../../../Shared/Sales-ExecutiveNavbar/Navbar";
import { useNavigate } from "react-router-dom";
import { baseURL } from "../../../../Apiservices/Api";
import { AuthContext } from '../../../../AuthContext/AuthContext';
import { getCountries, getCountryCallingCode } from 'libphonenumber-js';

const DynamicForm = () => {
  const [countryCodeOptions, setCountryCodeOptions] = useState([]);
  useEffect(() => {
    // Get all country codes and their calling codes
    const countries = getCountries();
    const callingCodes = countries.map(
      (country) => `+${getCountryCallingCode(country)}`
    );
    const uniqueCodes = [...new Set(callingCodes)]; // Remove duplicates

    // Sort numerically
    uniqueCodes.sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)));

    setCountryCodeOptions(uniqueCodes);
  }, []);
  const { userId, userName, userMobile, userEmail, userRole, assignManager, managerId, } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    lead_type: "group",
    name: '',
    email: '',
    phone_number: '',
    country_code: '+91', // Default country code
    primarySource: '',
    secondarysource: '',
    origincity: '',
    destination: [], // Now correctly initialized as an array
    another_name: '',
    another_email: '',
    another_phone_number: '',
    corporate_id: 1,
    description: '',
    assignedSalesId: userId,
    assignedSalesName: userName,
    assign_to_manager: assignManager,
    managerid: managerId,
    employee_id: null
  });

  console.log(userId, userName, userMobile, userEmail, userRole, assignManager, managerId,);
  const [message, setMessage] = useState(""); // State for success/error message
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const nameInputRef = useRef(null);
  const [phoneError, setPhoneError] = useState(""); // State for phone number error
  const [emailError, setEmailError] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone_number") {
      // Allow only numeric input and limit to 10 digits
      const formattedValue = value.replace(/\D/g, ""); // Remove non-numeric characters
      if (formattedValue.length <= 10) {
        setFormData({ ...formData, [name]: formattedValue });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  
      useEffect(() => {
      const loadScript = (url, callback) => {
        let script = document.createElement("script");
        script.src = url;
        script.async = true;
        script.defer = true;
        script.onload = callback;
        document.body.appendChild(script);
      };
  
      loadScript(
        "https://maps.googleapis.com/maps/api/js?key=AIzaSyB-AttzsuR48YIyyItx6x2JSN_aigxcC0E&libraries=places",
        () => {
          if (window.google) {
            const autocomplete = new window.google.maps.places.Autocomplete(
              document.getElementById("origincity"),
              { types: ["(cities)"] }
            );
  
            autocomplete.addListener("place_changed", () => {
              const place = autocomplete.getPlace();
              if (place && place.address_components) {
                let city = "", state = "", country = "";
                place.address_components.forEach((component) => {
                  if (component.types.includes("locality")) {
                    city = component.long_name;
                  } else if (component.types.includes("administrative_area_level_1")) {
                    state = component.long_name;
                  } else if (component.types.includes("country")) {
                    country = component.long_name;
                  }
                });
                handleChange({ target: { name: "origincity", value: `${city}, ${state}, ${country}` } });
              }
            });
          }
        }
      );
    }, [handleChange]);

  const validateEmail = (email) => {
    // Basic email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const [destinationOptions, setDestinationOptions] = useState([]);

  // Fetch destination options when the component mounts
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/destinations`);
        setDestinationOptions(response.data);
      } catch (error) {
        console.error("Error fetching destinations:", error);
      }
    };

    fetchDestinations();
  }, []);


  const handleDestinationChange = (selectedOptions) => {
    setFormData((prevData) => ({
      ...prevData,
      destination: selectedOptions, // ✅ Ensure destination is updated properly
    }));
  };

  console.log(userId, userName, userMobile, userEmail, userRole, assignManager, managerId,);

  const handleSubmit = async (e, action = "save") => {
    setLoading(true);
    e.preventDefault();
    setMessage(""); // Clear previous messages

    if (!formData.name.trim()) {
      setNameError("Name is required.");
      setLoading(false);
      return;
    }



    // Validate email
    if (!validateEmail(formData.email)) {
      setEmailError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    // Validate phone number
    if (formData.phone_number.length !== 10) {
      setPhoneError("Phone number must be exactly 10 digits.");
      setLoading(false);
      return;
    }
    const formattedDestinations = formData.destination.map((dest) => dest.label);

    try {
      const response = await axios.post(`${baseURL}/api/leads`, {
        ...formData,
        destination: formattedDestinations, // ✅ Send only labels to the backend
      });
      console.log(response.data);
      console.log(JSON.stringify(formData));
      // Set success message
      setMessage("Lead added successfully!");
      setTimeout(() => setMessage(""), 3000);

      // Reset form data
      setFormData({
        name: '',
        email: '',
        phone_number: '',
        country_code: '+91', // Reset to default country code
        primarySource: '',
        secondarysource: '',
        another_name: '',
        another_email: '',
        another_phone_number: '',
        origincity: '',
        destination: [],
        description: '',
      });
      if (action === "saveAndClose") {
        navigate("/View-lead");
      }
    } catch (error) {
      console.error("Error adding lead:", error);
      // Set error message
      setMessage("Error: Failed to add lead. Please try again.");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  };


  const renderForm = () => {
    const subDropdownOptions = {
      Referral: ["Grade 3", "Grade 2", "Grade 1"],
      Corporate: ["BIW", "Others"],
      Community: ["BNI", "Rotary", "Lions", "Association", "Others"],
      "Purchased Leads": ["Tripcrafter", "Others"],
      "Social Media": ["Linkedin", "Others"],
      Google: ["Google Organic", "Google Ad", "Youtube Organic", "Youtube Paid"],
      Meta: [
        "Facebook Organic",
        "Instagram Organic",
        "Facebook (Paid)",
        "Instagram (Paid)",
        "Others",
      ],
    };

    // Handle changes in the main dropdown
    const handleSourceChange = (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });

      // Clear the subdropdown selection when a new main dropdown is selected
      if (name === "primarySource") {
        setFormData({ ...formData, [name]: value, secondarysource: "" });
      }
    };


    return (
      <div className="addleads-form-grid">
        <div className="addleads-input-group">
          <label>
            Name<span style={{ color: "red" }}> *</span>
          </label>
          <input
            type="text"
            name="name"
            placeholder="Enter Name"
            value={formData.name}
            onChange={handleChange}
            ref={nameInputRef}
            required
            autoFocus
            onBlur={() => {
              if (!formData.name.trim()) {
                setNameError("Please enter a valid name.");
              } else {
                setNameError("");
              }
            }}
            className={nameError ? "error-input" : ""} // Add class if error exists
          />
          {nameError && <span style={{ color: "red", fontSize: "12px" }}>{nameError}</span>}
        </div>
        <div className="addleads-input-group">
          <label>Email<span style={{ color: "red" }}> *</span></label>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <input
              type="email"
              name="email"
              placeholder="Enter Email"
              value={formData.email}
              onChange={handleChange}
              required
              onBlur={() => {
                if (!validateEmail(formData.email)) {
                  setEmailError("Please enter a valid email address.");
                } else {
                  setEmailError("");
                }
              }}
            />
            {/* Show email error message below the input */}
            {emailError && <span style={{ color: "red", fontSize: "12px" }}>{emailError}</span>}
          </div>
        </div>
        <div className="addleads-input-group">
          <label>
            Phone Number<span style={{ color: "red" }}> *</span>
          </label>
          <div style={{ display: "flex", alignItems: "center" }}>
            {/* Country Code Dropdown */}
            <select
              name="country_code"
              value={formData.country_code}
              onChange={handleChange}
              style={{
                width: "80px",
                marginRight: "10px",
                padding: "5px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            >
              {countryCodeOptions.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>

            {/* Phone Number Input */}
            <input
              type="text"
              name="phone_number"
              placeholder="Enter Phone Number"
              value={formData.phone_number}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value)) {
                  handleChange(e);
                }
              }}
              onBlur={() => {
                if (formData.phone_number.length !== 10) {
                  setPhoneError("Please enter a valid number.");
                } else {
                  setPhoneError("");
                }
              }}
              style={{
                flex: 1,
                padding: "5px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
              maxLength={10}
              required
            />
          </div>

          {/* Error Message */}
          {phoneError && (
            <span style={{ color: "red", fontSize: "12px" }}>{phoneError}</span>
          )}
        </div>
        <div className="addleads-input-group">
          <label>Primary Source</label>
          <select
            name="primarySource"
            value={formData.primarySource}
            onChange={handleSourceChange}
          >
            <option value="">Select Source</option>
            <option value="Referral">Referral/Repeat</option>
            <option value="Corporate">Corporate</option>
            <option value="Partner Promotion">Partner Promotion</option>
            <option value="Media Coverage">Media Coverage</option>
            <option value="Blog">Blog</option>
            <option value="Community">Community</option>
            <option value="Purchased Leads">Purchased Leads</option>
            <option value="Social Media">Social Media</option>
            <option value="Google">Google</option>
            <option value="Meta">Meta</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Conditionally render the subdropdown */}
        {formData.primarySource && subDropdownOptions[formData.primarySource] && (
          <div className="addleads-input-group">
            <label>{formData.primarySource} SubSource</label>
            <select
              name="secondarysource"
              value={formData.secondarysource || ""}
              onChange={handleChange}
            >
              <option value="">Select SubSource</option>
              {subDropdownOptions[formData.primarySource].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}
        {/* <div className="addleads-input-group">
          <label>Another Name</label>
          <input
            type="text"
            name="another_name"
            placeholder="Enter Another Name"
            value={formData.another_name}
            onChange={handleChange}
          />
        </div> */}
        <div className="addleads-input-group">
          <label>Secondary Email</label>
          <input
            type="email"
            name="another_email"
            placeholder="Enter Another Email"
            value={formData.another_email}
            onChange={handleChange}
          />
        </div>
        <div className="addleads-input-group">
          <label>Secondary Phone Number</label>
          <input
            type="text"
            name="another_phone_number"
            placeholder="Enter Another Phone Number"
            value={formData.another_phone_number}
            onChange={handleChange}
            maxLength={10}
          />
        </div>
        <div className="addleads-input-group">
          <label>Origin City</label>
          <input
            type="text"
            id="origincity"
            name="origincity"
            placeholder="Enter Origin City"
            value={formData.origincity}
            onChange={handleChange}
          />
        </div>
        <div className="addleads-input-group">
          <label>Destination</label>
          <Select
            isMulti
            options={destinationOptions} // 
            value={formData.destination}
            onChange={handleDestinationChange}
          />
        </div>
        <div className="addleads-input-group full-width">
          <label>Description</label>
          <textarea
            type="text"
            name="description"
            placeholder="Enter Description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="salesViewLeadsContainer">
      <Navbar onToggleSidebar={setCollapsed} />
      <div className={`salesViewLeads ${collapsed ? "collapsed" : ""}`}>
        <div className="addleads-form-container">
          <h2 className="addleads-form-header">Add Leads</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          {message && <div className="alert alert-info">{message}</div>}{/* Display message */}
          <form onSubmit={handleSubmit} className="addleads-form">
            {renderForm()}
            <div className="addleads-form-footer">
              <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                Back
              </button>
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                className="btn btn-success"
                type="button"
                disabled={loading}
                onClick={(e) => handleSubmit(e, "saveAndClose")}
              >
                {loading ? "Saving..." : "Save & Close"}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default DynamicForm;

