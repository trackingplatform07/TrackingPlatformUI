import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/ProfilePage.css";

const COMPANY_PROFILE_API = "https://localhost:7150/api/CompanyProfiles";

const COUNTRY_OPTIONS = ["India", "United States of America", "United Kingdom", "Canada", "Australia", "Germany", "France", "United Arab Emirates"];
const SOCIAL_PLATFORMS = ["skype", "whatsapp", "telegram", "discord"];
const CUSTOM_PROFILE_SELECT_OPTIONS = ["Optional", "Required", "Hidden"];

const buildEmptyForm = () => ({
  company: "",
  firstName: "",
  lastName: "",
  address: "",
  city: "",
  state: "",
  country: "India",
  zip: "",
  contact: "",
  socialContactPlatform: "skype",
  socialContactValue: "",
  customProfileName: "",
  customProfileEmail: "",
  customProfileContact: "",
  customProfileSelect: "",
  customProfileExtra: "",
  taxGstVat: "",
  taxIgstVatType: "",
  taxPan: "",
  taxPercentage: "",
});

export default function ProfilePage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(buildEmptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(COMPANY_PROFILE_API, { headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to load company profile");
      const data = await response.json();
      setProfile(data);
      setForm({
        company: data.company || "",
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        address: data.address || "",
        city: data.city || "",
        state: data.state || "",
        country: data.country || "India",
        zip: data.zip || "",
        contact: data.contact || "",
        socialContactPlatform: data.socialContactPlatform || "skype",
        socialContactValue: data.socialContactValue || "",
        customProfileName: data.customProfileName || "",
        customProfileEmail: data.customProfileEmail || "",
        customProfileContact: data.customProfileContact || "",
        customProfileSelect: data.customProfileSelect || "",
        customProfileExtra: data.customProfileExtra || "",
        taxGstVat: data.taxGstVat || "",
        taxIgstVatType: data.taxIgstVatType || "",
        taxPan: data.taxPan || "",
        taxPercentage: data.taxPercentage ?? "",
      });
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submitForm = async () => {
    try {
      setSaving(true);
      const response = await fetch(COMPANY_PROFILE_API, {
        method: "PUT",
        headers: { "Content-Type": "application/json", accept: "*/*" },
        body: JSON.stringify({
          company: form.company.trim() || null,
          firstName: form.firstName.trim() || null,
          lastName: form.lastName.trim() || null,
          address: form.address.trim() || null,
          city: form.city.trim() || null,
          state: form.state.trim() || null,
          country: form.country || null,
          zip: form.zip.trim() || null,
          contact: form.contact.trim() || null,
          socialContactPlatform: form.socialContactPlatform,
          socialContactValue: form.socialContactValue.trim() || null,
          customProfileName: form.customProfileName.trim() || null,
          customProfileEmail: form.customProfileEmail.trim() || null,
          customProfileContact: form.customProfileContact.trim() || null,
          customProfileSelect: form.customProfileSelect || null,
          customProfileExtra: form.customProfileExtra.trim() || null,
          taxGstVat: form.taxGstVat.trim() || null,
          taxIgstVatType: form.taxIgstVatType.trim() || null,
          taxPan: form.taxPan.trim() || null,
          taxPercentage: form.taxPercentage === "" ? null : Number(form.taxPercentage),
        }),
      });
      if (!response.ok) throw new Error("Unable to save company profile");
      await loadProfile();
      alert("Company profile saved.");
    } catch {
      alert("Unable to save the company profile. Please check the API and try again.");
    } finally {
      setSaving(false);
    }
  };

  const changeEmail = async () => {
    const newEmail = window.prompt("Enter the new account email:", profile?.accountEmail || "");
    if (!newEmail || !newEmail.trim()) return;
    try {
      const response = await fetch(`${COMPANY_PROFILE_API}/change-email`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", accept: "*/*" },
        body: JSON.stringify({ newEmail: newEmail.trim() }),
      });
      if (!response.ok) throw new Error("Unable to change email");
      await loadProfile();
      alert("Account email updated.");
    } catch {
      alert("Unable to change the account email. Please check the API and try again.");
    }
  };

  const regenerateSecretKey = async () => {
    if (!window.confirm("Regenerate the account secret key? Any integration using the current key will stop working until updated.")) return;
    try {
      const response = await fetch(`${COMPANY_PROFILE_API}/regenerate-secret-key`, { method: "POST", headers: { "Content-Type": "application/json", accept: "*/*" }, body: JSON.stringify(null) });
      if (!response.ok) throw new Error("Unable to regenerate secret key");
      await loadProfile();
    } catch {
      alert("Unable to regenerate the secret key. Please check the API and try again.");
    }
  };

  const copySecretKey = async () => {
    if (!profile?.accountSecretKey) return;
    try {
      await navigator.clipboard.writeText(profile.accountSecretKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      alert(profile.accountSecretKey);
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

        <main className="cprofile-page">
          <section className="cprofile-card">
            <h1><span aria-hidden="true">🏢</span> Company Profile</h1>

            {loading && <p className="cprofile-loading">Loading company profile…</p>}
            {!loading && !profile && <p className="cprofile-loading">Unable to load company profile. Please check the API and try again.</p>}

            {!loading && profile && (
              <>
                <div className="cprofile-row">
                  <label>Account ID</label>
                  <span className="cprofile-static-value">{profile.accountId}</span>
                </div>

                <hr className="cprofile-divider" />

                <div className="cprofile-row">
                  <label>Company</label>
                  <input value={form.company} onChange={(event) => updateForm("company", event.target.value)} />
                </div>

                <div className="cprofile-row">
                  <label>Account Email</label>
                  <div className="cprofile-inline-field">
                    <input value={profile.accountEmail || ""} readOnly />
                    <button type="button" className="cprofile-dark-btn" onClick={changeEmail}>
                      <span aria-hidden="true">✉</span> Change Email
                    </button>
                  </div>
                </div>

                <div className="cprofile-row">
                  <label>Name</label>
                  <div className="cprofile-split-2">
                    <input placeholder="First Name" value={form.firstName} onChange={(event) => updateForm("firstName", event.target.value)} />
                    <input placeholder="Last Name" value={form.lastName} onChange={(event) => updateForm("lastName", event.target.value)} />
                  </div>
                </div>

                <div className="cprofile-row">
                  <label>Address</label>
                  <input placeholder="Address" value={form.address} onChange={(event) => updateForm("address", event.target.value)} />
                </div>

                <div className="cprofile-row">
                  <label></label>
                  <div className="cprofile-split-2">
                    <input placeholder="City" value={form.city} onChange={(event) => updateForm("city", event.target.value)} />
                    <input placeholder="State" value={form.state} onChange={(event) => updateForm("state", event.target.value)} />
                  </div>
                </div>

                <div className="cprofile-row">
                  <label></label>
                  <div className="cprofile-split-2">
                    <select value={form.country} onChange={(event) => updateForm("country", event.target.value)}>
                      {COUNTRY_OPTIONS.map((country) => <option key={country}>{country}</option>)}
                    </select>
                    <input placeholder="Zip" value={form.zip} onChange={(event) => updateForm("zip", event.target.value)} />
                  </div>
                </div>

                <div className="cprofile-row">
                  <label>Contact</label>
                  <input value={form.contact} onChange={(event) => updateForm("contact", event.target.value)} />
                </div>

                <div className="cprofile-row">
                  <label>Social Contact</label>
                  <div className="cprofile-split-2">
                    <select value={form.socialContactPlatform} onChange={(event) => updateForm("socialContactPlatform", event.target.value)}>
                      {SOCIAL_PLATFORMS.map((platform) => <option key={platform}>{platform}</option>)}
                    </select>
                    <input value={form.socialContactValue} onChange={(event) => updateForm("socialContactValue", event.target.value)} />
                  </div>
                </div>

                <div className="cprofile-row">
                  <label>Custom Profile Details<br /><small>(Affiliates)</small></label>
                  <div className="cprofile-custom-stack">
                    <input placeholder="Name" value={form.customProfileName} onChange={(event) => updateForm("customProfileName", event.target.value)} />
                    <div className="cprofile-split-2">
                      <input placeholder="Email" value={form.customProfileEmail} onChange={(event) => updateForm("customProfileEmail", event.target.value)} />
                      <input placeholder="Contact" value={form.customProfileContact} onChange={(event) => updateForm("customProfileContact", event.target.value)} />
                    </div>
                    <div className="cprofile-split-2">
                      <select value={form.customProfileSelect} onChange={(event) => updateForm("customProfileSelect", event.target.value)}>
                        <option value="">Select</option>
                        {CUSTOM_PROFILE_SELECT_OPTIONS.map((option) => <option key={option}>{option}</option>)}
                      </select>
                      <input value={form.customProfileExtra} onChange={(event) => updateForm("customProfileExtra", event.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="cprofile-row">
                  <label>Tax Details<br /><small>(Add your Tax details for<br />Affiliate / Advertiser Invoices)</small></label>
                  <div className="cprofile-split-4">
                    <input placeholder="GST/VAT" value={form.taxGstVat} onChange={(event) => updateForm("taxGstVat", event.target.value)} />
                    <input placeholder="IGST/VAT Type" value={form.taxIgstVatType} onChange={(event) => updateForm("taxIgstVatType", event.target.value)} />
                    <input placeholder="ABCDEF00001" value={form.taxPan} onChange={(event) => updateForm("taxPan", event.target.value)} />
                    <input type="number" step="0.01" placeholder="18.00" value={form.taxPercentage} onChange={(event) => updateForm("taxPercentage", event.target.value)} />
                  </div>
                </div>

                <button type="button" className="cprofile-submit-btn" onClick={submitForm} disabled={saving}>
                  <span aria-hidden="true">🕐</span> {saving ? "Saving…" : "Submit"}
                </button>

                <hr className="cprofile-divider" />

                <div className="cprofile-row">
                  <label><span aria-hidden="true">🔑</span> Account Secret Key</label>
                  <div className="cprofile-secret-row">
                    <span className="cprofile-secret-value">{profile.accountSecretKey}</span>
                    <span className="cprofile-secret-valid">(valid for 24hours)</span>
                    <button type="button" className="cprofile-icon-btn" onClick={copySecretKey} title="Copy">
                      {copied ? "✓" : "⧉"}
                    </button>
                    <button type="button" className="cprofile-icon-btn" onClick={regenerateSecretKey} title="Regenerate">
                      ↻
                    </button>
                  </div>
                  <p className="cprofile-secret-note">(If you want to make any changes in your account, provide fresh access key to Offer18 account manager)</p>
                </div>
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
