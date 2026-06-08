<template>
  <q-page class="dashboard-page">
    <div class="page-shell dashboard-header">
      <div>
        <h1 class="dashboard-title">Gestao de denuncias</h1>
        <p class="dashboard-subtitle">
          Analise e valide os focos de dengue reportados em tempo real.
        </p>
      </div>
      <q-btn color="primary" unelevated class="export-btn" @click="exportarDados">
        Exportar dados
      </q-btn>
    </div>

    <div class="page-shell filter-row">
      <q-btn
        v-for="chip in filtros"
        :key="chip.value"
        unelevated
        class="filter-chip"
        :class="{ active: filtroAtivo === chip.value }"
        @click="aplicarFiltro(chip.value)"
      >
        <q-icon :name="chip.icon" size="18px" />
        {{ chip.label }}
      </q-btn>
    </div>

    <div class="page-shell table-wrap">
      <div class="table-head">
        <span>Data</span>
        <span>Localizacao</span>
        <span>Tipo de foco</span>
        <span>Foto</span>
        <span>Acoes</span>
      </div>
      <div v-if="loading" class="table-empty">Carregando denuncias...</div>
      <div v-else-if="denunciasFiltradas.length === 0" class="table-empty">
        Nenhuma denuncia encontrada.
      </div>
      <div v-else class="table-body">
        <div v-for="denuncia in denunciasFiltradas" :key="denuncia.iddenuncia" class="table-row">
          <div class="cell">
            <div class="date-main">{{ formatDate(denuncia.data_criacao) }}</div>
            <div class="date-sub">{{ formatTime(denuncia.data_criacao) }}</div>
          </div>
          <div class="cell location">
            <q-icon name="place" color="primary" size="16px" />
            <span>{{ formatLocalizacao(denuncia) }}</span>
          </div>
          <div class="cell">
            <q-badge class="type-badge" color="orange-2" text-color="deep-orange-8">
              {{ getTipo(denuncia) || 'Nao informado' }}
            </q-badge>
          </div>
          <div class="cell">
            <div v-if="denuncia.foto" class="photo-pill">
              <img :src="denuncia.foto" alt="Foco" />
            </div>
            <span v-else class="text-caption text-grey-6">Sem foto</span>
          </div>
          <div class="cell actions">
            <q-btn
              color="positive"
              unelevated
              size="sm"
              @click="aprovar(denuncia)"
              :disable="denuncia.status === 'APROVADA'"
            >
              Aprovar
            </q-btn>
            <q-btn
              color="grey-2"
              text-color="grey-9"
              unelevated
              size="sm"
              @click="abrirRejeicao(denuncia)"
              :disable="denuncia.status === 'REJEITADA'"
            >
              Rejeitar
            </q-btn>
          </div>
        </div>
      </div>
    </div>

    <div class="page-shell stats-row">
      <div class="stat-card">
        <div class="stat-title">Pendentes hoje</div>
        <div class="stat-number">{{ statsValue('pendentes_hoje') }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">Validadas</div>
        <div class="stat-number">{{ statsValue('aprovadas') }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">Urgencia critica</div>
        <div class="stat-number">{{ urgenciaCritica }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">Tempo medio</div>
        <div class="stat-number">{{ tempoMedio }}</div>
      </div>
    </div>

    <q-dialog v-model="rejeicaoDialog">
      <q-card style="min-width: 360px">
        <q-card-section>
          <div class="text-h6">Motivo da rejeicao</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model="motivoRejeicao" type="textarea" outlined />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="negative" unelevated label="Confirmar" @click="confirmarRejeicao" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useDenuncias } from 'src/composables/useDenuncias'
import { formatLocalizacao, parseDescricaoDenuncia } from 'src/helpers/denuncia'

const { denuncias, stats, loading, fetchDenuncias, fetchStats, updateStatus } = useDenuncias()

const filtroAtivo = ref('pendentes')
const rejeicaoDialog = ref(false)
const motivoRejeicao = ref('')
const denunciaSelecionada = ref(null)
const localizacaoUsuario = ref(null)

const filtros = [
  { label: 'Pendentes', value: 'pendentes', icon: 'pending_actions' },
  { label: 'Urgencia alta', value: 'urgencia', icon: 'priority_high' },
  { label: 'Mais recentes', value: 'recentes', icon: 'schedule' },
  { label: 'Por proximidade', value: 'proximidade', icon: 'near_me' },
]

onMounted(() => {
  fetchDenuncias()
  fetchStats()
})

const aplicarFiltro = (valor) => {
  filtroAtivo.value = valor
  if (valor === 'proximidade' && !localizacaoUsuario.value) {
    navigator.geolocation?.getCurrentPosition((pos) => {
      localizacaoUsuario.value = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      }
    })
  }
}

const getTipo = (denuncia) => parseDescricaoDenuncia(denuncia?.descricao).tipo
const getUrgencia = (denuncia) => parseDescricaoDenuncia(denuncia?.descricao).urgencia

const denunciasFiltradas = computed(() => {
  let lista = [...(denuncias.value || [])]

  if (filtroAtivo.value === 'pendentes') {
    lista = lista.filter((item) => item.status === 'PENDENTE')
  }

  if (filtroAtivo.value === 'urgencia') {
    lista = lista.filter((item) => getUrgencia(item) === 'Alta')
  }

  if (filtroAtivo.value === 'proximidade' && localizacaoUsuario.value) {
    lista = lista
      .map((item) => ({
        ...item,
        distancia: calcularDistancia(localizacaoUsuario.value, item),
      }))
      .sort((a, b) => (a.distancia || 0) - (b.distancia || 0))
  }

  return lista
})

const aprovar = async (denuncia) => {
  await updateStatus(denuncia.iddenuncia, 'APROVADA')
  fetchDenuncias()
  fetchStats()
}

const abrirRejeicao = (denuncia) => {
  denunciaSelecionada.value = denuncia
  motivoRejeicao.value = ''
  rejeicaoDialog.value = true
}

const confirmarRejeicao = async () => {
  if (!denunciaSelecionada.value) return
  await updateStatus(denunciaSelecionada.value.iddenuncia, 'REJEITADA', motivoRejeicao.value)
  rejeicaoDialog.value = false
  fetchDenuncias()
  fetchStats()
}

const formatDate = (date) =>
  new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })

