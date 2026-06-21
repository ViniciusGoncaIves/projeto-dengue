<template>
  <q-page class="prevention-page">
    <section class="page-shell hero">
      <div class="hero-content">
        <div class="hero-chip">Alerta publico</div>
        <h1 class="hero-title">Proteja sua casa, derrote a dengue</h1>
        <p class="hero-subtitle">
          A prevenção e a melhor estrategia para reduzir focos de mosquito e proteger sua família.
        </p>
        <div class="hero-actions">
          <q-btn color="primary" unelevated class="hero-btn" to="/report">Agir agora</q-btn>
          <q-btn outline class="hero-btn-secondary" to="/emergency">Ver riscos</q-btn>
        </div>
      </div>
      <div class="hero-image"></div>
    </section>

    <section class="page-shell steps">
      <div class="steps-header">
        <h2 class="section-title">6 passos essenciais para prevenção</h2>
        <p>Eliminar água parada interrompe o ciclo do mosquito e protege bairros inteiros.</p>
      </div>
      <div class="steps-grid">
        <div v-for="item in steps" :key="item.title" class="step-card">
          <div class="step-icon">
            <q-icon :name="item.icon" size="20px" />
          </div>
          <h3>{{ item.title }}</h3>
          <p>{{ item.text }}</p>
        </div>
      </div>
    </section>

    <section class="page-shell protection">
      <div class="protection-card">
        <div class="protection-info">
          <h2 class="section-title">Guia de proteção pessoal</h2>
          <p>
            Além da prevenção em casa, proteger a pele e evitar horários de risco ajuda a reduzir a
            exposicao.
          </p>
          <ul>
            <li v-for="item in protection" :key="item.title">
              <span class="bullet"></span>
              <div>
                <strong>{{ item.title }}</strong>
                <p>{{ item.text }}</p>
              </div>
            </li>
          </ul>
        </div>
        <div class="protection-image">
          <div class="protection-tag">Protocolos recomendados</div>
        </div>
      </div>
    </section>

    <section class="page-shell cta">
      <div class="cta-card">
        <h2 class="section-title">Pare a dengue em conjunto</h2>
        <p>Reporte possíveis focos para ação rápida das equipes de saude.</p>
        <q-btn unelevated color="white" text-color="primary" to="/report">Reportar foco</q-btn>
      </div>
    </section>
  </q-page>
</template>

<script setup>
const steps = [
  {
    title: 'Limpar calhas',
    text: 'Remova folhas e evite acumulação de água em telhados.',
    icon: 'home',
  },
  {
    title: 'Cobrir reservatorios',
    text: "Mantenha caixas d'água e tambores bem fechados.",
    icon: 'water_drop',
  },
  {
    title: 'Esvaziar vasos',
    text: 'Descarte a água de pratos de plantas e recipientes.',
    icon: 'spa',
  },
  {
    title: 'Descartar entulho',
    text: 'Elimine pneus e objetos que possam acumular chuva.',
    icon: 'delete',
  },
  {
    title: 'Tratar piscinas',
    text: 'Use cloro e mantenha a filtragem mesmo fora de uso.',
    icon: 'pool',
  },
  {
    title: 'Proteger animais',
    text: 'Troque diariamente a água de bebedouros.',
    icon: 'pets',
  },
]

const protection = [
  {
    title: 'Repelente eficaz',
    text: 'Aplique nas áreas expostas, especialmente ao amanhecer e entardecer.',
  },
  {
    title: 'Horarios de risco',
    text: 'Evite exposicao prolongada em locais com alta incidencia.',
  },
  {
    title: 'Roupas protetoras',
    text: 'Prefira mangas longas e tecidos leves para barreira fisica.',
  },
]
</script>

<style scoped>
.prevention-page {
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
  background: var(--brand-orange-alpha-15);
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
  background: linear-gradient(135deg, var(--brand-orange-alpha-12), var(--brand-dark-alpha-10));
}

.steps {
  margin-top: 48px;
}

.steps-header {
  text-align: center;
  margin-bottom: 28px;
}

.steps-header p {
  color: var(--brand-ink-soft);
}

.steps-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.step-card {
  background: var(--brand-card);
  border-radius: 18px;
  padding: 18px;
  box-shadow: var(--brand-shadow);
}

.step-icon {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: var(--brand-success-alpha-12);
  color: var(--brand-green);
  display: grid;
  place-items: center;
  margin-bottom: 12px;
}

.step-card p {
  color: var(--brand-ink-soft);
  font-size: 13px;
}

.protection {
  margin-top: 48px;
}

.protection-card {
  background: var(--brand-protection-bg);
  border-radius: 26px;
  padding: 28px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
}

.protection-info p {
  color: var(--brand-ink-soft);
}

.protection-info ul {
  list-style: none;
  padding: 0;
  margin: 18px 0 0;
  display: grid;
  gap: 14px;
}

.protection-info li {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.bullet {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--brand-sky);
  margin-top: 6px;
}

.protection-image {
  border-radius: 24px;
  background: linear-gradient(135deg, var(--brand-warm-start), var(--brand-warm-end));
  position: relative;
}

.protection-tag {
  position: absolute;
  bottom: 18px;
  left: 18px;
  background: var(--brand-card);
  padding: 6px 12px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 12px;
}

.cta {
  margin-top: 48px;
}

.cta-card {
  background: var(--brand-orange);
  color: var(--brand-card);
  border-radius: 26px;
  padding: 32px;
  text-align: center;
  display: grid;
  gap: 12px;
}

@media (max-width: 900px) {
  .protection-card {
    padding: 22px;
  }
}
</style>
