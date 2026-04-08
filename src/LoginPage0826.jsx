import React, { useState } from 'react';
import './css/LoginPage.css';
import { useNavigate } from 'react-router-dom';
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
    setFormData({ ...formData, [name]: value });
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.email) {
      tempErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      tempErrors.password = 'Password is required';
    }

    if (!formData.captchaInput) {
      tempErrors.captchaInput = 'Please enter the security code';
    } else if (formData.captchaInput !== captchaData.code) {
      tempErrors.captchaInput = 'Incorrect security code';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError(''); // Clear previous top-level errors
    
    if (validate()) {
      try {
        const email = encodeURIComponent(formData.email);
        const password = encodeURIComponent(formData.password);
        const url = `${API_BASE_URL}/api/Users/login?email=${email}&password=${password}`;

        const response = await fetch(url, {
          method: 'POST',
        });

        if (response.ok) {
          navigate('/dashboard');
        } else {
          const errorText = await response.text();
          setLoginError(errorText || 'Login failed. Please check your credentials.');
          generateCaptcha();
          setFormData({ ...formData, captchaInput: '' });
        }
      } catch (error) {
        console.error('Login request failed:', error);
        setLoginError('Login failed. Could not connect to the server.');
        generateCaptcha();
        setFormData({ ...formData, captchaInput: '' });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(false);
      setLoginError('Login failed. Please fill in the correct details.');
      // Refresh captcha on failed attempt for security
      generateCaptcha();
      setFormData({ ...formData, captchaInput: '' });
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="brand-logo">Login Account</div>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {loginError && (
            <div className="login-error-banner">{loginError}</div>
          )}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@company.com"
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={errors.password ? 'error' : ''}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-group captcha-group">
            <label htmlFor="captchaInput">Security Verification</label>
            <div className="captcha-container">
              <div className="captcha-display">
                {captchaData.code.split('').map((char, index) => (
                  <span key={index} style={{ transform: `rotate(${captchaData.rotations[index] ?? 0}deg)` }}>{char}</span>
                ))}
              </div>
              <button type="button" className="refresh-captcha" onClick={generateCaptcha} title="Refresh Code">
                &#x21bb;
              </button>
            </div>
            <input
              type="text"
              id="captchaInput"
              name="captchaInput"
              value={formData.captchaInput}
              onChange={handleChange}
              placeholder="Enter the code above"
              className={errors.captchaInput ? 'error' : ''}
            />
            {errors.captchaInput && <span className="error-text">{errors.captchaInput}</span>}
          </div>

          <div className="form-actions">
            <div className="remember-me">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Remember me</label>
            </div>
            <a href="#" className="forgot-link">Forgot password?</a>
          </div>

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <p>Don't have an account? <a href="#">Create an account</a></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