const formatTime = (date) =>
  new Date(date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

const calcularDistancia = (origem, destino) => {
  if (destino.latitude == null || destino.longitude == null) return null
  const toRad = (value) => (value * Math.PI) / 180
  const R = 6371
  const dLat = toRad(destino.latitude - origem.latitude)
  const dLon = toRad(destino.longitude - origem.longitude)
  const lat1 = toRad(origem.latitude)
  const lat2 = toRad(destino.latitude)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

const statsValue = (key) => stats.value?.[key] ?? 0

const urgenciaCritica = computed(() => {
  return denuncias.value?.filter((item) => getUrgencia(item) === 'Alta').length || 0
})

const tempoMedio = computed(() => {
  const valor = stats.value?.tempo_medio_horas
  if (!valor) return '0h'
  return `${valor}h`
})

const exportarDados = () => {
  if (!denunciasFiltradas.value.length) return

  const header = ['Data', 'Localizacao', 'Tipo', 'Status']
  const linhas = denunciasFiltradas.value.map((item) => [
    formatDate(item.data_criacao),
    formatLocalizacao(item),
    getTipo(item),
    item.status,
  ])

  const csv = [header, ...linhas].map((row) => row.join(';')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'denuncias.csv'
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.dashboard-page {
  padding: 32px 0 80px;
  background: var(--brand-muted);
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  margin-bottom: 24px;
}

.dashboard-title {
  font-size: clamp(28px, 3vw, 36px);
  font-weight: 700;
}

.dashboard-subtitle {
  color: var(--brand-ink-soft);
}

.export-btn {
  border-radius: 999px;
  padding: 10px 20px;
  font-weight: 700;
}

.filter-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}

.filter-chip {
  border-radius: 999px;
  background: #fff;
  color: var(--brand-ink-soft);
  padding: 10px 18px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
}

.filter-chip.active {
  background: var(--brand-orange);
  color: #fff;
}

.table-wrap {
  background: #fff;
  border-radius: 26px;
  box-shadow: var(--brand-shadow);
  padding: 18px;
}

.table-head,
.table-row {
  display: grid;
  grid-template-columns: 160px 1.5fr 160px 120px 180px;
  gap: 12px;
  align-items: center;
}

.table-head {
  text-transform: uppercase;
  font-size: 12px;
  color: var(--brand-ink-soft);
  padding-bottom: 12px;
  border-bottom: 1px solid var(--brand-line);
}

.table-body {
  display: grid;
  gap: 12px;
  margin-top: 12px;
}

.table-row {
  background: #fff7f2;
  border-radius: 18px;
  padding: 12px;
}

.cell.location {
  display: flex;
  gap: 8px;
  align-items: center;
}

.date-main {
  font-weight: 700;
}

.date-sub {
  color: var(--brand-ink-soft);
  font-size: 12px;
}

.type-badge {
  border-radius: 999px;
  padding: 6px 10px;
  font-weight: 600;
}

.photo-pill {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  overflow: hidden;
  background: #e2e8f0;
  display: grid;
  place-items: center;
}

.photo-pill img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.actions {
  display: flex;
  gap: 8px;
}

.table-empty {
  padding: 24px;
  text-align: center;
  color: var(--brand-ink-soft);
}

.stats-row {
  margin-top: 24px;
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.stat-card {
  background: #fff;
  border-radius: 18px;
  padding: 16px;
  box-shadow: var(--brand-shadow);
}

.stat-title {
  color: var(--brand-ink-soft);
  font-size: 12px;
  font-weight: 600;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  margin-top: 6px;
}

@media (max-width: 900px) {
  .table-head,
  .table-row {
    grid-template-columns: 1fr;
  }

  .actions {
    justify-content: flex-start;
  }
}
</style>
