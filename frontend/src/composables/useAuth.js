import { storeToRefs } from 'pinia'
import { useAuthStore } from 'src/stores/auth-store'

export function useAuth() {
  const store = useAuthStore()
  const { user, loading, error } = storeToRefs(store)

  return {
    user,
    loading,
    error,
    fetchMe: store.fetchMe,
    logout: store.logout,
    isAuthenticated: store.isAuthenticated,
  }
}
