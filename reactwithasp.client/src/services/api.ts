import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.ASPNETCORE_HTTPS_PORT
    ? `https://localhost:${import.meta.env.ASPNETCORE_HTTPS_PORT}`
    : import.meta.env.ASPNETCORE_URLS
      ? import.meta.env.ASPNETCORE_URLS.split(';')[0]
      : 'https://localhost:8001',
  withCredentials: true, // Include cookies in requests
})

export default api
