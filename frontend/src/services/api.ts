import axios from 'axios'
import { useStoreStore } from '../store/useStoreStore'

export const apiClient = axios.create({
  baseURL: '',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to inject current store code and ID
apiClient.interceptors.request.use((config) => {
  const { currentStoreCode, currentStoreId } = useStoreStore.getState()
  if (currentStoreCode) {
    config.headers['X-Store-Code'] = currentStoreCode
  }
  if (currentStoreId) {
    config.headers['X-Store-Id'] = String(currentStoreId)
  }
  // Internal token for internal tool calls
  if (config.url?.startsWith('/internal')) {
    config.headers['X-Internal-Token'] = 'retail-internal-secret-token-v1'
  }
  return config
})

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log or transform error
    return Promise.reject(error)
  }
)
