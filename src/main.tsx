import { enableMapSet } from 'immer'
import { createRoot } from 'react-dom/client'
import App from './App'
import initI18n from './i18n'
import { initSearchIndex } from './utils/searchIndex'

enableMapSet()
initSearchIndex()
const lang = localStorage.getItem('lang') || 'en-US'
initI18n(lang)

const root = createRoot(document.getElementById('root')!)

root.render(<App />)

postMessage({ payload: 'removeLoading' }, '*')
