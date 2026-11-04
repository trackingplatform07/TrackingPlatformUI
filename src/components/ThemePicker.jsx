import React, { useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import { THEMES, applyTheme, getSavedTheme } from '../theme';
import '../css/ThemePicker.css';

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
        <span className="nf-theme-dot" style={{ background: active.swatch[1] }} />
      </button>

      {open && (
        <div className="nf-theme-menu" role="listbox" aria-label="Choose a theme">
          <p className="nf-theme-menu-title">Choose theme</p>
          {THEMES.map((t) => (
            <button
              type="button"
              key={t.id}
              role="option"
              aria-selected={t.id === current}
              className={`nf-theme-option ${t.id === current ? 'is-active' : ''}`}
              onClick={() => choose(t.id)}
            >
              <span className="nf-theme-swatch">
                <span style={{ background: t.swatch[0] }} />
                <span style={{ background: t.swatch[1] }} />
              </span>
              <span className="nf-theme-label">{t.label}</span>
              {t.id === current && <span className="nf-theme-check" aria-hidden="true">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemePicker;
