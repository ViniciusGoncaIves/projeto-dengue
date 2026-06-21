<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-card">
        <div class="text-center q-mb-lg">
          <h1 class="text-h5 text-dark q-my-none q-mb-sm">Crie sua conta</h1>
          <p class="text-subtitle2 text-weight-light text-grey-7">
            Cadastre-se para acompanhar as denúncias que você registrar.
          </p>
        </div>

        <q-banner v-if="errorMessage" class="bg-red-1 text-red-9 q-mb-md" rounded>
          {{ errorMessage }}
        </q-banner>

        <q-form ref="formRef" @submit.prevent="handleRegister" class="q-gutter-md">
          <div>
            <label class="text-caption text-weight-medium text-dark">Nome Completo</label>
            <q-input
              v-model="form.fullName"
              outlined
              dense
              placeholder="Seu nome completo"
              prefix-icon="person"
              class="q-mt-xs"
              :rules="[(val) => !!val || 'Nome é obrigatório']"
            />
          </div>

          <div>
            <label class="text-caption text-weight-medium text-dark">E-mail</label>
            <q-input
              v-model="form.email"
              outlined
              dense
              type="email"
              placeholder="exemplo@email.com"
              prefix-icon="email"
              class="q-mt-xs"
              :rules="[
                (val) => !!val || 'E-mail é obrigatório',
                (val) => /.+@.+\..+/.test(val) || 'E-mail inválido',
              ]"
            />
          </div>

          <div>
            <label class="text-caption text-weight-medium text-dark">Senha</label>
            <q-input
              v-model="form.password"
              outlined
              dense
              :type="showPassword ? 'text' : 'password'"
              placeholder="Mínimo 8 caracteres"
              prefix-icon="lock"
              :suffix-icon="showPassword ? 'visibility_off' : 'visibility'"
              class="q-mt-xs"
              @click:append="showPassword = !showPassword"
              :rules="[
                (val) => !!val || 'Senha é obrigatória',
                (val) => val.length >= 8 || 'Mínimo 8 caracteres',
              ]"
            />
          </div>

          <div>
            <label class="text-caption text-weight-medium text-dark">Confirmar Senha</label>
            <q-input
              v-model="form.confirmPassword"
              outlined
              dense
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="Repita sua senha"
              prefix-icon="lock"
              :suffix-icon="showConfirmPassword ? 'visibility_off' : 'visibility'"
              class="q-mt-xs"
              @click:append="showConfirmPassword = !showConfirmPassword"
              :rules="[
                (val) => !!val || 'Confirmação é obrigatória',
                (val) => val === form.password || 'Senhas não coincidem',
              ]"
            />
          </div>

          <q-btn
            type="submit"
            unelevated
            size="lg"
            color="primary"
            label="Criar conta"
            class="full-width text-white text-weight-bold"
            :loading="loading"
          />
        </q-form>

        <div class="text-center q-mt-lg">
          <span class="text-caption text-grey-7">
            Já tenho uma conta?
            <router-link to="/login" class="text-primary text-weight-bold text-decoration-none">
              Login
            </router-link>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { http, setAuthToken } from 'src/boot/apiFetch'
import { useAuthStore } from 'src/stores/auth-store'

const router = useRouter()
const authStore = useAuthStore()

const formRef = ref(null)

const form = ref({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

const handleRegister = async () => {
  errorMessage.value = ''

  const isValid = await formRef.value?.validate()
  if (!isValid) return

  loading.value = true
  try {
    await http.post('/api/usuario', {
      nome: form.value.fullName,
      email: form.value.email,
      senha: form.value.password,
    })

    const login = await http.post('/api/auth/login', {
      email: form.value.email,
      senha: form.value.password,
    })

    if (!login?.token) {
      throw new Error('Conta criada, mas a autenticação automática falhou.')
    }

    setAuthToken(login.token)
    await authStore.fetchMe()
    router.push('/dashboard')
  } catch (err) {
    errorMessage.value = err?.message || 'Erro ao criar conta'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: var(--brand-field);
  padding: 20px;
}

.register-container {
  width: 100%;
  max-width: 440px;
}

.register-card {
  background-color: var(--brand-card);
  border-radius: 12px;
  padding: 40px;
  box-shadow: var(--brand-shadow-soft);
}

a {
  text-decoration: none;
  color: currentColor;
}

a:hover {
  text-decoration: underline;
}

:deep(.q-field__control) {
  color: var(--brand-ink);
}

:deep(.q-field__native) {
  color: var(--brand-placeholder) !important;
}

:deep(.q-placeholder) {
  color: var(--brand-placeholder) !important;
}

:deep(.q-field--outlined .q-field__control:before) {
  border-color: var(--brand-line);
}

:deep(.q-field--outlined.q-field--focused .q-field__control:before) {
  border-color: var(--brand-orange);
}
</style>
