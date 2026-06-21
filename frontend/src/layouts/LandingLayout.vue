<template>
  <q-layout view="hHh lpR fFf" class="landing-layout">
    <q-header class="landing-header">
      <q-toolbar class="landing-toolbar page-shell">
        <div class="landing-brand">
          <div class="brand-icon">
            <q-icon name="health_and_safety" size="20px" />
          </div>
          <div>
            <div class="brand-title">Combate à Dengue</div>
            <div class="brand-subtitle">Registro comunitário de focos</div>
          </div>
        </div>

        <nav class="landing-nav">
          <router-link
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="nav-link"
            :class="{ active: route.path === item.to }"
          >
            {{ item.label }}
          </router-link>
        </nav>

        <div class="landing-actions">
          <q-btn
            v-if="!isAuthenticated"
            v-bind="actionProps"
            unelevated
            color="primary"
            class="landing-cta"
          >
            {{ actionLabel }}
          </q-btn>

          <q-btn v-else flat round>
            <q-avatar size="34px">
              <span>{{ userInitials }}</span>
            </q-avatar>
            <q-menu anchor="bottom right" self="top right">
              <q-list style="min-width: 180px">
                <q-item>
                  <q-item-section>
                    <div class="text-weight-bold">{{ userName || 'Usuário' }}</div>
                    <div class="text-caption text-grey-6">{{ userEmail }}</div>
                  </q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable @click="handleLogout">
                  <q-item-section>Sair</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <div class="landing-content">
        <div class="landing-view">
          <router-view />
        </div>
        <footer v-if="!isAuthenticated" class="landing-footer">
          <div class="page-shell footer-grid">
            <div>
              <div class="footer-brand">Combate à Dengue</div>
              <p>
                Projeto acadêmico para registro e acompanhamento de focos de dengue.
              </p>
            </div>
            <div>
              <div class="footer-title">Fluxo</div>
              <ul>
                <li>Denúncia pública ou identificada</li>
                <li>Painel para usuários cadastrados</li>
                <li>Análise administrativa</li>
              </ul>
            </div>
            <div>
              <div class="footer-title">Status</div>
              <ul>
                <li>Pendente</li>
                <li>Aprovada</li>
                <li>Rejeitada</li>
              </ul>
            </div>
          </div>
          <div class="page-shell footer-bottom">
            <span>Projeto acadêmico</span>
          </div>
        </footer>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getAuthToken } from 'src/boot/apiFetch'
import { useAuthStore } from 'src/stores/auth-store'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

onMounted(() => {
  if (isAuthenticated.value) {
    authStore.fetchMe()
  }
})

const isAuthenticated = computed(() => !!getAuthToken())
const navItems = computed(() =>
  isAuthenticated.value
    ? [
        { label: 'Painel', to: '/dashboard' },
        { label: 'Nova denúncia', to: '/report' },
      ]
    : [
        { label: 'Início', to: '/' },
        { label: 'Registrar denúncia', to: '/report' },
      ],
)

const headerConfig = computed(() => {
  return {
    action: { label: 'Login', to: '/login' },
  }
})

const actionProps = computed(() => {
  const action = headerConfig.value.action || {
    label: 'Login',
    to: '/login',
  }
  return { to: action.to }
})

const actionLabel = computed(() => headerConfig.value.action?.label || '')
const userName = computed(() => authStore.user?.nome || '')
const userEmail = computed(() => authStore.user?.email || '')
const userInitials = computed(() => {
  const name = userName.value.trim()
  if (!name) return 'U'
  const parts = name.split(' ').filter(Boolean)
  return parts
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.landing-layout {
  background: var(--brand-muted);
}

.landing-header {
  background: var(--brand-panel);
  border-bottom: 1px solid var(--brand-line);
  color: var(--brand-ink);
}

.landing-toolbar {
  min-height: 72px;
  gap: 18px;
  display: grid;
  grid-template-columns: minmax(220px, 1fr) auto minmax(220px, 1fr);
  align-items: center;
}

.landing-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-icon {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: var(--brand-orange-alpha-12);
  color: var(--brand-orange);
  display: grid;
  place-items: center;
}

.brand-title {
  font-weight: 700;
  font-size: 16px;
}

.brand-subtitle {
  font-size: 12px;
  color: var(--brand-ink-soft);
}

.landing-nav {
  display: flex;
  gap: 18px;
  font-weight: 600;
  color: var(--brand-ink-soft);
  justify-content: center;
}

.nav-link {
  text-decoration: none;
  color: inherit;
  padding-bottom: 6px;
  border-bottom: 2px solid transparent;
}

.nav-link.active {
  color: var(--brand-orange);
  border-color: var(--brand-orange);
}

.landing-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: flex-end;
}

.landing-content {
  min-height: calc(100vh - 72px);
  display: flex;
  flex-direction: column;
}

.landing-view {
  flex: 1 1 auto;
}

.landing-cta {
  border-radius: 999px;
  padding: 10px 18px;
  text-transform: none;
  font-weight: 700;
}

.landing-footer {
  background: var(--brand-footer);
  color: var(--brand-footer-text);
  padding: 48px 0 28px;
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 28px;
  margin-bottom: 28px;
}

.footer-brand {
  font-weight: 700;
  font-size: 18px;
  margin-bottom: 12px;
}

.footer-title {
  font-weight: 600;
  margin-bottom: 10px;
}

.footer-grid ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 8px;
  color: var(--brand-footer-soft);
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--brand-footer-muted);
  border-top: 1px solid var(--brand-footer-line);
  padding-top: 16px;
}

.footer-links {
  display: inline-flex;
  gap: 12px;
}

@media (max-width: 900px) {
  .landing-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .landing-nav {
    width: 100%;
    flex-wrap: wrap;
    justify-content: center;
  }

  .landing-actions {
    width: 100%;
    justify-content: center;
    min-width: 0;
  }

  .footer-bottom {
    flex-direction: column;
    gap: 6px;
    align-items: center;
  }
}
</style>
