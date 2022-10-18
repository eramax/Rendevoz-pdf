import { Controller, Inject } from '@nestjs/common'
import { WebContents, BrowserWindow } from 'electron'
import { AppService } from './app.service'
import { IpcInvoke } from './transport'
import fs from 'fs'
import path from 'path'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, @Inject('WEB_CONTENTS') private readonly webContents: WebContents) {}
  @IpcInvoke('maximizeWindow')
  public async maximizeWindow() {
    if (BrowserWindow.getFocusedWindow()?.isMaximized()) {
      BrowserWindow.getFocusedWindow()?.unmaximize()
    } else {
      BrowserWindow.getFocusedWindow()?.maximize()
    }
  }
  @IpcInvoke('minimizeWindow')
  public async minimizeWindow() {
    BrowserWindow.getFocusedWindow()?.minimize()
  }
  @IpcInvoke('msg')
  public async handleSendMsg(msg: string): Promise<string> {
    this.webContents.send('reply-msg', 'this is msg from webContents.send')
    return `The main process received your message: ${msg} at time: ${this.appService.getTime()}`
  }
  @IpcInvoke('readPdf')
  public async pdfFile(fileUrl: string) {
    return new Promise((resolve, reject) => {
      fs.readFile(fileUrl, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }
  @IpcInvoke('copyPdf')
  public async copyPdfFile(originPath: string, originName: string) {
    if (!fs.existsSync('./files')) {
      fs.mkdirSync('./files', {})
    }
    const newPath = `./files/${originName}`
    if (!fs.existsSync(newPath)) {
      return new Promise(resolve => {
        fs.copyFile(originPath, newPath, () => {
          resolve(newPath)
        })
      })
    } else {
      return newPath
    }
  }
  @IpcInvoke('saveImage')
  public async saveImage(imgName: string, imgData: string) {
    if (!fs.existsSync('./imgs')) {
      fs.mkdirSync('./imgs', {})
    }
    const newPath = `./imgs/${imgName}.png`
    const absolutePath = path.resolve(newPath)
    const protocolPath = 'rendefile://' + absolutePath
    const data = imgData.replace(/^data:image\/png;base64,/, '')
    const buf = Buffer.from(data, 'base64')
    if (!fs.existsSync(newPath)) {
      return new Promise(resolve => {
        fs.writeFile(newPath, buf, () => {
          resolve(protocolPath)
        })
      })
    } else {
      return protocolPath
    }
  }
}
