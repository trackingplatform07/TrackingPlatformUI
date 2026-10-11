import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/SecurityPage.css";

const API_KEYS_API = "https://localhost:7150/api/ApiKeys";
const LOGIN_SESSIONS_API = "https://localhost:7150/api/LoginSessions";
const SECURITY_SETTINGS_API = "https://localhost:7150/api/SecuritySettings";

const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "N/A";

export default function SecurityPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [apiKeys, setApiKeys] = useState([]);
  const [apiKeysLoading, setApiKeysLoading] = useState(true);
  const [visibleSecrets, setVisibleSecrets] = useState({});
  const [whitelistDrafts, setWhitelistDrafts] = useState({});
  const [creatingKey, setCreatingKey] = useState(false);

  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [loggingOutAll, setLoggingOutAll] = useState(false);

  const [security, setSecurity] = useState(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [togglingTwoFactor, setTogglingTwoFactor] = useState(false);

  const loadApiKeys = async () => {
    try {
      setApiKeysLoading(true);
      const response = await fetch(API_KEYS_API, { headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to load API keys");
      const data = await response.json();
      const list = Array.isArray(data) ? data : data.items || data.data || [];
      setApiKeys(list);
      setWhitelistDrafts(Object.fromEntries(list.map((key) => [key.id, key.whitelistIp || ""])));
    } catch {
      setApiKeys([]);
    } finally {
      setApiKeysLoading(false);
    }
  };

  const loadSessions = async () => {
    try {
      setSessionsLoading(true);
      const response = await fetch(LOGIN_SESSIONS_API, { headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to load login sessions");
      const data = await response.json();
      setSessions(Array.isArray(data) ? data : data.items || data.data || []);
    } catch {
      setSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  };

  const loadSecurity = async () => {
    try {
      const response = await fetch(SECURITY_SETTINGS_API, { headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to load security settings");
      const data = await response.json();
      setSecurity(data);
    } catch {
      setSecurity(null);
    }
  };

  useEffect(() => {
    const recordThisSession = async () => {
      try {
        await fetch(`${LOGIN_SESSIONS_API}/record`, { method: "POST", headers: { accept: "*/*" } });
      } catch {
        // non-fatal; the sessions list will simply not include this visit
      } finally {
        loadSessions();
      }
    };

    loadApiKeys();
    recordThisSession();
    loadSecurity();
  }, []);

  const createApiKey = async () => {
    try {
      setCreatingKey(true);
      const response = await fetch(API_KEYS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json", accept: "*/*" },
        body: JSON.stringify(null),
      });
      if (!response.ok) throw new Error("Unable to create API key");
      await loadApiKeys();
    } catch {
      alert("Unable to create the API key. Please check the API and try again.");
    } finally {
      setCreatingKey(false);
    }
  };

  const toggleSecretVisible = (id) => setVisibleSecrets((current) => ({ ...current, [id]: !current[id] }));

  const saveWhitelistIp = async (id) => {
    try {
      const response = await fetch(`${API_KEYS_API}/${id}/whitelist-ip`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", accept: "*/*" },
        body: JSON.stringify(whitelistDrafts[id] || ""),
      });
      if (!response.ok) throw new Error("Unable to update whitelist IP");
      await loadApiKeys();
    } catch {
      alert("Unable to update the whitelist IP. Please check the API and try again.");
    }
  };

  const revokeApiKey = async (id) => {
    if (!window.confirm("Revoke this API key? Any integration using it will stop working immediately.")) return;
    try {
      const response = await fetch(`${API_KEYS_API}/${id}/revoke`, { method: "POST", headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to revoke API key");
      await loadApiKeys();
    } catch {
      alert("Unable to revoke the API key. Please check the API and try again.");
    }
  };

  const logoutAllDevices = async () => {
    if (!window.confirm("Log out all devices? Every active session will be marked as logged out.")) return;
    try {
      setLoggingOutAll(true);
      const response = await fetch(`${LOGIN_SESSIONS_API}/logout-all`, { method: "POST", headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to log out all devices");
      await loadSessions();
    } catch {
      alert("Unable to log out all devices. Please check the API and try again.");
    } finally {
      setLoggingOutAll(false);
    }
  };

  const submitChangePassword = async () => {
    if (!newPassword || newPassword !== repeatPassword) {
      alert("New password and repeat password must match.");
      return;
    }
    try {
      setChangingPassword(true);
      const response = await fetch(`${SECURITY_SETTINGS_API}/change-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", accept: "*/*" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || "Unable to change password");
      }
      setOldPassword("");
      setNewPassword("");
      setRepeatPassword("");
      await loadSecurity();
      alert("Password changed successfully.");
    } catch (error) {
      alert(error.message || "Unable to change the password. Please check the API and try again.");
    } finally {
      setChangingPassword(false);
    }
  };

  const toggleTwoFactor = async () => {
    try {
      setTogglingTwoFactor(true);
      const response = await fetch(`${SECURITY_SETTINGS_API}/two-factor`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", accept: "*/*" },
        body: JSON.stringify(!security?.twoFactorEnabled),
      });
      if (!response.ok) throw new Error("Unable to update two-factor authentication");
      await loadSecurity();
    } catch {
      alert("Unable to update two-factor authentication. Please check the API and try again.");
    } finally {
      setTogglingTwoFactor(false);
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

        <main className="sec-page">
          <section className="sec-card">
            <div className="sec-header">
              <div>
                <h1><span aria-hidden="true">🔑</span> Access Keys</h1>
                <p className="sec-subtitle">API keys for the network API and the IPs allowed to use them</p>
              </div>
              <div className="sec-header-actions">
                <button type="button" className="sec-dark-btn" onClick={createApiKey} disabled={creatingKey}>
                  <span aria-hidden="true">+</span> {creatingKey ? "Creating…" : "Create New API Key"}
                </button>
                <button type="button" className="sec-outline-btn" onClick={() => window.open("https://knowledgebase.offer18.com", "_blank", "noopener,noreferrer")}>
                  <span aria-hidden="true">📄</span> Api Docs
                </button>
              </div>
            </div>

            <div className="sec-table-scroll">
              <table className="sec-table">
                <thead>
                  <tr>
                    <th>#</th><th>API Key</th><th>Secret Key</th><th>Last Active</th><th>Created Date</th><th>Whitelist IP</th><th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {apiKeysLoading && <tr><td colSpan="7" className="sec-message">Loading API keys…</td></tr>}
                  {!apiKeysLoading && apiKeys.length === 0 && <tr><td colSpan="7" className="sec-message">No API keys yet.</td></tr>}
                  {!apiKeysLoading && apiKeys.map((key, index) => (
                    <tr key={key.id}>
                      <td>{index + 1}</td>
                      <td className="sec-key-cell">{key.keyCode}</td>
                      <td>
                        {visibleSecrets[key.id] ? (
                          <span className="sec-secret-value">{key.secretKey}</span>
                        ) : (
                          <button type="button" className="sec-link" onClick={() => toggleSecretVisible(key.id)}>View</button>
                        )}
                      </td>
                      <td>{formatDateTime(key.lastActiveOn)}</td>
                      <td>{formatDateTime(key.createdOn)}</td>
                      <td>
                        <input
                          className="sec-whitelist-input"
                          value={whitelistDrafts[key.id] ?? ""}
                          onChange={(event) => setWhitelistDrafts((current) => ({ ...current, [key.id]: event.target.value }))}
                          onBlur={() => saveWhitelistIp(key.id)}
                        />
                      </td>
                      <td>
                        <button type="button" className="sec-revoke-btn" onClick={() => revokeApiKey(key.id)}>Revoke Access</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="sec-card">
            <div className="sec-header">
              <div>
                <h1><span aria-hidden="true">🔌</span> Login Sessions</h1>
                <p className="sec-subtitle">Your 100 most recent sign ins</p>
              </div>
              <button type="button" className="sec-dark-btn" onClick={logoutAllDevices} disabled={loggingOutAll}>
                <span aria-hidden="true">⇥</span> {loggingOutAll ? "Logging out…" : "Logout All Devices"}
              </button>
            </div>

            <div className="sec-table-scroll">
              <table className="sec-table">
                <thead>
                  <tr>
                    <th>Time</th><th>Status</th><th>Session ID</th><th>Count</th><th>User Agent</th><th>Login IP</th>
                  </tr>
                </thead>
                <tbody>
                  {sessionsLoading && <tr><td colSpan="6" className="sec-message">Loading sessions…</td></tr>}
                  {!sessionsLoading && sessions.length === 0 && <tr><td colSpan="6" className="sec-message">No sessions recorded yet.</td></tr>}
                  {!sessionsLoading && sessions.map((session) => (
                    <tr key={session.id}>
                      <td>{formatDateTime(session.loginOn)}</td>
                      <td><span className={`sec-status-pill ${session.status === "Active" ? "active" : "inactive"}`}>{session.status}</span></td>
                      <td className="sec-session-id">{session.sessionId}</td>
                      <td>{session.signInCount}</td>
                      <td className="sec-user-agent">{session.userAgent}</td>
                      <td>{session.loginIp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="sec-bottom-grid">
            <section className="sec-card">
              <h2><span aria-hidden="true">🔐</span> Change Password</h2>
              <p className="sec-subtitle">Update the password you sign in with</p>

              <div className="sec-field">
                <label>Old Password</label>
                <input type="password" value={oldPassword} onChange={(event) => setOldPassword(event.target.value)} />
              </div>
              <div className="sec-field">
                <label>New Password</label>
                <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
              </div>
              <div className="sec-field">
                <label>New Password Repeat</label>
                <input type="password" value={repeatPassword} onChange={(event) => setRepeatPassword(event.target.value)} />
              </div>

              <button type="button" className="sec-submit-btn" onClick={submitChangePassword} disabled={changingPassword}>
                <span aria-hidden="true">🕐</span> {changingPassword ? "Saving…" : "Submit"}
              </button>
            </section>

            <section className="sec-card">
              <h2><span aria-hidden="true">🛡</span> Two-Factor Authentication</h2>
              <p className="sec-subtitle">Ask for an authenticator code at every sign in</p>

              <p className="sec-2fa-status">
                Two-Factor Authentication (2FA) is {security?.twoFactorEnabled ? "enabled" : "not enabled"} in your account.
              </p>
              <button type="button" className="sec-outline-btn" onClick={toggleTwoFactor} disabled={togglingTwoFactor || !security}>
                <span aria-hidden="true">🔒</span> {togglingTwoFactor ? "Saving…" : security?.twoFactorEnabled ? "Disable" : "Enable"}
              </button>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
