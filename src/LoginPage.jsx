import React, { useState } from 'react';
import './css/LoginPage.css';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from './config';

const createCaptcha = () => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let code = '';
  const rotations = [];

  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
    rotations.push(Math.random() * 20 - 10);
  }

  return { code, rotations };
};

const LoginPage = () => {

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    user_type: 'Administrator', // Added default value
    captchaInput: ''
  });

  const [captchaData, setCaptchaData] = useState(() => createCaptcha());
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const generateCaptcha = () => {
    setCaptchaData(createCaptcha());
  };

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }

  };

  const validate = () => {

    let tempErrors = {};

    if (!formData.email) {
      tempErrors.email = 'Email is required';
    }
    else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Enter valid email';
    }

    if (!formData.password) {
      tempErrors.password = 'Password is required';
    }

    if (!formData.captchaInput) {
      tempErrors.captchaInput = 'Enter security code';
    }
    else if (formData.captchaInput !== captchaData.code) {
      tempErrors.captchaInput = 'Incorrect code';
    }

    setErrors(tempErrors);

    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    setIsSubmitting(true);
    setLoginError('');

    if (validate()) {

      try {

        const email = encodeURIComponent(formData.email);
        const password = encodeURIComponent(formData.password);
        const userType = encodeURIComponent(formData.user_type);

        // Fixed: Now using userType in the URL
        const url = `${API_BASE_URL}/api/Users/login?email=${email}&password=${password}&user_type=${userType}`;
        
        console.log('Login attempt with:', {
          email: formData.email,
          user_type: formData.user_type,
          url: url
        });

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {

          const data = await response.json();

          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data));
          console.log(data, 'login');
          navigate('/dashboard');

        }
        else {
          const errorData = await response.json().catch(() => ({}));
          setLoginError(errorData.message || 'Invalid email, password, or Login As');
          
          generateCaptcha();

          setFormData(prev => ({
            ...prev,
            captchaInput: ''
          }));

        }

      }
      catch (error) {

        console.error(error);
        setLoginError('Server connection failed');

      }
      finally {

        setIsSubmitting(false);

      }

    }
    else {

      setIsSubmitting(false);
      setLoginError('Please fill correct details');

      generateCaptcha();

      setFormData(prev => ({
        ...prev,
        captchaInput: ''
      }));

    }

  };

  return (

    <div className="login-container">
      <div className="container">
        <div className="row">
          
          {/* COL-MD-2 - Empty or Logo Section */}
          <div className="col-md-3">
            {/* You can add logo, branding, or leave empty */}
            <div className="left-sidebar">
              {/* Optional content */}
            </div>
          </div>

          {/* COL-MD-6 - Login Form */}
          <div className="col-md-6">
            <div className="login-card">
              <div className="login-header">
                <div className="brand-logo">Login Account</div>
              </div>

              <form className="login-form" onSubmit={handleSubmit}>
                {loginError && (
                  <div className="login-error-banner">{loginError}</div>
                )}
                
                {/* USER TYPE */}
                <div className="form-group">
                  <label>Login as</label>
                  <select
                    name="user_type"
                    className="form-control"
                    value={formData.user_type}
                    onChange={handleChange}
                  >
                    <option value="Administrator">Administrator</option>
                    <option value="Employee">Employee</option>
                    <option value="Affiliate">Affiliate</option>
                    <option value="Advertiser">Advertiser</option>
                  </select>
                </div>
                
                {/* EMAIL */}
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@company.com"
                  />
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>

                {/* PASSWORD */}
                <div className="form-group">
                  <label>Password</label>
                  <div className="password-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      className="toggle-password button-pass"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {errors.password && <span className="error-text">{errors.password}</span>}
                  
                  {/* FORGOT PASSWORD */}
                  <div className="forgot-password">
                    <Link to="/forgot-password">Forgot Password?</Link>
                  </div>
                </div>

                {/* CAPTCHA */}
                <div className="form-group captcha-group">
                  <label>Security Code</label>
                  <div className="captcha-container">
                    <div className="captcha-display">
                      {captchaData.code.split('').map((char, index) => (
                        <span
                          key={index}
                          style={{ transform: `rotate(${captchaData.rotations[index]}deg)` }}
                        >
                          {char}
                        </span>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="refresh-captcha"
                      onClick={generateCaptcha}
                    >
                      ↻
                    </button>
                  </div>
                  <input
                    type="text"
                    name="captchaInput"
                    value={formData.captchaInput}
                    onChange={handleChange}
                    placeholder="Enter code"
                  />
                  {errors.captchaInput && (
                    <span className="error-text">{errors.captchaInput}</span>
                  )}
                </div>

                {/* SUBMIT */}
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Signing In...' : 'Sign In'}
                </button>
              </form>

              {/* FOOTER */}
              <div className="login-footer">
                <p>
                  <Link className="create-user-link">
                    Powered by Offer18
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* COL-MD-4 - Additional Content (Info, Image, or Banner) */}
          <div className="col-md-3">
            <div className="right-sidebar">
              {/* Add any additional content here like info, features, or image */}
              <div className="info-card">
                     <h4>Don't have an account yet?</h4>
                     <button
                       className="signup-btn"
                       onClick={() => navigate("/affiliate-signup")}
                     >
                       Signup as Affiliate
                     </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

  );

};

export default LoginPage;