import React, { useState, useEffect ,useContext} from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import Select from "react-select";
import Navbar from "../../../../Shared/Navbar/Navbar";
import { useNavigate } from "react-router-dom";
import { Form, Row, Col } from 'react-bootstrap';
import './EditOppLead.css';
import { useLocation } from "react-router-dom";
import { baseURL } from "../../../../Apiservices/Api";
import { getCountries, getCountryCallingCode } from "libphonenumber-js";
import { ThemeContext } from "../../../../Shared/Themes/ThemeContext";

const EditOppLead = () => {
  const location = useLocation();
  const { leadid } = location.state;
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [countryCodeOptions, setCountryCodeOptions] = useState([]);
  const { themeColor } = useContext(ThemeContext);


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
    lead_type: "",
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
    destination: [], 
    start_date: '',
    end_date: '',
    duration: '',
    adults_count: '',
    children_count: '',
    child_ages: [],
    approx_budget: '',

    notes: '',
    comments: '',
    reminder_setting: '',
    opportunity_status1: '',
    opportunity_status2: '',
    primarySource: '',
    secondarysource: '',
  });
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchLeadData = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/get-lead-data/${leadid}`);
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
          corporate_id: leadData.corporate_id || '',
          primaryStatus: leadData.primaryStatus || '',
          secondaryStatus: leadData.secondaryStatus || '',
          opportunity_status1: leadData.opportunity_status1 || '',
          opportunity_status2: leadData.opportunity_status2 || '',
          primarySource: leadData.primarySource || '',
          secondarysource: leadData.secondarysource || '',
        }));
      } catch (err) {
        console.error("Error fetching lead data:", err);
        setError("Failed to fetch lead data.");
      }
    };

    const fetchOpportunityData = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/get-lead-data/${leadid}`);
        const opportunityData = response.data;
        const formattedStartDate = opportunityData.start_date ? new Date(opportunityData.start_date).toISOString().split('T')[0] : '';
        const formattedEndDate = opportunityData.end_date ? new Date(opportunityData.end_date).toISOString().split('T')[0] : '';
        const reminder = opportunityData.reminder_setting ? new Date(opportunityData.reminder_setting).toISOString().slice(0, 16) : '';
        setFormData((prev) => ({
          ...prev,
          origincity: opportunityData.origincity || '',
          destination: opportunityData.destination
            ? opportunityData.destination.split(", ").map((item) => ({ value: item, label: item }))
            : [],
          start_date: formattedStartDate,
          end_date: formattedEndDate,
          duration: opportunityData.duration || '',
          adults_count: opportunityData.adults_count || '',
          children_count: opportunityData.children_count || '',
          child_ages: opportunityData.child_ages ? opportunityData.child_ages.split(',') : [],
          approx_budget: opportunityData.approx_budget || '',
          notes: opportunityData.notes || '',
          reminder_setting: reminder,
        }));
      } catch (err) {
        console.error("Error fetching opportunity data:", err);
        setError("Failed to fetch opportunity data.");
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
    fetchOpportunityData();
    fetchDestinationOptions();
  }, [leadid]);

 const [destinationOptions, setDestinationOptions] = useState([]);


  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "start_date") {
      const newStartDate = new Date(value);
      const today = new Date();


      if (newStartDate <= today) {
        setError("Start date must be a future date.");
        return;
      } else {
        setError(null);
      }


      setFormData((prev) => ({
        ...prev,
        start_date: value,
        end_date: value,
        duration: '0',
      }));
    } else if (name === "end_date") {
      const newEndDate = new Date(value);
      const startDate = new Date(formData.start_date);


      if (newEndDate < startDate) {
        setError("End date must be after start date.");
        return;
      } else {
        setError(null);
      }

      setFormData((prev) => ({
        ...prev,
        end_date: value,
        duration: Math.ceil((newEndDate - startDate) / (1000 * 60 * 60 * 24)),
      }));
    } else if (name === "reminder_setting") {
      const reminderDate = new Date(value);
      const startDate = new Date(formData.start_date);


      if (reminderDate > startDate) {
        setError("Reminder setting must be before the start date.");
        return;
      } else {
        setError(null);
      }

      setFormData((prev) => ({
        ...prev,
        reminder_setting: value,
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }

    if (name === "primaryStatus") {
      setFormData({ ...formData, [name]: value, secondaryStatus: "" });
    }

    if (name === "opportunity_status1") {
      setFormData({ ...formData, [name]: value, opportunity_status2: "" });
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

  const handleChildrenCountChange = (e) => {
    const { value } = e.target;
    const count = parseInt(value, 10);
    const newChildAges = Array.from({ length: count }, (_, i) => formData.child_ages[i] || '');

    setFormData((prev) => ({
      ...prev,
      children_count: count,
      child_ages: newChildAges,
    }));
  };

  const handleChildAgeChange = (index, value) => {
    const newChildAges = [...formData.child_ages];
    newChildAges[index] = value;

    setFormData((prev) => ({
      ...prev,
      child_ages: newChildAges,
    }));
  };

  const subDropdownOptions = {
    Referral: ["Grade 3", "Grade 2", "Grade 1"],
    Community: ["BNI", "Rotary", "Lions", "Association", "Others"],
    "Purchased Leads": ["Tripcrafter", "Others"],
    "Social Media": [" Linkedin", "Others"],
    Google: ["Google Organic", "Google Ad", "Youtube Organic", "Youtube Paid"],
    Meta: [
      "Facebook Organic",
      "Instagram Organic",
      "Facebook (Paid)",
      "Instagram (Paid)",
      "Others",
    ],
  };

  const handleMultiSelectChange = (selectedOptions) => {
    setFormData((prev) => ({
      ...prev,
      destination: selectedOptions || [], // ✅ Always an array, never undefined
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      corporate_id: formData.corporate_id,
      primaryStatus: formData.primaryStatus,
      secondaryStatus: formData.secondaryStatus,
      opportunity_status1: formData.opportunity_status1,
      opportunity_status2: formData.opportunity_status2,
      primarySource: formData.primarySource,
      secondarysource: formData.secondarysource,
    };

    const opportunityData = {
      origincity: formData.origincity,
      destination: formData.destination.length
        ? formData.destination.map((item) => item.value).join(", ")
        : "",
      start_date: formData.start_date,
      end_date: formData.end_date,
      duration: formData.duration,
      adults_count: formData.adults_count,
      children_count: formData.children_count,
      child_ages: formData.child_ages.join(','),
      approx_budget: formData.approx_budget,

      notes: formData.notes,
      comments: formData.comments,
      reminder_setting: formData.reminder_setting,
    };
    console.log(JSON.stringify(leadData, null, 2));
    console.log(JSON.stringify(opportunityData, null, 2));
    try {
      await axios.put(`${baseURL}/api/leads/${leadid}`, leadData);
      await axios.put(`${baseURL}/api/opportunities/${leadid}`, opportunityData);
      setMessage('Updated Successfully');
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error updating data:", error);
      setError("Failed to update data.");
    }
  };

  const [loading, setLoading] = useState(false);
  const handleSubmitAndClose = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setLoading(true);

    try {
      await handleSubmit(e); // Call the original handleSubmit function
      navigate("/a-potential-leads"); // Redirect to leads list page after saving
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  const [dropdownOptions] = useState({
    primary: ["In Progress", "Confirmed", "Lost", "Duplicate"],
    secondary: {
      "In Progress": [
        "Understood Requirement",
        "Sent first quote",
        "Amendment Requested",
        "Sent amended quote",
        "Negotiation Process",
        "Verbally Confirmed-Awaiting token amount",
      ],
      Confirmed: ["Upcoming Trip", "Ongoing Trip", "Trip Completed"],
      Lost: [
        "Plan Cancelled",
        "Plan Postponed",
        "High Quote",
        "Low Budget",
        "No response",
        "Options not available",
        "just checking price",
        "Booked from other source",
        "Delay in quote",
        "Concern about reliability/trust",
        "Did not like payment terms",
        "Did not like cancellation policy",
        "Booked different option from us",
      ],
      Duplicate: ["Duplicate"],

    },
  });

  return (
    <div className="salesViewLeadsContainer">
      <Navbar onToggleSidebar={setCollapsed} />
      <div className={`salesViewLeads ${collapsed ? "collapsed" : ""}`}>
        <div className="editleads-form-container">
          <h2 className="editleads-form-header" style={{ "--theme-color": themeColor }}>Edit Customer and Opportunity Details</h2>
          <form className="editleads-form" onSubmit={handleSubmit}>
            <div className="s-edit-opp-lead-FormLable">
              <h5>Customer Details</h5>
              {message && <div className="alert alert-info">{message}</div>}
              <Row>

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

                      <Form.Select
                        name="country_code"
                        value={formData.country_code || "+91"}
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


                      <Form.Control
                        type="text"
                        name="phone_number"
                        placeholder="Enter Phone Number"
                        value={formData.phone_number || ""}
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
              </Row>
              <hr />
              <h5>Opportunity Details</h5>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Origin City</Form.Label>
                    <Form.Control
                      type="text"
                      id="origincity"
                      name="origincity"
                      value={formData.origincity}
                      onChange={handleChange}
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
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleChange}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>End Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleChange}
                      min={formData.start_date}
                    />
                  </Form.Group>
                </Col>


                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Duration (Nights)</Form.Label>
                    <Form.Control
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={(e) => {
                        const newDuration = parseInt(e.target.value) || 0;
                        setFormData((prev) => ({
                          ...prev,
                          duration: newDuration,
                          end_date: new Date(new Date(formData.start_date).getTime() + newDuration * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Update end date based on duration
                        }));
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>No of Adults</Form.Label>
                    <Form.Control
                      type="number"
                      name="adults_count"
                      value={formData.adults_count}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Children Count</Form.Label>
                    <Form.Control
                      type="number"
                      name="children_count"
                      value={formData.children_count}
                      onChange={handleChildrenCountChange}
                      min="0"
                    />
                  </Form.Group>
                </Col>
                {Array.from({ length: formData.children_count }).map((_, index) => (
                  <Col md={4} key={index}>
                    <Form.Group className="mb-3">
                      <Form.Label>Child Age {index + 1}</Form.Label>
                      <Form.Select
                        value={formData.child_ages[index] || ''}
                        onChange={(e) => handleChildAgeChange(index, e.target.value)}
                      >
                        <option value="">Select Age</option>
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                ))}
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Approx Budget</Form.Label>
                    <Form.Control
                      type="number"
                      name="approx_budget"
                      value={formData.approx_budget}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Reminder Setting</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      name="reminder_setting"
                      value={formData.reminder_setting}
                      onChange={handleChange}
                      min={new Date().toISOString().slice(0, 16)}
                      max={formData.start_date ? new Date(formData.start_date).toISOString().slice(0, 16) : ""}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Opportunity Status 1</Form.Label>
                    <Form.Select
                      name="opportunity_status1"
                      value={formData.opportunity_status1}
                      onChange={handleChange}
                    >
                      {!formData.opportunity_status1 && <option value="">Select Status</option>}
                      {dropdownOptions.primary.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Opportunity Status 2</Form.Label>
                    <Form.Select
                      name="opportunity_status2"
                      value={formData.opportunity_status2}
                      onChange={handleChange}
                      disabled={!formData.opportunity_status1}
                    >
                      {!formData.opportunity_status2 && <option value="">Select Status</option>}
                      {formData.opportunity_status1 && dropdownOptions.secondary[formData.opportunity_status1] ? (
                        dropdownOptions.secondary[formData.opportunity_status1].map((status) => (
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

              </Row>
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Notes</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>
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
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditOppLead;