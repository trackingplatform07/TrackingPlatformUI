import React, { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import AddAffiliateModal from "../components/AddAffiliateModal";
import "../css/Affiliates.css";
import { useNavigate } from "react-router-dom";

const AffiliatesPage = () => {
  const navigate = useNavigate();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterSearchTerm, setFilterSearchTerm] = useState("");

  const [openRowIndex, setOpenRowIndex] = useState(null);
  const [openFilterIndex, setOpenFilterIndex] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);

  // Selection
  const [selectedIds, setSelectedIds] = useState([]);

  // Sorting state
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Refs for dropdown positioning
  const filterButtonRef = useRef(null);
  const [filterDropdownPosition, setFilterDropdownPosition] = useState({ top: 0, right: 0 });

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    checkbox: true,
    affiliateId: true,
    name: true,
    email: true,
    contact: true,
    company: true,
    country: true,
    manager: true,
    address: true,
    city: true,
    state: true,
    zipCode: true,
    createdOn: true,
    status: true,
    jobTitle: true,
    social: true,
    lastLogin: true,
    signupDate: true,
    signupIP: true,
    signupSource: true,
    postbackDelay: true,
    defaultClickTokens: true,
    timeZone: true,
    trafficSources: true,
    currency: true,
    fallBackURL: true,
    apiAccess: true,
    privateNote: true,
    options: true,
  });

  // Column definitions with categories for better organization
  const columns = [
    { key: "checkbox", label: "Checkbox", category: "Selection" },
    { key: "affiliateId", label: "Affiliate ID", category: "Basic Info" },
    { key: "name", label: "Name", category: "Basic Info" },
    { key: "email", label: "Email", category: "Contact Info" },
    { key: "contact", label: "Contact", category: "Contact Info" },
    { key: "company", label: "Company", category: "Business Info" },
    { key: "jobTitle", label: "Job Title", category: "Business Info" },
    { key: "address", label: "Address", category: "Location" },
    { key: "city", label: "City", category: "Location" },
    { key: "state", label: "State", category: "Location" },
    { key: "country", label: "Country", category: "Location" },
    { key: "zipCode", label: "Zip Code", category: "Location" },
    { key: "social", label: "Social", category: "Contact Info" },
    { key: "lastLogin", label: "Last Login", category: "Activity" },
    { key: "signupDate", label: "Signup Date", category: "Activity" },
    { key: "signupIP", label: "Signup IP", category: "Activity" },
    { key: "signupSource", label: "Signup Source", category: "Activity" },
    { key: "postbackDelay", label: "Postback Delay", category: "Tech Settings" },
    { key: "defaultClickTokens", label: "Default Click Tokens", category: "Tech Settings" },
    { key: "timeZone", label: "Time Zone", category: "Tech Settings" },
    { key: "trafficSources", label: "Traffic Sources", category: "Tech Settings" },
    { key: "currency", label: "Currency", category: "Tech Settings" },
    { key: "fallBackURL", label: "Fallback URL", category: "Tech Settings" },
    { key: "apiAccess", label: "API Access", category: "Tech Settings" },
    { key: "manager", label: "Manager", category: "Business Info" },
    { key: "privateNote", label: "Private Note", category: "Business Info" },
    { key: "createdOn", label: "Created On", category: "System Info" },
    { key: "status", label: "Status", category: "System Info" },
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

  // Update dropdown position when filter button is clicked
  const updateFilterDropdownPosition = () => {
    if (filterButtonRef.current) {
      const rect = filterButtonRef.current.getBoundingClientRect();
      setFilterDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        right: window.innerWidth - rect.right,
      });
    }
  };

  // API
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://localhost:7029/api/Affiliates");
      const resData = await response.json();
      
      console.log(resData);
      const formatted = resData.map((item) => ({
        id: item.id,
        affiliateId: item.id,
        name: `${item.firstName || ''} ${item.lastName || ''}`.trim() || "-",
        email: item.email || "-",
        contact: item.contact || "-",
        company: item.company || "-",
        country: item.country || "-",
        manager: item.manager || "-",
        status: item.status || "Pending",
        address: item.address || "-",
        city: item.city || "-",
        state: item.state || "-",
        zipCode: item.zipCode || "-",
        createdOn: item.createdOn ? new Date(item.createdOn).toLocaleDateString() : "-",
        jobTitle: item.jobTitle || "-",
        social: item.socialContact || "-",
        lastLogin: item.lastLogin ? new Date(item.lastLogin).toLocaleDateString() : "-",
        signupDate: item.signupDate ? new Date(item.signupDate).toLocaleDateString() : "-",
        signupIP: item.signupIP || "-",
        signupSource: item.signupSource || "-",
        postbackDelay: item.postbackDelay ?? "-",
        defaultClickTokens: item.defaultClickTokens || "-",
        timeZone: item.timeZone || "-",
        trafficSources: item.trafficSources || "-",
        currency: item.currency || "-",
        fallBackURL: item.fallBackURL || "-",
        apiAccess: item.apiAccess ? "Yes" : "No",
        privateNote: item.privateNote || "-",
        isActive: item.isActive,
      }));

      setData(formatted);
      setTotalItems(formatted.length);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // Update status function
  const updateStatus = async (id, status) => {
    try {
      setLoading(true);
      
      const response = await fetch(`https://localhost:7029/api/Affiliates/${id}/status`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "accept": "*/*"
        },
        body: JSON.stringify({
          id: id,
          status: status,
          isActive: status === "Approved"
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update status: ${response.status}`);
      }

      setData((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: status } : item))
      );
      
      console.log(`Successfully updated affiliate ${id} status to ${status}`);
      
    } catch (err) {
      console.error("Error updating status:", err);
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Delete single affiliate - Simple confirm
  const deleteAffiliate = async (id) => {
    if (window.confirm("Are you sure you want to delete this affiliate?")) {
      try {
        setLoading(true);
        const response = await fetch(`https://localhost:7029/api/Affiliates/${id}`, {
          method: "DELETE",
          headers: {
            "accept": "*/*"
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to delete affiliate: ${response.status}`);
        }

        setData((prev) => prev.filter((item) => item.id !== id));
        setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
        
        alert("Affiliate deleted successfully!");
        
      } catch (err) {
        console.error("Error deleting affiliate:", err);
        alert(`Failed to delete affiliate: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  // Bulk delete affiliates - Simple confirm
  const bulkDeleteAffiliates = async (ids) => {
    if (window.confirm(`Are you sure you want to delete ${ids.length} selected affiliate(s)?`)) {
      try {
        setLoading(true);
        
        const deletePromises = ids.map(id => 
          fetch(`https://localhost:7029/api/Affiliates/${id}`, {
            method: "DELETE",
            headers: {
              "accept": "*/*"
            }
          })
        );
        
        const responses = await Promise.all(deletePromises);
        const failedDeletes = responses.filter(res => !res.ok);
        
        if (failedDeletes.length > 0) {
          throw new Error(`${failedDeletes.length} deletions failed`);
        }
        
        setData((prev) => prev.filter((item) => !ids.includes(item.id)));
        setSelectedIds([]);
        
        alert(`Successfully deleted ${ids.length} affiliate(s)!`);
        
      } catch (err) {
        console.error("Error bulk deleting affiliates:", err);
        alert(`Failed to delete affiliates: ${err.message}`);
      } finally {
        setLoading(false);
      }
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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const close = (e) => {
      if (
        !e.target.closest(".action-trigger") &&
        !e.target.closest(".action-dropdown") &&
        !e.target.closest(".option-wrapper") &&
        !e.target.closest(".row-dropdown")
      ) {
        setOpenRowIndex(null);
      }
      if (
        !e.target.closest(".filter-icon-btn") &&
        !e.target.closest(".filter-dropdown")
      ) {
        setOpenFilterIndex(null);
        setFilterSearchTerm("");
      }
    };
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  // Filtered data based on search
  const filteredData = data.filter((row) =>
    (row.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (row.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (row.company || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.id.toString().includes(searchTerm)
  );

  // Sort data
  const sortedData = [...filteredData];
  if (sortConfig.key) {
    sortedData.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      if (sortConfig.key === 'affiliateId') {
        aValue = a.id;
        bValue = b.id;
      }
      
      if (aValue === undefined || aValue === null) aValue = '';
      if (bValue === undefined || bValue === null) bValue = '';
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      const aString = String(aValue).toLowerCase();
      const bString = String(bValue).toLowerCase();
      
      if (aString < bString) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aString > bString) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  // Update total items when filtered data changes
  useEffect(() => {
    setTotalItems(sortedData.length);
    setCurrentPage(1);
  }, [searchTerm, sortedData.length]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
      const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
      
      if (startPage > 1) {
        pageNumbers.push(1);
        if (startPage > 2) pageNumbers.push('...');
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  const toggleColumn = (columnKey) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  const selectAllColumns = () => {
    const allSelected = {};
    columns.forEach((col) => {
      allSelected[col.key] = true;
    });
    setVisibleColumns(allSelected);
  };

  const deselectAllColumns = () => {
    const allDeselected = {};
    columns.forEach((col) => {
      allDeselected[col.key] = false;
    });
    setVisibleColumns(allDeselected);
  };

  const resetColumns = () => {
    setVisibleColumns({
      checkbox: true,
      affiliateId: true,
      name: true,
      email: true,
      contact: true,
      company: true,
      country: true,
      manager: true,
      address: true,
      city: true,
      state: true,
      zipCode: true,
      createdOn: true,
      status: true,
      jobTitle: true,
      social: true,
      lastLogin: true,
      signupDate: true,
      signupIP: true,
      signupSource: true,
      postbackDelay: true,
      defaultClickTokens: true,
      timeZone: true,
      trafficSources: true,
      currency: true,
      fallBackURL: true,
      apiAccess: true,
      privateNote: true,
      options: true,
    });
  };

  const selectedColumnsCount = Object.values(visibleColumns).filter(
    (v) => v === true
  ).length;

  // Handle navigation to affiliate details
  const handleAffiliateClick = (id) => {
    navigate(`/affiliate/${id}`);
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
          {/* HEADER */}
          <div className="of-page-header">
            <h2>Affiliates</h2>

            <div className="of-actions">
              <button
                className="btn primary small"
                onClick={() => setShowModal(true)}
              >
                + Add Affiliate
              </button>

              <button className="btn small" onClick={() => navigate("/import-affiliates")}>
                Import
              </button>
               <button className="btn small" onClick={() => navigate("/affiliate-postback")}>
                 Affiliate Postback 
              </button>

              <input
                type="text"
                placeholder="Search affiliates..."
                className="of-search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {/* Filters Icon Button */}
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
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M3 5H21L14 13V19L10 21V13L3 5Z"
                      stroke="#3B82F6"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
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
                      <span>Filters & Columns</span>
                    </div>

                    <div className="dropdown-section">
                      <div className="dropdown-title">Search Columns</div>
                      <div className="filter-input-group">
                        <input
                          type="text"
                          placeholder="Search columns by name or category..."
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
                        <span className="status-badge active"></span>
                      </div>
                      <div className="columns-select-all">
                        <span className="columns-count">
                          {selectedColumnsCount} of {columns.length} selected
                        </span>
                        <div className="select-all-actions">
                          <button
                            onClick={selectAllColumns}
                            className="select-all-btn"
                          >
                            Select All
                          </button>
                          <button
                            onClick={deselectAllColumns}
                            className="deselect-all-btn"
                          >
                            Deselect All
                          </button>
                          <button onClick={resetColumns} className="reset-btn">
                            Reset
                          </button>
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
                          <div style={{ 
                            textAlign: 'center', 
                            padding: '40px 20px',
                            color: '#9ca3af',
                            fontSize: '13px'
                          }}>
                            No columns found matching "{filterSearchTerm}"
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
                      Apply Changes
                    </button>
                  </div>
                )}
              </div>

              <select 
                className="of-select" 
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
              >
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>
            </div>
          </div>

          {/* TABLE - Scrollable */}
          <div className="of-table-wrapper">
            <table className="of-table">
              <thead>
                <tr>
                  <th style={{ width: "40px" }}>
                    <div
                      className="action-trigger"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenRowIndex(
                          openRowIndex === "header" ? null : "header"
                        );
                      }}
                    >
                      Action ▼
                    </div>

                    {openRowIndex === "header" && (
                      <div
                        className="action-dropdown"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="dropdown-section">
                          <div className="dropdown-title">
                            Affiliate Select
                          </div>

                          <div
                            className="dropdown-item"
                            onClick={() =>
                              setSelectedIds(currentItems.map((d) => d.id))
                            }
                          >
                            ✓ Select All (Current Page)
                          </div>

                          <div
                            className="dropdown-item"
                            onClick={() =>
                              setSelectedIds(filteredData.map((d) => d.id))
                            }
                          >
                            ✓ Select All (All Pages)
                          </div>

                          <div
                            className="dropdown-item"
                            onClick={() =>
                              setSelectedIds(
                                currentItems
                                  .filter((d) => d.status === "Approved")
                                  .map((d) => d.id)
                              )
                            }
                          >
                            ✓ Select Approved (Current Page)
                          </div>

                          <div
                            className="dropdown-item"
                            onClick={() =>
                              setSelectedIds(
                                currentItems
                                  .filter((d) => d.status === "Pending")
                                  .map((d) => d.id)
                              )
                            }
                          >
                            ⏳ Select Pending (Current Page)
                          </div>

                          <div
                            className="dropdown-item"
                            onClick={() =>
                              setSelectedIds(
                                currentItems
                                  .filter((d) => d.status === "Rejected")
                                  .map((d) => d.id)
                              )
                            }
                          >
                            ✗ Select Rejected (Current Page)
                          </div>

                          <div
                            className="dropdown-item"
                            onClick={() => setSelectedIds([])}
                          >
                            Clear Selection
                          </div>
                        </div>

                        <div className="dropdown-section">
                          <div className="dropdown-title">
                            Bulk Status Update
                          </div>

                          <div
                            className="dropdown-item"
                            onClick={async () => {
                              if (selectedIds.length === 0) {
                                alert("Please select at least one affiliate");
                                return;
                              }

                              for (let id of selectedIds) {
                                await updateStatus(id, "Approved");
                              }

                              setSelectedIds([]);
                              setOpenRowIndex(null);
                              alert(`Approved ${selectedIds.length} affiliate(s)`);
                            }}
                          >
                            ✓ Approve Selected ({selectedIds.length})
                          </div>

                          <div
                            className="dropdown-item"
                            onClick={async () => {
                              if (selectedIds.length === 0) {
                                alert("Please select at least one affiliate");
                                return;
                              }

                              for (let id of selectedIds) {
                                await updateStatus(id, "Rejected");
                              }

                              setSelectedIds([]);
                              setOpenRowIndex(null);
                              alert(`Rejected ${selectedIds.length} affiliate(s)`);
                            }}
                          >
                            ✗ Reject Selected ({selectedIds.length})
                          </div>
                        </div>

                        <div className="dropdown-section">
                          <div className="dropdown-title">
                            Bulk Delete
                          </div>
                          <div 
                            className="dropdown-item danger"
                            onClick={() => {
                              if (selectedIds.length === 0) {
                                alert("Please select at least one affiliate");
                                return;
                              }
                              bulkDeleteAffiliates(selectedIds);
                              setOpenRowIndex(null);
                            }}
                          >
                            🗑 Delete Selected ({selectedIds.length})
                          </div>
                        </div>

                        <div className="dropdown-section">
                          <div className="dropdown-title">
                            Affiliate Actions
                          </div>
                          <div className="dropdown-item">🔒 Manage API Access</div>
                          <div className="dropdown-item">🔄 Reset Postback Settings</div>
                          <div className="dropdown-item">✉ Send Bulk Email</div>
                        </div>
                      </div>
                    )}
                  </th>

                  {visibleColumns.affiliateId && (
                    <th onClick={() => requestSort('affiliateId')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                      Affiliate ID{getSortIndicator('affiliateId')}
                    </th>
                  )}
                  {visibleColumns.name && (
                    <th onClick={() => requestSort('name')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                      Name{getSortIndicator('name')}
                    </th>
                  )}
                  {visibleColumns.email && (
                    <th onClick={() => requestSort('email')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                      Email{getSortIndicator('email')}
                    </th>
                  )}
                  {visibleColumns.contact && (
                    <th onClick={() => requestSort('contact')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                      Contact{getSortIndicator('contact')}
                    </th>
                  )}
                  {visibleColumns.company && (
                    <th onClick={() => requestSort('company')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                      Company{getSortIndicator('company')}
                    </th>
                  )}
                  {visibleColumns.jobTitle && (
                    <th onClick={() => requestSort('jobTitle')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                      Job Title{getSortIndicator('jobTitle')}
                    </th>
                  )}
                  {visibleColumns.address && (
                    <th onClick={() => requestSort('address')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                      Address{getSortIndicator('address')}
                    </th>
                  )}
                  {visibleColumns.city && (
                    <th onClick={() => requestSort('city')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                      City{getSortIndicator('city')}
                    </th>
                  )}
                  {visibleColumns.state && (
                    <th onClick={() => requestSort('state')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                      State{getSortIndicator('state')}
                    </th>
                  )}
                  {visibleColumns.country && (
                    <th onClick={() => requestSort('country')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                      Country{getSortIndicator('country')}
                    </th>
                  )}
                  {visibleColumns.zipCode && (
                    <th onClick={() => requestSort('zipCode')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                      Zip Code{getSortIndicator('zipCode')}
                    </th>
                  )}
                  {visibleColumns.social && (
                    <th onClick={() => requestSort('social')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                      Social{getSortIndicator('social')}
                    </th>
                  )}
                  {visibleColumns.lastLogin && (
                    <th onClick={() => requestSort('lastLogin')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                      Last Login{getSortIndicator('lastLogin')}
                    </th>
                  )}
                  {visibleColumns.signupDate && (
                    <th onClick={() => requestSort('signupDate')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                      Signup Date{getSortIndicator('signupDate')}
                    </th>
                  )}
                  {visibleColumns.signupIP && (
                    <th onClick={() => requestSort('signupIP')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                      Signup IP{getSortIndicator('signupIP')}
                    </th>
                  )}
                  {visibleColumns.signupSource && (
                    <th onClick={() => requestSort('signupSource')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                      Signup Source{getSortIndicator('signupSource')}
                    </th>
                  )}
                  {visibleColumns.postbackDelay && (
                    <th onClick={() => requestSort('postbackDelay')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                      Postback Delay{getSortIndicator('postbackDelay')}
                    </th>
                  )}
                  {visibleColumns.defaultClickTokens && (
                    <th onClick={() => requestSort('defaultClickTokens')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                      Default Click Tokens{getSortIndicator('defaultClickTokens')}
                    </th>
                  )}
                  {visibleColumns.timeZone && (
                    <th onClick={() => requestSort('timeZone')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                      Time Zone{getSortIndicator('timeZone')}
                    </th>
                  )}
                  {visibleColumns.trafficSources && (
                    <th onClick={() => requestSort('trafficSources')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                      Traffic Sources{getSortIndicator('trafficSources')}
                    </th>
                  )}
                  {visibleColumns.currency && (
                    <th onClick={() => requestSort('currency')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                      Currency{getSortIndicator('currency')}
                    </th>
                  )}
                  {visibleColumns.fallBackURL && (
                    <th onClick={() => requestSort('fallBackURL')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                      Fallback URL{getSortIndicator('fallBackURL')}
                    </th>
                  )}
                  {visibleColumns.apiAccess && (
                    <th onClick={() => requestSort('apiAccess')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                      API Access{getSortIndicator('apiAccess')}
                    </th>
                  )}
                  {visibleColumns.manager && (
                    <th onClick={() => requestSort('manager')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                      Manager{getSortIndicator('manager')}
                    </th>
                  )}
                  {visibleColumns.privateNote && (
                    <th onClick={() => requestSort('privateNote')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                      Private Note{getSortIndicator('privateNote')}
                    </th>
                  )}
                  {visibleColumns.createdOn && (
                    <th onClick={() => requestSort('createdOn')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                      Created On{getSortIndicator('createdOn')}
                    </th>
                  )}
                  {visibleColumns.status && (
                    <th onClick={() => requestSort('status')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                      Status{getSortIndicator('status')}
                    </th>
                  )}
                  {visibleColumns.options && <th>Options</th>}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="30"
                      style={{ textAlign: "center", padding: "60px" }}
                    >
                      <div className="spinner" style={{ margin: "0 auto" }}></div>
                      <p style={{ marginTop: "16px", color: "#6b7280" }}>Loading affiliates...</p>
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan="30"
                      style={{ textAlign: "center", padding: "60px" }}
                    >
                      <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
                      <p style={{ color: "#6b7280", fontSize: "16px" }}>No affiliates found</p>
                      <p style={{ color: "#9ca3af", fontSize: "14px", marginTop: "8px" }}>
                        Try adjusting your search or add a new affiliate
                      </p>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((row, index) => (
                    <tr key={row.id}>
                      <td style={{ width: "40px", textAlign: "center" }}>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(row.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds((prev) => [...prev, row.id]);
                            } else {
                              setSelectedIds((prev) =>
                                prev.filter((id) => id !== row.id)
                              );
                            }
                          }}
                        />
                      </td>

                      {visibleColumns.affiliateId && (
                        <td
                          className="link"
                          onClick={() => handleAffiliateClick(row.id)}
                          style={{ cursor: 'pointer', color: '#3b82f6', fontWeight: '500' }}
                        >
                          #{row.id}
                        </td>
                      )}

                      {visibleColumns.name && (
                        <td
                          className="link"
                          onClick={() => handleAffiliateClick(row.id)}
                          style={{ cursor: 'pointer', fontWeight: "500" }}
                        >
                          {row.name}
                        </td>
                      )}

                      {visibleColumns.email && (
                        <td
                          className="link"
                          onClick={() => handleAffiliateClick(row.id)}
                          style={{ cursor: 'pointer' }}
                        >
                          {row.email}
                        </td>
                      )}

                      {visibleColumns.contact && <td>{row.contact}</td>}
                      {visibleColumns.company && <td>{row.company}</td>}
                      {visibleColumns.jobTitle && <td>{row.jobTitle}</td>}
                      {visibleColumns.address && <td>{row.address}</td>}
                      {visibleColumns.city && <td>{row.city}</td>}
                      {visibleColumns.state && <td>{row.state}</td>}
                      {visibleColumns.country && <td>{row.country}</td>}
                      {visibleColumns.zipCode && <td>{row.zipCode}</td>}
                      {visibleColumns.social && <td>{row.social}</td>}
                      {visibleColumns.lastLogin && <td>{row.lastLogin}</td>}
                      {visibleColumns.signupDate && <td>{row.signupDate}</td>}
                      {visibleColumns.signupIP && <td>{row.signupIP}</td>}
                      {visibleColumns.signupSource && <td>{row.signupSource}</td>}
                      {visibleColumns.postbackDelay && <td>{row.postbackDelay}</td>}
                      {visibleColumns.defaultClickTokens && <td>{row.defaultClickTokens}</td>}
                      {visibleColumns.timeZone && <td>{row.timeZone}</td>}
                      {visibleColumns.trafficSources && <td>{row.trafficSources}</td>}
                      {visibleColumns.currency && <td>{row.currency}</td>}
                      {visibleColumns.fallBackURL && <td>{row.fallBackURL}</td>}
                      {visibleColumns.apiAccess && <td>{row.apiAccess}</td>}
                      {visibleColumns.manager && <td>{row.manager}</td>}
                      {visibleColumns.privateNote && <td>{row.privateNote}</td>}
                      {visibleColumns.createdOn && <td>{row.createdOn}</td>}
                      {visibleColumns.status && (
                        <td>
                          <span
                            className={`status ${
                              row.status === "Approved"
                                ? "approved"
                                : row.status === "Rejected"
                                ? "rejected"
                                : "pending"
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                      )}

                      {visibleColumns.options && (
                        <td>
                          <div className="option-wrapper">
                            <button
                              className="option-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenRowIndex(
                                  openRowIndex === index ? null : index
                                );
                              }}
                            >
                              ⋮
                            </button>

                            {openRowIndex === index && (
                              <div className="row-dropdown">
                                <div
                                  className="dropdown-item"
                                  onClick={() => {
                                    handleAffiliateClick(row.id);
                                    setOpenRowIndex(null);
                                  }}
                                >
                                  👤 View Details
                                </div>

                                <div className="dropdown-divider"></div>

                                <div
                                  className="dropdown-item"
                                  onClick={() => {
                                    updateStatus(row.id, "Approved");
                                    setOpenRowIndex(null);
                                  }}
                                >
                                  ✓ Approve
                                </div>

                                <div
                                  className="dropdown-item"
                                  onClick={() => {
                                    updateStatus(row.id, "Rejected");
                                    setOpenRowIndex(null);
                                  }}
                                >
                                  ✕ Reject
                                </div>

                                <div className="dropdown-divider"></div>

                                <div className="dropdown-item">
                                  🔗 Postback URL
                                </div>
                                <div className="dropdown-item">📊 Reports</div>
                                <div className="dropdown-item">🎯 Offers</div>
                                <div className="dropdown-item">✉ Send Email</div>
                                <div className="dropdown-item">🔑 API Access</div>

                                <div className="dropdown-divider"></div>

                                <div 
                                  className="dropdown-item danger"
                                  onClick={() => {
                                    deleteAffiliate(row.id);
                                    setOpenRowIndex(null);
                                  }}
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

          {/* Pagination Component */}
          {!loading && totalItems > 0 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, totalItems)} of {totalItems} entries
              </div>
              <div className="pagination-controls">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="pagination-nav-btn"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className="pagination-nav-btn"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {showModal && (
          <AddAffiliateModal onClose={() => setShowModal(false)} />
        )}
      </div>
    </div>
  );
};

export default AffiliatesPage;