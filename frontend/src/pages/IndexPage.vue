<template>
  <q-page class="landing-page">
    <section class="hero page-shell">
      <div class="hero-content">
        <div class="hero-chip">Alerta de saúde pública</div>
        <h1 class="hero-title">Juntos contra a dengue</h1>
        <p class="hero-subtitle">
          Dados em tempo real, reportes de focos e orientações para proteger sua comunidade.
        </p>
        <div class="hero-actions">
          <q-btn color="primary" unelevated class="hero-btn" to="/report">Quero ajudar</q-btn>
          <q-btn flat class="hero-btn-secondary" to="/prevention">Ver prevenção</q-btn>
        </div>
      </div>
      <div class="hero-visual">
        <div class="hero-overlay">
          <div class="hero-pill">Alerta</div>
          <p>Monitoramento ativo de focos urbanos</p>
        </div>
      </div>
    </section>

    <section class="stats-section page-shell">
      <div class="stats-grid">
        <div class="stat-card" v-for="card in statCards" :key="card.label">
          <div class="stat-label">{{ card.label }}</div>
          <div class="stat-value">{{ card.value }}</div>
          <div class="stat-foot">{{ card.foot }}</div>
        </div>
      </div>
    </section>

    <section class="outbreak-section page-shell">
      <div class="outbreak-main">
        <div class="section-header">
          <h2 class="section-title">Alertas ativos</h2>
          <q-btn flat color="primary" to="/report">Ver mapa</q-btn>
        </div>
        <div class="outbreak-map">
          <div class="map-legend">Mapa de calor dinâmico</div>
          <div class="map-card">
            <div class="map-label">Hotspot atual</div>
            <div class="map-title">{{ hotspotTitle }}</div>
            <div class="map-desc">{{ hotspotDesc }}</div>
            <q-btn size="sm" color="primary" unelevated to="/report">Detalhes</q-btn>
          </div>
        </div>
      </div>
      <div class="outbreak-side">
        <div class="hotline-card">
          <div class="hotline-icon">
            <q-icon name="local_hospital" size="22px" />
          </div>
          <h3>Central de emergência</h3>
          <p>Atendimento imediato para sintomas graves.</p>
          <div class="hotline-number">0800 123 4567</div>
        </div>

        <div class="checklist-card">
          <h3>Checklist de prevenção</h3>
          <ul>
            <li>Eliminar água parada</li>
            <li>Usar repelente aprovado</li>
            <li>Instalar telas protetoras</li>
            <li>Manter calhas limpas</li>
          </ul>
        </div>

        <div class="education-card">
          <h3>Hub educativo</h3>
          <p>Materiais oficiais para orientar a sua comunidade.</p>
          <q-btn outline color="primary" to="/prevention">Explorar recursos</q-btn>
        </div>
      </div>
    </section>
  </q-page>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useDenuncias } from 'src/composables/useDenuncias'
import { formatLocalizacao, parseDescricaoDenuncia } from 'src/helpers/denuncia'

const { stats, denuncias, fetchPublicStats, fetchPublicDenuncias } = useDenuncias()

onMounted(() => {
  fetchPublicStats()
  fetchPublicDenuncias({ limit: 1 })
})

const statCards = computed(() => {
  const total = stats.value ? Number(stats.value.total) : null
  const pendentes = stats.value ? Number(stats.value.pendentes) : null
  const aprovadas = stats.value ? Number(stats.value.aprovadas) : 0
  const rejeitadas = stats.value ? Number(stats.value.rejeitadas) : 0
  const resolvidas = aprovadas + rejeitadas
  const taxaResolucao =
    total != null ? `${Math.round((resolvidas / Math.max(total, 1)) * 100)}%` : '-'
  const ultimos30 = stats.value ? Number(stats.value.ultimos_30_dias) : null

  return [
    { label: 'Total de denúncias', value: total ?? '-', foot: 'desde o início' },
    { label: 'Pendentes', value: pendentes ?? '-', foot: 'aguardando análise' },
    { label: 'Últimos 30 dias', value: ultimos30 ?? '-', foot: 'novos registros' },
    { label: 'Taxa de resolução', value: taxaResolucao, foot: 'aprovadas + rejeitadas' },
  ]
})

const hotspotTitle = computed(() => {
  const item = denuncias.value?.[0]
  const parsed = parseDescricaoDenuncia(item?.descricao)
  return parsed.tipo || formatLocalizacao(item)
})

