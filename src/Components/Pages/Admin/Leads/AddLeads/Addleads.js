import React, { useState, useRef, useContext, useEffect } from "react";
import { getCountries, getCountryCallingCode } from 'libphonenumber-js';
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import "./AddLeads.css";
import Select from "react-select";
import Navbar from '../../../../Shared/Navbar/Navbar';
import { useNavigate } from "react-router-dom";
import { baseURL } from "../../../../Apiservices/Api";
import { AuthContext } from "../../../../AuthContext/AuthContext";

const DynamicForm = () => {
  const { authToken, userId, userName } = useContext(AuthContext);
  const [countryCodeOptions, setCountryCodeOptions] = useState([]);

  useEffect(() => {

    const countries = getCountries();
    const callingCodes = countries.map(
      (country) => `+${getCountryCallingCode(country)}`
    );
    const uniqueCodes = [...new Set(callingCodes)];


    uniqueCodes.sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)));

    setCountryCodeOptions(uniqueCodes);
  }, []);
  const [formData, setFormData] = useState({
    lead_type: "group",
    name: '',
    email: '',
    phone_number: '',
    country_code: '+91',
    primarySource: '',
    secondarysource: '',
    origincity: '',
    destination: [],
    another_name: '',
    another_email: '',
    another_phone_number: '',
    corporate_id: 1,
    description: '',
    assign_to_manager: "",
    managerid: '',

  });

  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const nameInputRef = useRef(null);
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [error, setError] = useState(null);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone_number") {
      const formattedValue = value.replace(/\D/g, "");
      if (formattedValue.length <= 10) {
        setFormData({ ...formData, [name]: formattedValue });
      }
    } else if (name === "managerid") {
      const selectedEmployeeId = Number(value);
      const selectedEmployee = managers.find(employee => employee.id === selectedEmployeeId);
      setFormData({
        ...formData,
        managerid: selectedEmployeeId,
        assign_to_manager: selectedEmployee ? selectedEmployee.name : '',
      });
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

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const response = await fetch(`${baseURL}/managers`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch managers");
        }
        const result = await response.json();
        setManagers(result.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching managers:", err.message);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchManagers();
  }, [authToken]);

  const validateEmail = (email) => {
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

  const handleSubmit = async (e, action = "save") => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Validate name (Required)
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

    const dataToSubmit = {
      ...formData,
      assign_to_manager: formData.assign_to_manager,
      manager_id: formData.managerid,
      admin: userName,
    };

    const formattedDestinations = formData.destination.map((dest) => dest.label); 

    try {
      const response = await axios.post(`${baseURL}/api/leads`, {
        ...formData,
        dataToSubmit,
        destination: formattedDestinations, // ✅ Send only labels to the backend
      });
      console.log(response.data);
      setMessage("Lead added successfully!");

      // Clear form after successful submission
      setFormData({
        lead_type: "group",
        name: '',
        email: '',
        phone_number: '',
        country_code: '+91',
        primarySource: '',
        secondarysource: '',
        another_name: '',
        another_email: '',
        another_phone_number: '',
        origincity: '',
        destination: [],
        description: '',
        managerid: "",
        assign_to_manager: "",
      });

      // Redirect if "Save & Close" was clicked
      if (action === "saveAndClose") {
        navigate("/a-view-lead");
      }
    } catch (error) {
      console.error("Error adding lead:", error);
      setMessage("Error: Failed to add lead. Please try again.");
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


    const handleSourceChange = (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });


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

            {emailError && <span style={{ color: "red", fontSize: "12px" }}>{emailError}</span>}
          </div>
        </div>
        <div className="addleads-input-group">
          <label>Phone Number<span style={{ color: "red" }}> *</span></label>
          <div style={{ display: "flex", alignItems: "center" }}>
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
              {countryCodeOptions.map(code => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>


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
              onBlur={(e) => {
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
          {phoneError && <span style={{ color: "red", fontSize: "12px" }}>{phoneError}</span>}
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
            <option value="Blog ">Blog</option>
            <option value="Community">Community</option>
            <option value="Purchased Leads">Purchased Leads</option>
            <option value="Social Media">Social Media</option>
            <option value="Google">Google</option>
            <option value="Meta">Meta</option>
            <option value="Other">Other</option>
          </select>
        </div>
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
        <div className="addleads-input-group">
          <label>Assign To</label>
          <select
            name="managerid"
            value={formData.managerid}
            onChange={handleChange}
          >
            <option value="">Select Employee</option>
            {managers.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>
        </div>


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
          {message && <div className="alert alert-info">{message}</div>} {/* Display message */}
          <form onSubmit={(e) => handleSubmit(e, "save")} className="addleads-form">
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