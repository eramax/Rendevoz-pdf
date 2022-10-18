import { app, BrowserWindow, shell } from 'electron'
import { release } from 'os'
import { join } from 'path'
import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions } from '@nestjs/microservices'
import { AppModule } from './app.module'
import { ElectronIpcTransport } from './transport'

async function bootstrap() {
  try {
    const nestApp = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
      strategy: new ElectronIpcTransport()
    })
    await nestApp.listen()
  } catch (error) {
    console.log(error)
    app.quit()
  }
}
// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

bootstrap()