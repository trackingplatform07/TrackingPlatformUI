import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/ChangeLogsPage.css";

const ACCESS_LOGS_API = "https://localhost:7150/api/AccessLogs";
const EMPLOYEES_API = "https://localhost:7150/api/EmployeeAccesses";

const todayIso = () => new Date().toISOString().slice(0, 10);

const formatDateTime = (value) =>
  new Date(value).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

const employeeName = (employee) => employee.name || employee.email || `Employee ${employee.id}`;

export default function AccessLogsPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [employees, setEmployees] = useState([]);

  const [draftStartDate, setDraftStartDate] = useState(todayIso());
  const [draftEndDate, setDraftEndDate] = useState(todayIso());
  const [draftEmployeeId, setDraftEmployeeId] = useState("");

  const [applied, setApplied] = useState({
    startDate: todayIso(),
    endDate: todayIso(),
    employeeId: "",
  });

  const [pageSize, setPageSize] = useState(100);
  const [showFilters, setShowFilters] = useState(false);

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    fetch(EMPLOYEES_API, { headers: { accept: "*/*" }, signal: controller.signal })
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => setEmployees(Array.isArray(data) ? data : []))
      .catch(() => {});

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const loadLogs = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("startDate", new Date(`${applied.startDate}T00:00:00`).toISOString());
        params.set("endDate", new Date(`${applied.endDate}T23:59:59`).toISOString());
        params.set("pageSize", String(pageSize));
        if (applied.employeeId) params.set("employeeId", applied.employeeId);

        const response = await fetch(`${ACCESS_LOGS_API}?${params.toString()}`, {
          headers: { accept: "*/*" },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Unable to load access logs");
        const data = await response.json();
        setLogs(Array.isArray(data) ? data : []);
      } catch (error) {
        if (error.name !== "AbortError") setLogs([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadLogs();
    return () => controller.abort();
  }, [applied, pageSize]);

  const applyFilters = () => {
    setApplied({
      startDate: draftStartDate,
      endDate: draftEndDate,
      employeeId: draftEmployeeId,
    });
    setShowFilters(false);
  };

  const resetFilters = () => {
    setDraftEmployeeId("");
  };

  return (
    <div className="of-layout">
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <div className="of-main">
        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed((value) => !value)}
        />

        <main className="clog-page">
          <section className="clog-card">
            <div className="clog-header">
              <div>
                <h1><span aria-hidden="true">⚲</span> Access Logs</h1>
                <p className="clog-subtitle">Review who accessed your account and from where</p>
              </div>
              <div className="clog-toolbar">
                <div className="clog-date-range">
                  <input type="date" value={draftStartDate} onChange={(event) => setDraftStartDate(event.target.value)} />
                  <span>-</span>
                  <input type="date" value={draftEndDate} onChange={(event) => setDraftEndDate(event.target.value)} />
                </div>
                <select className="clog-page-size" value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))}>
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
                  <option value={100}>100 / page</option>
                </select>
                <div className="clog-filters-wrap">
                  <button type="button" className="clog-filters-btn" onClick={() => setShowFilters((open) => !open)}>
                    <span aria-hidden="true">▽</span> Filters
                  </button>
                  {showFilters && (
                    <div className="clog-filters-panel">
                      <div className="clog-filters-panel-header">
                        <span>Filters</span>
                        <button type="button" className="clog-reset-link" onClick={resetFilters}>Reset all</button>
                      </div>
                      <div className="clog-filters-field">
                        <label>Employee</label>
                        <select value={draftEmployeeId} onChange={(event) => setDraftEmployeeId(event.target.value)}>
                          <option value="">All employees</option>
                          {employees.map((employee) => (
                            <option key={employee.id} value={employee.id}>{employee.id} ~ {employeeName(employee)}</option>
                          ))}
                        </select>
                      </div>
                      <div className="clog-filters-footer">
                        <button type="button" className="clog-apply-btn" onClick={applyFilters}>Apply</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="clog-table-scroll">
              <table className="clog-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Type</th>
                    <th>Access By</th>
                    <th>Location</th>
                    <th>Log Data</th>
                    <th>User Info</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && <tr><td colSpan="6" className="clog-message">Loading access logs…</td></tr>}
                  {!loading && logs.length === 0 && <tr><td colSpan="6" className="clog-message">No data available in table</td></tr>}
                  {!loading && logs.map((log) => (
                    <tr key={log.id}>
                      <td>{formatDateTime(log.occurredOn)}</td>
                      <td>{log.type}</td>
                      <td>{log.accessBy || "-"}</td>
                      <td>{log.location || "-"}</td>
                      <td><textarea className="clog-textarea" readOnly value={log.logData || ""} /></td>
                      <td><textarea className="clog-textarea" readOnly value={log.userInfo || ""} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
