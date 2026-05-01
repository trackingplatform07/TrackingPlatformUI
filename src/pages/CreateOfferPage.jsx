import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/CreateOfferPage.css";

export default function CreateOfferPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const navigate = useNavigate();

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
    startDate: "",
    endDate: "",
    dailyStartTime: "00:00:00",
    dailyEndTime: "00:00:00",
    
    // Offer Settings
    offerVisibility: "Public",
    status: "Approve",
    alertToAffiliates: false,
    deepLinks: "Enable",
    terms: "",
    offerDescription: "",
    privateNote: "",
    paOfferTerms: "",
    styles: "",
  });

  const [advertisers, setAdvertisers] = useState([
    { id: 1, name: "Advertiser 1" },
    { id: 2, name: "Advertiser 2" },
    { id: 3, name: "Advertiser 3" },
  ]);

  const [categories, setCategories] = useState([
    { id: 1, name: "Category 1" },
    { id: 2, name: "Category 2" },
    { id: 3, name: "Category 3" },
  ]);

  const [showAdvertiserModal, setShowAdvertiserModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newAdvertiser, setNewAdvertiser] = useState("");
  const [newCategory, setNewCategory] = useState("");

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
      setAdvertisers([...advertisers, { id: Date.now(), name: newAdvertiser }]);
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
    if (activeStep < 4) {
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

          {/* Step Navigation */}
          <div className="step-navigation">
            <div 
              className={`step-item ${activeStep === 1 ? 'active' : ''} ${activeStep > 1 ? 'completed' : ''}`}
              onClick={() => setActiveStep(1)}
            >
              <div className="step-number">1</div>
              <div className="step-label">GENERAL-STEP1</div>
            </div>
            <div className="step-line"></div>
            <div 
              className={`step-item ${activeStep === 2 ? 'active' : ''} ${activeStep > 2 ? 'completed' : ''}`}
              onClick={() => setActiveStep(2)}
            >
              <div className="step-number">2</div>
              <div className="step-label">TARGETING-STEP2</div>
            </div>
            <div className="step-line"></div>
            <div 
              className={`step-item ${activeStep === 3 ? 'active' : ''} ${activeStep > 3 ? 'completed' : ''}`}
              onClick={() => setActiveStep(3)}
            >
              <div className="step-number">3</div>
              <div className="step-label">CREATIVES-STEP3</div>
            </div>
            <div className="step-line"></div>
            <div 
              className={`step-item ${activeStep === 4 ? 'active' : ''}`}
              onClick={() => setActiveStep(4)}
            >
              <div className="step-number">4</div>
              <div className="step-label">AFFILIATES-STEP4</div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: General */}
            {activeStep === 1 && (
              <div className="offer-form">
                <div className="form-section">
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
                      <div className="select-with-button">
                        <select 
                          name="advertiser" 
                          value={formData.advertiser} 
                          onChange={handleChange}
                          className="form-control"
                          required
                        >
                          <option value="">Select Advertiser</option>
                          {advertisers.map(adv => (
                            <option key={adv.id} value={adv.name}>{adv.name}</option>
                          ))}
                        </select>
                        <button 
                          type="button" 
                          className="btn secondary small"
                          onClick={() => setShowAdvertiserModal(true)}
                        >
                          + Create
                        </button>
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
                      <input
                        type="text"
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
                <div className="form-section">
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
                <div className="form-section">
                  <h3 className="section-title">Affiliate Pricing (Payout)</h3>
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
                    <div className="form-group checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="hidePayout"
                          checked={formData.hidePayout}
                          onChange={handleChange}
                        />
                        <span>Hide Payout</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Schedule */}
                <div className="form-section">
                  <h3 className="section-title">Schedule</h3>
                  <div className="form-row">
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
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Daily Start/Stop</label>
                      <div className="time-group">
                        <input
                          type="time"
                          name="dailyStartTime"
                          value={formData.dailyStartTime}
                          onChange={handleChange}
                          className="form-control"
                        />
                        <span className="time-separator">to</span>
                        <input
                          type="time"
                          name="dailyEndTime"
                          value={formData.dailyEndTime}
                          onChange={handleChange}
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
                  </div>

                  <div className="form-row">
                    <div className="form-group checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="alertToAffiliates"
                          checked={formData.alertToAffiliates}
                          onChange={handleChange}
                        />
                        <span>Alert to Affiliates</span>
                      </label>
                    </div>
                    <div className="form-group">
                      <label>Deep Links</label>
                      <select 
                        name="deepLinks" 
                        value={formData.deepLinks} 
                        onChange={handleChange}
                        className="form-control"
                      >
                        <option>Enable</option>
                        <option>Disable</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Description and Terms */}
                <div className="form-section">
                  <div className="form-group">
                    <label>Terms</label>
                    <textarea
                      name="terms"
                      value={formData.terms}
                      onChange={handleChange}
                      className="form-control"
                      rows="3"
                      placeholder="Enter terms and conditions"
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label>Offer Description</label>
                    <textarea
                      name="offerDescription"
                      value={formData.offerDescription}
                      onChange={handleChange}
                      className="form-control"
                      rows="3"
                      placeholder="Enter offer description"
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label>Private Note</label>
                    <textarea
                      name="privateNote"
                      value={formData.privateNote}
                      onChange={handleChange}
                      className="form-control"
                      rows="2"
                      placeholder="Enter private note"
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label>PA Offer Terms/KPI</label>
                    <textarea
                      name="paOfferTerms"
                      value={formData.paOfferTerms}
                      onChange={handleChange}
                      className="form-control"
                      rows="2"
                      placeholder="Enter PA Offer Terms/KPI"
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label>Styles</label>
                    <div className="styles-editor">
                      <button type="button" className="style-btn">Format</button>
                      <button type="button" className="style-btn">ABCD</button>
                      <button type="button" className="style-btn">AI Rewrite</button>
                    </div>
                    <textarea
                      name="styles"
                      value={formData.styles}
                      onChange={handleChange}
                      className="form-control"
                      rows="4"
                      placeholder="Enter custom styles"
                    ></textarea>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Targeting */}
            {activeStep === 2 && (
              <div className="offer-form">
                <div className="form-section">
                  <h3 className="section-title">Targeting Settings</h3>
                  <div className="form-group">
                    <label>Countries</label>
                    <select className="form-control" multiple size="5">
                      <option>United States</option>
                      <option>United Kingdom</option>
                      <option>Canada</option>
                      <option>Australia</option>
                      <option>India</option>
                      <option>Germany</option>
                      <option>France</option>
                    </select>
                    <small className="form-help">Hold Ctrl/Cmd to select multiple</small>
                  </div>
                  
                  <div className="form-group">
                    <label>Devices</label>
                    <div className="checkbox-group-row">
                      <label className="checkbox-label">
                        <input type="checkbox" /> 
                        <span>Desktop</span>
                      </label>
                      <label className="checkbox-label">
                        <input type="checkbox" /> 
                        <span>Mobile</span>
                      </label>
                      <label className="checkbox-label">
                        <input type="checkbox" /> 
                        <span>Tablet</span>
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Operating Systems</label>
                    <div className="checkbox-group-row">
                      <label className="checkbox-label">
                        <input type="checkbox" /> 
                        <span>Windows</span>
                      </label>
                      <label className="checkbox-label">
                        <input type="checkbox" /> 
                        <span>macOS</span>
                      </label>
                      <label className="checkbox-label">
                        <input type="checkbox" /> 
                        <span>iOS</span>
                      </label>
                      <label className="checkbox-label">
                        <input type="checkbox" /> 
                        <span>Android</span>
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Browsers</label>
                    <div className="checkbox-group-row">
                      <label className="checkbox-label">
                        <input type="checkbox" /> 
                        <span>Chrome</span>
                      </label>
                      <label className="checkbox-label">
                        <input type="checkbox" /> 
                        <span>Firefox</span>
                      </label>
                      <label className="checkbox-label">
                        <input type="checkbox" /> 
                        <span>Safari</span>
                      </label>
                      <label className="checkbox-label">
                        <input type="checkbox" /> 
                        <span>Edge</span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="button" className="btn secondary" onClick={prevStep}>Previous</button>
                  <button type="button" className="btn primary" onClick={nextStep}>Next: Creatives</button>
                </div>
              </div>
            )}

            {/* Step 3: Creatives */}
            {activeStep === 3 && (
              <div className="offer-form">
                <div className="form-section">
                  <h3 className="section-title">Creatives</h3>
                  <div className="form-group">
                    <label>Banner Images</label>
                    <input type="file" multiple className="form-control" accept="image/*" />
                    <small className="form-help">Upload multiple banners (JPG, PNG, GIF)</small>
                  </div>
                  
                  <div className="form-group">
                    <label>Video URL</label>
                    <input type="text" className="form-control" placeholder="Enter video URL (YouTube, Vimeo, etc.)" />
                  </div>

                  <div className="form-group">
                    <label>HTML Banner</label>
                    <textarea 
                      className="form-control" 
                      rows="5"
                      placeholder="Paste HTML code for banner"
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label>Preview</label>
                    <div className="preview-placeholder">
                      <p>Creative preview will appear here</p>
                    </div>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="button" className="btn secondary" onClick={prevStep}>Previous</button>
                  <button type="button" className="btn primary" onClick={nextStep}>Next: Affiliates</button>
                </div>
              </div>
            )}

            {/* Step 4: Affiliates */}
            {activeStep === 4 && (
              <div className="offer-form">
                <div className="form-section">
                  <h3 className="section-title">Affiliate Settings</h3>
                  <div className="form-group">
                    <label>Select Affiliates</label>
                    <select className="form-control" multiple size="5">
                      <option>All Affiliates</option>
                      <option>Premium Affiliates</option>
                      <option>New Affiliates</option>
                      <option>Top Performers</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Approval Required</label>
                    <div className="radio-group-row">
                      <label className="radio-label">
                        <input type="radio" name="approval" value="auto" defaultChecked />
                        <span>Auto Approve</span>
                      </label>
                      <label className="radio-label">
                        <input type="radio" name="approval" value="manual" />
                        <span>Manual Approve</span>
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Affiliate Commission</label>
                    <div className="form-row">
                      <div className="form-group">
                        <input type="text" className="form-control" placeholder="Special commission %" />
                      </div>
                      <div className="form-group">
                        <select className="form-control">
                          <option>Fixed Amount</option>
                          <option>Percentage</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="button" className="btn secondary" onClick={prevStep}>Previous</button>
                  <button type="submit" className="btn primary">Submit & Save</button>
                </div>
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