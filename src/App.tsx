/*
 Copyright (C) 2022 RealRong 2001

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as
 published by the Free Software Foundation, either version 3 of the
 License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */


import { Provider as JotaiProvider } from 'jotai'
import { BrowserRouter as Router } from 'react-router-dom'
import Routes from './routes'
import { GlobalScope } from './jotai/jotaiScope'
import { enableMapSet } from 'immer'
import '@icon-park/react/styles/index.less'
import './common.less'
import { Toaster } from 'react-hot-toast'
import TitleBar from './components/titlebar'
import Initializer from './Initializer'
import './global.less'
enableMapSet()
window.global = window
const App = () => {
  return (
    <JotaiProvider scope={GlobalScope}>
      <Toaster />
      <Initializer />
      <TitleBar />
      <Router>
        <Routes />
      </Router>
    </JotaiProvider>
  )
}

export default App
