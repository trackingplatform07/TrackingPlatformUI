import React, { useState } from "react";
import "../css/UserModal.css";

const CreateUserModal = ({ onClose, onUserCreated }) => {

  const [form,setForm] = useState({
    firstName:"",
    lastName:"",
    email:"",
    passwordHash:"",
    role:"User"
  });

  const [errors,setErrors] = useState({});

  const handleChange = (e)=>{
    setForm({
      ...form,
      [e.target.name]:e.target.value
    })
  };

  const validate = () => {

    let newErrors = {};

    if(!form.firstName.trim()){
      newErrors.firstName = "First Name is required";
    }

    if(!form.lastName.trim()){
      newErrors.lastName = "Last Name is required";
    }

    if(!form.email){
      newErrors.email = "Email is required";
    }
    else if(!/\S+@\S+\.\S+/.test(form.email)){
      newErrors.email = "Invalid Email format";
    }

    if(!form.passwordHash){
      newErrors.passwordHash = "Password is required";
    }
    else if(form.passwordHash.length < 6){
      newErrors.passwordHash = "Password must be at least 6 characters";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const createUser = async () => {

    if(!validate()) return;

    const body = {

      id: crypto.randomUUID(),

      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      passwordHash: form.passwordHash,
      role: form.role,

      isActive: true,

      createdOn: new Date().toISOString(),
      createdBy: "admin",

      modifiedOn: new Date().toISOString(),
      modifiedBy: "admin",

      resetOtp: "",
      otpExpiry: new Date().toISOString()
    };

    try{

      const res = await fetch("https://localhost:7228/api/Users",{

        method:"POST",

        headers:{
          "Content-Type":"application/json"
        },

        body:JSON.stringify(body)

      });

      const newUser = await res.json();

      alert("User Created Successfully");

      if(onUserCreated){
        onUserCreated(newUser);
      }

      onClose();

    }catch(err){

      console.log(err);
      alert("Error creating user");

    }

  };


  return(

    <div className="modal show d-block modal-overlay">

      <div className="modal-dialog modal-lg modal-dialog-centered">

        <div className="modal-content shadow-lg border-0">

          <div className="modal-header">
            <h5 className="modal-title">Create User</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">

            <div className="row">

              <div className="col-md-6 mb-3">
                <label className="form-label">First Name</label>
                <input className="form-control" name="firstName" onChange={handleChange}/>
                {errors.firstName && <small className="text-danger">{errors.firstName}</small>}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Last Name</label>
                <input className="form-control" name="lastName" onChange={handleChange}/>
                {errors.lastName && <small className="text-danger">{errors.lastName}</small>}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Email</label>
                <input className="form-control" name="email" onChange={handleChange}/>
                {errors.email && <small className="text-danger">{errors.email}</small>}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Password</label>
                <input type="password" className="form-control" name="passwordHash" onChange={handleChange}/>
                {errors.passwordHash && <small className="text-danger">{errors.passwordHash}</small>}
              </div>

            </div>

          </div>

          <div className="modal-footer user-modal-footer">

            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>

            <button className="btn btn-primary btn-sm" onClick={createUser}>
              Submit
            </button>

          </div>

        </div>

      </div>

    </div>

  )

}

export default CreateUserModal;