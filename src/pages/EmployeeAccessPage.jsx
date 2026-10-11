import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/Modal.css";
import "../css/EmployeeAccessPage.css";

const EMPLOYEE_ACCESS_API = "https://localhost:7150/api/EmployeeAccesses";

const initials = (name, email) => {
  const source = (name || email || "?").trim();
  return source.charAt(0).toUpperCase();
};

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString("en-GB", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "-";

export default function EmployeeAccessPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch(EMPLOYEE_ACCESS_API, { headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to load employees");
      const data = await response.json();
      setEmployees(Array.isArray(data) ? data : data.items || data.data || []);
    } catch {
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const toggleStatus = async (employee) => {
    setOpenMenu(null);
    const nextStatus = employee.status === "Active" ? "Inactive" : "Active";
    try {
      const response = await fetch(`${EMPLOYEE_ACCESS_API}/${employee.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", accept: "*/*" },
        body: JSON.stringify(nextStatus),
      });
      if (!response.ok) throw new Error("Unable to update status");
      await loadEmployees();
    } catch {
      alert("Unable to update the employee status. Please check the API and try again.");
    }
  };

  const removeEmployee = async (employee) => {
    setOpenMenu(null);
    if (!window.confirm(`Remove employee access for "${employee.name || employee.email}"?`)) return;
    try {
      const response = await fetch(`${EMPLOYEE_ACCESS_API}/${employee.id}`, { method: "DELETE", headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to remove employee");
      await loadEmployees();
    } catch {
      alert("Unable to remove the employee. Please check the API and try again.");
    }
  };

  return (
    <div className="of-layout">
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <div className="of-main">
        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed((value) => !value)}
        />

        <main className="emp-page">
          <section className="emp-card">
            <div className="emp-toolbar">
              <h1><span aria-hidden="true">🔑</span> Employee Access</h1>
              <button type="button" className="emp-create-btn" onClick={() => setShowAddModal(true)}>
                <span aria-hidden="true">+</span> Create Employee
              </button>
            </div>

            <div className="emp-table-scroll">
              <table className="emp-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tag</th>
                    <th>Account</th>
                    <th>Last login</th>
                    <th>Permissions</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && <tr><td colSpan="7" className="emp-message">Loading employees…</td></tr>}
                  {!loading && employees.length === 0 && <tr><td colSpan="7" className="emp-message">No employees yet.</td></tr>}
                  {!loading && employees.map((employee) => (
                    <tr key={employee.id}>
                      <td><span className="emp-link">{employee.id}</span></td>
                      <td>{employee.tag}</td>
                      <td>
                        <div className="emp-account-cell">
                          <span className="emp-avatar" style={{ background: employee.avatarColor }}>
                            {initials(employee.name, employee.email)}
                          </span>
                          <div>
                            <div className="emp-account-name">{employee.name || employee.email}</div>
                            {employee.name && <div className="emp-account-email">{employee.email}</div>}
                          </div>
                        </div>
                      </td>
                      <td>{formatDate(employee.lastLoginOn)}</td>
                      <td>
                        {employee.permissionsCount ? (
                          <span className="emp-permissions-badge">Assigned ({employee.permissionsCount})</span>
                        ) : (
                          <span className="emp-permissions-none">Not Assigned</span>
                        )}
                      </td>
                      <td>
                        <span className={`emp-status-badge ${employee.status === "Active" ? "active" : "inactive"}`}>
                          {employee.status === "Active" ? "✓" : "✕"} {employee.status}
                        </span>
                      </td>
                      <td>
                        <div className="emp-menu-wrapper">
                          <button
                            type="button"
                            className="emp-options"
                            aria-label={`Options for ${employee.email}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              setOpenMenu(openMenu === employee.id ? null : employee.id);
                            }}
                          >
                            ⋮
                          </button>
                          {openMenu === employee.id && (
                            <div className="emp-row-dropdown">
                              <button type="button" onClick={() => toggleStatus(employee)}>{employee.status === "Active" ? "Deactivate" : "Activate"}</button>
                              <button type="button" className="danger" onClick={() => removeEmployee(employee)}>Remove</button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>

      {showAddModal && (
        <AddEmployeeModal onClose={() => setShowAddModal(false)} onCreated={loadEmployees} />
      )}
    </div>
  );
}

function AddEmployeeModal({ onClose, onCreated }) {
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!email.trim()) {
      alert("Please enter an email.");
      return;
    }
    try {
      setSaving(true);
      const response = await fetch(EMPLOYEE_ACCESS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json", accept: "*/*" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!response.ok) throw new Error("Unable to create employee");
      await onCreated();
      onClose();
    } catch {
      alert("Unable to create the employee. Please check the API and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="emp-modal" onClick={(event) => event.stopPropagation()}>
        <div className="emp-modal-header">
          <h2><span aria-hidden="true">+</span> Add Employee</h2>
          <button type="button" onClick={onClose}>✕</button>
        </div>
        <div className="emp-modal-body">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && submit()}
          />
          <div className="emp-modal-footer">
            <button type="button" className="emp-submit-btn" onClick={submit} disabled={saving}>
              <span aria-hidden="true">🕐</span> {saving ? "Saving…" : "Submit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
