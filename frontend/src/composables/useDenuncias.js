import { ref } from 'vue'
import { http } from 'src/boot/apiFetch'

export function useDenuncias() {
  const denuncias = ref([])
  const stats = ref(null)
  const loading = ref(false)
  const error = ref('')

  const fetchDenuncias = async (params = {}) => {
    loading.value = true
    error.value = ''
    try {
      const response = await http.get('/api/denuncia', { params })
      denuncias.value = response?.data || []
    } catch (err) {
      error.value = err?.message || 'Erro ao carregar denuncias'
    } finally {
      loading.value = false
    }
  }

  const fetchStats = async () => {
    try {
      const response = await http.get('/api/denuncia/stats')
      stats.value = response?.data || null
    } catch (err) {
      error.value = err?.message || 'Erro ao carregar estatisticas'
    }
  }

  const fetchPublicDenuncias = async (params = {}) => {
    loading.value = true
    error.value = ''
    try {
      const response = await http.get('/api/denuncia/public', { params, skipAuth: true })
      denuncias.value = response?.data || []
    } catch (err) {
      error.value = err?.message || 'Erro ao carregar denuncias'
    } finally {
      loading.value = false
    }
  }

  const fetchPublicStats = async () => {
    try {
      const response = await http.get('/api/denuncia/public-stats', { skipAuth: true })
      stats.value = response?.data || null
    } catch (err) {
      error.value = err?.message || 'Erro ao carregar estatisticas'
    }
  }

  const createDenuncia = async (payload, options = {}) => {
    return http.post('/api/denuncia', payload, options)
  }

  const fetchDenunciaById = async (id) => {
    return http.get(`/api/denuncia/${id}`)
  }

  const updateDenuncia = async (id, payload, options = {}) => {
    return http.put(`/api/denuncia/${id}`, payload, options)
  }

  const updateStatus = async (id, status, motivo) => {
    return http.patch(`/api/denuncia/${id}/status`, {
      status,
      motivo_rejeicao: motivo || null,
    })
  }

  return {
    denuncias,
    stats,
    loading,
    error,
    fetchDenuncias,
    fetchStats,
    createDenuncia,
    fetchDenunciaById,
    updateDenuncia,
    updateStatus,
    fetchPublicDenuncias,
    fetchPublicStats,
  }
}
