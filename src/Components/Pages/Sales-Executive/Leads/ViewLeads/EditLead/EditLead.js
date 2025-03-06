import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import Select from "react-select";
import Navbar from "../../../../../Shared/Sales-ExecutiveNavbar/Navbar";
import { useNavigate, useLocation } from "react-router-dom";
import { Form, Row, Col } from 'react-bootstrap';
import './EditLead.css';

import { baseURL } from "../../../../../Apiservices/Api";
import { getCountries, getCountryCallingCode } from "libphonenumber-js";

const EditOppLead = () => {
  const location = useLocation();
  const { leadid } = location.state;
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [message, setMessage] = useState("");
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
    lead_type: '',
    name: '',
    country_code: '',
    phone_number: '',
    email: '',
    sources: '',
    description: '',
    another_name: '',
    another_email: '',
    another_phone_number: '',
    corporate_id: '',
    primaryStatus: '',
    secondaryStatus: '',
    origincity: '',
    destination: [], // Now stored as an array
    primarySource: '',
    secondarysource: '',
  });
  const [error, setError] = useState(null);
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

  const [destinationOptions, setDestinationOptions] = useState([]); // Multi-select options

  useEffect(() => {
    const fetchLeadData = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/leads/${leadid}`);
        const leadData = response.data;

        setFormData((prev) => ({
          ...prev,
          lead_type: leadData.lead_type || '',
          name: leadData.name || '',
          country_code: leadData.country_code || '',
          phone_number: leadData.phone_number || '',
          email: leadData.email || '',
          sources: leadData.sources || '',
          description: leadData.description || '',
          another_name: leadData.another_name || '',
          another_email: leadData.another_email || '',
          another_phone_number: leadData.another_phone_number || '',
          origincity: leadData.origincity || '',
          destination: leadData.destination
            ? leadData.destination.split(", ").map((item) => ({ value: item, label: item }))
            : [],
          corporate_id: leadData.corporate_id || '',
          primaryStatus: leadData.primaryStatus || '',
          secondaryStatus: leadData.secondaryStatus || '',
          primarySource: leadData.primarySource || '',
          secondarysource: leadData.secondarysource || '',
        }));
      } catch (err) {
        console.error("Error fetching lead data:", err);
        setError("Failed to fetch lead data.");
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
    fetchDestinationOptions(); // ✅ Fetch available destinations on mount
  }, [leadid]);

  const handleMultiSelectChange = (selectedOptions) => {
    setFormData((prev) => ({
      ...prev,
      destination: selectedOptions || [], // ✅ Always an array, never undefined
    }));
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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

  const handleFormSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    const leadData = {
      lead_type: formData.lead_type,
      name: formData.name,
      country_code: formData.country_code,
      phone_number: formData.phone_number,
      email: formData.email,
      sources: formData.sources,
      description: formData.description,
      another_name: formData.another_name,
      another_email: formData.another_email,
      another_phone_number: formData.another_phone_number,
      origincity: formData.origincity,
      destination: formData.destination.length
        ? formData.destination.map((item) => item.value).join(", ")
        : "",
      corporate_id: formData.corporate_id,
      primaryStatus: formData.primaryStatus,
      secondaryStatus: formData.secondaryStatus,
      primarySource: formData.primarySource,
      secondarysource: formData.secondarysource,
    };

    console.log(JSON.stringify(leadData, null, 2));

    try {
      await axios.put(`${baseURL}/api/update-lead-customer/${leadid}`, leadData);
      setMessage("Updated Successfully");
      setTimeout(() => {
        setMessage("");
      }, 2000);
    } catch (error) {
      console.error("Error updating lead:", error);
      setError("Failed to update lead.");
    } finally {
      setLoading(false);
    }
  };


  const [loading, setLoading] = useState(false);

  const handleSubmitAndClose = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setLoading(true);

    try {
      await handleFormSubmit(e); // Call the original handleSubmit function
      navigate("/View-lead"); // Redirect to leads list page after saving
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  const [leadDropdownOptions] = useState({
    primary: ["New", "No Response", "Duplicate", "False Lead", "Junk", "Plan Cancelled"],
    secondary: {
      New: ["Yet to Contact", "Not picking up call", "Asked to call later"],
      "No Response": [],
      Duplicate: [],
      "False Lead": [],
      Junk: ["Plan Cancelled", "Plan Delayed", "Already Booked", "Others"],
      "Plan Cancelled": [],
    },
  });

  return (
    <div className="salesViewLeadsContainer">
      <Navbar onToggleSidebar={setCollapsed} />
      <div className={`salesViewLeads ${collapsed ? "collapsed" : ""}`}>
        <div className="editlead-form-container">
          <h2 className="editlead-form-header">Edit Leads</h2>

          <div className="editlead-form">
            <Form className="s-edit-opp-lead-FormLable" onSubmit={handleFormSubmit}>
              {/* Customer Details Section */}
              <h5>Lead Details</h5>
              {message && <div className="alert alert-info">{message}</div>} {/* Display message */}
              {error && <div className="alert alert-danger">{error}</div>} {/* Display error message */}

              <Row>
                {/* <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Lead Type</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.lead_type}
                      onChange={handleChange}
                      readOnly
                    />
                  </Form.Group>
                </Col> */}
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Phone Number
                    </Form.Label>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {/* Country Code Dropdown */}
                      <Form.Select
                        name="country_code"
                        value={formData.country_code || "+91"} // Default value
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
                      </Form.Select>

                      {/* Phone Number Input */}
                      <Form.Control
                        type="text"
                        name="phone_number"
                        placeholder="Enter Phone Number"
                        value={formData.phone_number || ""} // Prevents undefined errors
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

                    {/* Validation Error Message */}

                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Primary Source</Form.Label>
                    <Form.Select
                      name="primarySource"
                      value={formData.primarySource}
                      onChange={handleChange}
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
                    </Form.Select>
                  </Form.Group>
                </Col>
                {subDropdownOptions[formData.primarySource] && (
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>{formData.primarySource} SubSource</Form.Label>
                      <Form.Select
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
                      </Form.Select>
                    </Form.Group>
                  </Col>
                )}
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Origin City</Form.Label>
                    <Form.Control
                      type="text"
                      id="origincity"
                      name="origincity"
                      value={formData.origincity}
                      onChange={handleChange}
                      placeholder="Enter Origin City"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Destination</Form.Label>
                    <Select
                      isMulti
                      name="destination"
                      options={destinationOptions} // ✅ Use fetched options
                      value={formData.destination}
                      onChange={handleMultiSelectChange}
                    />
                  </Form.Group>
                </Col>
                {/* <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Another Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="another_name"
                      value={formData.another_name}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col> */}
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Secondary Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="another_email"
                      value={formData.another_email}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Secondary Phone Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="another_phone_number"
                      value={formData.another_phone_number}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                {/* <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Corporate ID</Form.Label>
                    <Form.Control
                      type="text"
                      name="corporate_id"
                      value={formData.corporate_id}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col> */}
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Primary Status</Form.Label>
                    <Form.Select
                      name="primaryStatus"
                      value={formData.primaryStatus}
                      onChange={handleChange}
                    >
                      {!formData.primaryStatus && <option value="">Select Status</option>}
                      {leadDropdownOptions.primary.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Secondary Status</Form.Label>
                    <Form.Select
                      name="secondaryStatus"
                      value={formData.secondaryStatus}
                      onChange={handleChange}
                      disabled={
                        !formData.primaryStatus ||
                        ["No Response", "Duplicate", "False Lead", "Plan Cancelled"].includes(formData.primaryStatus)
                      }
                    >
                      {!formData.secondaryStatus && <option value="">Select Status</option>}
                      {formData.primaryStatus && leadDropdownOptions.secondary[formData.primaryStatus] ? (
                        leadDropdownOptions.secondary[formData.primaryStatus].map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>No options available</option>
                      )}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <div className="addleads-form-footer">
                <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                  Back
                </button>
                <button className="btn btn-primary" type="submit">
                  Submit
                </button>
                <button
                  className="btn btn-success"
                  type="button"
                  disabled={loading}
                  onClick={handleSubmitAndClose}
                >
                  {loading ? "Submiting..." : "Submit & Close"}
                </button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditOppLead;