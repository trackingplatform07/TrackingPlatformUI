import React, { useState } from "react";
import "./css/CreateUser.css";
import { API_BASE_URL } from "./config";
import { useNavigate, Link } from "react-router-dom";

const CreateUser = () => {

  const navigate = useNavigate();

  const [formData,setFormData] = useState({
    firstName:"",
    lastName:"",
    email:"",
    password:"",
    confirmPassword:"",
    role:""
  });

  const [errors,setErrors] = useState({});
  const [message,setMessage] = useState("");
  const [error,setError] = useState("");

  const handleChange = (e) =>{
    const {name,value} = e.target;

    setFormData({...formData,[name]:value});

    // typing ke time error clear
    if(errors[name]){
      setErrors({...errors,[name]:""});
    }
  };

  const validate = () =>{

    let tempErrors = {};

    if(!formData.firstName.trim())
      tempErrors.firstName = "First name is required";

    if(!formData.lastName.trim())
      tempErrors.lastName = "Last name is required";

    if(!formData.email)
      tempErrors.email = "Email is required";
    else if(!/\S+@\S+\.\S+/.test(formData.email))
      tempErrors.email = "Please enter a valid email address";

    if(!formData.password)
      tempErrors.password = "Password is required";
    else if(formData.password.length < 6)
      tempErrors.password = "Password must be at least 6 characters";

    if(!formData.confirmPassword)
      tempErrors.confirmPassword = "Confirm password is required";
    else if(formData.password !== formData.confirmPassword)
      tempErrors.confirmPassword = "Passwords do not match";

    if(!formData.role)
      tempErrors.role = "Please select a role";

    setErrors(tempErrors);

    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) =>{
    e.preventDefault();

    if(!validate()) return;

    setError("");
    setMessage("");

    try{

      const res = await fetch(`${API_BASE_URL}/api/Users`,{
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          "accept":"*/*"
        },
        body:JSON.stringify({
          firstName:formData.firstName,
          lastName:formData.lastName,
          email:formData.email,
          passwordHash:formData.password,
          role:formData.role,
          createdBy:"Self"
        })
      });

      if(res.ok){

        setMessage("Account created successfully. Redirecting to login...");

        setTimeout(()=>{
          navigate("/login");
        },2000);

      }else{

       // const text = await res.text();

        setError(
          text ||
          "Request failed. Please check your First Name, Last Name, Email and Password."
        );

      }

    }catch(err){
      setError("Server error. Please try again later.");
    }

  };

  return (

    <div className="create-user-container">

      <div className="create-user-card">

        <h2>Create Account</h2>

        {message && <div className="success">{message}</div>}
        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>

          <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleChange}
          />
          {errors.firstName && <span className="error-text">{errors.firstName}</span>}

          <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          />
          {errors.lastName && <span className="error-text">{errors.lastName}</span>}

          <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          />
          {errors.email && <span className="error-text">{errors.email}</span>}

          <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          />
          {errors.password && <span className="error-text">{errors.password}</span>}

          <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          />
          {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}

          <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          >
            <option value="">Select Role</option>
            <option value="Admin">Admin</option>
            <option value="User">User</option>
          </select>
          {errors.role && <span className="error-text">{errors.role}</span>}

          <button type="submit">
            Create Account
          </button>

        </form>

        <div className="login-link">
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>

      </div>

    </div>

  );

};

export default CreateUser;