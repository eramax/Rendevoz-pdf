import toast from 'react-hot-toast'

const globalPromiseErrorHandler = e => {
  toast.error(e.reason)
}

window.onunhandledrejection = globalPromiseErrorHandler
