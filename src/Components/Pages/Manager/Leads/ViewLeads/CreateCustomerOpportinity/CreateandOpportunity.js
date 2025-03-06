import React, { useState, useEffect } from "react";
import "./CreateandOpportunity.css";
import axios from 'axios';
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../../../Shared/ManagerNavbar/Navbar";
import Select from "react-select";
import { baseURL } from "../../../../../Apiservices/Api";
import { getCountries, getCountryCallingCode } from "libphonenumber-js";


const CreateCustomerOpportunity = () => {
  const navigate = useNavigate();
  const { leadid } = useParams();
  const [activeTab, setActiveTab] = useState("customer");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [duration, setDuration] = useState("");
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
  const [customerData, setCustomerData] = useState({
    name: "",
    country_code: "",
    phone_number: "",
    email: "",
    travel_type: "",
    passport_number: "",
    preferred_contact_method: "",
    special_requirement: "",
    customer_status: "",
  });
  const [formData, setFormData] = useState({
    origincity: '',
    destination: [],
    adults_count: "",
    children_count: "",
    approx_budget: "",
    reminder_setting: "",
    notes: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [childrenAges, setChildrenAges] = useState([]);
  const [message, setMessage] = useState("");
  const [leadData, setLeadData] = useState(null);

  const handleTabClick = (tabName) => setActiveTab(tabName);



  const calculateDuration = (start, end) => {
    if (start && end) {
      const startDateObj = new Date(start);
      const endDateObj = new Date(end);
      const diffTime = endDateObj - startDateObj;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDuration(diffDays >= 0 ? diffDays : 0);
    } else {
      setDuration("");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (activeTab === "customer") {
      setCustomerData((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (name === "children_count") {
      const count = parseInt(value) || 0;
      setChildrenAges(Array.from({ length: count }, (_, i) => childrenAges[i] || ""));
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

  const handleChildAgeChange = (index, value) => {
    const updatedAges = [...childrenAges];
    updatedAges[index] = value;
    setChildrenAges(updatedAges);
  };

  const handleSubmitCustomer = async (navigateToPage = false) => {
    setLoading(true);
    setError(null);
    console.log("customerData", JSON.stringify(customerData, null, 2));
    try {
      const response = await axios.put(`${baseURL}/api/customers/update/by-lead/${leadid}`, customerData);
      console.log(JSON.stringify(response, null, 2));
      if (response.status === 200) {
        setMessage("Customer data submitted successfully!");
        setTimeout(() => setMessage(""), 3000);

        if (navigateToPage) {
          navigate("/m-view-leads");
        } else {
          setActiveTab("opportunity");
        }
      }
    } catch (err) {
      console.error("Error updating customer and lead data:", err);
      setError("Error updating customer and lead data.");
      setMessage("Failed to update customer and lead data. Please try again.");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchLeadData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${baseURL}/api/leads/${leadid}`);
        console.log("Fetched lead data:", JSON.stringify(response.data, null, 2));
        setLeadData(response.data);
        const LeadData = response.data;



        setFormData((prev) => ({
          ...prev, destination: LeadData.destination
            ? LeadData.destination.split(", ").map((item) => ({ value: item, label: item }))
            : [],
          notes: response.data.description || "",
          description: response.data.description || "",
          origincity: response.data.origincity || "",
        }));

      } catch (err) {
        console.error("Error fetching lead data:", err);
        setError("Error fetching lead data.");
      } finally {
        setLoading(false);
      }
    };

    const fetchCustomerData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${baseURL}/api/customers/by-lead/${leadid}`);
        console.log("Fetched customer data:", JSON.stringify(response.data, null, 2));
        setCustomerData(response.data);
        setFormData((prev) => ({
          ...prev,
          name: response.data.name || "",
          country_code: response.data.country_code || "",
          phone_number: response.data.phone_number || "",
          email: response.data.email || "",
          travel_type: response.data.travel_type || "",
          passport_number: response.data.passport_number || "",
          preferred_contact_method: response.data.preferred_contact_method || "",
          special_requirement: response.data.special_requirement || "",
        }));


        if (response.data.customer_status === "existing") {
          setActiveTab("opportunity");
        }
      } catch (err) {
        console.error("Error fetching customer data:", err);
        setError("Error fetching customer data.");
      } finally {
        setLoading(false);
      }
    };

    const fetchDestinationOptions = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/destinations`);
        const options = response.data.map((dest) => ({
          value: dest.value, // ✅ Ensure it's { value, label }
          label: dest.label,
        }));
        setDestinationOptions(options);
      } catch (error) {
        console.error("Error fetching destinations:", error);
      }
    };

    fetchLeadData();
    fetchCustomerData();
    fetchDestinationOptions();
  }, [leadid]);

  const [destinationOptions, setDestinationOptions] = useState([]);
  const handleMultiSelectChange = (selectedOptions) => {
    setFormData((prev) => ({
      ...prev,
      destination: selectedOptions || [], // ✅ Always an array, never undefined
    }));
  };

  const handleSubmitOpportunity = async (isSaveAndClose = false) => {
    setLoading(true);
    setError(null);

    if (!formData.origincity || !formData.destination || !startDate || !endDate) {
      setMessage(" Required fields must be filled in.");
      setTimeout(() => setMessage(""), 3000);
      setLoading(false);
      return;
    }

    const opportunityData = {
      leadid: leadid,
      customerid: customerData.id,
      origincity: formData.origincity,
      destination: formData.destination.length
      ? formData.destination.map((item) => item.value).join(", ")
      : "",
      start_date: startDate,
      end_date: endDate,
      duration: duration,
      adults_count: formData.adults_count,
      children_count: formData.children_count,
      child_ages: childrenAges.join(","),
      approx_budget: formData.approx_budget,
      notes: formData.notes,
      reminder_setting: formData.reminder_setting,
    };

    console.log("Opportunity data being submitted:", JSON.stringify(opportunityData, null, 2));

    try {
      const response = await axios.post(`${baseURL}/api/opportunities/create`, opportunityData);
      if (response.status === 201) {
        setMessage("Opportunity created successfully!");
        setTimeout(() => setMessage(""), 3000);

        if (!isSaveAndClose) {
          navigate("/m-potential-leads"); // Default navigation
        }

        return true; // Success
      }
    } catch (err) {
      console.error("Error creating opportunity:", err);
      setError("Error creating opportunity. Please try again.");
      setMessage("Failed to create opportunity. Please try again.");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="salesViewLeadsContainer">
      <Navbar onToggleSidebar={setCollapsed} />
      <div className={`salesViewLeads ${collapsed ? "collapsed" : ""}`}>
        <div className="createcustomer-form-container">
          <h2 className="createcustomer-form-header">
            {customerData.customer_status === "existing" ? "Customer and Opportunity" : "Create Customer and Opportunity"}
          </h2>
          {message && <div className="alert alert-info">{message}</div>}

          <div className="createcustomer-tabs">
            <button
              className={`createcustomer-tab-button ${activeTab === "customer" ? "active" : ""}`}
              onClick={() => handleTabClick("customer")}
            >
              {customerData.customer_status === "existing" ? "Customer Details" : "Create Customer"}
            </button>
            <button
              className={`createcustomer-tab-button ${activeTab === "opportunity" ? "active" : ""}`}
              onClick={() => handleTabClick("opportunity")}
            >
              Create Opportunity
            </button>
          </div>


          <div className={`createcustomer-tab-content ${activeTab === "customer" ? "active" : ""}`}>
            <div className="createcustomer-form-grid">
              <div className="createcustomer-input-group">
                <label>Name</label>
                <input type="text" name="name" value={customerData.name} onChange={handleChange} />
              </div>
              <div className="createcustomer-input-group">
                <label>
                  Mobile
                </label>
                <div style={{ display: "flex", alignItems: "center" }}>

                  <select
                    name="country_code"
                    value={customerData.country_code || "+91"}
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


                  <input
                    type="text"
                    name="phone_number"
                    placeholder="Enter Mobile Number"
                    value={customerData.phone_number || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*$/.test(value)) {
                        handleChange(e);
                      }
                    }}

                    style={{
                      flex: 1,
                      padding: "5px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                    }}
                    required
                  />
                </div>


              </div>

              <div className="createcustomer-input-group">
                <label>Email ID</label>
                <input type="email" name="email" value={customerData.email} onChange={handleChange} />
              </div>
              <div className="createcustomer-input-group">
                <label>Type of Travel</label>
                <input type="text" name="travel_type" value={customerData.travel_type} onChange={handleChange} />
              </div>

              <div className="createcustomer-input-group">
                <label>Preferred Contact Method</label>
                <select
                  name="preferred_contact_method"
                  value={customerData.preferred_contact_method}
                  onChange={handleChange}
                >
                  <option value="">Select a contact method</option>
                  <option value="Email">Email</option>
                  <option value="Phone">Phone</option>
                  <option value="WhatsApp">WhatsApp</option>
                </select>
              </div>
              <div className="createcustomer-input-group full-width">
                <label>Special Requirement</label>
                <textarea
                  name="special_requirement"
                  value={customerData.special_requirement}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>
          </div>

          <div className={`createcustomer-tab-content ${activeTab === "opportunity" ? "active" : ""}`}>
            <div className="createcustomer-form-grid">
              <div className="createcustomer-input-group">
                <label>Origin City<span style={{ color: "red" }}> *</span></label>
                <input
                  type="text"
                  id="origincity"
                  name="origincity"
                  value={formData.origincity}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="createcustomer-input-group">
                <label>Destination<span style={{ color: "red" }}> *</span></label>
                <Select
                  isMulti
                  name="destination"
                  options={destinationOptions} // ✅ Use fetched options
                  value={formData.destination}
                  onChange={handleMultiSelectChange}
                />
              </div>
              <div className="createcustomer-input-group">
                <label>Start Date<span style={{ color: "red" }}> *</span></label>
                <input
                  type="date"
                  value={startDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    const newStartDate = e.target.value;
                    setStartDate(newStartDate);
                    calculateDuration(newStartDate, endDate);
                  }}
                  required
                />
              </div>
              <div className="createcustomer-input-group">
                <label>End Date<span style={{ color: "red" }}> *</span></label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate || new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    const newEndDate = e.target.value;
                    setEndDate(newEndDate);
                    calculateDuration(startDate, newEndDate);
                  }}
                  required
                />
              </div>

              <div className="createcustomer-input-group">
                <label>Duration (Nights)</label>
                <input
                  type="number"
                  value={duration ? parseInt(duration) : ""}
                  onChange={(e) => {
                    const newDuration = parseInt(e.target.value) || 0;
                    setDuration(newDuration);
                    if (startDate) {
                      const newEndDate = new Date(startDate);
                      newEndDate.setDate(newEndDate.getDate() + newDuration);
                      setEndDate(newEndDate.toISOString().split("T")[0]);
                    }
                  }}
                  required
                />
              </div>

              <div className="createcustomer-input-group">
                <label>No of Adults</label>
                <input
                  type="number"
                  name="adults_count"
                  value={formData.adults_count}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </div>
              <div className="createcustomer-input-group">
                <label>No of Children</label>
                <input
                  type="number"
                  name="children_count"
                  value={formData.children_count}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </div>

              {Array.from({ length: formData.children_count || 0 }, (_, index) => (
                <div className="createcustomer-input-group" key={index}>
                  <label>Child Age {index + 1}</label>
                  <select
                    value={childrenAges[index] || ""}
                    onChange={(e) => handleChildAgeChange(index, e.target.value)}
                  >
                    <option value="">Select Age</option>
                    {Array.from({ length: 12 }, (_, age) => (
                      <option key={age} value={age + 1}>{age + 1}</option>
                    ))}
                  </select>
                </div>
              ))}

              <div className="createcustomer-input-group">
                <label>Approx Budget</label>
                <input
                  type="number"
                  name="approx_budget"
                  value={formData.approx_budget}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </div>
              <div className="createcustomer-input-group full-width">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="createcustomer-input-group">
                <label>Reminder Setting</label>
                <input
                  type="datetime-local"
                  name="reminder_setting"
                  min={new Date().toISOString().slice(0, 16)}
                  max={startDate ? new Date(startDate).toISOString().slice(0, 16) : ""}
                  value={formData.reminder_setting}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="createcustomer-form-footer">
            <button className="createcustomer-btn createcustomer-close-btn" onClick={() => navigate(-1)}>
              Back
            </button>
            {/* Save Button */}
            <button
              className="createcustomer-btn createcustomer-submit-btn"
              onClick={async () => {
                if (activeTab === "customer") {
                  await handleSubmitCustomer(); // Save Customer
                } else {
                  await handleSubmitOpportunity(); // Save Opportunity
                }
              }}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save & Close"}
            </button>

            {/* Save & Close Button */}
            {/* <button
              className="btn btn-success"
              onClick={async () => {
                if (activeTab === "customer") {
                  const success = await handleSubmitCustomer(true); // Pass true for Save & Close
                  if (success) navigate("/m-view-leads");
                } else {
                  const success = await handleSubmitOpportunity(true);
                  if (success) navigate("/m-potential-leads");
                }
              }}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save & Close"}
            </button> */}
          </div>

          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default CreateCustomerOpportunity;
