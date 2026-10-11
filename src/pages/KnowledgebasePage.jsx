import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/KnowledgebasePage.css";

const ARTICLES_API = "https://localhost:7150/api/KnowledgeArticles";

export default function KnowledgebasePage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [expandedId, setExpandedId] = useState(null);

  const loadArticles = async (searchTerm) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.set("search", searchTerm);
      const response = await fetch(`${ARTICLES_API}?${params.toString()}`, { headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to load articles");
      const data = await response.json();
      setArticles(Array.isArray(data) ? data : []);
    } catch {
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles("");
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => loadArticles(search), 300);
    return () => clearTimeout(handle);
  }, [search]);

  const categories = ["All", ...Array.from(new Set(articles.map((article) => article.category)))];
  const visibleArticles = activeCategory === "All" ? articles : articles.filter((article) => article.category === activeCategory);

  return (
    <div className="of-layout">
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <div className="of-main">
        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed((value) => !value)}
        />

        <main className="kb-page">
          <section className="kb-card">
            <h1><span aria-hidden="true">📚</span> Knowledgebase</h1>
            <p className="kb-subtitle">Find answers and guides for using Offer18</p>

            <input
              className="kb-search"
              placeholder="Search articles…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <div className="kb-categories">
              {categories.map((category) => (
                <button
                  type="button"
                  key={category}
                  className={`kb-category-chip ${activeCategory === category ? "active" : ""}`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="kb-articles">
              {loading && <p className="kb-message">Loading articles…</p>}
              {!loading && visibleArticles.length === 0 && <p className="kb-message">No articles found</p>}
              {!loading && visibleArticles.map((article) => (
                <div className="kb-article" key={article.id}>
                  <button
                    type="button"
                    className="kb-article-header"
                    onClick={() => setExpandedId((current) => (current === article.id ? null : article.id))}
                  >
                    <div>
                      <span className="kb-article-category">{article.category}</span>
                      <div className="kb-article-title">{article.title}</div>
                      <div className="kb-article-summary">{article.summary}</div>
                    </div>
                    <span aria-hidden="true" className={`kb-article-arrow ${expandedId === article.id ? "open" : ""}`}>▾</span>
                  </button>
                  {expandedId === article.id && (
                    <div className="kb-article-content">{article.content}</div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
