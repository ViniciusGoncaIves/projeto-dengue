import { http } from 'src/boot/apiFetch'

export function useUsuarios() {
  const fetchUsuarios = () => http.get('/api/usuario')

  const createUsuario = (payload) => http.post('/api/usuario/admin', payload)

  const updateUsuario = (id, payload) => http.put(`/api/usuario/${id}`, payload)

  const deleteUsuario = (id) => http.delete(`/api/usuario/${id}`)

  return {
    fetchUsuarios,
    createUsuario,
    updateUsuario,
    deleteUsuario,
  }
}
