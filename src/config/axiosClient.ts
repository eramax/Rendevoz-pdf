import axios from 'axios'

axios.defaults.withCredentials = false;
const fetchClient = () => {
  const instance = axios.create()
  instance.interceptors.request.use(request => {
    // request.headers.RendevozCsrf = Cookies.get('CSRF-TOKEN')
    return request
  })
  return instance
}
export default fetchClient()
