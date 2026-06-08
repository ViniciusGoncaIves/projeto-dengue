import { defineStore } from 'pinia'
import { http, clearAuthToken, getAuthToken } from 'src/boot/apiFetch'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: false,
    error: '',
  }),
  getters: {
    isAuthenticated: () => !!getAuthToken(),
  },
  actions: {
    async fetchMe() {
      if (!getAuthToken()) return

      this.loading = true
      this.error = ''
      try {
        const response = await http.get('/api/auth/me')
        this.user = response?.data || null
      } catch (err) {
        this.error = err?.message || 'Erro ao carregar usuario'
        clearAuthToken()
        this.user = null
      } finally {
        this.loading = false
      }
    },
    logout() {
      clearAuthToken()
      this.user = null
    },
  },
})
