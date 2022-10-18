import { IBase } from './base'

export interface ITask extends IBase {
  originId: number
  name: string
  content: string
  estimatedEndTime: number
  status: string
}

export interface DocumentTask extends ITask {
  category: string
}
