import React, { useState, useEffect, useRef } from 'react';
import '../css/AddGlobalPostbackModal.css';

const AddGlobalPostbackModal = ({ onClose, editingData, onSaved }) => {
  const [formData, setFormData] = useState({
    position: 'global',
    affiliateId: '',
    integrationType: 'default',
    postbackType: 's2s',
    postbackUrl: '',
    httpMethod: 'GET',
    headers: [{ name: '', value: '' }],
    postBodyType: 'form',
    postBodyFields: [{ name: '', value: '' }],
    jsonBody: '{}',
    rawBody: '',
    advanceSetup: false,
  });

  const [affiliates, setAffiliates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdvance, setShowAdvance] = useState(false);
  const [showPostBody, setShowPostBody] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  // Dynamic API call for affiliates
  useEffect(() => {
    const fetchAffiliates = async () => {
      try {
        const token = JSON.parse(localStorage.getItem('user'))?.token;
        const response = await fetch('https://localhost:7029/api/Affiliates', {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch affiliates');
        }
        
        const data = await response.json();
        setAffiliates(data);
      } catch (error) {
        console.error('Error fetching affiliates:', error);
        setAffiliates([]);
      }
    };
    fetchAffiliates();
  }, []);

  // Load editing data if provided
  useEffect(() => {
    if (editingData) {
      setIsEditMode(true);
      setEditId(editingData.id);
      
      // Parse postback URL to extract method and URL
      let postbackUrl = editingData.postbackUrl || '';
      let httpMethod = 'GET';
      
      if (postbackUrl.startsWith('GET ')) {
        httpMethod = 'GET';
        postbackUrl = postbackUrl.substring(4);
      } else if (postbackUrl.startsWith('POST ')) {
        httpMethod = 'POST';
        postbackUrl = postbackUrl.substring(5);
      }
      
      setFormData({
        position: editingData.position || 'global',
        affiliateId: editingData.affiliateRawId?.toString() || editingData.affiliateId?.toString() || '',
        integrationType: editingData.integrationType || 'default',
        postbackType: editingData.type || 's2s',
        postbackUrl: postbackUrl,
        httpMethod: httpMethod,
        headers: [{ name: '', value: '' }],
        postBodyType: 'form',
        postBodyFields: [{ name: '', value: '' }],
        jsonBody: '{}',
        rawBody: '',
        advanceSetup: false,
      });
    } else {
      // Reset form for create mode
      setIsEditMode(false);
      setEditId(null);
      setFormData({
        position: 'global',
        affiliateId: '',
        integrationType: 'default',
        postbackType: 's2s',
        postbackUrl: '',
        httpMethod: 'GET',
        headers: [{ name: '', value: '' }],
        postBodyType: 'form',
        postBodyFields: [{ name: '', value: '' }],
        jsonBody: '{}',
        rawBody: '',
        advanceSetup: false,
      });
    }
  }, [editingData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Handle special cases
    if (name === 'integrationType' && value === 'privacy_postback') {
      setShowAdvance(false);
      setFormData(prev => ({ ...prev, advanceSetup: false }));
    } else if (name === 'postbackType') {
      if (value === 's2s' && formData.integrationType !== 'privacy_postback') {
        setShowAdvance(formData.advanceSetup);
      } else {
        setShowAdvance(false);
        setFormData(prev => ({ ...prev, advanceSetup: false }));
      }
      // Partner templates
      const partners = ['facebook', 'snapchat', 'tiktok'];
      if (partners.includes(value)) {
        setSelectedPartner(value);
      } else {
        setSelectedPartner(null);
      }
    } else if (name === 'httpMethod') {
      setShowPostBody(value === 'POST');
      if (value !== 'POST') {
        setFormData(prev => ({ ...prev, postBodyType: 'form', postBodyFields: [{ name: '', value: '' }], jsonBody: '{}', rawBody: '' }));
      }
    }
  };

  const handleHeaderChange = (index, field, value) => {
    const updatedHeaders = [...formData.headers];
    updatedHeaders[index][field] = value;
    setFormData(prev => ({ ...prev, headers: updatedHeaders }));
  };

  const addHeader = () => {
    setFormData(prev => ({
      ...prev,
      headers: [...prev.headers, { name: '', value: '' }]
    }));
  };

  const removeHeader = (index) => {
    setFormData(prev => ({
      ...prev,
      headers: prev.headers.filter((_, i) => i !== index)
    }));
  };

  const handleFieldChange = (index, field, value) => {
    const updatedFields = [...formData.postBodyFields];
    updatedFields[index][field] = value;
    setFormData(prev => ({ ...prev, postBodyFields: updatedFields }));
  };

  const addField = () => {
    setFormData(prev => ({
      ...prev,
      postBodyFields: [...prev.postBodyFields, { name: '', value: '' }]
    }));
  };

  const removeField = (index) => {
    setFormData(prev => ({
      ...prev,
      postBodyFields: prev.postBodyFields.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!formData.affiliateId) {
      alert('Please select an affiliate');
      return;
    }
    if (!formData.postbackUrl && !selectedPartner) {
      alert('Please enter Postback URL');
      return;
    }

    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const createdBy = user?.email || user?.name || 'system';
      const token = user?.token;

      // Get affiliate name
      const selectedAffiliate = affiliates.find(aff => aff.id === parseInt(formData.affiliateId));
      const affiliateName = selectedAffiliate 
        ? `${selectedAffiliate.firstName || ''} ${selectedAffiliate.lastName || ''}`.trim() || selectedAffiliate.email || ''
        : '';

      let response;
      
      if (isEditMode && editId) {
        // EDIT MODE - Use PUT request
        // Prepare payload for edit (same structure as CREATE)
        const payload = {
          affiliateId: formData.affiliateId.toString(),
          affiliateName: affiliateName,
          position: formData.position,
          offerId: '',
          eventType: '',
          integrationType: formData.integrationType,
          type: formData.postbackType,
          postbackUrl: formData.postbackUrl,
          status: 'active',
          triggerType: 'conversion',
          createdBy: createdBy
        };

        console.log('Updating postback with payload:', payload);
        
        response = await fetch(`https://localhost:7029/api/AffiliatePostback/${editId}`, {
          method: 'PUT',
          headers: {
            'accept': '*/*',
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify(payload),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to update postback');
        }
        
        alert('Postback updated successfully ✅');
      } else {
        // CREATE MODE - Keep original working code
        const payload = {
          affiliateId: formData.affiliateId.toString(),
          affiliateName: affiliateName,
          position: formData.position,
          offerId: formData.position === 'offer' ? '' : '',
          eventType: '',
          integrationType: formData.integrationType,
          type: formData.postbackType,
          postbackUrl: formData.postbackUrl,
          status: 'active',
          triggerType: 'conversion',
          createdBy: createdBy
        };

        console.log('Creating postback with payload:', payload);
        
        response = await fetch('https://localhost:7029/api/AffiliatePostback', {
          method: 'POST',
          headers: {
            'accept': '*/*',
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify(payload),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to add postback');
        }
        
        alert('Postback added successfully ✅');
      }
      
      if (onSaved) {
        onSaved();
      }
      
      onClose();
    } catch (error) {
      console.error(error);
      alert(`Error: ${error.message} ❌`);
    } finally {
      setLoading(false);
    }
  };

  // Token list for reference
  const tokens = [
    { label: 'Aff Click ID', value: '{aff_click_id}' },
    { label: 'Sub Affiliate ID', value: '{sub_aff_id}' },
    { label: 'Aff Sub ID 1', value: '{aff_sub1}' },
    { label: 'Aff Sub ID 2', value: '{aff_sub2}' },
    { label: 'Aff Sub ID 3', value: '{aff_sub3}' },
    { label: 'Aff Sub ID 4', value: '{aff_sub4}' },
    { label: 'Aff Sub ID 5', value: '{aff_sub5}' },
    { label: 'Aff Sub ID 6', value: '{aff_sub6}' },
    { label: 'Aff Sub ID 7', value: '{aff_sub7}' },
    { label: 'Aff Sub ID 8', value: '{aff_sub8}' },
    { label: 'Aff Sub ID 9', value: '{aff_sub9}' },
    { label: 'Aff Sub ID 10', value: '{aff_sub10}' },
    { label: 'Event Token', value: '{event_token}' },
    { label: 'Offer Payout', value: '{payout}' },
    { label: 'Payout Currency', value: '{currency}' },
    { label: 'Source', value: '{source}' },
    { label: 'Android ID', value: '{androidid}' },
    { label: 'Device ID', value: '{deviceid}' },
    { label: 'Google AID', value: '{googleaid}' },
    { label: 'IOS IDFA', value: '{iosidfa}' },
    { label: 'Session IP', value: '{ip}' },
    { label: 'Offer ID', value: '{offerid}' },
    { label: 'Offer Name', value: '{offername}' },
    { label: 'Offer Model', value: '{omodel}' },
    { label: 'Raw Useragent', value: '{raw_useragent}' },
    { label: 'Useragent URL Encoded', value: '{useragent}' },
    { label: 'Coupon Code', value: '{coupon}' },
    { label: 'Adv Sub4', value: '{adv_sub4}' },
    { label: 'Adv Sub5', value: '{adv_sub5}' },
    { label: 'Random Value', value: '{random}' },
    { label: 'Creative ID', value: '{creativeid}' },
  ];

  // Format affiliate name for display
  const getAffiliateDisplayName = (affiliate) => {
    if (affiliate.firstName || affiliate.lastName) {
      const name = `${affiliate.firstName || ''} ${affiliate.lastName || ''}`.trim();
      return `${affiliate.id} ~ ${name}`;
    }
    if (affiliate.email) {
      return `${affiliate.id} ~ ${affiliate.email}`;
    }
    return `${affiliate.id} ~ Affiliate`;
  };

  return (
    <div className="modal-overlay-gp">
      <div className="modal-box-gp">
        <button type="button" className="close-btn-gp" onClick={onClose}>×</button>
        
        <div className="modal-header-gp">
          <h3 className="mb-0-gp">
            <svg className="icon-plus-gp" viewBox="0 0 448 512" fill="currentColor">
              <path d="M248 56c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 176-176 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l176 0 0 176c0 13.3 10.7 24 24 24s24-10.7 24-24l0-176 176 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-176 0 0-176z"/>
            </svg>
            {isEditMode ? 'Edit Postback' : 'Add Postback'}
          </h3>
        </div>

        <div className="modal-body-gp">
          <form id="AffiliatePostbackAdd">
            {/* Position */}
            <div className="row-gp">
              <div className="col-md-4-gp">Position</div>
              <div className="col-md-6-gp">
                <select name="position" value={formData.position} onChange={handleChange} className="select-gp">
                  <option value="offer">Offer Postback</option>
                  <option value="global">Global</option>
                </select>
              </div>
            </div>

            {/* Affiliate ID - Dynamic dropdown */}
            <div className="row-gp">
              <div className="col-md-4-gp">Affiliate ID</div>
              <div className="col-md-6-gp">
                <select 
                  name="affiliateId" 
                  value={formData.affiliateId} 
                  onChange={handleChange} 
                  className="select-gp"
                  required
                >
                  <option value="">Select Affiliate</option>
                  {affiliates.map(aff => (
                    <option key={aff.id} value={aff.id}>
                      {getAffiliateDisplayName(aff)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Integration Type */}
            <div className="row-gp">
              <div className="col-md-4-gp">Integration Type</div>
              <div className="col-md-6-gp">
                <select name="integrationType" value={formData.integrationType} onChange={handleChange} className="select-gp">
                  <option value="default">Default</option>
                  <option value="privacy_postback">Privacy Postback</option>
                </select>
              </div>
            </div>

            {/* Postback Type */}
            <div className="row-gp">
              <div className="col-md-4-gp">Postback Type</div>
              <div className="col-md-6-gp">
                <select name="postbackType" value={formData.postbackType} onChange={handleChange} className="select-gp">
                  <option value="s2s">S2S</option>
                  <option value="pixel">Pixel</option>
                  <option value="iframe">iframe</option>
                </select>
              </div>
            </div>

            {/* Partner Template Placeholder */}
            {selectedPartner && (
              <div className="partner-template-gp">
                <div className="alert-info-gp">
                  Loading template for <strong>{selectedPartner}</strong>...
                </div>
              </div>
            )}

            {/* Postback URL */}
            <div className="row-gp" style={{ display: selectedPartner ? 'none' : 'flex' }}>
              <div className="col-md-4-gp">Postback URL</div>
              <div className="col-md-6-gp">
                <textarea 
                  name="postbackUrl" 
                  value={formData.postbackUrl} 
                  onChange={handleChange} 
                  className="textarea-gp" 
                  placeholder="http://example.com/"
                  rows="2"
                />
              </div>
            </div>

            {/* Advance Setup Checkbox */}
            <div className="row-gp advance-checkbox-row-gp">
              <div className="col-12-gp">
                <label className="checkbox-label-gp">
                  <input 
                    type="checkbox" 
                    id="advance-setup" 
                    checked={formData.advanceSetup && formData.integrationType !== 'privacy_postback' && formData.postbackType === 's2s'}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setShowAdvance(checked);
                      setFormData(prev => ({ ...prev, advanceSetup: checked }));
                    }}
                    disabled={formData.integrationType === 'privacy_postback' || formData.postbackType !== 's2s'}
                  />
                  <span className="checkbox-text-gp">Advance Setup</span>
                </label>
              </div>
            </div>

            {/* Advance Setup Section */}
            {(showAdvance || formData.advanceSetup) && formData.postbackType === 's2s' && formData.integrationType !== 'privacy_postback' && (
              <div className="advance-setup-gp">
                {/* HTTP Method */}
                <div className="row-gp">
                  <div className="col-md-4-gp">HTTP Method</div>
                  <div className="col-md-6-gp">
                    <select name="httpMethod" value={formData.httpMethod} onChange={handleChange} className="select-gp">
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                    </select>
                  </div>
                </div>

                {/* HTTP Headers */}
                <fieldset className="fieldset-gp">
                  <legend className="legend-gp">HTTP Headers</legend>
                  {formData.headers.map((header, index) => (
                    <div key={index} className="row-gp header-row-gp">
                      <div className="col-5-gp">
                        <input 
                          type="text" 
                          className="input-gp" 
                          placeholder="Header Name" 
                          value={header.name}
                          onChange={(e) => handleHeaderChange(index, 'name', e.target.value)}
                        />
                      </div>
                      <div className="col-5-gp">
                        <input 
                          type="text" 
                          className="input-gp" 
                          placeholder="Header Value" 
                          value={header.value}
                          onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                        />
                      </div>
                      <div className="col-1-gp">
                        <svg className="icon-times-gp text-danger-gp" onClick={() => removeHeader(index)} viewBox="0 0 384 512" fill="currentColor">
                          <path d="M7.5 105c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l151 151 151-151c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-151 151 151 151c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-151-151-151 151c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l151-151-151-151z"/>
                        </svg>
                      </div>
                    </div>
                  ))}
                  <div className="row-gp">
                    <div className="col-12-gp">
                      <button type="button" className="btn-outline-gp" onClick={addHeader}>Add Header</button>
                    </div>
                  </div>
                </fieldset>

                {/* POST Body */}
                {formData.httpMethod === 'POST' && (
                  <div className="post-body-gp">
                    <div className="row-gp">
                      <div className="col-md-4-gp">POST Body</div>
                      <div className="col-md-6-gp">
                        <select 
                          name="postBodyType" 
                          value={formData.postBodyType} 
                          onChange={handleChange} 
                          className="select-gp"
                        >
                          <option value="form">form-data</option>
                          <option value="www_urlencoded">x-www-form-urlencoded</option>
                          <option value="json">json</option>
                          <option value="raw">raw</option>
                        </select>
                      </div>
                    </div>

                    {/* Form Data Fields */}
                    {(formData.postBodyType === 'form' || formData.postBodyType === 'www_urlencoded') && (
                      <fieldset className="fieldset-gp">
                        <legend className="legend-gp">HTTP Fields</legend>
                        {formData.postBodyFields.map((field, index) => (
                          <div key={index} className="row-gp field-row-gp">
                            <div className="col-5-gp">
                              <input 
                                type="text" 
                                className="input-gp" 
                                placeholder="Field Name" 
                                value={field.name}
                                onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                              />
                            </div>
                            <div className="col-5-gp">
                              <input 
                                type="text" 
                                className="input-gp" 
                                placeholder="Field Value" 
                                value={field.value}
                                onChange={(e) => handleFieldChange(index, 'value', e.target.value)}
                              />
                            </div>
                            <div className="col-1-gp">
                              <svg className="icon-times-gp text-danger-gp" onClick={() => removeField(index)} viewBox="0 0 384 512" fill="currentColor">
                                <path d="M7.5 105c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l151 151 151-151c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-151 151 151 151c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-151-151-151 151c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l151-151-151-151z"/>
                              </svg>
                            </div>
                          </div>
                        ))}
                        <div className="row-gp">
                          <div className="col-12-gp">
                            <button type="button" className="btn-outline-gp" onClick={addField}>Add Field</button>
                          </div>
                        </div>
                      </fieldset>
                    )}

                    {/* JSON Body */}
                    {formData.postBodyType === 'json' && (
                      <div className="row-gp">
                        <div className="col-10-gp">
                          <label className="text-muted-gp">JSON Body</label>
                          <textarea 
                            className="textarea-gp" 
                            name="jsonBody" 
                            value={formData.jsonBody} 
                            onChange={handleChange} 
                            rows="4"
                          />
                        </div>
                      </div>
                    )}

                    {/* Raw Body */}
                    {formData.postBodyType === 'raw' && (
                      <div className="row-gp">
                        <div className="col-10-gp">
                          <label className="text-muted-gp">Raw Body</label>
                          <textarea 
                            className="textarea-gp" 
                            name="rawBody" 
                            value={formData.rawBody} 
                            onChange={handleChange} 
                            placeholder="Raw Body" 
                            rows="4"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <div className="row-gp submit-row-gp">
              <div className="col-md-4-gp"></div>
              <div className="col-md-6-gp text-right-gp">
                <button type="button" className="btn-primary-gp" onClick={handleSubmit} disabled={loading}>
                  <svg className="icon-plus-gp" viewBox="0 0 448 512" fill="currentColor">
                    <path d="M248 56c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 176-176 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l176 0 0 176c0 13.3 10.7 24 24 24s24-10.7 24-24l0-176 176 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-176 0 0-176z"/>
                  </svg>
                  {loading ? (isEditMode ? 'Updating...' : 'Adding...') : (isEditMode ? 'Update Postback' : 'Add Postback')}
                </button>
              </div>
            </div>

            {/* Postback Tokens Section */}
            <h5 className="tokens-title-gp">
              <svg className="icon-tags-gp" viewBox="0 0 576 512" fill="currentColor">
                <path d="M367.2 38.9c-9.4 9.3-9.5 24.5-.2 33.9L515.3 223.1c9.2 9.4 9.2 24.4 0 33.7L358.8 415.1c-9.3 9.4-9.2 24.6 .2 33.9s24.6 9.2 33.9-.2L549.4 290.6c27.7-28 27.7-73.1 0-101.2L401.2 39.1c-9.3-9.4-24.5-9.5-33.9-.2zM80.1 96c0-8.8 7.2-16 16-16l133.5 0c4.2 0 8.3 1.7 11.3 4.7l144 144c6.2 6.2 6.2 16.4 0 22.6L251.4 384.8c-6.2 6.2-16.4 6.2-22.6 0l-144-144c-3-3-4.7-7.1-4.7-11.3L80.1 96zm-48 0l0 133.5c0 17 6.7 33.3 18.7 45.3l144 144c25 25 65.5 25 90.5 0L418.8 285.3c25-25 25-65.5 0-90.5l-144-144c-12-12-28.3-18.7-45.3-18.7L96.1 32c-35.3 0-64 28.7-64 64zm112 80a32 32 0 1 0 0-64 32 32 0 1 0 0 64z"/>
              </svg>
              Postback Tokens
            </h5>
            
            <div className="tokens-table-container-gp">
              <table className="table-gp">
                <tbody>
                  {tokens.map((token, idx) => (
                    <tr key={idx}>
                      <td className="token-label-gp">{token.label}</td>
                      <td><input type="text" className="token-input-gp" value={token.value} readOnly onClick={(e) => e.target.select()} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddGlobalPostbackModal;