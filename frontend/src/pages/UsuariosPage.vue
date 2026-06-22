<template>
  <q-page class="usuarios-page">
    <div class="page-shell page-header">
      <div>
        <h1 class="page-title">Gestão de usuários</h1>
        <p class="page-subtitle">
          Cadastre, edite e remova contas de usuários comuns e administradores.
        </p>
      </div>
      <q-btn
        color="primary"
        unelevated
        icon="person_add"
        label="Novo usuário"
        @click="abrirFormulario()"
      />
    </div>

    <div class="page-shell table-wrap">
      <q-banner v-if="errorMessage" class="message message-error" rounded>
        {{ errorMessage }}
      </q-banner>
      <q-banner v-if="successMessage" class="message message-success" rounded>
        {{ successMessage }}
      </q-banner>

      <div class="table-head">
        <span>Nome</span>
        <span>E-mail</span>
        <span>Tipo</span>
        <span>Cadastro</span>
        <span>Ações</span>
      </div>

      <div v-if="loading" class="table-empty">Carregando usuários...</div>
      <div v-else-if="usuarios.length === 0" class="table-empty">Nenhum usuário encontrado.</div>

      <div v-else class="table-body">
        <div v-for="usuario in usuarios" :key="usuario.idusuario" class="table-row">
          <div class="cell user-main">
            <strong>{{ usuario.nome }}</strong>
          </div>
          <div class="cell">{{ usuario.email }}</div>
          <div class="cell">
            <q-badge class="type-badge" :class="tipoClass(usuario.tipo)">
              {{ formatTipo(usuario.tipo) }}
            </q-badge>
          </div>
          <div class="cell">{{ formatDate(usuario.data_cadastro) }}</div>
          <div class="cell actions">
            <q-btn
              dense
              unelevated
              color="primary"
              icon="edit"
              @click="abrirFormulario(usuario)"
            />
            <q-btn
              dense
              unelevated
              color="negative"
              icon="delete"
              :disable="usuario.idusuario === authStore.user?.idusuario"
              @click="abrirExclusao(usuario)"
            />
          </div>
        </div>
      </div>
    </div>

    <q-dialog v-model="formDialog">
      <q-card class="form-dialog">
        <q-card-section>
          <div class="text-h6">{{ editandoUsuario ? 'Editar usuário' : 'Cadastrar usuário' }}</div>
          <div class="dialog-subtitle">
            {{ editandoUsuario ? 'Atualize os dados da conta.' : 'Informe os dados da nova conta.' }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-form ref="formRef" class="user-form" @submit.prevent="salvarUsuario">
            <q-input
              v-model="form.nome"
              outlined
              dense
              debounce="500"
              label="Nome completo"
              :rules="nameRules"
            />
            <q-input
              v-model="form.email"
              outlined
              dense
              debounce="500"
              type="email"
              label="E-mail"
              :rules="emailRules"
            />
            <q-input
              v-model="form.senha"
              outlined
              dense
              debounce="500"
              type="password"
              :label="editandoUsuario ? 'Nova senha' : 'Senha'"
              :rules="senhaRules"
            />
            <q-select
              v-model="form.tipo"
              :options="tipoOptions"
              emit-value
              map-options
              outlined
              dense
              label="Tipo"
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            color="primary"
            unelevated
            label="Salvar"
            :loading="saving"
            @click="salvarUsuario"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="deleteDialog">
      <q-card class="confirm-dialog">
        <q-card-section>
          <div class="text-h6">Remover usuário</div>
          <div class="dialog-subtitle">
            Confirme a remoção de {{ usuarioParaExcluir?.nome }}.
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            color="negative"
            unelevated
            label="Remover"
            :loading="deleting"
            @click="excluirUsuario"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth-store'
import { useUsuarios } from 'src/composables/useUsuarios'
import { formatDate } from 'src/helpers/formatters'
import { email, minLength, required } from 'src/helpers/validation'

const router = useRouter()
const authStore = useAuthStore()
const { fetchUsuarios, createUsuario, updateUsuario, deleteUsuario } = useUsuarios()

const usuarios = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const formDialog = ref(false)
const deleteDialog = ref(false)
const formRef = ref(null)
const editandoUsuario = ref(null)
const usuarioParaExcluir = ref(null)
const form = ref({
  nome: '',
  email: '',
  senha: '',
  tipo: 'USER',
})

const tipoOptions = [
  { label: 'Usuário comum', value: 'USER' },
  { label: 'Administrador', value: 'ADMIN' },
]

const nameRules = [required('Nome obrigatório')]
const emailRules = [required('E-mail obrigatório'), email()]
const senhaRules = computed(() => [
  (val) => editandoUsuario.value || !!val || 'Senha obrigatória',
  minLength(8),
])

onMounted(async () => {
  if (!authStore.user) {
    await authStore.fetchMe()
  }

  if (authStore.user?.tipo !== 'ADMIN') {
    router.replace('/dashboard')
    return
  }

  await carregarUsuarios()
})

const carregarUsuarios = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await fetchUsuarios()
    usuarios.value = response?.data || []
  } catch (err) {
    errorMessage.value = err?.message || 'Erro ao carregar usuários.'
  } finally {
    loading.value = false
  }
}

const abrirFormulario = async (usuario = null) => {
  errorMessage.value = ''
  successMessage.value = ''
  editandoUsuario.value = usuario
  form.value = {
    nome: usuario?.nome || '',
    email: usuario?.email || '',
    senha: '',
    tipo: usuario?.tipo || 'USER',
  }
  formDialog.value = true
  await nextTick()
  formRef.value?.resetValidation()
}

const salvarUsuario = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  const isValid = formRef.value ? await formRef.value.validate() : true
  if (!isValid) return

  saving.value = true
  try {
    const payload = {
      nome: form.value.nome,
      email: form.value.email,
      tipo: form.value.tipo,
    }

    if (form.value.senha) {
      payload.senha = form.value.senha
    }

    if (editandoUsuario.value) {
      const response = await updateUsuario(editandoUsuario.value.idusuario, payload)
      const usuarioAtualizado = response?.data || {
        ...editandoUsuario.value,
        ...payload,
      }
      usuarios.value = usuarios.value.map((usuario) =>
        usuario.idusuario === editandoUsuario.value.idusuario
          ? { ...usuario, ...usuarioAtualizado }
          : usuario,
      )
      successMessage.value = 'Usuário atualizado com sucesso.'
    } else {
      const response = await createUsuario({
        ...payload,
        senha: form.value.senha,
      })
      if (response?.data) {
        usuarios.value = [response.data, ...usuarios.value]
      }
      successMessage.value = 'Usuário cadastrado com sucesso.'
    }

    formDialog.value = false
  } catch (err) {
    errorMessage.value = err?.message || 'Erro ao salvar usuário.'
  } finally {
    saving.value = false
  }
}

const abrirExclusao = (usuario) => {
  errorMessage.value = ''
  successMessage.value = ''
  usuarioParaExcluir.value = usuario
  deleteDialog.value = true
}

const excluirUsuario = async () => {
  if (!usuarioParaExcluir.value) return

  deleting.value = true
  try {
    await deleteUsuario(usuarioParaExcluir.value.idusuario)
    usuarios.value = usuarios.value.filter(
      (usuario) => usuario.idusuario !== usuarioParaExcluir.value.idusuario,
    )
    successMessage.value = 'Usuário removido com sucesso.'
    deleteDialog.value = false
    usuarioParaExcluir.value = null
  } catch (err) {
    errorMessage.value = err?.message || 'Erro ao remover usuário.'
  } finally {
    deleting.value = false
  }
}

const formatTipo = (tipo) => (tipo === 'ADMIN' ? 'Administrador' : 'Usuário')

const tipoClass = (tipo) => ({
  'type-admin': tipo === 'ADMIN',
  'type-user': tipo !== 'ADMIN',
})

</script>

<style scoped>
.usuarios-page {
  padding: 32px 0 80px;
  background: var(--brand-muted);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  margin-bottom: 24px;
}

.page-title {
  font-size: clamp(28px, 3vw, 36px);
  font-weight: 700;
}

.page-subtitle,
.dialog-subtitle {
  color: var(--brand-ink-soft);
}

.table-wrap {
  background: var(--brand-card);
  border-radius: var(--brand-radius);
  box-shadow: var(--brand-shadow);
  padding: 18px;
}

.message {
  margin-bottom: 14px;
}

.message-error {
  background: var(--brand-danger-soft);
  color: var(--brand-danger-text);
}

.message-success {
  background: var(--brand-success-soft);
  color: var(--brand-success-text);
}

.table-head,
.table-row {
  display: grid;
  grid-template-columns: 1.15fr 1.25fr 150px 150px 120px;
  gap: 12px;
  align-items: center;
}

.table-head {
  text-transform: uppercase;
  font-size: 12px;
  color: var(--brand-ink-soft);
  padding-bottom: 12px;
  border-bottom: 1px solid var(--brand-line);
}

.table-body {
  display: grid;
  gap: 12px;
  margin-top: 12px;
}

.table-row {
  background: var(--brand-panel);
  border-radius: var(--brand-radius);
  padding: 12px;
}

.cell {
  min-width: 0;
  overflow-wrap: anywhere;
}

.actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.type-badge {
  border-radius: 999px;
  padding: 6px 10px;
  font-weight: 700;
}

.type-admin {
  background: var(--brand-warning-soft);
  color: var(--brand-warning-text);
}

.type-user {
  background: var(--brand-success-soft);
  color: var(--brand-success-text);
}

.table-empty {
  padding: 24px;
  text-align: center;
  color: var(--brand-ink-soft);
}

.form-dialog,
.confirm-dialog {
  width: min(520px, 94vw);
}

.user-form {
  display: grid;
  gap: 12px;
}

@media (max-width: 900px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .table-head {
    display: none;
  }

  .table-row {
    grid-template-columns: 1fr;
  }
}
</style>
