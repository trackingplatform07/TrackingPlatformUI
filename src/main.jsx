import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './css/index.css'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/theme-enhance.css'
import './css/themes.css'
import './css/buttons.css'
import './css/popups.css'
import './css/pagination.css'
import './css/filters.css'
import { applyTheme } from './theme'
import { initStickyColumns } from './stickyColumns'
import { initButtonPolish } from './buttonPolish'
import { initPopupPolish } from './popupPolish'
import { initPagerPolish } from './pagerPolish'
import { initMenuFloat } from './menuFloat'

applyTheme()
initStickyColumns()
initButtonPolish()
initPopupPolish()
initPagerPolish()
initMenuFloat()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

