<template>
  <q-page class="emergency-page">
    <section class="page-shell hero">
      <div class="hero-content">
        <div class="hero-chip">Atendimento urgente</div>
        <h1 class="hero-title">Emergencia medica e busca de hospitais</h1>
        <p class="hero-subtitle">
          Em casos graves como vomito persistente ou sangramentos, procure atendimento imediato.
        </p>
        <div class="hero-actions">
          <q-btn color="primary" unelevated class="hero-btn">Encontrar hospital</q-btn>
          <q-btn outline class="hero-btn-secondary" href="tel:192">Ligar 192</q-btn>
        </div>
      </div>
      <div class="hero-image"></div>
    </section>

    <section class="page-shell hotlines">
      <h2 class="section-title">Telefones de emergencia</h2>
      <div class="hotline-grid">
        <div v-for="hotline in hotlines" :key="hotline.title" class="hotline-card">
          <div class="hotline-icon">
            <q-icon :name="hotline.icon" size="20px" />
          </div>
          <div>
            <div class="hotline-title">{{ hotline.title }}</div>
            <div class="hotline-desc">{{ hotline.desc }}</div>
          </div>
          <div class="hotline-number">{{ hotline.number }}</div>
        </div>
      </div>
    </section>

    <section class="page-shell centers">
      <div class="centers-grid">
        <div class="center-list">
          <div class="center-header">
            <h2 class="section-title">Centros proximos</h2>
            <q-btn flat color="primary">Filtrar</q-btn>
          </div>
          <div class="center-empty">
            <q-icon name="location_off" size="28px" />
            <p>Nenhum centro cadastrado no momento.</p>
          </div>
        </div>
        <div class="center-map">
          <h3>Mapa em tempo real</h3>
          <div class="map-placeholder">
            <p>Ative a geolocalizacao para visualizar unidades proximas.</p>
          </div>
          <div class="map-tips">
            <h4>O que fazer enquanto espera</h4>
            <ol>
              <li>Mantenha-se hidratado.</li>
              <li>Evite anti-inflamatorios sem orientacao.</li>
              <li>Monitore temperatura e sinais de alerta.</li>
              <li>Procure ajuda se os sintomas piorarem.</li>
            </ol>
          </div>
        </div>
      </div>
    </section>

    <section class="page-shell warning">
      <div class="warning-card">
        <h2>Alertas graves</h2>
        <p>Se apresentar algum desses sintomas, busque atendimento imediato.</p>
        <div class="warning-items">
          <div v-for="item in warnings" :key="item" class="warning-item">
            <q-icon name="warning" size="20px" />
            <span>{{ item }}</span>
          </div>
        </div>
      </div>
    </section>
  </q-page>
</template>

<script setup>
const hotlines = [
  {
    title: 'SAMU',
    desc: 'Atendimento pre-hospitalar imediato.',
    number: '192',
    icon: 'medical_services',
  },
  {
    title: 'Disque Saude',
    desc: 'Informacoes e orientacoes oficiais.',
    number: '136',
    icon: 'support_agent',
  },
  {
    title: 'Suporte Dengue',
    desc: 'Canal especializado para pacientes.',
    number: '0800-DENGUE',
    icon: 'health_and_safety',
  },
]

const warnings = [
  'Dor abdominal intensa',
  'Vomito persistente',
  'Sangramento mucoso',
  'Tontura extrema',
]
</script>

<style scoped>
.emergency-page {
  padding: 48px 0 80px;
  background: var(--brand-muted);
}

.hero {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 32px;
  align-items: center;
}

.hero-chip {
  display: inline-flex;
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(255, 90, 31, 0.15);
  color: var(--brand-orange);
  font-weight: 600;
}

.hero-title {
  font-size: clamp(30px, 4vw, 42px);
  font-weight: 700;
}

.hero-subtitle {
  color: var(--brand-ink-soft);
}

.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.hero-btn,
.hero-btn-secondary {
  border-radius: 999px;
  padding: 12px 22px;
}

.hero-image {
  min-height: 260px;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.15), rgba(255, 90, 31, 0.2));
}

.hotlines {
  margin-top: 42px;
}

.hotline-grid {
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  margin-top: 18px;
}

.hotline-card {
  background: #fff;
  border-radius: 20px;
  padding: 18px;
  display: grid;
  gap: 12px;
  box-shadow: var(--brand-shadow);
}

.hotline-icon {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: rgba(255, 90, 31, 0.15);
  color: var(--brand-orange);
  display: grid;
  place-items: center;
}

.hotline-title {
  font-weight: 700;
}

.hotline-desc {
  color: var(--brand-ink-soft);
  font-size: 13px;
}

.hotline-number {
  font-size: 20px;
  font-weight: 700;
}

.centers {
  margin-top: 48px;
}

.centers-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 24px;
}

.center-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.center-list,
.center-map {
  background: #fff;
  border-radius: 22px;
  padding: 20px;
  box-shadow: var(--brand-shadow);
}

.center-empty {
  display: grid;
  place-items: center;
  gap: 8px;
  color: var(--brand-ink-soft);
  min-height: 180px;
}

.map-placeholder {
  border-radius: 18px;
  background: linear-gradient(135deg, #dbeafe, #e0f2fe);
  padding: 18px;
  min-height: 180px;
  display: grid;
  place-items: center;
  color: #1e3a8a;
  margin-top: 12px;
}

.map-tips {
  margin-top: 18px;
  background: #fff7ed;
  border-radius: 16px;
  padding: 16px;
}

.map-tips ol {
  margin: 8px 0 0 18px;
  color: var(--brand-ink-soft);
}

.warning {
  margin-top: 48px;
}

.warning-card {
  background: #0f172a;
  color: #e2e8f0;
  border-radius: 26px;
  padding: 28px;
  display: grid;
  gap: 12px;
}

.warning-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.warning-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(148, 163, 184, 0.15);
  border-radius: 16px;
  padding: 12px;
}

@media (max-width: 1024px) {
  .centers-grid {
    grid-template-columns: 1fr;
  }
}
</style>
