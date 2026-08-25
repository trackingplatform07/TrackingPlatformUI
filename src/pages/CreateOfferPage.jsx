import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaStrikethrough,
  FaListOl,
  FaListUl,
  FaQuoteRight,
  FaUndo,
  FaRedo,
  FaLink,
  FaUnlink,
  FaImage,
  FaTable,
  FaAlignLeft,
  FaLock,
  FaUserTie,
  FaMagic,
} from "react-icons/fa";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/CreateOfferPage.css";

const editorTabs = [
  { id: "offerDescription", label: "Offer Description", icon: FaTable },
  { id: "privateNote", label: "Private Note", icon: FaLock },
  { id: "paOfferTerms", label: "Offer Terms/KPI", icon: FaUserTie },
];

function RichTextOfferEditor({ formData, setFormData }) {
  const [activeTab, setActiveTab] = useState("offerDescription");
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: formData.offerDescription,
    editorProps: {
      attributes: {
        class: "offer-rich-text-content",
        "aria-label": "Offer description editor",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      setFormData((previous) => ({
        ...previous,
        [activeTab]: currentEditor.getHTML(),
      }));
    },
  });

  useEffect(() => {
    if (!editor) return;
    const nextContent = formData[activeTab] || "";
    if (editor.getHTML() !== nextContent) {
      editor.commands.setContent(nextContent, { emitUpdate: false });
    }
  }, [activeTab, editor, formData]);

  const selectTab = (tabId) => {
    if (editor) {
      setFormData((previous) => ({
        ...previous,
        [activeTab]: editor.getHTML(),
      }));
    }
    setActiveTab(tabId);
  };

  const setLink = () => {
    const url = window.prompt("Paste the link URL");
    if (url) editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  if (!editor) return null;

  return (
    <div className="offer-rich-text" aria-label="Offer information editor">
      <div className="offer-editor-tabs" role="tablist" aria-label="Offer information tabs">
        {editorTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`offer-editor-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => selectTab(tab.id)}
          >
            {React.createElement(tab.icon, { "aria-hidden": true })}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="offer-editor-shell">
        <div className="offer-editor-toolbar" role="toolbar" aria-label="Text formatting">
          <button type="button" title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}><FaUndo /></button>
          <button type="button" title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}><FaRedo /></button>
          <span className="toolbar-divider" />
          <button type="button" title="Numbered list" className={editor.isActive("orderedList") ? "is-active" : ""} onClick={() => editor.chain().focus().toggleOrderedList().run()}><FaListOl /></button>
          <button type="button" title="Bulleted list" className={editor.isActive("bulletList") ? "is-active" : ""} onClick={() => editor.chain().focus().toggleBulletList().run()}><FaListUl /></button>
          <button type="button" title="Quote" className={editor.isActive("blockquote") ? "is-active" : ""} onClick={() => editor.chain().focus().toggleBlockquote().run()}><FaQuoteRight /></button>
          <span className="toolbar-divider" />
          <button type="button" title="Bold" className={editor.isActive("bold") ? "is-active" : ""} onClick={() => editor.chain().focus().toggleBold().run()}><FaBold /></button>
          <button type="button" title="Italic" className={editor.isActive("italic") ? "is-active" : ""} onClick={() => editor.chain().focus().toggleItalic().run()}><FaItalic /></button>
          <button type="button" title="Underline" className={editor.isActive("underline") ? "is-active" : ""} onClick={() => editor.chain().focus().toggleUnderline().run()}><FaUnderline /></button>
          <button type="button" title="Strikethrough" className={editor.isActive("strike") ? "is-active" : ""} onClick={() => editor.chain().focus().toggleStrike().run()}><FaStrikethrough /></button>
          <span className="toolbar-divider" />
          <button type="button" title="Add link" onClick={setLink}><FaLink /></button>
          <button type="button" title="Remove link" onClick={() => editor.chain().focus().unsetLink().run()} disabled={!editor.isActive("link")}><FaUnlink /></button>
          <button type="button" title="Image uploads are not configured" disabled><FaImage /></button>
          <button type="button" title="Table support is not configured" disabled><FaTable /></button>
          <button type="button" title="Paragraph" onClick={() => editor.chain().focus().setParagraph().run()}><FaAlignLeft /></button>
          <span className="toolbar-divider" />
          <select
            aria-label="Styles"
            value={editor.isActive("heading", { level: 2 }) ? "h2" : editor.isActive("heading", { level: 3 }) ? "h3" : "paragraph"}
            onChange={(event) => {
              const command = editor.chain().focus();
              event.target.value === "paragraph" ? command.setParagraph().run() : command.toggleHeading({ level: Number(event.target.value.slice(1)) }).run();
            }}
          >
            <option value="paragraph">Styles</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
          </select>
          <select aria-label="Format" defaultValue="format" onChange={(event) => event.target.value === "clear" && editor.chain().focus().clearNodes().unsetAllMarks().run()}>
            <option value="format">Format</option>
            <option value="clear">Clear formatting</option>
          </select>
        </div>
        <EditorContent editor={editor} />
        <div className="offer-editor-status">
          <button type="button" className="ai-rewrite-button" title="AI rewrite can be connected when an AI service is available"><FaMagic /> AI Rewrite</button>
        </div>
      </div>
    </div>
  );
}

function WizardStepFooter({ onPrevious, onNext }) {
  return (
    <div className="wizard-step-footer">
      <button type="button" className="btn secondary" onClick={onPrevious}>Previous</button>
      <button type="button" className="btn primary" onClick={onNext}>Submit &amp; Next Set Targeting</button>
    </div>
  );
}

export default function CreateOfferPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const navigate = useNavigate();
  const [affiliateRandomUrl, setAffiliateRandomUrl] = useState(false);
  const [landingPages, setLandingPages] = useState([
    { id: "", name: "default_url", type: "default", url: "test", targeting: "", affiliate: "", weight: "", updatedAt: "", status: "" },
  ]);
  const [targetingRules, setTargetingRules] = useState([]);
  const [creativeUploadType, setCreativeUploadType] = useState("");
  const [creativeFileName, setCreativeFileName] = useState("");
  const [affiliateSearch, setAffiliateSearch] = useState("");
  const [advertiserDropdownOpen, setAdvertiserDropdownOpen] = useState(false);
  const [advertiserSearch, setAdvertiserSearch] = useState("");
  const [advertisersLoading, setAdvertisersLoading] = useState(true);
  const [advertisersError, setAdvertisersError] = useState("");
  const [offerAffiliates, setOfferAffiliates] = useState([
    { id: 1, initials: "TI", color: "#a868f5", offer: "22009958 - test", affiliate: "565890 - test test (test)" },
    { id: 2, initials: "NA", color: "#57528e", offer: "22009958 - test", affiliate: "311875 - New Affiliate (Affiliate)" },
    { id: 3, initials: "TA", color: "#fb6191", offer: "22009958 - test", affiliate: "122115 - Test Affiliate 1" },
  ]);

  const [formData, setFormData] = useState({
    // General Step 1
    offerType: "General",
    offerName: "",
    uploadLogo: null,
    advertiser: "",
    offerCategory: "",
    appId: "",
    externalOfferId: "",
    offerPreviewUrl: "",
    offerUrl: "",
    advertiserUrlBuilder: "",
    landingPage: "",
    tokens: "",
    
    // Advertiser Pricing
    advertiserModel: "",
    advertiserPrice: "0",
    advertiserCurrency: "",
    
    // Affiliate Pricing
    affiliateModel: "",
    affiliatePrice: "0",
    affiliateCurrency: "",
    hidePayout: false,
    
    // Schedule
    startDate: "2026-08-16T13:00",
    endDate: "2028-08-16T13:00",
    dailyStartTime: "00:00:00",
    dailyEndTime: "00:00:00",
    dailyScheduleEnabled: false,
    
    // Offer Settings
    offerVisibility: "Public",
    status: "Approve",
    alertToAffiliates: false,
    deepLinks: false,
    terms: "", 
    offerDescription: "",
    privateNote: "",
    paOfferTerms: "",
    styles: "",
  });

  const [advertisers, setAdvertisers] = useState([]);

  const [categories, setCategories] = useState([
    { id: 1, name: "Category 1" },
    { id: 2, name: "Category 2" },
    { id: 3, name: "Category 3" },
  ]);

  const [showAdvertiserModal, setShowAdvertiserModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newAdvertiser, setNewAdvertiser] = useState("");
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadAdvertisers = async () => {
      try {
        setAdvertisersLoading(true);
        setAdvertisersError("");
        const response = await fetch("https://localhost:7129/api/Advertisers", {
          headers: { accept: "*/*" },
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("Unable to load advertisers");

        const data = await response.json();
        setAdvertisers(Array.isArray(data) ? data : data.items || data.data || []);
      } catch (error) {
        if (error.name !== "AbortError") {
          setAdvertisers([]);
          setAdvertisersError("Unable to load advertisers");
        }
      } finally {
        if (!controller.signal.aborted) setAdvertisersLoading(false);
      }
    };

    loadAdvertisers();
    return () => controller.abort();
  }, []);

  const advertiserName = (advertiser) =>
    [advertiser.firstName, advertiser.lastName].filter(Boolean).join(" ") || advertiser.companyName || "Unnamed Advertiser";

  const advertiserInitials = (advertiser) =>
    advertiserName(advertiser).split(" ").filter(Boolean).slice(0, 2).map((name) => name[0]).join("").toUpperCase();

  const selectedAdvertiser = advertisers.find((advertiser) => String(advertiser.id) === String(formData.advertiser));
  const filteredAdvertisers = advertisers.filter((advertiser) => {
    const searchText = `${advertiser.id} ${advertiserName(advertiser)} ${advertiser.companyName || ""}`.toLowerCase();
    return searchText.includes(advertiserSearch.trim().toLowerCase());
  });

  const selectAdvertiser = (advertiser) => {
    setFormData((previous) => ({ ...previous, advertiser: String(advertiser.id) }));
    setAdvertiserSearch("");
    setAdvertiserDropdownOpen(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      uploadLogo: e.target.files[0],
    }));
  };

  const handleAddAdvertiser = () => {
    if (newAdvertiser.trim()) {
      setAdvertisers([...advertisers, { id: Date.now(), firstName: newAdvertiser, lastName: "" }]);
      setNewAdvertiser("");
      setShowAdvertiserModal(false);
    }
  };

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      setCategories([...categories, { id: Date.now(), name: newCategory }]);
      setNewCategory("");
      setShowCategoryModal(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Offer Data:", formData);
    alert("Offer Created Successfully ✅");
    navigate("/offers");
  };

  const nextStep = () => {
    if (activeStep === 1) {
      // Validate required fields for step 1
      if (!formData.offerName) {
        alert("Please enter Offer Name");
        return;
      }
      if (!formData.advertiser) {
        alert("Please select Advertiser");
        return;
      }
      if (!formData.offerUrl) {
        alert("Please enter Offer URL");
        return;
      }
    }
    if (activeStep < 5) {
      setActiveStep(activeStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="of-layout">
      <Sidebar isCollapsed={isSidebarCollapsed} />

      <div className="of-main">
        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        <div className="create-offer-container">
          {/* Header */}
          <div className="offer-header">
            <h1 className="offer-title">Create Offer</h1>
          </div>

          <div className="step-navigation compact-steps">
            {[
              "▣  GENERAL - STEP 1",
              "▣  LANDING - STEP 2",
              "◉  TARGETING - STEP 3",
              "▣  CREATIVES - STEP 4",
              "♧  AFFILIATES - STEP 5",
            ].map((step, index) => (
              <button key={step} type="button" className={`compact-step ${activeStep === index + 1 ? "active" : ""}`} onClick={() => setActiveStep(index + 1)}>
                {step}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: General */}
            {activeStep === 1 && (
              <div className="offer-form">
                <div className="form-section general-info-section">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Offer Type</label>
                      <select 
                        name="offerType" 
                        value={formData.offerType} 
                        onChange={handleChange}
                        className="form-control"
                      >
                        <option>General</option>
                        <option>Mobile</option>
                        <option>Incentive</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Offer Name *</label>
                      <input
                        type="text"
                        name="offerName"
                        value={formData.offerName}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter offer name"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Upload Logo</label>
                      <input
                        type="file"
                        name="uploadLogo"
                        onChange={handleFileChange}
                        className="form-control"
                        accept="image/*"
                      />
                    </div>
                    <div className="form-group">
                      <label>Advertiser *</label>
                      <div className="select-with-button advertiser-picker">
                        <button
                          type="button"
                          className="advertiser-picker-trigger"
                          aria-haspopup="listbox"
                          aria-expanded={advertiserDropdownOpen}
                          onClick={() => setAdvertiserDropdownOpen((isOpen) => !isOpen)}
                        >
                          <span>{selectedAdvertiser ? `${selectedAdvertiser.id} ~ ${advertiserName(selectedAdvertiser)}` : "Select Advertiser"}</span>
                          <span aria-hidden="true">▾</span>
                        </button>
                        {advertiserDropdownOpen && (
                          <div className="advertiser-picker-menu" role="listbox" aria-label="Advertisers">
                            <input
                              type="search"
                              autoFocus
                              value={advertiserSearch}
                              onChange={(event) => setAdvertiserSearch(event.target.value)}
                              placeholder="Search advertiser"
                              aria-label="Search advertisers"
                            />
                            <div className="advertiser-picker-options">
                              {advertisersLoading && <p>Loading advertisers…</p>}
                              {!advertisersLoading && advertisersError && <p>{advertisersError}</p>}
                              {!advertisersLoading && !advertisersError && filteredAdvertisers.length === 0 && <p>No advertisers found</p>}
                              {filteredAdvertisers.map((advertiser) => (
                                <button
                                  type="button"
                                  role="option"
                                  aria-selected={String(advertiser.id) === String(formData.advertiser)}
                                  className="advertiser-picker-option"
                                  key={advertiser.id}
                                  onClick={() => selectAdvertiser(advertiser)}
                                >
                                  <span className="advertiser-avatar">{advertiserInitials(advertiser)}</span>
                                  <span><strong>{advertiser.id} ~ {advertiserName(advertiser)}</strong><small>{advertiser.status || advertiser.companyName || "Advertiser"}</small></span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Offer Category</label>
                      <div className="select-with-button">
                        <select 
                          name="offerCategory" 
                          value={formData.offerCategory} 
                          onChange={handleChange}
                          className="form-control"
                        >
                          <option value="">Select Category</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                          ))}
                        </select>
                        <button 
                          type="button" 
                          className="btn secondary small"
                          onClick={() => setShowCategoryModal(true)}
                        >
                          + Create
                        </button>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>AppID</label>
                      <input
                        type="text"
                        name="appId"
                        value={formData.appId}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter App ID"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>External Offer ID</label>
                      <input
                        type="text"
                        name="externalOfferId"
                        value={formData.externalOfferId}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter External Offer ID"
                      />
                    </div>
                    <div className="form-group">
                      <label>Offer Preview URL</label>
                      <input
                        type="text"
                        name="offerPreviewUrl"
                        value={formData.offerPreviewUrl}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter preview URL"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Offer URL *</label>
                      <textarea
                        name="offerUrl"
                        value={formData.offerUrl}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter offer URL"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Advertiser URL Builder</label>
                      <input
                        type="text"
                        name="advertiserUrlBuilder"
                        value={formData.advertiserUrlBuilder}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter URL builder"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Landing Page</label>
                      <input
                        type="text"
                        name="landingPage"
                        value={formData.landingPage}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter landing page"
                      />
                    </div>
                    <div className="form-group">
                      <label>Tokens</label>
                      <input
                        type="text"
                        name="tokens"
                        value={formData.tokens}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter tokens"
                      />
                    </div>
                  </div>
                </div>

                {/* Advertiser Pricing */}
                <div className="form-section compact-pricing-section">
                  <h3 className="section-title">Advertiser Pricing (Revenue) *</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Select Model</label>
                      <select 
                        name="advertiserModel" 
                        value={formData.advertiserModel} 
                        onChange={handleChange}
                        className="form-control"
                      >
                        <option value="">Select Model</option>
                        <option value="cpa">CPA</option>
                        <option value="cpc">CPC</option>
                        <option value="cpm">CPM</option>
                        <option value="cpl">CPL</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Amount</label>
                      <input
                        type="number"
                        name="advertiserPrice"
                        value={formData.advertiserPrice}
                        onChange={handleChange}
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label>Select Currency</label>
                      <select 
                        name="advertiserCurrency" 
                        value={formData.advertiserCurrency} 
                        onChange={handleChange}
                        className="form-control"
                      >
                        <option value="">Select Currency</option>
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="INR">INR - Indian Rupee</option>
                        <option value="AUD">AUD - Australian Dollar</option>
                        <option value="CAD">CAD - Canadian Dollar</option>
                        <option value="SGD">SGD - Singapore Dollar</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Affiliate Pricing */}
                <div className="form-section compact-pricing-section">
                  <h3 className="section-title">Affiliate Pricing (Payout) *</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Select Model</label>
                      <select 
                        name="affiliateModel" 
                        value={formData.affiliateModel} 
                        onChange={handleChange}
                        className="form-control"
                      >
                        <option value="">Select Model</option>
                        <option value="cpa">CPA</option>
                        <option value="cpc">CPC</option>
                        <option value="cpm">CPM</option>
                        <option value="cpl">CPL</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Amount</label>
                      <input
                        type="number"
                        name="affiliatePrice"
                        value={formData.affiliatePrice}
                        onChange={handleChange}
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label>Hide Payout</label>
                      <label className="switch">
                        <input
                          type="checkbox"
                          name="hidePayout"
                          checked={formData.hidePayout}
                          onChange={handleChange}
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Schedule */}
                <div className="form-section">
                  <h3 className="section-title">Schedule</h3>
                  <div className="form-row compact-schedule-row">
                    <div className="form-group">
                      <label>Start Date & Time</label>
                      <input
                        type="datetime-local"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label>End Date & Time</label>
                      <input
                        type="datetime-local"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label>Daily Start/Stop</label>
                      <label className="switch">
                        <input type="checkbox" name="dailyScheduleEnabled" checked={formData.dailyScheduleEnabled} onChange={handleChange} />
                        <span className="slider round"></span>
                      </label>
                      <div className="time-group">
                        <input
                          type="time"
                          name="dailyStartTime"
                          value={formData.dailyStartTime}
                          onChange={handleChange}
                          step="1"
                          className="form-control"
                        />
                        <span className="time-separator">to</span>
                        <input
                          type="time"
                          name="dailyEndTime"
                          value={formData.dailyEndTime}
                          onChange={handleChange}
                          step="1"
                          className="form-control"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Offer Settings */}
                <div className="form-section">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Offer Visibility</label>
                      <select 
                        name="offerVisibility" 
                        value={formData.offerVisibility} 
                        onChange={handleChange}
                        className="form-control"
                      >
                        <option>Public</option>
                        <option>Private</option>
                        <option>Unlisted</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Status</label>
                      <select 
                        name="status" 
                        value={formData.status} 
                        onChange={handleChange}
                        className="form-control"
                      >
                        <option>Approve</option>
                        <option>Pending</option>
                        <option>Rejected</option>
                        <option>Draft</option>
                      </select>
                    </div>
                    <div className="form-group setting-toggle">
                      <label className="switch">
                        <input type="checkbox" name="alertToAffiliates" checked={formData.alertToAffiliates} onChange={handleChange} />
                        <span className="slider round"></span>
                      </label>
                      <label>Alert to Affiliates</label>
                    </div>
                     <div className="form-group deep-links-toggle">
                      <label>Deep Links</label>
                      <label className="switch">
                        <input
                          type="checkbox"
                          name="deepLinks"
                          checked={formData.deepLinks}
                        onChange={handleChange}
                        />
                        <span className="slider round"></span>
                      </label>
                      <label>Enable</label>
                    </div>
                  </div>
                </div>

                {/* Description and Terms */}
                <div className="form-section">
                  <div className="form-group">
                    <label>Terms</label>
                    <RichTextOfferEditor formData={formData} setFormData={setFormData} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Landing pages */}
            {activeStep === 2 && (
              <div className="offer-form landing-v2-form">
                <section className="landing-v2" aria-label="Landing Page V2">
                  <div className="landing-v2-toolbar">
                    <h2>Landing Page V2</h2>
                    <div className="landing-v2-actions">
                      <label className="landing-random-toggle">
                        <span>Affiliate Random URL</span>
                        <span className="switch">
                          <input type="checkbox" checked={affiliateRandomUrl} onChange={(event) => setAffiliateRandomUrl(event.target.checked)} />
                          <span className="slider round" />
                        </span>
                      </label>
                      <button type="button" onClick={() => setLandingPages((pages) => [...pages, { id: "", name: `landing_url_${pages.length}`, type: "default", url: "", targeting: "", affiliate: "", weight: "", updatedAt: "", status: "" }])}>+ Add Landing Page</button>
                      <button type="button">Manage Weight</button>
                      <button type="button">☁ Import Landing Page (.csv)</button>
                    </div>
                  </div>

                  <div className="landing-table-wrap">
                    <table className="landing-v2-table">
                      <thead>
                        <tr>
                          <th>ID</th><th>Name</th><th>Type</th><th>URL</th><th>Targeting</th><th>Affiliate</th><th>Weight</th><th>Updated At</th><th>Status</th><th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {landingPages.map((page, index) => (
                          <tr key={`${page.name}-${index}`}>
                            <td>{page.id}</td><td>{page.name}</td><td>{page.type}</td><td>{page.url}</td><td>{page.targeting}</td><td>{page.affiliate}</td><td>{page.weight}</td><td>{page.updatedAt}</td><td>{page.status}</td><td />
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
                <div className="form-actions landing-v2-footer">
                  <button type="button" className="btn secondary" onClick={prevStep}>Previous</button>
                  <button type="button" className="btn primary" onClick={nextStep}>Submit &amp; Next Set Targeting</button>
                </div>
                </div>
            )}

            {/* Step 3: Targeting */}
            {activeStep === 3 && (
              <div className="offer-form targeting-v2-form">
                <section className="targeting-v2" aria-label="Targeting Rules">
                  <div className="targeting-v2-toolbar">
                    <div className="targeting-v2-heading">
                      <h2>▧&nbsp; Targeting Rules</h2>
                      <button type="button" onClick={() => setTargetingRules((rules) => [...rules, { id: rules.length + 1, enabled: true }])}>+ Add Rule</button>
                    </div>
                    <div className="targeting-v2-actions">
                      <button type="button" onClick={nextStep}>◉ Next Upload Creative</button>
                      <button type="button" className="targeting-old-version">Targeting Old Version →</button>
                    </div>
                  </div>
                  {targetingRules.map((rule) => (
                    <article className="target-rule-card" key={rule.id}>
                      <div className="target-rule-card-title">＋&nbsp; Create Target Rule</div>
                      <div className="target-rule-card-body">
                        <div className="target-rule-name">
                          <label>Rule Name</label>
                          <input type="text" placeholder="Rule name" aria-label="Rule name" />
                        </div>

                        <div className="target-rule-divider" />

                        <div className="target-rule-actions-row">
                          {['Action On Clicks', 'Action On Conversions', 'Action On Impressions'].map((label) => (
                            <label key={label}>
                              <span>{label}</span>
                              <select defaultValue="none"><option value="none">No Action</option><option>Redirect</option><option>Block</option></select>
                            </label>
                          ))}
                        </div>

                        <div className="target-rule-divider" />

                        <div className="target-rule-conditions">
                          {[
                            ['Country', 'Select Country'], ['OS', 'Select OS'], ['Browser', 'Select Browser'], ['Device Type', 'Select Device Type'], ['ISP', 'Select ISP'],
                          ].map(([label, placeholder]) => (
                            <div className="target-rule-condition" key={label}>
                              <label>{label}</label>
                              <select defaultValue="equal"><option value="equal">is equal</option><option>is not equal</option></select>
                              <input type="text" placeholder={placeholder} aria-label={placeholder} />
                            </div>
                          ))}
                          <button type="button" className="target-rule-add-more">＋ Add More</button>
                        </div>

                        <div className="target-rule-divider" />

                        <div className="target-rule-footer-row">
                          <label>Affiliate Visibility</label>
                          <select defaultValue="show"><option value="show">Show</option><option>Hide</option></select>
                          <label className="switch target-rule-switch">
                            <input type="checkbox" checked={rule.enabled} onChange={(event) => setTargetingRules((rules) => rules.map((item) => item.id === rule.id ? { ...item, enabled: event.target.checked } : item))} />
                            <span className="slider round" />
                          </label>
                          <span>Enable Rule</span>
                        </div>

                        <div className="target-rule-divider target-rule-last-divider" />
                        <div className="target-rule-submit-row"><button type="button">◉ Submit</button></div>
                      </div>
                    </article>
                  ))}
                </section>
                <WizardStepFooter onPrevious={prevStep} onNext={nextStep} />
                </div>
            )}

            {/* Step 4: Creatives */}
            {activeStep === 4 && (
              <div className="offer-form creatives-v2-form">
                <section className="creatives-v2" aria-label="Creatives">
                  <div className="creatives-v2-upload-row">
                    <label htmlFor="creative-upload-type">Upload</label>
                    <select id="creative_type" className="form-control" name="creative_type" value={creativeUploadType} onChange={(event) => { setCreativeUploadType(event.target.value); setCreativeFileName(""); }}>
                      <option value="">Choose Creatives</option>
                      <option value="html">HTML ( Zip File Only )</option>
                      <option value="html_file">HTML File</option>
                      <option value="image">Image ( PNG , JPEG , GIF , ICO , SVG , WEBP )</option>
                      <option value="video">Video ( MP4 , MPEG , WEBM )</option>
                      <option value="link">Link</option>
                      <option value="logo">Offer Logo (Single File)</option>
                    </select>
                    {creativeUploadType && creativeUploadType !== "link" && (
                      <label className="creative-file-picker">
                        ☁&nbsp; {creativeFileName || (creativeUploadType === "html" ? "Choose Zip File" : "Choose File")}
                        <input
                          type="file"
                          accept={creativeUploadType === "html" ? ".zip,application/zip" : undefined}
                          onChange={(event) => setCreativeFileName(event.target.files?.[0]?.name || "")}
                        />
                      </label>
                    )}
                    <button type="button">◉ Next Assign Affiliate</button>
                  </div>
                  <div className="creatives-v2-table-wrap">
                    <table className="creatives-v2-table">
                      <thead>
                        <tr><th>CreativeID</th><th>OfferID</th><th>Title</th><th>Dimensions</th><th>Size</th><th>Preview</th><th>Action</th><th>Affiliate Tracking URL</th></tr>
                      </thead>
                      <tbody><tr><td colSpan="8" /></tr></tbody>
                    </table>
                  </div>
                </section>
                <WizardStepFooter onPrevious={prevStep} onNext={nextStep} />
                </div>
            )}

            {/* Step 5: Affiliates */}
            {activeStep === 5 && (
              <div className="offer-form affiliates-v2-form">
                <section className="affiliates-v2" aria-label="Manage Affiliates">
                  <div className="affiliates-v2-main">
                    <div className="affiliates-v2-toolbar">
                      <div className="affiliates-v2-title">♧&nbsp; Manage Affiliates <button type="button" aria-label="Refresh affiliates">⟳</button></div>
                      <label className="affiliates-v2-search">Search:<input value={affiliateSearch} onChange={(event) => setAffiliateSearch(event.target.value)} /></label>
                    </div>
                    <div className="affiliates-v2-columns"><span>◉&nbsp; OfferID</span><span>♙&nbsp; Affiliate</span><span>⚙&nbsp; Action</span></div>
                    <h2 className="affiliates-v2-unassigned">?&nbsp;&nbsp; Not Assigned</h2>
                    <div className="affiliates-v2-rows">
                      {offerAffiliates.filter((item) => item.affiliate.toLowerCase().includes(affiliateSearch.toLowerCase()) || item.offer.toLowerCase().includes(affiliateSearch.toLowerCase())).map((item) => (
                        <div className="affiliate-v2-row" key={item.id}>
                          <span>{item.offer}</span>
                          <span className="affiliate-v2-name"><i style={{ background: item.color }}>{item.initials}</i>{item.affiliate}</span>
                          <span className="affiliate-v2-actions"><button type="button" onClick={() => setOfferAffiliates((items) => items.filter((affiliate) => affiliate.id !== item.id))}>＋ Assign Offer</button><button type="button">⊗ Reject</button></span>
                        </div>
                      ))}
                    </div>
                    <div className="affiliates-v2-bottom">
                      <label><input type="checkbox" /> Send Alert to Affiliate</label>
                      <label><input type="checkbox" /> Send Alert to Admin</label>
                      <button type="button" onClick={() => setOfferAffiliates([])}>＋ Assign All</button>
                    </div>
                    <div className="affiliates-v2-finish"><button type="button" onClick={handleSubmit}>✓ Finish Offer Create</button></div>
                  </div>

                  <aside className="affiliates-v2-summary">
                    <div className="affiliates-v2-share">♧ <strong>Affiliate Tracking URL</strong><small>Share Affiliate Tracking URL</small></div>
                    {[['▤', '3', 'ALL AFFILIATES', '#00a9f4'], ['◷', '0', 'PENDING', '#f4b900'], ['☑', '0', 'APPROVED', '#20b855'], ['⊗', '0', 'REJECTED', '#ff4a42']].map(([icon, count, label, color]) => (
                      <div className="affiliates-v2-stat" key={label}><i style={{ color }}>{icon}</i><div><b>{count}</b><span>↗&nbsp; {label}</span></div></div>
                    ))}
                  </aside>
                </section>
              </div>
            )}

            {/* Submit button for Step 1 */}
            {activeStep === 1 && (
              <div className="form-actions">
                <button type="button" className="btn secondary" onClick={() => navigate("/offers")}>Cancel</button>
                <button type="button" className="btn primary" onClick={nextStep}>Submit & Next Set Targeting</button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Advertiser Modal */}
      {showAdvertiserModal && (
        <div className="modal-overlay" onClick={() => setShowAdvertiserModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Create New Advertiser</h3>
            <input
              type="text"
              className="form-control"
              placeholder="Enter advertiser name"
              value={newAdvertiser}
              onChange={(e) => setNewAdvertiser(e.target.value)}
            />
            <div className="modal-actions">
              <button className="btn secondary" onClick={() => setShowAdvertiserModal(false)}>Cancel</button>
              <button className="btn primary" onClick={handleAddAdvertiser}>Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="modal-overlay" onClick={() => setShowCategoryModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Create New Category</h3>
            <input
              type="text"
              className="form-control"
              placeholder="Enter category name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <div className="modal-actions">
              <button className="btn secondary" onClick={() => setShowCategoryModal(false)}>Cancel</button>
              <button className="btn primary" onClick={handleAddCategory}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
