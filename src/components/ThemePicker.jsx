import React, { useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import { THEMES, THEME_GROUPS, applyTheme, getSavedTheme } from '../theme';
import '../css/ThemePicker.css';

// Mini screenshot of a theme: icon rail, top bar, page with a card and an accent bar.
const ThemePreview = ({ preview }) => (
  <span className="nf-theme-preview" style={{ background: preview.bg }} aria-hidden="true">
    <span className="nf-tp-rail" style={{ background: preview.rail }} />
    <span className="nf-tp-top" style={{ background: preview.top }} />
    <span className="nf-tp-card" />
    <span className="nf-tp-accent" style={{ background: preview.accent }} />
  </span>
);

const ThemePicker = () => {
  const [current, setCurrent] = useState(getSavedTheme);
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const choose = (id) => {
    setCurrent(applyTheme(id));
    setOpen(false);
  };

  const active = THEMES.find((t) => t.id === current) || THEMES[0];

  return (
    <div className="nf-theme" ref={rootRef}>
      <button
        type="button"
        className="nf-theme-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Icon name="palette" className="of-top-icon" />
        <span>Theme</span>
        <span className="nf-theme-dot" style={{ background: active.preview.accent }} />
      </button>

      {open && (
        <div className="nf-theme-menu" role="listbox" aria-label="Choose a theme">
          <div className="nf-theme-menu-head">
            <p className="nf-theme-menu-title">Choose theme</p>
            <span className="nf-theme-current">{active.label}</span>
          </div>
          {THEME_GROUPS.map((group) => (
            <div className="nf-theme-group" key={group}>
              <p className="nf-theme-group-title">{group}</p>
              <div className="nf-theme-grid">
                {THEMES.filter((t) => t.group === group).map((t) => (
                  <button
                    type="button"
                    key={t.id}
                    role="option"
                    aria-selected={t.id === current}
                    className={`nf-theme-option ${t.id === current ? 'is-active' : ''}`}
                    onClick={() => choose(t.id)}
                    title={t.label}
                  >
                    <ThemePreview preview={t.preview} />
                    <span className="nf-theme-label">{t.label}</span>
                    {t.id === current && <span className="nf-theme-check" aria-hidden="true">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemePicker;
