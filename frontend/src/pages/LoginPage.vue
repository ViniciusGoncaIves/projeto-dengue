<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="text-center q-mb-lg">
          <h1 class="text-h5 text-dark q-my-none q-mb-sm">Acesse sua conta</h1>
          <p class="text-subtitle2 text-weight-light text-grey-7">
            Entre para acompanhar suas denúncias ou analisar registros como administrador.
          </p>
        </div>

        <q-banner v-if="infoMessage" class="bg-blue-1 text-blue-9 q-mb-md" rounded>
          {{ infoMessage }}
        </q-banner>
        <q-banner v-if="errorMessage" class="bg-red-1 text-red-9 q-mb-md" rounded>
          {{ errorMessage }}
        </q-banner>

        <q-form ref="formRef" @submit.prevent="handleLogin" class="q-gutter-md">
          <div>
            <label class="text-caption text-weight-medium text-dark">E-mail</label>
            <q-input
              v-model="form.email"
              outlined
              dense
              type="email"
              placeholder="seu@email.com"
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
              placeholder="••••••••"
              prefix-icon="lock"
              :suffix-icon="showPassword ? 'visibility_off' : 'visibility'"
              class="q-mt-xs"
              @click:append="showPassword = !showPassword"
              :rules="[(val) => !!val || 'Senha é obrigatória']"
            />
          </div>

          <q-btn
            type="submit"
            unelevated
            size="lg"
            color="primary"
            label="Login"
            icon-right="arrow_forward"
            class="full-width text-white text-weight-bold q-mt-md"
            :loading="loading"
          />
        </q-form>

        <div class="text-center q-my-lg">
          <span class="text-caption text-grey-7">OU</span>
        </div>

        <div class="text-center">
          <span class="text-caption text-grey-7">
            Ainda não tem uma conta?
            <router-link to="/register" class="text-primary text-weight-bold text-decoration-none">
              Criar conta
            </router-link>
          </span>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { http, setAuthToken } from 'src/boot/apiFetch'
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from 'src/stores/auth-store'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const formRef = ref(null)

const form = ref({
  email: '',
  password: '',
})

const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const infoMessage = ref('')

const handleLogin = async () => {
  errorMessage.value = ''

  const isValid = await formRef.value?.validate()
  if (!isValid) return

  loading.value = true
  try {
    const data = await http.post('/api/auth/login', {
      email: form.value.email,
      senha: form.value.password,
    })

    if (!data?.token) {
      throw new Error('Resposta inválida do servidor')
    }

    setAuthToken(data.token)
    await authStore.fetchMe()
    const redirectTo =
      typeof route.query.redirect === 'string' ? route.query.redirect : '/dashboard'
    router.push(redirectTo)
  } catch (err) {
    errorMessage.value = err?.message || 'Erro ao autenticar'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (route.query.registered === '1') {
    infoMessage.value = 'Conta criada com sucesso. Faça login para continuar.'
    const nextQuery = { ...route.query }
    delete nextQuery.registered
    router.replace({ query: nextQuery })
  }
})
</script>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: var(--brand-field);
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 440px;
}

.login-card {
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

:deep(.q-field__native::placeholder) {
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
