<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-card">
        <div class="text-center q-mb-lg">
          <h1 class="text-h5 text-dark q-my-none q-mb-sm">Crie sua conta</h1>
          <p class="text-subtitle2 text-weight-light text-grey-7">
            Junte-se a nós no combate à Dengue e proteja sua comunidade.
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

          <div class="q-mt-md">
            <q-checkbox
              v-model="form.acceptTerms"
              label-style="font-size: 13px"
              class="text-grey-7"
            >
              <template v-slot:default>
                <span class="text-caption">
                  Eu aceito os
                  <a href="#" class="text-primary text-weight-medium">Termos de Uso</a>
                  e a
                  <a href="#" class="text-primary text-weight-medium">Política de Privacidade</a>
                </span>
              </template>
            </q-checkbox>
          </div>

          <q-btn
            type="submit"
            unelevated
            size="lg"
            color="primary"
            label="Criar Conta"
            class="full-width text-white text-weight-bold"
            :disable="!form.acceptTerms"
            :loading="loading"
          />
        </q-form>

        <div class="text-center q-mt-lg">
          <span class="text-caption text-grey-7">
            Já tenho uma conta?
            <router-link to="/login" class="text-primary text-weight-bold text-decoration-none">
              Entrar
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
import { http } from 'src/boot/apiFetch'

const router = useRouter()

const formRef = ref(null)

const form = ref({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

const handleRegister = async () => {
  errorMessage.value = ''

  const isValid = await formRef.value?.validate()
  if (!isValid) return
  if (!form.value.acceptTerms) return

  loading.value = true
  try {
    await http.post('/api/usuario', {
      nome: form.value.fullName,
      email: form.value.email,
      senha: form.value.password,
    })

    router.push({ path: '/login', query: { registered: '1' } })
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
  background-color: #f5f5f5;
  padding: 20px;
}

.register-container {
  width: 100%;
  max-width: 440px;
}

.register-card {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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

:deep(.q-placeholder) {
  color: #999999 !important;
}

:deep(.q-field--outlined .q-field__control:before) {
  border-color: #e0e0e0;
}

:deep(.q-field--outlined.q-field--focused .q-field__control:before) {
  border-color: #ff5722;
}

:deep(.q-checkbox__svg) {
  color: #ff5722;
}
</style>
