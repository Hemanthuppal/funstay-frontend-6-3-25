import { useEffect, useState } from "react"; // Import React hooks
import { getCountries, getCountryCallingCode } from "libphonenumber-js";

const AddLeadsComponent = ( handleChange ) => {
  const [countryCodeOptions, setCountryCodeOptions] = useState([]);
  const [phoneError, setPhoneError] = useState("");
  const [formData, setFormData] = useState({
    country_code: "+1", // Default country code
    phone_number: "",
  });
  

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

  return (
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
          required
        />
      </div>

      {/* Error Message */}
      {phoneError && (
        <span style={{ color: "red", fontSize: "12px" }}>{phoneError}</span>
      )}
    </div>
  );
};

export default AddLeadsComponent;
