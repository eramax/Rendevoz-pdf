import EventEmitter from '@/events/eventEmitter'
import { CustomEditor } from '../types'

const withEmitter = (editor: CustomEditor, emitter: EventEmitter) => {
  editor.emitter = emitter
  return editor
}

export default withEmitter