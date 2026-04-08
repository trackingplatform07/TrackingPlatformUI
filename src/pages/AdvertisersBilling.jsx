import React, { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/AdvertisersBilling.css";
import { useNavigate } from "react-router-dom";
const AdvertisersBilling = () => {
const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const data = [
    {
      id: "#INV-20221003-2039",
      advertiser: "71991 ~ Test Advertiser 1",
      invoiceDate: "03 Oct, 2022",
      period: "01 Sep, 2022 - 30 Sep, 2022",
      dueDate: "03 Oct, 2022",
      paymentDate: "",
      amount: "120.000 USD",
      status: "Pending",
      note: ""
    },
    {
      id: "#INV-20220128-927",
      advertiser: "71991 ~ Test Advertiser 1",
      invoiceDate: "28 Jan, 2022",
      period: "01 Dec, 2021 - 31 Dec, 2021",
      dueDate: "28 Jan, 2022",
      paymentDate: "",
      amount: "140.000 USD",
      status: "Pending",
      note: ""
    },
    {
      id: "#INV-20210917-3564",
      advertiser: "92263 ~",
      invoiceDate: "17 Sep, 2021",
      period: "15 Aug, 2021 - 14 Sep, 2021",
      dueDate: "17 Sep, 2021",
      paymentDate: "",
      amount: "9542.000 USD",
      status: "Pending",
      note: ""
    },
    {
      id: "#INV-20210908-500",
      advertiser: "92124 ~",
      invoiceDate: "08 Sep, 2021",
      period: "01 Aug, 2021 - 31 Aug, 2021",
      dueDate: "08 Sep, 2021",
      paymentDate: "08 Sep, 2021",
      amount: "140.000 USD",
      status: "Paid",
      note: "done"
    }
  ];

  return (
    <div className="of-layout">

      <Sidebar isCollapsed={isSidebarCollapsed} />

      <div className="of-main">

        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        <div className="billing-page">

          {/* Header */}
          <div className="billing-header">
            <h2>Advertiser Billing</h2>

            <div className="billing-actions">
<button
  className="btn primary"
  onClick={() => navigate("/create-invoice")}
>
  + Create Invoice
</button>           
   <button
  className="btn"
  onClick={() => navigate("/invoice-settings")}
>
  Invoice Settings
</button>

              <input placeholder="Select Advertiser" className="input" />
              <select className="input">
                <option>All</option>
              </select>

              <div className="entries">
                Show
                <select>
                  <option>20</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="billing-table-wrapper">
            <table className="billing-table">

              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Advertiser</th>
                  <th>Invoice Date / Period</th>
                  <th>Due Date</th>
                  <th>Payment Date</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Note</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {data.map((row, i) => (
                  <tr key={i}>
                    <td className="link">{row.id}</td>
                    <td>{row.advertiser}</td>

                    <td>
                      <div>Invoice Date : {row.invoiceDate}</div>
                      <small>Period : {row.period}</small>
                    </td>

                    <td>{row.dueDate}</td>
                    <td>{row.paymentDate}</td>
                    <td>{row.amount}</td>

                    <td>
                      <span className={`status ${row.status.toLowerCase()}`}>
                        {row.status}
                      </span>
                    </td>

                    <td>{row.note}</td>

                    <td>
                      <button className="option-btn">⋮</button>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button>{"<<"}</button>
            <button className="active">1</button>
            <button>{">>"}</button>
          </div>

        </div>

      </div>

    </div>
  );
};

export default AdvertisersBilling;