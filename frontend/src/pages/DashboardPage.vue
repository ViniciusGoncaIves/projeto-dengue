<template>
  <q-page class="dashboard-page">
    <div class="page-shell page-header">
      <div>
        <h1 class="page-title">{{ pageTitle }}</h1>
        <p class="page-subtitle">{{ pageSubtitle }}</p>
      </div>
      <q-btn
        to="/report"
        color="primary"
        unelevated
        icon="add_location_alt"
        label="Nova denúncia"
      />
    </div>

    <div class="page-shell stats-row">
      <div class="stat-card">
        <div class="stat-title">Total</div>
        <div class="stat-number">{{ statsValue('total') }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">Pendentes</div>
        <div class="stat-number">{{ statsValue('pendentes') }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">Aprovadas</div>
        <div class="stat-number">{{ statsValue('aprovadas') }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">Rejeitadas</div>
        <div class="stat-number">{{ statsValue('rejeitadas') }}</div>
      </div>
    </div>

    <div class="page-shell filter-row">
      <q-btn
        v-for="option in statusOptions"
        :key="option.value"
        unelevated
        class="filter-chip"
        :class="{ active: filtroStatus === option.value }"
        @click="setFiltro(option.value)"
      >
        <q-icon :name="option.icon" size="18px" />
        {{ option.label }}
      </q-btn>
    </div>

    <div class="page-shell table-wrap">
      <div class="table-head" :class="{ admin: isAdmin }">
        <span>Data</span>
        <span>Localização</span>
        <span>Descrição</span>
        <span>Status</span>
        <span>Foto</span>
        <span>Ações</span>
      </div>

      <div v-if="loading" class="table-empty">Carregando denúncias...</div>
      <div v-else-if="error" class="table-empty table-error">{{ error }}</div>
      <div v-else-if="denunciasFiltradas.length === 0" class="table-empty">
        Nenhuma denúncia encontrada.
      </div>

      <div v-else class="table-body">
        <div
          v-for="denuncia in denunciasFiltradas"
          :key="denuncia.iddenuncia"
          class="table-row"
          :class="{ admin: isAdmin }"
        >
          <div class="cell">
            <div class="date-main">{{ formatDate(denuncia.data_criacao) }}</div>
            <div class="date-sub">{{ formatTime(denuncia.data_criacao) }}</div>
          </div>
          <div class="cell location">
            <q-icon name="place" color="primary" size="16px" />
            <span>{{ formatLocalizacao(denuncia) }}</span>
          </div>
          <div class="cell description">
            <div class="description-main">{{ getTipo(denuncia) || 'Tipo não informado' }}</div>
            <div class="description-sub">{{ getDetalhes(denuncia) || denuncia.descricao }}</div>
          </div>
          <div class="cell">
            <q-badge class="status-badge" :class="statusClass(denuncia.status)">
              {{ formatStatus(denuncia.status) }}
            </q-badge>
          </div>
          <div class="cell">
            <a
              v-if="denuncia.foto"
              :href="denuncia.foto"
              target="_blank"
              rel="noopener"
              class="photo-pill"
            >
              <img :src="denuncia.foto" alt="Foco denunciado" />
            </a>
            <span v-else class="empty-photo">Sem imagem</span>
          </div>
          <div class="cell actions">
            <q-btn
              dense
              unelevated
              color="primary"
              icon="visibility"
              @click="abrirDetalhes(denuncia)"
            />
            <q-btn
              v-if="podeEditar(denuncia)"
              dense
              unelevated
              color="secondary"
              icon="edit"
              :to="`/dashboard/denuncias/${denuncia.iddenuncia}/editar`"
            />
            <template v-if="isAdmin && denuncia.status === 'PENDENTE'">
              <q-btn
                dense
                unelevated
                color="positive"
                icon="check"
                @click="prepararAlteracaoStatus(denuncia, 'APROVADO')"
              />
              <q-btn
                dense
                unelevated
                color="negative"
                icon="close"
                @click="abrirRejeicao(denuncia)"
              />
            </template>
          </div>
        </div>
      </div>
    </div>

    <q-dialog v-model="rejeicaoDialog">
      <q-card class="reject-dialog">
        <q-card-section>
          <div class="text-h6">Motivo da rejeição</div>
          <div class="dialog-subtitle">
            O motivo ficará visível para o usuário quando a denúncia for identificada.
          </div>
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="motivoRejeicao"
            type="textarea"
            outlined
            label="Motivo"
            placeholder="Informe o motivo para registro interno"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="negative" unelevated label="Continuar" @click="prepararRejeicao" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="confirmacaoDialog">
      <q-card class="confirm-dialog">
        <q-card-section>
          <div class="text-h6">{{ confirmacaoTitulo }}</div>
          <div class="dialog-subtitle">{{ confirmacaoMensagem }}</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            :color="acaoPendente?.status === 'REJEITADO' ? 'negative' : 'positive'"
            unelevated
            label="Confirmar alteração"
            :loading="alterandoStatus"
            @click="confirmarAlteracaoStatus"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="detalhesDialog" @hide="limparMapaDetalhes">
      <q-card class="details-dialog">
        <q-card-section class="details-header">
          <div>
            <div class="text-h6">Detalhes da denúncia</div>
            <div class="details-subtitle">
              {{ selectedDenuncia ? `#${selectedDenuncia.iddenuncia}` : '' }}
            </div>
          </div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section v-if="selectedDenuncia" class="details-content">
          <div class="details-grid">
            <div class="detail-item">
              <span>Status</span>
              <q-badge class="status-badge" :class="statusClass(selectedDenuncia.status)">
                {{ formatStatus(selectedDenuncia.status) }}
              </q-badge>
            </div>
            <div class="detail-item">
              <span>Data</span>
              <strong
                >{{ formatDate(selectedDenuncia.data_criacao) }}
                {{ formatTime(selectedDenuncia.data_criacao) }}</strong
              >
            </div>
            <div class="detail-item">
              <span>Tipo</span>
              <strong>{{ getTipo(selectedDenuncia) || 'Não informado' }}</strong>
            </div>
            <div class="detail-item">
              <span>Urgência</span>
              <strong>{{ getUrgencia(selectedDenuncia) || 'Não informada' }}</strong>
            </div>
            <div v-if="isAdmin" class="detail-item">
              <span>Identificação</span>
              <strong>{{ selectedDenuncia.anonima ? 'Anônima' : 'Identificada' }}</strong>
            </div>
            <div v-if="isAdmin" class="detail-item">
              <span>Responsável</span>
              <strong>{{ autorDenuncia(selectedDenuncia) }}</strong>
            </div>
            <div class="detail-item detail-wide">
              <span>Localização</span>
              <strong>{{ formatLocalizacao(selectedDenuncia) }}</strong>
            </div>
            <div class="detail-item">
              <span>Latitude</span>
              <strong>{{ selectedDenuncia.latitude }}</strong>
            </div>
            <div class="detail-item">
              <span>Longitude</span>
              <strong>{{ selectedDenuncia.longitude }}</strong>
            </div>
          </div>

          <div class="detail-block">
            <span>Descrição</span>
            <p>
              {{ getDetalhes(selectedDenuncia) || selectedDenuncia.descricao || 'Sem descrição.' }}
            </p>
          </div>

          <div v-if="selectedDenuncia.status === 'REJEITADO'" class="detail-block rejection-block">
            <span>Motivo da rejeição</span>
            <p>{{ selectedDenuncia.motivo_rejeicao || 'Motivo não informado.' }}</p>
          </div>

          <div class="detail-block">
            <span>Mapa</span>
            <div ref="detailsMapEl" class="details-map"></div>
          </div>

          <div class="detail-block">
            <span>Imagens</span>
            <div v-if="imagensSelecionadas.length" class="image-grid">
              <a
                v-for="imagem in imagensSelecionadas"
                :key="imagem"
                :href="imagem"
                target="_blank"
                rel="noopener"
                class="detail-image"
              >
                <img :src="imagem" alt="Imagem da denúncia" />
              </a>
            </div>
            <p v-else>Sem imagens anexadas.</p>
          </div>

          <div v-if="isAdmin && selectedDenuncia.status !== 'PENDENTE'" class="detail-actions">
            <q-btn
              color="positive"
              unelevated
              icon="check"
              label="Aprovar denúncia"
              :disable="selectedDenuncia.status === 'APROVADO'"
              @click="prepararAlteracaoStatus(selectedDenuncia, 'APROVADO')"
            />
            <q-btn
              color="negative"
              unelevated
              icon="close"
              label="Rejeitar denúncia"
              :disable="selectedDenuncia.status === 'REJEITADO'"
              @click="abrirRejeicao(selectedDenuncia)"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useAuthStore } from 'src/stores/auth-store'
import { useDenuncias } from 'src/composables/useDenuncias'
import { formatLocalizacao, parseDescricaoDenuncia } from 'src/helpers/denuncia'
import { formatDate, formatTime } from 'src/helpers/formatters'

const authStore = useAuthStore()
const { denuncias, stats, loading, error, fetchDenuncias, fetchStats, updateStatus } =
  useDenuncias()

const filtroStatus = ref('TODAS')
const rejeicaoDialog = ref(false)
const detalhesDialog = ref(false)
const motivoRejeicao = ref('')
const denunciaSelecionada = ref(null)
const selectedDenuncia = ref(null)
const detailsMapEl = ref(null)
const detailsMap = ref(null)
const confirmacaoDialog = ref(false)
const acaoPendente = ref(null)
const alterandoStatus = ref(false)

const statusOptions = [
  { label: 'Todas', value: 'TODAS', icon: 'list_alt' },
  { label: 'Pendentes', value: 'PENDENTE', icon: 'pending_actions' },
  { label: 'Aprovadas', value: 'APROVADO', icon: 'check_circle' },
  { label: 'Rejeitadas', value: 'REJEITADO', icon: 'cancel' },
]

const isAdmin = computed(() => authStore.user?.tipo === 'ADMIN')
const pageTitle = computed(() => (isAdmin.value ? 'Gestão de denúncias' : 'Minhas denúncias'))
const pageSubtitle = computed(() =>
  isAdmin.value
    ? 'Analise as denúncias registradas e atualize o status de atendimento.'
    : 'Acompanhe as denúncias registradas com a sua conta.',
)

onMounted(async () => {
  if (!authStore.user) {
    await authStore.fetchMe()
  }
  await carregarDados()
})

const carregarDados = async () => {
  await Promise.all([fetchDenuncias(), fetchStats()])
}

const setFiltro = (status) => {
  filtroStatus.value = status
}

const denunciasFiltradas = computed(() => {
  const lista = [...(denuncias.value || [])]
  if (filtroStatus.value === 'TODAS') return lista
  return lista.filter((denuncia) => denuncia.status === filtroStatus.value)
})

const podeEditar = (denuncia) => {
  return !isAdmin.value && ['PENDENTE', 'REJEITADO'].includes(denuncia?.status)
}

const getParsed = (denuncia) => parseDescricaoDenuncia(denuncia?.descricao)
const getTipo = (denuncia) => getParsed(denuncia).tipo
const getUrgencia = (denuncia) => getParsed(denuncia).urgencia
const getDetalhes = (denuncia) => getParsed(denuncia).detalhes

const abrirRejeicao = (denuncia) => {
  denunciaSelecionada.value = denuncia
  motivoRejeicao.value = ''
  rejeicaoDialog.value = true
}

const abrirDetalhes = (denuncia) => {
  selectedDenuncia.value = denuncia
  detalhesDialog.value = true
}

const confirmacaoTitulo = computed(() => {
  if (acaoPendente.value?.status === 'REJEITADO') return 'Confirmar rejeição'
  if (acaoPendente.value?.status === 'APROVADO') return 'Confirmar aprovação'
  return 'Confirmar alteração'
})

const confirmacaoMensagem = computed(() => {
  const denuncia = acaoPendente.value?.denuncia
  if (!denuncia) return ''

  if (acaoPendente.value.status === 'REJEITADO') {
    return `Você está prestes a rejeitar a denúncia #${denuncia.iddenuncia}. Confirme apenas após revisar todos os detalhes.`
  }

  return `Você está prestes a aprovar a denúncia #${denuncia.iddenuncia}. Confirme apenas após revisar todos os detalhes.`
})

const aplicarAlteracaoStatus = async (denuncia, status, motivo = '') => {
  alterandoStatus.value = true
  try {
    const response = await updateStatus(denuncia.iddenuncia, status, motivo)
    const denunciaAtualizada = {
      ...denuncia,
      ...(response?.data || {}),
      status,
      motivo_rejeicao: motivo || denuncia.motivo_rejeicao,
    }

    denuncias.value = denuncias.value.map((item) =>
      item.iddenuncia === denuncia.iddenuncia ? { ...item, ...denunciaAtualizada } : item,
    )

    if (selectedDenuncia.value?.iddenuncia === denuncia.iddenuncia) {
      selectedDenuncia.value = {
        ...selectedDenuncia.value,
        ...denunciaAtualizada,
      }
    }

    await fetchStats()
    confirmacaoDialog.value = false
    rejeicaoDialog.value = false
    acaoPendente.value = null
    motivoRejeicao.value = ''
  } finally {
    alterandoStatus.value = false
  }
}

const prepararAlteracaoStatus = async (denuncia, status, motivo = '') => {
  if (!denuncia) return

  if (denuncia.status === 'PENDENTE') {
    await aplicarAlteracaoStatus(denuncia, status, motivo)
    return
  }

  acaoPendente.value = { denuncia, status, motivo }
  confirmacaoDialog.value = true
}

const prepararRejeicao = async () => {
  if (!denunciaSelecionada.value) return
  await prepararAlteracaoStatus(denunciaSelecionada.value, 'REJEITADO', motivoRejeicao.value)
}

const confirmarAlteracaoStatus = async () => {
  if (!acaoPendente.value) return

  const { denuncia, status, motivo } = acaoPendente.value
  await aplicarAlteracaoStatus(denuncia, status, motivo)
}

const formatStatus = (status) => {
  const labels = {
    PENDENTE: 'Pendente',
    APROVADO: 'Aprovada',
    REJEITADO: 'Rejeitada',
  }
  return labels[status] || status || 'Não informado'
}

const statusClass = (status) => ({
  'status-pendente': status === 'PENDENTE',
  'status-aprovada': status === 'APROVADO',
  'status-rejeitada': status === 'REJEITADO',
})

const statsValue = (key) => stats.value?.[key] ?? 0

const autorDenuncia = (denuncia) => {
  if (!denuncia || denuncia.anonima) return 'Denúncia anônima'
  const nome = denuncia.usuario_nome || 'Usuário não informado'
  const email = denuncia.usuario_email ? ` (${denuncia.usuario_email})` : ''
  return `${nome}${email}`
}

const imagensSelecionadas = computed(() => {
  const imagens = selectedDenuncia.value?.imagens
  if (Array.isArray(imagens)) return imagens.filter(Boolean)
  if (selectedDenuncia.value?.foto) return [selectedDenuncia.value.foto]
  return []
})

const limparMapaDetalhes = () => {
  detailsMap.value?.remove()
  detailsMap.value = null
}

const montarMapaDetalhes = async () => {
  limparMapaDetalhes()
  await nextTick()

  const denuncia = selectedDenuncia.value
  const lat = Number(denuncia?.latitude)
  const lng = Number(denuncia?.longitude)

  if (!detailsMapEl.value || !Number.isFinite(lat) || !Number.isFinite(lng)) return

  detailsMap.value = L.map(detailsMapEl.value, {
    zoomControl: true,
    attributionControl: true,
  }).setView([lat, lng], 16)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(detailsMap.value)

  L.circleMarker([lat, lng], {
    radius: 9,
    color: 'var(--brand-orange-dark)',
    fillColor: 'var(--brand-orange)',
    fillOpacity: 0.85,
    weight: 3,
  }).addTo(detailsMap.value)
}

watch(detalhesDialog, (isOpen) => {
  if (isOpen) {
    montarMapaDetalhes()
  }
})

onBeforeUnmount(() => {
  limparMapaDetalhes()
})
</script>

<style scoped>
.dashboard-page {
  padding: 32px 0 80px;
  background: var(--brand-muted);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  margin-bottom: 24px;
}

.page-title {
  font-size: clamp(28px, 3vw, 36px);
  font-weight: 700;
}

.page-subtitle,
.date-sub,
.description-sub,
.empty-photo {
  color: var(--brand-ink-soft);
}

.stats-row {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  margin-bottom: 20px;
}

.stat-card,
.table-wrap {
  background: var(--brand-card);
  box-shadow: var(--brand-shadow);
}

.stat-card {
  border-radius: var(--brand-radius);
  padding: 16px;
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

.filter-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}

.filter-chip {
  border-radius: 999px;
  background: var(--brand-card);
  color: var(--brand-ink-soft);
  padding: 10px 18px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
}

.filter-chip.active {
  background: var(--brand-orange);
  color: var(--brand-on-primary);
}

.table-wrap {
  border-radius: var(--brand-radius);
  padding: 18px;
}

.table-head,
.table-row {
  display: grid;
  grid-template-columns: 150px 1.1fr 1.35fr 120px 100px 120px;
  gap: 12px;
  align-items: center;
}

.table-head.admin,
.table-row.admin {
  grid-template-columns: 150px 1fr 1.15fr 120px 100px 280px;
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
  background: var(--brand-panel);
  border-radius: var(--brand-radius);
  padding: 12px;
}

.cell.location,
.actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.description-main,
.date-main {
  font-weight: 700;
}

.status-badge {
  border-radius: 999px;
  padding: 6px 10px;
  font-weight: 700;
}

.status-pendente {
  background: var(--brand-warning-soft);
  color: var(--brand-warning-text);
}

.status-aprovada {
  background: var(--brand-success-soft);
  color: var(--brand-success-text);
}

.status-rejeitada {
  background: var(--brand-danger-soft);
  color: var(--brand-danger-text);
}

.photo-pill {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  overflow: hidden;
  background: var(--brand-photo-bg);
  display: grid;
  place-items: center;
}

.photo-pill img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.actions {
  flex-wrap: wrap;
}

.table-empty {
  padding: 24px;
  text-align: center;
  color: var(--brand-ink-soft);
}

.table-error {
  color: var(--brand-danger-text);
}

.reject-dialog {
  min-width: min(420px, 90vw);
}

.confirm-dialog {
  min-width: min(420px, 90vw);
}

.dialog-subtitle {
  color: var(--brand-ink-soft);
  margin-top: 4px;
}

.details-dialog {
  width: min(920px, 94vw);
  max-width: 920px;
}

.details-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.details-subtitle,
.detail-item span,
.detail-block span {
  color: var(--brand-ink-soft);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.details-content {
  display: grid;
  gap: 18px;
}

.details-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
}

.detail-item,
.detail-block {
  background: var(--brand-panel);
  border-radius: var(--brand-radius);
  padding: 14px;
}

.detail-item {
  display: grid;
  gap: 8px;
}

.detail-wide {
  grid-column: 1 / -1;
}

.detail-block {
  display: grid;
  gap: 8px;
}

.detail-block p {
  margin: 0;
  color: var(--brand-ink);
}

.rejection-block {
  background: var(--brand-danger-soft);
}

.details-map {
  height: 300px;
  border-radius: var(--brand-radius);
  border: 1px solid var(--brand-line);
  overflow: hidden;
}

.image-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
}

.detail-image {
  aspect-ratio: 1;
  border-radius: var(--brand-radius);
  overflow: hidden;
  background: var(--brand-photo-bg);
}

.detail-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

@media (max-width: 1000px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .table-head {
    display: none;
  }

  .table-row,
  .table-row.admin {
    grid-template-columns: 1fr;
  }
}
</style>
