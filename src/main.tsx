import { enableMapSet } from 'immer'
import { createRoot } from 'react-dom/client'
import App from './App'
import initI18n from './i18n'

enableMapSet()
const lang = localStorage.getItem('lang') || 'en-US'
console.log(lang)
initI18n(lang)
const root = createRoot(document.getElementById('root')!)

root.render(<App />)

postMessage({ payload: 'removeLoading' }, '*')
