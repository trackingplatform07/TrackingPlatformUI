import React, { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/ImportPage.css";

const ImportPage = () => {

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const cards = [
    { title: "Affiliates", color: "green" },
    { title: "Advertisers", color: "orange" },
    { title: "Offers", color: "blue" },
    { title: "Conversions", color: "yellow", button: "+ Setup" }
  ];

  return (
    <div className="of-layout">

      <Sidebar isCollapsed={isSidebarCollapsed} />

      <div className="of-main">

        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        <div className="import-page">

          <div className="import-header">
            <span>Shortcuts</span>
          </div>

          <div className="import-grid">

            {cards.map((card, index) => (
              <div className="import-card" key={index}>

                <div className={`icon ${card.color}`}>☁</div>

                <h3>{card.title}</h3>

                <p>Import</p>

                {card.button ? (
                  <button className="btn setup">{card.button}</button>
                ) : (
                  <button className="btn upload">Select CSV File</button>
                )}

              </div>
            ))}

          </div>

        </div>

      </div>

    </div>
  );
};

export default ImportPage;