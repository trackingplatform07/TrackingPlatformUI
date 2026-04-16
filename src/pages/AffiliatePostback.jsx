import React, { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import AddGlobalPostbackModal from '../components/AddGlobalPostbackModal';
import AddOfferPostbackModal from '../components/AddOfferPostbackModal'; // Add this import
import "../css/Affiliates.css";
import { useNavigate } from "react-router-dom";

const AffiliatePostback = () => {
  const [showModal, setShowModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false); // Add state for offer modal
  const [editingPostback, setEditingPostback] = useState(null);
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSearchTerm, setFilterSearchTerm] = useState("");
  const [openRowIndex, setOpenRowIndex] = useState(null);
  const [openFilterIndex, setOpenFilterIndex] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState("");
  const [selectedAffiliate, setSelectedAffiliate] = useState("");
  
  // Testing state
  const [testingUrl, setTestingUrl] = useState(null);
  const [testStatus, setTestStatus] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  
  
  // Data state
  const [data, setData] = useState([]);
  const [affiliatesList, setAffiliatesList] = useState([]);
  const [offersList, setOffersList] = useState([]);
  
  // Sorting state
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  
  // Refs for dropdown positioning
  const filterButtonRef = useRef(null);
  const [filterDropdownPosition, setFilterDropdownPosition] = useState({ top: 0, right: 0 });
  
  // Get current user for modifiedBy field
  const getCurrentUser = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.email || user?.username || 'system';
  };
  
  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    affiliateId: true,
    position: true,
    offerId: true,
    event: true,
    integrationType: true,
    type: true,
    postbackUrl: true,
    status: true,
    trigger: true,
    updateTime: true,
    options: true,
  });

  // Column definitions
  const columns = [
    { key: "affiliateId", label: "Affiliate ID", category: "Affiliate Info" },
    { key: "position", label: "Position", category: "Affiliate Info" },
    { key: "offerId", label: "Offer ID", category: "Offer Info" },
    { key: "event", label: "Event", category: "Postback Config" },
    { key: "integrationType", label: "Integration Type", category: "Postback Config" },
    { key: "type", label: "Type", category: "Postback Config" },
    { key: "postbackUrl", label: "Postback URL", category: "Postback Config" },
    { key: "status", label: "Status", category: "Status" },
    { key: "trigger", label: "Trigger", category: "Postback Config" },
    { key: "updateTime", label: "Update Time", category: "Timeline" },
    { key: "options", label: "Options", category: "Actions" },
  ];

  // Filter columns based on search term
  const filteredColumns = columns.filter(column =>
    column.label.toLowerCase().includes(filterSearchTerm.toLowerCase()) ||
    column.category.toLowerCase().includes(filterSearchTerm.toLowerCase())
  );

  // Group columns by category
  const groupedColumns = filteredColumns.reduce((groups, column) => {
    if (!groups[column.category]) {
      groups[column.category] = [];
    }
    groups[column.category].push(column);
    return groups;
  }, {});

  // Handle navigation to affiliate details
  const handleAffiliateClick = (affiliateRawId) => {
    navigate(`/affiliate/${affiliateRawId}`);
  };

  // Fetch Affiliate Postbacks from API
  useEffect(() => {
    const fetchPostbacks = async () => {
      try {
        const token = JSON.parse(localStorage.getItem('user'))?.token;
        const response = await fetch('https://localhost:7029/api/AffiliatePostback', {
          headers: {
            'accept': '*/*',
            'Authorization': token ? `Bearer ${token}` : '',
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch postbacks');
        }
        
        const apiData = await response.json();
        
        // Transform API data to match table structure
        const transformedData = apiData.map(item => ({
          id: item.id,
          affiliateId: `${item.affiliateId} - ${item.affiliateName}`,
          affiliateRawId: item.affiliateId,
          position: item.position?.charAt(0).toUpperCase() + item.position?.slice(1) || '-',
          offerId: item.offerId || 'Default',
          event: item.type || '-',
          integrationType: item.integrationType || '-',
          type: item.type || '-',
          postbackUrl: item.postbackURL || item.postbackUrl,
          status: item.status === 'active' ? 'Approved' : (item.status === 'inactive' ? 'Pending' : (item.status === 'rejected' ? 'Rejected' : item.status)),
          rawStatus: item.status,
          trigger: item.triggerType || '-',
          updateTime: item.modifiedOn ? formatDate(item.modifiedOn) : (item.createdOn ? `created on ${formatDate(item.createdOn)}` : '-'),
          createdOn: item.createdOn,
          modifiedOn: item.modifiedOn,
          originalData: item
        }));
        
        setData(transformedData);
        setTotalItems(transformedData.length);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching postbacks:', error);
        setLoading(false);
      }
    };
    
    fetchPostbacks();
  }, []);

  // Fetch Affiliates for dropdown
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
        
        if (response.ok) {
          const data = await response.json();
          setAffiliatesList(data);
        }
      } catch (error) {
        console.error('Error fetching affiliates:', error);
      }
    };
    
    fetchAffiliates();
  }, []);

  // Fetch Offers for dropdown
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const token = JSON.parse(localStorage.getItem('user'))?.token;
        const response = await fetch('https://localhost:7029/api/Offers', {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setOffersList(data);
        }
      } catch (error) {
        console.error('Error fetching offers:', error);
      }
    };
    
    fetchOffers();
  }, []);

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Update dropdown position
  const updateFilterDropdownPosition = () => {
    if (filterButtonRef.current) {
      const rect = filterButtonRef.current.getBoundingClientRect();
      setFilterDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        right: window.innerWidth - rect.right,
      });
    }
  };

  // Sorting function
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
    }
    return '';
  };

  // Close dropdowns
  useEffect(() => {
    const close = (e) => {
      if (!e.target.closest(".option-btn") && !e.target.closest(".row-dropdown")) {
        setOpenRowIndex(null);
      }
      if (!e.target.closest(".filter-icon-btn") && !e.target.closest(".filter-dropdown")) {
        setOpenFilterIndex(null);
        setFilterSearchTerm("");
      }
    };
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  // Filtered data
  const filteredData = data.filter((row) => {
    const matchesSearch = 
      row.affiliateId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.postbackUrl?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.event?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAffiliateFilter = !selectedAffiliate || row.affiliateRawId === parseInt(selectedAffiliate);
    const matchesOfferFilter = !selectedOffer || row.offerId === selectedOffer;
    
    return matchesSearch && matchesAffiliateFilter && matchesOfferFilter;
  });

  // Sort data
  const sortedData = [...filteredData];
  if (sortConfig.key) {
    sortedData.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      if (aValue === undefined || aValue === null) aValue = '';
      if (bValue === undefined || bValue === null) bValue = '';
      
      const aString = String(aValue).toLowerCase();
      const bString = String(bValue).toLowerCase();
      
      if (aString < bString) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aString > bString) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Pagination
  useEffect(() => {
    setTotalItems(filteredData.length);
    setCurrentPage(1);
  }, [searchTerm, selectedAffiliate, selectedOffer]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
      const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
      
      if (startPage > 1) {
        pageNumbers.push(1);
        if (startPage > 2) pageNumbers.push('...');
      }
      
      for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
      
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    return pageNumbers;
  };

  // Column visibility functions
  const toggleColumn = (columnKey) => {
    setVisibleColumns((prev) => ({ ...prev, [columnKey]: !prev[columnKey] }));
  };

  const selectAllColumns = () => {
    const allSelected = {};
    columns.forEach((col) => { allSelected[col.key] = true; });
    setVisibleColumns(allSelected);
  };

  const deselectAllColumns = () => {
    const allDeselected = {};
    columns.forEach((col) => { allDeselected[col.key] = false; });
    setVisibleColumns(allDeselected);
  };

  const resetColumns = () => {
    setVisibleColumns({
      affiliateId: true,
      position: true,
      offerId: true,
      event: true,
      integrationType: true,
      type: true,
      postbackUrl: true,
      status: true,
      trigger: true,
      updateTime: true,
      options: true,
    });
  };

  const selectedColumnsCount = Object.values(visibleColumns).filter(v => v === true).length;

  // Copy URL to clipboard
  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    alert("Postback URL copied to clipboard!");
  };

  // Function to test postback URL
  const testPostbackUrl = async (url, rowId) => {
    setTestingUrl(rowId);
    setTestStatus(null);
    
    try {
      // Replace template parameters with test values
      let testUrl = url;
      if (testUrl && testUrl.includes('{REPLACE}')) {
        testUrl = testUrl.replace('{REPLACE}', 'TEST_CLICK_ID_12345');
      }
      if (testUrl && testUrl.includes('{aff_click_id}')) {
        testUrl = testUrl.replace('{aff_click_id}', 'TEST_CLICK_ID_12345');
      }
      
      // Try to fetch the URL
      const response = await fetch(testUrl, {
        method: 'HEAD',
        mode: 'no-cors',
      });
      
      setTestStatus({ id: rowId, success: true, message: '✓ Test successful! URL is reachable.' });
      setTimeout(() => setTestStatus(null), 3000);
    } catch (error) {
      setTestStatus({ id: rowId, success: false, message: '✗ Test failed: ' + error.message });
      setTimeout(() => setTestStatus(null), 3000);
    }
  };

  // Status update using PATCH endpoint
  const updateStatus = async (id, newStatus) => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const currentUser = getCurrentUser();
      
      const payload = {
        id: id,
        status: newStatus,
        modifiedBy: currentUser
      };
      
      const response = await fetch('https://localhost:7029/api/AffiliatePostback/status', {
        method: 'PATCH',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        setData(prevData => 
          prevData.map(item => {
            if (item.id === id) {
              let newDisplayStatus;
              if (newStatus === 'active') newDisplayStatus = 'Approved';
              else if (newStatus === 'inactive') newDisplayStatus = 'Pending';
              else if (newStatus === 'rejected') newDisplayStatus = 'Rejected';
              else newDisplayStatus = newStatus;
              
              return { 
                ...item, 
                status: newDisplayStatus,
                rawStatus: newStatus,
                updateTime: formatDate(new Date().toISOString())
              };
            }
            return item;
          })
        );
        
        const statusMessage = newStatus === 'active' ? 'Approved' : 
                             newStatus === 'inactive' ? 'Pending' : 
                             newStatus === 'rejected' ? 'Rejected' : 
                             newStatus;
        alert(`Status updated to ${statusMessage} successfully!`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert(`Error: ${error.message}`);
    }
    setOpenRowIndex(null);
  };

  // Delete postback
  const deletePostback = async (id) => {
    if (window.confirm("Are you sure you want to delete this postback?")) {
      try {
        const token = JSON.parse(localStorage.getItem('user'))?.token;
        const response = await fetch(`https://localhost:7029/api/AffiliatePostback/${id}`, {
          method: 'DELETE',
          headers: {
            'accept': '*/*',
            'Authorization': token ? `Bearer ${token}` : '',
          },
        });
        
        if (response.ok) {
          setData(prevData => prevData.filter(item => item.id !== id));
          alert("Postback deleted successfully");
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to delete postback');
        }
      } catch (error) {
        console.error('Error deleting postback:', error);
        alert(`Error: ${error.message}`);
      }
      setOpenRowIndex(null);
    }
  };

  // Edit postback function
  const editPostback = (row) => {
    setEditingPostback(row);
    setShowModal(true);
    setOpenRowIndex(null);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setShowOfferModal(false);
    setEditingPostback(null);
  };

  const handleOfferModalClose = () => {
    setShowOfferModal(false);
    setEditingPostback(null);
  };

  const handlePostbackSaved = () => {
    const fetchPostbacks = async () => {
      try {
        const token = JSON.parse(localStorage.getItem('user'))?.token;
        const response = await fetch('https://localhost:7029/api/AffiliatePostback', {
          headers: {
            'accept': '*/*',
            'Authorization': token ? `Bearer ${token}` : '',
          }
        });
        
        if (response.ok) {
          const apiData = await response.json();
          const transformedData = apiData.map(item => ({
            id: item.id,
            affiliateId: `${item.affiliateId} - ${item.affiliateName}`,
            affiliateRawId: item.affiliateId,
            position: item.position?.charAt(0).toUpperCase() + item.position?.slice(1) || '-',
            offerId: item.offerId || 'Default',
            event: item.type || '-',
            integrationType: item.integrationType || '-',
            type: item.type || '-',
            postbackUrl: item.postbackURL || item.postbackUrl,
            status: item.status === 'active' ? 'Approved' : (item.status === 'inactive' ? 'Pending' : (item.status === 'rejected' ? 'Rejected' : item.status)),
            rawStatus: item.status,
            trigger: item.triggerType || '-',
            updateTime: item.modifiedOn ? formatDate(item.modifiedOn) : (item.createdOn ? `created on ${formatDate(item.createdOn)}` : '-'),
            createdOn: item.createdOn,
            modifiedOn: item.modifiedOn,
            originalData: item
          }));
          setData(transformedData);
          setTotalItems(transformedData.length);
        }
      } catch (error) {
        console.error('Error refreshing postbacks:', error);
      }
    };
    
    fetchPostbacks();
    handleModalClose();
  };

  return (
    <div className="of-layout">
      <Sidebar isCollapsed={isSidebarCollapsed} />
      {loading && (
        <div className="page-loader">
          <div className="spinner"></div>
        </div>
      )}
      <div className="of-main">
        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        <div className="of-page">
          {/* HEADER with buttons */}
          <div className="of-page-header">
            <h2>Affiliate Postback</h2>

            <div className="of-actions">
              <button 
                className="btn primary small" 
                onClick={() => {
                  setEditingPostback(null);
                  setShowModal(true);
                }}
              >
                + Add Global Postback
              </button>

              {showModal && (
                <AddGlobalPostbackModal 
                  onClose={handleModalClose}
                  editingData={editingPostback}
                  onSaved={handlePostbackSaved}
                />
              )}

              <button 
                className="btn primary small" 
                onClick={() => {
                  setEditingPostback(null);
                  setShowOfferModal(true);
                }}
              >
                + Add Offer Postback
              </button>

              {showOfferModal && (
                <AddOfferPostbackModal 
                  onClose={handleOfferModalClose}
                  editingData={editingPostback}
                  onSaved={handlePostbackSaved}
                />
              )}

              <button className="btn small" onClick={() => navigate("/import-postback")}>
                Import Postback
              </button>

              <select 
                className="of-select" 
                value={selectedOffer}
                onChange={(e) => setSelectedOffer(e.target.value)}
                style={{ minWidth: "140px" }}
              >
                <option value="">Select Offer</option>
                {offersList.map(offer => (
                  <option key={offer.id} value={offer.id}>{offer.name || offer.id}</option>
                ))}
              </select>

              <select 
                className="of-select" 
                value={selectedAffiliate}
                onChange={(e) => setSelectedAffiliate(e.target.value)}
                style={{ minWidth: "160px" }}
              >
                <option value="">Select Affiliate</option>
                {affiliatesList.map(affiliate => {
                  const displayName = `${affiliate.id} - ${affiliate.firstName || ''} ${affiliate.lastName || ''}`.trim();
                  return (
                    <option key={affiliate.id} value={affiliate.id.toString()}>
                      {displayName || affiliate.email}
                    </option>
                  );
                })}
              </select>

              <input
                type="text"
                placeholder="Search affiliates..."
                className="of-search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <div className="filter-icon-wrapper">
                <button
                  ref={filterButtonRef}
                  className="filter-icon-btn modern"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (openFilterIndex === "columns") {
                      setOpenFilterIndex(null);
                      setFilterSearchTerm("");
                    } else {
                      updateFilterDropdownPosition();
                      setOpenFilterIndex("columns");
                    }
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                    <path
                      d="M3 5H21L14 13V19L10 21V13L3 5Z"
                      stroke="#3B82F6"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span style={{ marginLeft: "6px", fontSize: "13px" }}>Columns</span>
                </button>

                {openFilterIndex === "columns" && (
                  <div
                    className="filter-dropdown"
                    style={{
                      position: 'fixed',
                      top: `${filterDropdownPosition.top}px`,
                      right: `${filterDropdownPosition.right}px`,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="filter-dropdown-header">
                      <span>Manage Columns</span>
                    </div>

                    <div className="dropdown-section">
                      <div className="dropdown-title">Search Columns</div>
                      <div className="filter-input-group">
                        <input
                          type="text"
                          placeholder="Search columns..."
                          className="filter-search"
                          value={filterSearchTerm}
                          onChange={(e) => setFilterSearchTerm(e.target.value)}
                          autoFocus
                        />
                      </div>
                    </div>

                    <div className="dropdown-section">
                      <div className="dropdown-title">
                        <span>Column Visibility</span>
                      </div>
                      <div className="columns-select-all">
                        <span className="columns-count">
                          {selectedColumnsCount} of {columns.length} selected
                        </span>
                        <div className="select-all-actions">
                          <button onClick={selectAllColumns} className="select-all-btn">Select All</button>
                          <button onClick={deselectAllColumns} className="deselect-all-btn">Deselect All</button>
                          <button onClick={resetColumns} className="reset-btn">Reset</button>
                        </div>
                      </div>
                      
                      <div className="columns-list">
                        {Object.entries(groupedColumns).map(([category, cols]) => (
                          <div key={category} className="column-category">
                            <div className="column-category-title">
                              {category} ({cols.length})
                            </div>
                            {cols.map((column) => (
                              <label key={column.key} className="column-checkbox">
                                <input
                                  type="checkbox"
                                  checked={visibleColumns[column.key]}
                                  onChange={() => toggleColumn(column.key)}
                                />
                                <span>{column.label}</span>
                              </label>
                            ))}
                          </div>
                        ))}
                        
                        {filteredColumns.length === 0 && (
                          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af', fontSize: '13px' }}>
                            No columns found
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      className="submit-btn"
                      onClick={() => {
                        setOpenFilterIndex(null);
                        setFilterSearchTerm("");
                      }}
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>

              <select className="of-select" value={itemsPerPage} onChange={handleItemsPerPageChange}>
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>
            </div>
          </div>

          {/* TABLE */}
          <div className="of-table-wrapper">
            <table className="of-table">
              <thead>
                <tr>
                  {visibleColumns.affiliateId && (
                    <th onClick={() => requestSort('affiliateId')} style={{ cursor: 'pointer' }}>
                      Affiliate ID{getSortIndicator('affiliateId')}
                    </th>
                  )}
                  {visibleColumns.position && (
                    <th onClick={() => requestSort('position')} style={{ cursor: 'pointer' }}>
                      Position{getSortIndicator('position')}
                    </th>
                  )}
                  {visibleColumns.offerId && (
                    <th onClick={() => requestSort('offerId')} style={{ cursor: 'pointer' }}>
                      Offer ID{getSortIndicator('offerId')}
                    </th>
                  )}
                  {visibleColumns.event && (
                    <th onClick={() => requestSort('event')} style={{ cursor: 'pointer' }}>
                      Event{getSortIndicator('event')}
                    </th>
                  )}
                  {visibleColumns.integrationType && (
                    <th onClick={() => requestSort('integrationType')} style={{ cursor: 'pointer' }}>
                      Integration Type{getSortIndicator('integrationType')}
                    </th>
                  )}
                  {visibleColumns.type && (
                    <th onClick={() => requestSort('type')} style={{ cursor: 'pointer' }}>
                      Type{getSortIndicator('type')}
                    </th>
                  )}
                  {visibleColumns.postbackUrl && <th style={{ minWidth: "400px" }}>Postback URL</th>}
                  {visibleColumns.status && (
                    <th onClick={() => requestSort('status')} style={{ cursor: 'pointer' }}>
                      Status{getSortIndicator('status')}
                    </th>
                  )}
                  {visibleColumns.trigger && (
                    <th onClick={() => requestSort('trigger')} style={{ cursor: 'pointer' }}>
                      Trigger{getSortIndicator('trigger')}
                    </th>
                  )}
                  {visibleColumns.updateTime && (
                    <th onClick={() => requestSort('updateTime')} style={{ cursor: 'pointer' }}>
                      Update Time{getSortIndicator('updateTime')}
                    </th>
                  )}
                  {visibleColumns.options && <th style={{ width: "80px" }}>Options</th>}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="30" style={{ textAlign: "center", padding: "60px" }}>
                      <div className="spinner" style={{ margin: "0 auto" }}></div>
                      <p style={{ marginTop: "16px", color: "#6b7280" }}>Loading postback data...</p>
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="30" style={{ textAlign: "center", padding: "60px" }}>
                      <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔗</div>
                      <p style={{ color: "#6b7280", fontSize: "16px" }}>No postback configurations found</p>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((row, index) => (
                    <tr key={row.id}>
                      {visibleColumns.affiliateId && (
                        <td 
                          className="link" 
                          onClick={() => handleAffiliateClick(row.affiliateRawId)}
                          style={{ cursor: 'pointer', color: '#3b82f6', fontWeight: '500' }}
                        >
                          {row.affiliateId}
                        </td>
                      )}
                      {visibleColumns.position && <td>{row.position}</td>}
                      {visibleColumns.offerId && <td>{row.offerId}</td>}
                      {visibleColumns.event && (
                        <td>
                          <span className={`status ${row.event === 's2s' ? 'approved' : 'pending'}`} style={{ fontSize: '12px', padding: '4px 10px' }}>
                            {row.event}
                          </span>
                        </td>
                      )}
                      {visibleColumns.integrationType && <td>{row.integrationType}</td>}
                      {visibleColumns.type && <td>{row.type}</td>}
                      {visibleColumns.postbackUrl && (
                        <td style={{ maxWidth: "500px", minWidth: "350px" }}>
                          <div style={{ 
                            display: "flex", 
                            flexDirection: "column",
                            gap: "8px",
                            background: "#f8f9fa",
                            padding: "10px 12px",
                            borderRadius: "8px",
                            border: "1px solid #e9ecef"
                          }}>
                            {/* URL Display */}
                            <div style={{ 
                              display: "flex", 
                              alignItems: "center", 
                              justifyContent: "space-between",
                              gap: "8px",
                              flexWrap: "wrap"
                            }}>
                              <code style={{ 
                                fontSize: "12px", 
                                fontFamily: "'Courier New', 'Monaco', monospace",
                                color: "#495057",
                                background: "white",
                                padding: "8px 12px",
                                borderRadius: "6px",
                                flex: 1,
                                overflow: "auto",
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-all",
                                border: "1px solid #e5e7eb",
                                maxHeight: "80px",
                                lineHeight: "1.5"
                              }}>
                                {row.postbackUrl || '-'}
                              </code>
                              
                              <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                                <button
                                  onClick={() => copyToClipboard(row.postbackUrl)}
                                  style={{ 
                                    background: "#e9ecef", 
                                    border: "none", 
                                    cursor: "pointer", 
                                    padding: "6px 12px",
                                    borderRadius: "6px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    fontSize: "12px",
                                    fontWeight: "500",
                                    color: "#495057",
                                    transition: "all 0.2s"
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = "#dee2e6"}
                                  onMouseLeave={(e) => e.currentTarget.style.background = "#e9ecef"}
                                  title="Copy URL"
                                >
                                  📋 Copy
                                </button>
                                
                              </div>
                            </div>
                            
                            {/* Test Status Message */}
                            {testStatus && testStatus.id === row.id && (
                              <div style={{
                                padding: "8px 12px",
                                borderRadius: "6px",
                                fontSize: "12px",
                                background: testStatus.success ? "#d1fae5" : "#fee2e2",
                                color: testStatus.success ? "#065f46" : "#dc2626",
                                border: `1px solid ${testStatus.success ? "#a7f3d0" : "#fecaca"}`
                              }}>
                                {testStatus.message}
                              </div>
                            )}
                            
                            {/* Parameter Info */}
                            {row.postbackUrl && (row.postbackUrl.includes('{REPLACE}') || row.postbackUrl.includes('{aff_click_id}')) && (
                              <div style={{
                                display: "flex",
                                gap: "8px",
                                alignItems: "center",
                                fontSize: "11px",
                                color: "#92400e",
                                padding: "6px 10px",
                                background: "#fef3c7",
                                borderRadius: "6px",
                                border: "1px solid #fde68a"
                              }}>
                                <span style={{ fontSize: "14px" }}>ℹ️</span>
                                <span>
                                  <strong>Parameters:</strong>{' '}
                                  {row.postbackUrl.includes('{REPLACE}') && <code style={{ background: "#fde68a", padding: "2px 4px", borderRadius: "3px", margin: "0 2px" }}>{'{REPLACE}'}</code>}
                                  {row.postbackUrl.includes('{aff_click_id}') && <code style={{ background: "#fde68a", padding: "2px 4px", borderRadius: "3px", margin: "0 2px" }}>{'{aff_click_id}'}</code>}
                                  {' '}will be replaced automatically
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                      )}
                      {visibleColumns.status && (
                        <td>
                          <span className={`status ${
                            row.status === "Approved" ? "approved" : 
                            row.status === "Rejected" ? "rejected" : 
                            "pending"
                          }`}>
                            {row.status}
                          </span>
                        </td>
                      )}
                      {visibleColumns.trigger && <td>{row.trigger}</td>}
                      {visibleColumns.updateTime && <td style={{ fontSize: "12px", color: "#6b7280" }}>{row.updateTime}</td>}
                      {visibleColumns.options && (
                        <td>
                          <div className="option-wrapper" style={{ position: "relative" }}>
                            <button
                              className="option-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenRowIndex(openRowIndex === index ? null : index);
                              }}
                              style={{
                                width: "32px",
                                height: "32px",
                                fontSize: "18px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "#f3f4f6",
                                border: "1px solid #e5e7eb",
                                borderRadius: "6px",
                                cursor: "pointer",
                                transition: "all 0.2s"
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#e5e7eb";
                                e.currentTarget.style.borderColor = "#d1d5db";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "#f3f4f6";
                                e.currentTarget.style.borderColor = "#e5e7eb";
                              }}
                            >
                              ⋮
                            </button>
                            {openRowIndex === index && (
                              <div className="row-dropdown" style={{ 
                                minWidth: "180px",
                                position: "absolute",
                                top: "100%",
                                right: "0",
                                marginTop: "8px",
                                background: "white",
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px",
                                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
                                zIndex: 1000,
                                overflow: "hidden"
                              }}>
                                <div 
                                  className="dropdown-item" 
                                  onClick={() => editPostback(row)}
                                  style={{
                                    padding: "10px 16px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    fontSize: "14px",
                                    color: "#374151",
                                    transition: "background 0.2s"
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = "#f3f4f6"}
                                  onMouseLeave={(e) => e.currentTarget.style.background = "white"}
                                >
                                  ✏️ Edit
                                </div>
                                <div style={{ height: "1px", background: "#e5e7eb", margin: "4px 0" }}></div>
                                {row.rawStatus !== 'active' && (
                                  <div 
                                    className="dropdown-item" 
                                    onClick={() => updateStatus(row.id, "active")}
                                    style={{
                                      padding: "10px 16px",
                                      cursor: "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "8px",
                                      fontSize: "14px",
                                      color: "#10b981",
                                      transition: "background 0.2s"
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = "#f3f4f6"}
                                    onMouseLeave={(e) => e.currentTarget.style.background = "white"}
                                  >
                                    ✅ Approve
                                  </div>
                                )}
                                {row.rawStatus !== 'inactive' && (
                                  <div 
                                    className="dropdown-item" 
                                    onClick={() => updateStatus(row.id, "inactive")}
                                    style={{
                                      padding: "10px 16px",
                                      cursor: "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "8px",
                                      fontSize: "14px",
                                      color: "#f59e0b",
                                      transition: "background 0.2s"
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = "#f3f4f6"}
                                    onMouseLeave={(e) => e.currentTarget.style.background = "white"}
                                  >
                                    ⏳ Set Pending
                                  </div>
                                )}
                                {row.rawStatus !== 'rejected' && (
                                  <div 
                                    className="dropdown-item" 
                                    onClick={() => updateStatus(row.id, "rejected")}
                                    style={{
                                      padding: "10px 16px",
                                      cursor: "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "8px",
                                      fontSize: "14px",
                                      color: "#ef4444",
                                      transition: "background 0.2s"
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = "#f3f4f6"}
                                    onMouseLeave={(e) => e.currentTarget.style.background = "white"}
                                  >
                                    ❌ Reject
                                  </div>
                                )}
                                <div style={{ height: "1px", background: "#e5e7eb", margin: "4px 0" }}></div>
                                <div 
                                  className="dropdown-item danger" 
                                  onClick={() => deletePostback(row.id)}
                                  style={{
                                    padding: "10px 16px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    fontSize: "14px",
                                    color: "#dc2626",
                                    transition: "background 0.2s"
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = "#fef2f2"}
                                  onMouseLeave={(e) => e.currentTarget.style.background = "white"}
                                >
                                  🗑 Delete
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && totalItems > 0 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, totalItems)} of {totalItems} entries
              </div>
              <div className="pagination-controls">
                <button onClick={prevPage} disabled={currentPage === 1} className="pagination-nav-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                
                <div className="pagination-numbers">
                  {getPageNumbers().map((pageNumber, idx) => (
                    <button
                      key={idx}
                      onClick={() => typeof pageNumber === 'number' && paginate(pageNumber)}
                      className={`pagination-number ${currentPage === pageNumber ? 'active' : ''} ${typeof pageNumber !== 'number' ? 'dots' : ''}`}
                      disabled={typeof pageNumber !== 'number'}
                    >
                      {pageNumber}
                    </button>
                  ))}
                </div>
                
                <button onClick={nextPage} disabled={currentPage === totalPages} className="pagination-nav-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AffiliatePostback;