import React,{useState} from "react";

const EditUserModal = ({user,onClose,onSave})=>{

const [form,setForm] = useState({
firstName:user.firstName || "",
lastName:user.lastName || "",
email:user.email || "",
role:user.role || "User",
isActive:user.isActive || false
})

const handleChange=(e)=>{
setForm({
...form,
[e.target.name]:e.target.value
})
}

const handleToggle=(field)=>{
setForm({
...form,
[field]:!form[field]
})
}

const save=()=>{
onSave({
...user,
...form
})
}

return(

<div className="modal show d-block">
<div className="modal-dialog modal-lg">
<div className="modal-content p-4">

<h4 className="mb-4">Update User</h4>

{/* User Detail */}

<div className="row mb-3">

<div className="col-md-4">
<label>First Name</label>
<input
type="text"
className="form-control"
name="firstName"
value={form.firstName}
onChange={handleChange}
/>
</div>

<div className="col-md-4">
<label>Last Name</label>
<input
type="text"
className="form-control"
name="lastName"
value={form.lastName}
onChange={handleChange}
/>
</div>

<div className="col-md-4">
<label>Email</label>
<input
type="text"
className="form-control"
name="email"
value={form.email}
onChange={handleChange}
/>
</div>

</div>


{/* Role */}

<div className="mb-3">

<label>Role</label>

<select
className="form-control"
name="role"
value={form.role}
onChange={handleChange}
>
<option>User</option>
<option>Admin</option>
<option>Manager</option>
</select>

</div>


{/* Toggles */}

<div className="d-flex justify-content-between align-items-center mb-4">

<div className="form-check form-switch">
<input
className="form-check-input"
type="checkbox"
checked={form.isActive}
onChange={()=>handleToggle("isActive")}
/>
<label className="form-check-label">
Is Active
</label>
</div>

</div>


{/* Buttons */}

<div className="text-end">

<button
className="btn btn-success me-2"
onClick={save}
>
Save
</button>

<button
className="btn btn-secondary"
onClick={onClose}
>
Cancel
</button>

</div>

</div>
</div>
</div>

)

}

export default EditUserModal