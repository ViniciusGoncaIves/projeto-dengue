<template>
  <q-layout view="hHh lpR fFf" class="auth-layout">
    <q-header class="auth-header">
      <q-toolbar class="auth-toolbar page-shell">
        <div class="auth-brand">
          <div class="auth-brand-icon">
            <q-icon name="bug_report" size="20px" />
          </div>
          <div>
            <div class="auth-brand-title">Combate à Dengue</div>
            <div class="auth-brand-subtitle">Registro comunitário de focos</div>
          </div>
        </div>

        <nav class="auth-nav">
          <router-link class="auth-link" to="/dashboard" :class="isActive('/dashboard')">
            Painel
          </router-link>
          <router-link class="auth-link" to="/report" :class="isActive('/report')">
            Nova denúncia
          </router-link>
        </nav>

        <div class="auth-actions">
          <q-btn flat round>
            <q-avatar size="34px">
              <img v-if="userAvatar" :src="userAvatar" alt="Usuário" />
              <span v-else>{{ userInitials }}</span>
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
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth-store'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

onMounted(() => {
  authStore.fetchMe()
})

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
const userAvatar = computed(() => authStore.user?.avatar || '')

const isActive = (path) => ({ active: route.path === path })

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.auth-layout {
  background: var(--brand-muted);
}

.auth-header {
  background: var(--brand-panel);
  border-bottom: 1px solid var(--brand-line);
  color: var(--brand-ink);
}

.auth-toolbar {
  min-height: 72px;
  gap: 18px;
  display: grid;
  grid-template-columns: minmax(220px, 1fr) auto minmax(220px, 1fr);
  align-items: center;
}

.auth-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.auth-brand-icon {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: var(--brand-orange-alpha-12);
  color: var(--brand-orange);
  display: grid;
  place-items: center;
}

.auth-brand-title {
  font-weight: 700;
  font-size: 16px;
}

.auth-brand-subtitle {
  font-size: 12px;
  color: var(--brand-ink-soft);
}

.auth-nav {
  display: flex;
  gap: 18px;
  font-weight: 600;
  color: var(--brand-ink-soft);
  justify-content: center;
}

.auth-link {
  text-decoration: none;
  color: inherit;
  padding-bottom: 6px;
  border-bottom: 2px solid transparent;
}

.auth-link.active {
  color: var(--brand-orange);
  border-color: var(--brand-orange);
}

.auth-actions {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 1024px) {
  .auth-toolbar {
    display: flex;
    flex-wrap: wrap;
  }

  .auth-nav {
    width: 100%;
    justify-content: center;
  }

  .auth-actions {
    margin-left: auto;
  }
}
</style>
