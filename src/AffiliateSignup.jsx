import React, { useState, useEffect } from "react";
import "./css/AffiliateSignup.css";

const AffiliateSignup = () => {
  const [countries, setCountries] = useState([]);
  const [captcha, setCaptcha] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const [userIP, setUserIP] = useState(""); // State for user IP address
  
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: "",
    lastName: "",
    company: "",
    email: "",
    contact: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    
    // Social/Communication
    socialContactType: "whatsapp",
    messengerAddress: "",
    
    // Professional Info
    education: [],
    gender: [],
    age: [],
    experience: [],
    trafficSources: "",
    
    // Terms & Captcha
    terms: false,
    captcha: ""
  });

  // Define required fields
  const requiredFields = [
    "firstName", "lastName", "email", "contact", "address", 
    "city", "state", "country", "zipCode", "messengerAddress", "captcha"
  ];

  // Check if all required fields are filled
  const isFormValid = () => {
    // Check all required text fields
    const allFieldsFilled = requiredFields.every(field => 
      formData[field] && formData[field].toString().trim() !== ""
    );
    
    // Check terms accepted
    const termsAccepted = formData.terms === true;
    
    // Check CAPTCHA matches
    const captchaValid = formData.captcha === captcha;
    
    return allFieldsFilled && termsAccepted && captchaValid;
  };

  // Get user IP address function
  const getUserIP = async () => {
    try {
      // Option 1: ipify.org (reliable)
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error("Error fetching IP:", error);
      
      // Option 2: Backup API if first one fails
      try {
        const backupResponse = await fetch('https://api.my-ip.io/ip.json');
        const backupData = await backupResponse.json();
        return backupData.ip;
      } catch (backupError) {
        console.error("Backup IP fetch also failed:", backupError);
        return "0.0.0.0"; // Default IP
      }
    }
  };

  // Generate CAPTCHA
  const generateCaptcha = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let captcha = "";
    for (let i = 0; i < 5; i++) {
      captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return captcha;
  };

  // Fetch countries and user IP on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      // Fetch countries
      try {
        const res = await fetch(
          "https://restcountries.com/v3.1/all?fields=name"
        );
        const data = await res.json();

        const countryList = data
          .map((c) => c.name.common)
          .sort((a, b) => a.localeCompare(b));

        setCountries(countryList);
      } catch (error) {
        console.error("Error fetching countries:", error);
      }

      // Fetch user IP
      const ip = await getUserIP();
      setUserIP(ip);
      console.log("User IP captured:", ip);
    };

    fetchInitialData();
    setCaptcha(generateCaptcha());
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      // Handle multi-select checkboxes
      if (["education", "gender", "age", "experience"].includes(name)) {
        if (checked) {
          setFormData({
            ...formData,
            [name]: [...formData[name], value]
          });
        } else {
          setFormData({
            ...formData,
            [name]: formData[name].filter(item => item !== value)
          });
        }
      } else {
        // Handle single checkbox (terms)
        setFormData({
          ...formData,
          [name]: checked
        });
      }
    } else {
      // Handle text inputs and selects
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Handle field blur for validation
  const handleBlur = (fieldName) => {
    setTouched({
      ...touched,
      [fieldName]: true
    });
  };

  // Handle CAPTCHA change separately
  const handleCaptchaChange = (e) => {
    setFormData({
      ...formData,
      captcha: e.target.value
    });
  };

  // Prepare API payload - arrays converted to comma-separated strings
  const prepareApiPayload = () => {
    // Convert arrays to comma-separated strings for the API
    const educationString = formData.education.join(", ");
    const genderString = formData.gender.join(", ");
    const ageString = formData.age.join(", ");
    const experienceString = formData.experience.join(", ");

    return {
      id: 0,
      externalID: "",
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      contact: formData.contact,
      company: formData.company,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      country: formData.country,
      zipCode: formData.zipCode,
      socialContactType: formData.socialContactType,
      messengerAddress: formData.messengerAddress,
      trafficSources: formData.trafficSources || "",
      education: educationString,
      gender: genderString,
      age: ageString,
      experience: experienceString,
      lastLogin: new Date().toISOString(),
      signupDate: new Date().toISOString(),
      signupIP: userIP, // User IP address added here
      signupSource: "web_form",
      postbackDelay: 0,
      defaultClickTokens: "",
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      currency: "USD",
      fallBackURL: "",
      apiAccess: false,
      apiKey: "",
      manager: "",
      privateNote: "",
      status: "pending",
      allowProfileUpdate: true,
      options: "",
      createdOn: new Date().toISOString(),
      createdBy: "system",
      modifiedOn: new Date().toISOString(),
      modifiedBy: "system",
      isActive: true
    };
  };

  // Reset form function
  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      company: "",
      email: "",
      contact: "",
      address: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
      socialContactType: "whatsapp",
      messengerAddress: "",
      education: [],      // Clear education checkboxes
      gender: [],         // Clear gender checkboxes
      age: [],            // Clear age checkboxes
      experience: [],     // Clear experience checkboxes
      trafficSources: "",
      terms: false,       // Uncheck terms checkbox
      captcha: ""
    });
    setTouched({});
    setCaptcha(generateCaptcha());
    setError("");
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched for validation
    const allTouched = {};
    requiredFields.forEach(field => {
      allTouched[field] = true;
    });
    setTouched(allTouched);

    // Validate CAPTCHA
    if (formData.captcha !== captcha) {
      setError("Captcha incorrect ❌");
      setCaptcha(generateCaptcha());
      setFormData({ ...formData, captcha: "" });
      return;
    }

    // Validate required fields
    if (!isFormValid()) {
      setError("Please fill all required fields ✅");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const payload = prepareApiPayload();
      
      console.log("Sending payload with IP:", payload);
      console.log("User IP being sent:", userIP);

      const response = await fetch('https://localhost:7029/api/Affiliates', {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("API Response:", result);
      alert("Registration Successful! ✅");
      
      // Reset form after successful submission
      resetForm();
      
    } catch (error) {
      console.error("Submission error:", error);
      setError(`Submission failed: ${error.message}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle CAPTCHA refresh
  const refreshCaptcha = () => {
    setCaptcha(generateCaptcha());
    setFormData({ ...formData, captcha: "" });
    setError("");
  };

  // Check if a field has error
  const hasError = (fieldName) => {
    return touched[fieldName] && (!formData[fieldName] || formData[fieldName].toString().trim() === "");
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2>Demo</h2>
        <h4>Register to Affiliate Portal</h4>

        <form onSubmit={handleSubmit}>
          <div className="grid">
            <div className="input-wrapper">
              <input 
                name="firstName" 
                placeholder="First Name" 
                value={formData.firstName}
                onChange={handleChange}
                onBlur={() => handleBlur("firstName")}
                className={hasError("firstName") ? "error-input" : ""}
                required 
              />
              {hasError("firstName") && <span className="error-text">First Name is required *</span>}
            </div>

            <div className="input-wrapper">
              <input 
                name="lastName" 
                placeholder="Last Name" 
                value={formData.lastName}
                onChange={handleChange}
                onBlur={() => handleBlur("lastName")}
                className={hasError("lastName") ? "error-input" : ""}
                required 
              />
              {hasError("lastName") && <span className="error-text">Last Name is required *</span>}
            </div>

            <div className="input-wrapper">
              <input 
                name="company" 
                placeholder="Company" 
                value={formData.company}
                onChange={handleChange}
                onBlur={() => handleBlur("company")}
              />
            </div>

            <div className="input-wrapper">
              <input 
                name="email" 
                type="email" 
                placeholder="Email" 
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleBlur("email")}
                className={hasError("email") ? "error-input" : ""}
                required 
              />
              {hasError("email") && <span className="error-text">Email is required *</span>}
            </div>

            <div className="input-wrapper">
              <input 
                name="contact" 
                placeholder="Mobile" 
                value={formData.contact}
                onChange={handleChange}
                onBlur={() => handleBlur("contact")}
                className={hasError("contact") ? "error-input" : ""}
                required 
              />
              {hasError("contact") && <span className="error-text">Mobile is required *</span>}
            </div>

            <div className="input-wrapper">
              <input 
                name="address" 
                placeholder="Address" 
                value={formData.address}
                onChange={handleChange}
                onBlur={() => handleBlur("address")}
                className={hasError("address") ? "error-input" : ""}
                required 
              />
              {hasError("address") && <span className="error-text">Address is required *</span>}
            </div>

            <div className="input-wrapper">
              <input 
                name="city" 
                placeholder="City" 
                value={formData.city}
                onChange={handleChange}
                onBlur={() => handleBlur("city")}
                className={hasError("city") ? "error-input" : ""}
                required 
              />
              {hasError("city") && <span className="error-text">City is required *</span>}
            </div>

            <div className="input-wrapper">
              <input 
                name="state" 
                placeholder="State" 
                value={formData.state}
                onChange={handleChange}
                onBlur={() => handleBlur("state")}
                className={hasError("state") ? "error-input" : ""}
                required 
              />
              {hasError("state") && <span className="error-text">State is required *</span>}
            </div>

            <div className="input-wrapper">
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                onBlur={() => handleBlur("country")}
                required
                className={`full-width ${hasError("country") ? "error-input" : ""}`}
              >
                <option value="">
                  {countries.length === 0 ? "Loading..." : "Select Country"}
                </option>
                {countries.map((country, index) => (
                  <option key={index} value={country}>
                    {country}
                  </option>
                ))}
              </select>
              {hasError("country") && <span className="error-text">Country is required *</span>}
            </div>

            <div className="input-wrapper">
              <input 
                name="zipCode" 
                placeholder="PIN Code" 
                value={formData.zipCode}
                onChange={handleChange}
                onBlur={() => handleBlur("zipCode")}
                className={hasError("zipCode") ? "error-input" : ""}
                required 
              />
              {hasError("zipCode") && <span className="error-text">PIN Code is required *</span>}
            </div>

            <div className="input-wrapper">
              <select name="socialContactType" value={formData.socialContactType} onChange={handleChange}>
                <option value="whatsapp">Whatsapp</option>
                <option value="telegram">Telegram</option>
                <option value="skype">Skype</option>
                <option value="wechat">WeChat</option>
              </select>
            </div>

            <div className="input-wrapper">
              <input 
                name="messengerAddress" 
                placeholder="Messenger Address" 
                value={formData.messengerAddress}
                onChange={handleChange}
                onBlur={() => handleBlur("messengerAddress")}
                className={hasError("messengerAddress") ? "error-input" : ""}
                required 
              />
              {hasError("messengerAddress") && <span className="error-text">Messenger Address is required *</span>}
            </div>

            <div className="input-wrapper">
              <input 
                name="trafficSources" 
                placeholder="Select Traffic Sources" 
                value={formData.trafficSources}
                onChange={handleChange}
                onBlur={() => handleBlur("trafficSources")}
              />
            </div>
          </div>

          <div className="section">
            <b>1. Education</b>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="education" 
                  value="Graduate" 
                  checked={formData.education.includes("Graduate")}
                  onChange={handleChange}
                /> 
                <span>Graduate</span>
              </label>
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="education" 
                  value="Post Graduate" 
                  checked={formData.education.includes("Post Graduate")}
                  onChange={handleChange}
                /> 
                <span>Post Graduate</span>
              </label>
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="education" 
                  value="Doctrate" 
                  checked={formData.education.includes("Doctrate")}
                  onChange={handleChange}
                /> 
                <span>Doctrate</span>
              </label>
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="education" 
                  value="High School" 
                  checked={formData.education.includes("High School")}
                  onChange={handleChange}
                /> 
                <span>High School</span>
              </label>
            </div>
          </div>

          <div className="section">
            <b>2. Gender</b>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="gender" 
                  value="Male" 
                  checked={formData.gender.includes("Male")}
                  onChange={handleChange}
                /> 
                <span>Male</span>
              </label>
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="gender" 
                  value="Female" 
                  checked={formData.gender.includes("Female")}
                  onChange={handleChange}
                /> 
                <span>Female</span>
              </label>
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="gender" 
                  value="Others" 
                  checked={formData.gender.includes("Others")}
                  onChange={handleChange}
                /> 
                <span>Others</span>
              </label>
            </div>
          </div>

          <div className="section">
            <b>3. Age</b>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="age" 
                  value="20-30" 
                  checked={formData.age.includes("20-30")}
                  onChange={handleChange}
                /> 
                <span>20-30</span>
              </label>
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="age" 
                  value="30-40" 
                  checked={formData.age.includes("30-40")}
                  onChange={handleChange}
                /> 
                <span>30-40</span>
              </label>
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="age" 
                  value="40-50" 
                  checked={formData.age.includes("40-50")}
                  onChange={handleChange}
                /> 
                <span>40-50</span>
              </label>
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="age" 
                  value="50-60" 
                  checked={formData.age.includes("50-60")}
                  onChange={handleChange}
                /> 
                <span>50-60</span>
              </label>
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="age" 
                  value="60-80" 
                  checked={formData.age.includes("60-80")}
                  onChange={handleChange}
                /> 
                <span>60-80</span>
              </label>
            </div>
          </div>

          <div className="section">
            <b>4. Experience</b>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="experience" 
                  value="Fresher" 
                  checked={formData.experience.includes("Fresher")}
                  onChange={handleChange}
                /> 
                <span>Fresher</span>
              </label>
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="experience" 
                  value="1-3 Years" 
                  checked={formData.experience.includes("1-3 Years")}
                  onChange={handleChange}
                /> 
                <span>1-3 Years</span>
              </label>
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="experience" 
                  value="3+ Years" 
                  checked={formData.experience.includes("3+ Years")}
                  onChange={handleChange}
                /> 
                <span>3+ Years</span>
              </label>
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="experience" 
                  value="more than 5 years" 
                  checked={formData.experience.includes("more than 5 years")}
                  onChange={handleChange}
                /> 
                <span>More than 5 years</span>
              </label>
            </div>
          </div>

          {/* CAPTCHA Section */}
          <div className="captcha-row">
            <div className="captcha-box">{captcha}</div>
            <div className="input-wrapper">
              <input
                name="captcha"
                placeholder="Enter Captcha"
                value={formData.captcha || ""}
                onChange={handleCaptchaChange}
                onBlur={() => handleBlur("captcha")}
                className={hasError("captcha") ? "error-input" : ""}
                required
              />
              {hasError("captcha") && <span className="error-text">Captcha is required *</span>}
            </div>
            <button type="button" onClick={refreshCaptcha} className="captcha-refresh">
              Refresh
            </button>
          </div>
          {error && <div className="error-message">{error}</div>}

          <div className="terms-row">
            <div className="terms-left">
              <input 
                type="checkbox" 
                name="terms" 
                checked={formData.terms}
                onChange={handleChange} 
                required 
              />
              <span>
                Agree the <a href="#">terms</a> and <a href="#">privacy policy</a>
              </span>
            </div>
            <button 
              type="submit" 
              className="submit-btn" 
              disabled={isLoading || !isFormValid()}
              style={{ opacity: (!isFormValid() || isLoading) ? 0.6 : 1 }}
            >
              {isLoading ? "Registering..." : "Register"}
            </button>
          </div>
        </form>

        <div className="footer">
          Already have an account? <a href="/">Login</a>
        </div>
      </div>
    </div>
  );
};

export default AffiliateSignup;