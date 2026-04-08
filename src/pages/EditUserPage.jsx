import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/EditUserPage.css";

const EditUserPage = () => {

const { id } = useParams();
const navigate = useNavigate();

const [isSidebarCollapsed,setIsSidebarCollapsed] = useState(false)
const [activeTab,setActiveTab] = useState("details")

const [form,setForm] = useState({
firstName:"",
lastName:"",
email:"",
role:"User",
isActive:true
})

const [permissions,setPermissions] = useState([])
const [selectedPermissions,setSelectedPermissions] = useState([])



/* LOAD DATA */

useEffect(()=>{

const loadData = async()=>{

try{

/* LOAD ALL PERMISSIONS */

const permissionRes = await fetch("https://localhost:7228/api/Users/permissions")
const permissionData = await permissionRes.json()

setPermissions(permissionData)


/* LOAD USER */

const userRes = await fetch(`https://localhost:7228/api/Users/${id}`)
const userData = await userRes.json()

setForm({
firstName:userData.firstName || "",
lastName:userData.lastName || "",
email:userData.email || "",
role:userData.role || "User",
isActive:userData.isActive ?? true
})

/* USER PERMISSION IDS */

const ids = userData.permissions?.map(p=>p.permissionId) || []

setSelectedPermissions(ids)

}
catch(err){

console.log(err)

}

}

loadData()

},[id])



/* INPUT CHANGE */

const handleChange=(e)=>{
setForm({
...form,
[e.target.name]:e.target.value
})
}



/* TOGGLE ACTIVE */

const toggleActive=()=>{
setForm({
...form,
isActive:!form.isActive
})
}



/* CHECKBOX TOGGLE */

const togglePermission=(permissionId)=>{

setSelectedPermissions(prev=>{

if(prev.includes(permissionId)){
return prev.filter(id=>id!==permissionId)
}else{
return [...prev,permissionId]
}

})

}



/* UPDATE USER */

const saveUser=()=>{

fetch(`https://localhost:7228/api/Users/${id}`,{

method:"PUT",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

firstName:form.firstName,
lastName:form.lastName,
email:form.email,
role:form.role,
isActive:form.isActive,
modifiedBy:"Admin",
permissionIds:selectedPermissions

})

})
.then(()=>{
alert("User Updated Successfully")
navigate("/user-manager")
})
.catch(err=>console.log(err))

}



return(

<div className={`of-layout ${isSidebarCollapsed ? 'collapsed' : ''}`}>

<Sidebar isCollapsed={isSidebarCollapsed}/>

<section className="of-main">

<Header
isSidebarCollapsed={isSidebarCollapsed}
onToggleSidebar={()=>setIsSidebarCollapsed(c=>!c)}
/>

<div className="container-fluid mt-4">

<h3 className="page-title">Update User</h3>

<hr/>

<div className="user-tabs">

<button
className={activeTab==="details"?"active":""}
onClick={()=>setActiveTab("details")}
>
User Details
</button>

<button
className={activeTab==="roles"?"active":""}
onClick={()=>setActiveTab("roles")}
>
Roles & Access
</button>

</div>



{/* USER DETAILS */}

{activeTab==="details" && (

<div className="card user-card">

<h5>User Detail</h5>

<div className="user-grid">

<div>
<label>First Name</label>
<input
name="firstName"
value={form.firstName}
onChange={handleChange}
/>
</div>

<div>
<label>Last Name</label>
<input
name="lastName"
value={form.lastName}
onChange={handleChange}
/>
</div>

<div>
<label>Email</label>
<input
name="email"
value={form.email}
onChange={handleChange}
/>
</div>

</div>

<div className="toggle-row">

<label>

<input
type="checkbox"
checked={form.isActive}
onChange={toggleActive}
/>

<span>Is Active</span>

</label>

</div>

<button onClick={()=>setActiveTab("roles")}>
Next
</button>

</div>

)}



{/* ROLES */}

{activeTab==="roles" && (

<div className="card user-card">

<h5>Roles & Access</h5>

<div className="role-row">

<label>User Role</label>

<select
name="role"
value={form.role}
onChange={handleChange}
>
<option value="Super Admin">Super Admin</option>
<option value="Admin">Admin</option>
<option value="User">User</option>
</select>

</div>

<hr/>

<h6>Module Access</h6>

<div className="admin-body">

{permissions.map(permission=>(

<label key={permission.id} className="module-item">

<input
type="checkbox"
checked={selectedPermissions.includes(permission.id)}
onChange={()=>togglePermission(permission.id)}
/>

{permission.permissionName}

</label>

))}

</div>

<button onClick={saveUser}>
Save User
</button>

</div>

)}

</div>

</section>

</div>

)

}

export default EditUserPage