import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import CreateUserModal from "../components/CreateUserModal";
import { useNavigate } from "react-router-dom";

const UserManager = () => {

  const navigate = useNavigate();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const loggedUser = JSON.parse(localStorage.getItem("user"));

  /* FETCH USERS */

  useEffect(() => {

    fetch("https://localhost:7228/api/Users")
      .then(res => res.json())
      .then(data => {

        const formattedUsers = data.map(u => ({
          id: u.id,
          name: `${u.firstName} ${u.lastName}`,
          email: u.email,
          role: u.role,
          createdOn: u.createdOn,
          modifiedOn: u.modifiedOn
        }));

        /* REMOVE LOGIN USER FROM LIST */

        const filteredUsers = formattedUsers.filter(
          u => u.id !== loggedUser?.id
        );

        setUsers(filteredUsers);

      })
      .catch(err => console.log(err));

  }, []);


  /* ADD USER AFTER CREATE */

  const addUserToList = (user) => {

    const formattedUser = {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
      createdOn: user.createdOn,
      modifiedOn: user.modifiedOn
    };

    if (formattedUser.id !== loggedUser?.id) {
      setUsers(prev => [formattedUser, ...prev]);
    }

  };


  /* DELETE USER */

  const deleteUser = (id) => {

    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    fetch(`https://localhost:7228/api/Users/${id}`, {
      method: "DELETE",
      headers: {
        "accept": "*/*"
      }
    })

      .then(() => {

        setUsers(prev => prev.filter(u => u.id !== id));
        alert("User Deleted Successfully");

      })

      .catch(err => console.log(err));

  };


  /* DATE FORMAT */

  const formatDate = (date) => {

    if (!date) return "-";

    const d = new Date(date);

    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

  };


  /* SEARCH */

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase())
  );


  /* SORT */

  const sortedUsers = [...filteredUsers].sort((a, b) => {

    if (a[sortField] < b[sortField]) return sortOrder === "asc" ? -1 : 1;
    if (a[sortField] > b[sortField]) return sortOrder === "asc" ? 1 : -1;
    return 0;

  });


  const handleSort = (field) => {

    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    }
    else {
      setSortField(field);
      setSortOrder("asc");
    }

  };


  /* PAGINATION */

  const indexOfLast = currentPage * usersPerPage;
  const indexOfFirst = indexOfLast - usersPerPage;

  const currentUsers = sortedUsers.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(sortedUsers.length / usersPerPage);


  return (

    <div className={`of-layout ${isSidebarCollapsed ? 'collapsed' : ''}`}>

      <Sidebar isCollapsed={isSidebarCollapsed} />

      <section className="of-main">

        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(c => !c)}
        />

        <div className="container mt-4">

          <h3>User Manager</h3>

          <div className="card p-3 mb-4">

            <div className="row">

              <div className="col-md-3">

                <button
                  className="btn btn-primary w-100"
                  onClick={() => setShowCreate(true)}
                >
                  Create User
                </button>

              </div>

            </div>

          </div>

          <input
            className="form-control mb-3"
            placeholder="Search User"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <table className="table table-hover table-bordered align-middle">

            <thead style={{ background: "#f1f3f5" }}>

              <tr>

                <th style={{ cursor: "pointer" }} onClick={() => handleSort("name")}>
                  Name
                </th>

                <th style={{ cursor: "pointer" }} onClick={() => handleSort("email")}>
                  Email
                </th>

                <th style={{ cursor: "pointer" }} onClick={() => handleSort("role")}>
                  Role
                </th>

                <th style={{ cursor: "pointer" }} onClick={() => handleSort("createdOn")}>
                  Created Date
                </th>

                <th style={{ cursor: "pointer" }} onClick={() => handleSort("modifiedOn")}>
                  Modified Date
                </th>

                <th width="120">Action</th>

              </tr>

            </thead>

            <tbody>

              {currentUsers.map(user => (

                <tr key={user.id}>

                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{formatDate(user.createdOn)}</td>
                  <td>{formatDate(user.modifiedOn)}</td>

                  <td>

                    <i
                      className="bi bi-pencil-square text-warning me-3"
                      style={{ cursor: "pointer", fontSize: "18px" }}
                      onClick={() => navigate(`/edit-user/${user.id}`)}
                    ></i>

                    <i
                      className="bi bi-trash text-danger"
                      style={{ cursor: "pointer", fontSize: "18px" }}
                      onClick={() => deleteUser(user.id)}
                    ></i>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>


          {/* PAGINATION */}

          <nav>

            <ul className="pagination">

              {/* PREVIOUS */}

              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
              </li>


              {/* PAGE NUMBERS */}

              {Array.from({ length: totalPages }, (_, i) => (

                <li
                  key={i}
                  className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                >

                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>

                </li>

              ))}


              {/* NEXT */}

              <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </li>

            </ul>

          </nav>

        </div>

      </section>

      {showCreate &&
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onUserCreated={addUserToList}
        />
      }

    </div>

  )

}

export default UserManager;