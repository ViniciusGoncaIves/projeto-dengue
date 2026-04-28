<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="text-center q-mb-lg">
          <h1 class="text-h5 text-dark q-my-none q-mb-sm">Acesse sua conta</h1>
          <p class="text-subtitle2 text-weight-light text-grey-7">
            Entre com suas credenciais para gerenciar notificações e focos.
          </p>
        </div>

        <q-form @submit.prevent="handleLogin" class="q-gutter-md">
          <!-- Email Input -->
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

          <!-- Password Input -->
          <div>
            <div class="row justify-between items-center q-mb-xs">
              <label class="text-caption text-weight-medium text-dark">Senha</label>
              <a href="#" class="text-caption text-primary text-weight-medium"
                >Esqueci minha senha</a
              >
            </div>
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

          <!-- Submit Button -->
          <q-btn
            type="submit"
            unelevated
            size="lg"
            color="primary"
            label="Entrar"
            icon-right="arrow_forward"
            class="full-width text-white text-weight-bold q-mt-md"
          />
        </q-form>

        <!-- Divider -->
        <div class="text-center q-my-lg">
          <span class="text-caption text-grey-7">OU</span>
        </div>

        <!-- Register Link -->
        <div class="text-center">
          <span class="text-caption text-grey-7">
            Ainda não tem uma conta?
            <router-link to="/register" class="text-primary text-weight-bold text-decoration-none">
              Criar conta
            </router-link>
          </span>
        </div>
      </div>

      <!-- Footer Links -->
      <div class="footer-links text-center q-mt-lg">
        <a href="#" class="text-caption text-grey-6">Termos de Uso</a>
        <span class="text-grey-6">·</span>
        <a href="#" class="text-caption text-grey-6">Privacidade</a>
        <span class="text-grey-6">·</span>
        <a href="#" class="text-caption text-grey-6">Suporte</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = ref({
  email: '',
  password: '',
})

const showPassword = ref(false)

const handleLogin = async () => {
  // TODO: Implementar a funcionalidade de login
  console.log('Dados de login:', {
    email: form.value.email,
    password: form.value.password,
  })
  // TODO: Fazer chamada à API para autenticar usuário
  // TODO: Armazenar token JWT
  // TODO: Redirecionar para o dashboard
}
</script>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 440px;
}

.login-card {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.footer-links {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

a {
  text-decoration: none;
  color: currentColor;
}

a:hover {
  text-decoration: underline;
}

:deep(.q-field__control) {
  color: #333333;
}

:deep(.q-field__native) {
  color: #999999 !important;
}

:deep(.q-field__native::placeholder) {
  color: #999999 !important;
}

:deep(.q-placeholder) {
  color: #999999 !important;
}

:deep(.q-field--outlined .q-field__control:before) {
  border-color: #e0e0e0;
}

:deep(.q-field--outlined.q-field--focused .q-field__control:before) {
  border-color: #ff5722;
}
</style>