const hotspotDesc = computed(() => {
  const item = denuncias.value?.[0]
  if (!item) return 'Nenhum foco registrado no momento.'
  const parsed = parseDescricaoDenuncia(item?.descricao)
  return parsed.detalhes || 'Monitoramento ativo para resposta rápida.'
})
</script>

<style scoped>
.landing-page {
  padding: 40px 0 80px;
  background: var(--brand-muted);
}

.hero {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 32px;
  align-items: center;
}

.hero-content {
  display: grid;
  gap: 16px;
}

.hero-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 999px;
  background: var(--brand-orange-alpha-15);
  color: var(--brand-orange);
  font-weight: 600;
  width: fit-content;
}

.hero-title {
  font-size: clamp(32px, 4vw, 46px);
  font-weight: 700;
}

.hero-subtitle {
  color: var(--brand-ink-soft);
  font-size: 16px;
}

.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.hero-btn {
  border-radius: 999px;
  padding: 12px 22px;
  font-weight: 700;
}

.hero-btn-secondary {
  border-radius: 999px;
  font-weight: 600;
}

.hero-visual {
  background:
    radial-gradient(circle at top, var(--brand-orange-alpha-20), transparent 55%),
    linear-gradient(120deg, var(--brand-hero-dark-start), var(--brand-hero-dark-end));
  border-radius: 28px;
  min-height: 280px;
  position: relative;
  overflow: hidden;
}

.hero-overlay {
  position: absolute;
  bottom: 24px;
  left: 24px;
  right: 24px;
  padding: 16px 18px;
  border-radius: 18px;
  background: var(--brand-white-alpha-08);
  color: var(--brand-card);
  backdrop-filter: blur(12px);
}

.hero-pill {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--brand-orange-alpha-70);
  font-size: 12px;
  font-weight: 600;
}

.stats-section {
  margin-top: 32px;
}

.stats-grid {
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
}

.stat-card {
  background: var(--brand-card);
  border-radius: 18px;
  padding: 18px;
  box-shadow: var(--brand-shadow);
}

.stat-label {
  color: var(--brand-ink-soft);
  font-weight: 600;
  font-size: 13px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  margin: 6px 0 4px;
}

.stat-foot {
  font-size: 12px;
  color: var(--brand-ink-muted);
}

.outbreak-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-top: 40px;
}

.outbreak-main {
  display: grid;
  gap: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.outbreak-map {
  background: linear-gradient(120deg, var(--brand-card), var(--brand-map-warm));
  border-radius: 24px;
  padding: 22px;
  min-height: 260px;
  position: relative;
  overflow: hidden;
}

.map-legend {
  font-size: 12px;
  color: var(--brand-map-text);
  background: var(--brand-orange-alpha-12);
  width: fit-content;
  padding: 4px 10px;
  border-radius: 999px;
}

.map-card {
  position: absolute;
  bottom: 24px;
  left: 24px;
  right: 24px;
  background: var(--brand-card);
  border-radius: 16px;
  padding: 14px 16px;
  box-shadow: var(--brand-shadow);
  display: grid;
  gap: 6px;
}

.map-label {
  font-size: 12px;
  color: var(--brand-map-label);
  font-weight: 600;
}

.map-title {
  font-weight: 700;
}

.map-desc {
  font-size: 13px;
  color: var(--brand-ink-soft);
}

.outbreak-side {
  display: grid;
  gap: 18px;
}

.hotline-card,
.checklist-card,
.education-card {
  background: var(--brand-card);
  border-radius: 20px;
  padding: 18px;
  box-shadow: var(--brand-shadow);
}

.hotline-card {
  background: var(--brand-orange);
  color: var(--brand-card);
}

.hotline-icon {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: var(--brand-white-alpha-20);
  display: grid;
  place-items: center;
  margin-bottom: 10px;
}

.hotline-number {
  font-size: 20px;
  font-weight: 700;
  margin-top: 8px;
}

.checklist-card ul {
  list-style: none;
  padding: 0;
  margin: 10px 0 0;
  display: grid;
  gap: 8px;
  color: var(--brand-ink-soft);
}

.education-card p {
  color: var(--brand-ink-soft);
}

@media (max-width: 1024px) {
  .outbreak-section {
    grid-template-columns: 1fr;
  }
}
</style>
