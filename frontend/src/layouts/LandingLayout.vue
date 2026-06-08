<template>
  <q-layout view="hHh lpR fFf" class="landing-layout">
    <q-header class="landing-header">
      <q-toolbar class="landing-toolbar page-shell">
        <div class="landing-brand">
          <div class="brand-icon">
            <q-icon name="health_and_safety" size="20px" />
          </div>
          <div>
            <div class="brand-title">Dengue Combat</div>
            <div class="brand-subtitle">Protecao em tempo real</div>
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
          <q-input
            :class="{ 'is-hidden': !showSearch }"
            v-model="search"
            dense
            rounded
            outlined
            :placeholder="headerConfig.searchPlaceholder"
            class="landing-search"
            :disable="!showSearch"
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>

          <q-btn
            :class="{ 'is-hidden': !showAction }"
            v-bind="actionProps"
            unelevated
            color="primary"
            class="landing-cta"
            :disable="!showAction"
          >
            {{ actionLabel }}
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <div class="landing-content">
        <div class="landing-view">
          <router-view />
        </div>
        <footer class="landing-footer">
          <div class="page-shell footer-grid">
            <div>
              <div class="footer-brand">Dengue Combat</div>
              <p>
                Portal publico para monitoramento e resposta a focos de dengue com dados
                atualizados.
              </p>
            </div>
            <div>
              <div class="footer-title">Recursos</div>
              <ul>
                <li>Guia de prevencao</li>
                <li>Mapa de focos</li>
                <li>Central de apoio</li>
                <li>Materiais oficiais</li>
              </ul>
            </div>
            <div>
              <div class="footer-title">Contato</div>
              <ul>
                <li>contato@denguecombat.gov</li>
                <li>0800 123 4567</li>
                <li>Suporte 24h</li>
              </ul>
            </div>
          </div>
          <div class="page-shell footer-bottom">
            <span>(c) 2024 Dengue Combat Initiative</span>
            <span class="footer-links">Politica de privacidade - Termos</span>
          </div>
        </footer>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const search = ref('')

const navItems = [
  { label: 'Inicio', to: '/' },
  { label: 'Prevencao', to: '/prevention' },
  { label: 'Emergencia', to: '/emergency' },
  { label: 'Reportar foco', to: '/report' },
]

const headerConfig = computed(() => {
  return (
    route.meta?.landingHeader || {
      searchPlaceholder: 'Buscar dados...',
      action: { label: 'Reportar foco', to: '/report' },
    }
  )
})

const showSearch = computed(() => !!headerConfig.value.searchPlaceholder)
const showAction = computed(() => !!headerConfig.value.action)

const actionProps = computed(() => {
  const action = headerConfig.value.action
  if (!action) return {}
  if (action.href) {
    return { href: action.href, target: '_blank', rel: 'noopener' }
  }
  return { to: action.to }
})

const actionLabel = computed(() => headerConfig.value.action?.label || '')
</script>

<style scoped>
.landing-layout {
  background: var(--brand-muted);
}

.landing-header {
  background: #fff7f2;
  border-bottom: 1px solid var(--brand-line);
  color: var(--brand-ink);
}

.landing-toolbar {
  min-height: 72px;
  gap: 18px;
  display: grid;
  grid-template-columns: minmax(220px, 1fr) auto minmax(260px, 1fr);
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
  background: rgba(255, 90, 31, 0.12);
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
  gap: 20px;
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
  min-width: 260px;
}

.landing-search {
  min-width: 220px;
}

.landing-content {
  min-height: calc(100vh - 72px);
  display: flex;
  flex-direction: column;
}

.landing-view {
  flex: 1 1 auto;
}

.is-hidden {
  visibility: hidden;
  pointer-events: none;
}

.landing-cta {
  border-radius: 999px;
  padding: 10px 18px;
  text-transform: none;
  font-weight: 700;
}

.landing-footer {
  background: #111827;
  color: #e2e8f0;
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
  color: #cbd5f5;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #94a3b8;
  border-top: 1px solid rgba(148, 163, 184, 0.2);
  padding-top: 16px;
}

.footer-links {
  display: inline-flex;
  gap: 12px;
}

@media (max-width: 900px) {
  .landing-toolbar {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .landing-nav {
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
