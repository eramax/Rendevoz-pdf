import { join } from 'path'
import { Module } from '@nestjs/common'
import { BrowserWindow, app, shell, protocol,session } from 'electron'
import axios from 'axios'
import { fileURLToPath } from 'url'
const HttpsProxyAgent = require('https-proxy-agent')

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'
process.env.DIST_ELECTRON = join(__dirname, '../..')
process.env.DIST = join(process.env.DIST_ELECTRON, '../../dist')
process.env.PUBLIC = app.isPackaged ? process.env.DIST : join(process.env.DIST_ELECTRON, '../public')

@Module({
  providers: [
    {
      provide: 'WEB_CONTENTS',
      async useFactory(isDev: boolean) {
        const preload = join(__dirname, '../../preload/index.js')
        const url = process.env.VITE_DEV_SERVER_URL
        const indexHtml = join(process.env.DIST, 'index.html')
        app.on('window-all-closed', () => {
          if (process.platform !== 'darwin') app.quit()
        })

        if (isDev) {
          if (process.platform === 'win32') {
            process.on('message', data => {
              if (data === 'graceful-exit') app.quit()
            })
          } else {
            process.on('SIGTERM', () => {
              app.quit()
            })
          }
        }

        await app.whenReady()
        protocol.registerFileProtocol('rendefile', (req, callback) => {
          const filePath = fileURLToPath('file://' + req.url.slice('rendefile://'.length))
          callback(filePath)
        })
        app.on('web-contents-created', (createEvent, contents) => {
          contents.on('new-window', newEvent => {
            console.log("Blocked by 'new-window'")
            newEvent.preventDefault()
          })

          contents.on('will-navigate', newEvent => {
            console.log("Blocked by 'will-navigate'")
            newEvent.preventDefault()
          })

          contents.setWindowOpenHandler(({ url }) => {
            shell.openExternal(url)
            return { action: 'allow' }
          })
        })
        const win = new BrowserWindow({
          width: 1000,
          height: 800,
          webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload,
            devTools: true
          },
          autoHideMenuBar: true,
          titleBarStyle: 'hidden'
        })

        win.on('maximize', () => {
          win.webContents.send('winMaximized')
        })
        win.on('unmaximize', () => {
          win.webContents.send('winUnmaximized')
        })
        const wsession = win.webContents.session

        // ?????????????????????????????????????????????????????????????????????????????????
        // ?????????????????????????????? www.google.com??????????????????????????????????????????
        wsession.resolveProxy('https://www.google.com').then(proxyUrl => {
          // DIRECT ????????????????????????
          if (proxyUrl !== 'DIRECT') {
            // proxyUrl ???????????????: 'PROXY 127.0.0.1:6152'
            const hostAndPort = proxyUrl.split(' ')[1]
            const [proxyHost, proxyPort] = hostAndPort.split(':')

            // ???????????????????????????????????????????????????????????? https-proxy-agent ?????? npm ?????? Axios ????????????????????????????????????
            // @ts-ignore
            const agent = new HttpsProxyAgent({
              host: proxyHost,
              port: proxyPort
            })
            axios.defaults.httpsAgent = agent
          }
        })
        if (app.isPackaged) {
          win.loadFile(indexHtml)
        } else {
          win.loadURL(url)
          // win.webContents.openDevTools()
        }
        win.webContents.openDevTools()
        // if (isDev) win.webContents.openDevTools()
        // else win.removeMenu()

        win.on('closed', () => {
          win.destroy()
        })

        return win.webContents
      },
      inject: ['IS_DEV']
    }
  ],
  exports: ['WEB_CONTENTS']
})
export class WinModule {}
