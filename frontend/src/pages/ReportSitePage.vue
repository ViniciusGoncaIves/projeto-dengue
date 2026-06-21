<template>
  <q-page class="report-page">
    <section class="page-shell page-header">
      <div>
        <h1 class="page-title">{{ pageTitle }}</h1>
        <p class="page-subtitle">
          {{ pageSubtitle }}
        </p>
      </div>
    </section>

    <section class="page-shell report-grid">
      <q-form ref="formRef" class="report-panel" @submit.prevent="handleSubmit">
        <q-banner v-if="errorMessage" class="message message-error" rounded>
          {{ errorMessage }}
        </q-banner>
        <q-banner v-if="successMessage" class="message message-success" rounded>
          {{ successMessage }}
        </q-banner>

        <div class="form-section">
          <div class="section-title-small">Localização</div>
          <div ref="mapEl" class="leaflet-map"></div>
          <div class="location-actions">
            <q-btn
              color="primary"
              unelevated
              icon="my_location"
              label="Usar minha localização"
              :loading="locating"
              @click="handleLocation"
            />
            <span class="map-hint">Clique no mapa para ajustar o ponto.</span>
          </div>
          <div class="coords-row">
            <q-input
              v-model.number="form.latitude"
              outlined
              dense
              type="number"
              step="0.000001"
              label="Latitude"
              :rules="[(val) => val !== null && val !== '' || 'Latitude obrigatória']"
              @update:model-value="syncMapFromInputs"
            />
            <q-input
              v-model.number="form.longitude"
              outlined
              dense
              type="number"
              step="0.000001"
              label="Longitude"
              :rules="[(val) => val !== null && val !== '' || 'Longitude obrigatória']"
              @update:model-value="syncMapFromInputs"
            />
          </div>
          <q-input
            v-model="form.endereco"
            outlined
            dense
            label="Endereço ou referência"
            placeholder="Ex.: Rua São Paulo, Centro"
            @keyup.enter.prevent="buscarEndereco"
          >
            <template #append>
              <q-btn
                flat
                round
                dense
                icon="search"
                :loading="searchingAddress"
                @click="buscarEndereco"
              />
            </template>
          </q-input>
        </div>

        <div class="form-section">
          <div class="section-title-small">Descrição</div>
          <div class="details-grid">
            <q-select
              v-model="form.tipo"
              :options="tipos"
              outlined
              dense
              label="Tipo de foco"
              :rules="[(val) => !!val || 'Tipo obrigatório']"
            />
            <q-select
              v-model="form.urgencia"
              :options="urgencias"
              outlined
              dense
              label="Urgência"
              :rules="[(val) => !!val || 'Urgência obrigatória']"
            />
          </div>
          <q-input
            v-model="form.detalhes"
            outlined
            type="textarea"
            label="Detalhes"
            placeholder="Descreva o foco e como ele pode ser encontrado"
            :rules="[(val) => !!val?.trim() || 'Descrição obrigatória']"
          />
        </div>

        <div class="form-section">
          <div class="section-title-small">Imagens</div>
          <q-file
            v-model="files"
            outlined
            dense
            multiple
            use-chips
            accept="image/*"
            label="Anexar uma ou mais imagens"
          >
            <template #prepend>
              <q-icon name="add_photo_alternate" />
            </template>
          </q-file>
        </div>

        <div class="submit-row">
          <q-checkbox
            v-if="!isEditing"
            v-model="form.anonimo"
            label="Enviar como denúncia anônima"
          />
          <q-btn
            type="submit"
            color="primary"
            unelevated
            :icon="isEditing ? 'save' : 'send'"
            :label="isEditing ? 'Salvar alterações' : 'Enviar denúncia'"
            :loading="loading"
          />
        </div>
      </q-form>

      <aside class="info-panel">
        <div class="info-title">Como funciona</div>
        <p>
          Denúncias anônimas são aceitas a qualquer momento. Ao enviar com uma conta, a denúncia
          aparece no seu painel para acompanhamento.
        </p>
        <p>
          Administradores visualizam todas as denúncias e podem alterar o status para pendente,
          aprovada ou rejeitada.
        </p>
      </aside>
    </section>
  </q-page>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getAuthToken } from 'src/boot/apiFetch'
import { useDenuncias } from 'src/composables/useDenuncias'
import { formatDescricaoDenuncia, parseDescricaoDenuncia } from 'src/helpers/denuncia'
import { useRoute, useRouter } from 'vue-router'

const DEFAULT_LOCATION = [-26.8495, -52.9913]
const DEFAULT_CITY = 'Pinhalzinho, Santa Catarina, Brasil'

const formRef = ref(null)
const mapEl = ref(null)
const map = ref(null)
const selectedPoint = ref(null)
const files = ref([])
const loading = ref(false)
const locating = ref(false)
const searchingAddress = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const route = useRoute()
const router = useRouter()
const isEditing = ref(false)
const denunciaId = ref(null)

const form = ref({
  endereco: '',
  latitude: DEFAULT_LOCATION[0],
  longitude: DEFAULT_LOCATION[1],
  tipo: '',
  urgencia: '',
  detalhes: '',
  anonimo: !getAuthToken(),
})

const tipos = ['Água parada', 'Pneu com água', 'Vaso de planta', "Caixa d'água aberta", 'Outro']
const urgencias = ['Baixa', 'Média', 'Alta']

const { createDenuncia, fetchDenunciaById, updateDenuncia } = useDenuncias()

const pageTitle = computed(() =>
  isEditing.value ? 'Editar denúncia' : 'Registrar foco de dengue',
)
const pageSubtitle = computed(() =>
  isEditing.value
    ? 'Corrija as informações da denúncia para que ela volte para análise.'
    : 'Informe o local, descreva a situação e envie imagens para apoiar a análise.',
)

onMounted(async () => {
  denunciaId.value = route.params.id || null
  isEditing.value = Boolean(denunciaId.value)

  await nextTick()
  map.value = L.map(mapEl.value, {
    zoomControl: true,
  }).setView(DEFAULT_LOCATION, 14)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map.value)

  setPoint(DEFAULT_LOCATION[0], DEFAULT_LOCATION[1], false)
  map.value.on('click', (event) => {
    setPoint(event.latlng.lat, event.latlng.lng, false)
  })

  if (isEditing.value) {
    await carregarDenunciaParaEdicao()
  }
})

onBeforeUnmount(() => {
  map.value?.remove()
})

const setPoint = (latitude, longitude, shouldPan = true) => {
  const lat = Number(latitude)
  const lng = Number(longitude)
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !map.value) return

  form.value.latitude = Number(lat.toFixed(6))
  form.value.longitude = Number(lng.toFixed(6))

  if (!selectedPoint.value) {
    selectedPoint.value = L.circleMarker([lat, lng], {
      radius: 9,
      color: 'var(--brand-orange-dark)',
      fillColor: 'var(--brand-orange)',
      fillOpacity: 0.85,
      weight: 3,
    }).addTo(map.value)
  } else {
    selectedPoint.value.setLatLng([lat, lng])
  }

  if (shouldPan) {
    map.value.setView([lat, lng], Math.max(map.value.getZoom(), 15))
  }
}

const syncMapFromInputs = () => {
  setPoint(form.value.latitude, form.value.longitude)
}

const handleLocation = () => {
  errorMessage.value = ''

  if (!navigator.geolocation) {
    errorMessage.value = 'Geolocalização não suportada no navegador.'
    return
  }

  locating.value = true
  navigator.geolocation.getCurrentPosition(
    (position) => {
      setPoint(position.coords.latitude, position.coords.longitude)
      locating.value = false
    },
    () => {
      errorMessage.value = 'Não foi possível obter sua localização.'
      locating.value = false
    },
  )
}

const buscarEndereco = async () => {
  errorMessage.value = ''
  const endereco = form.value.endereco?.trim()

  if (!endereco) {
    errorMessage.value = 'Informe um endereço para buscar no mapa.'
    return
  }

  searchingAddress.value = true
  try {
    const query = `${endereco}, ${DEFAULT_CITY}`
    const url = new URL('https://nominatim.openstreetmap.org/search')
    url.searchParams.set('format', 'jsonv2')
    url.searchParams.set('limit', '1')
    url.searchParams.set('addressdetails', '1')
    url.searchParams.set('countrycodes', 'br')
    url.searchParams.set('q', query)

    const response = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Não foi possível buscar o endereço.')
    }

    const results = await response.json()
    const result = results?.[0]

    if (!result) {
      errorMessage.value = 'Endereço não encontrado em Pinhalzinho-SC.'
      return
    }

    setPoint(result.lat, result.lon)
    form.value.endereco = result.display_name || query
  } catch (err) {
    errorMessage.value = err?.message || 'Erro ao buscar endereço.'
  } finally {
    searchingAddress.value = false
  }
}

const carregarDenunciaParaEdicao = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await fetchDenunciaById(denunciaId.value)
    const denuncia = response?.data

    if (!denuncia) {
      throw new Error('Denúncia não encontrada.')
    }

    if (!['PENDENTE', 'REJEITADO'].includes(denuncia.status)) {
      throw new Error('Denúncias aprovadas não podem ser editadas.')
    }

    const parsed = parseDescricaoDenuncia(denuncia.descricao)
    form.value = {
      endereco: denuncia.endereco || '',
      latitude: Number(denuncia.latitude),
      longitude: Number(denuncia.longitude),
      tipo: parsed.tipo || '',
      urgencia: parsed.urgencia || '',
      detalhes: parsed.detalhes || denuncia.descricao || '',
      anonimo: false,
    }

    setPoint(form.value.latitude, form.value.longitude)
  } catch (err) {
    errorMessage.value = err?.message || 'Erro ao carregar denúncia.'
  } finally {
    loading.value = false
  }
}

const buildPayload = () => {
  const payload = new FormData()
  payload.append(
    'descricao',
    formatDescricaoDenuncia({
      tipo: form.value.tipo,
      urgencia: form.value.urgencia,
      detalhes: form.value.detalhes,
    }),
  )
  payload.append('latitude', String(form.value.latitude))
  payload.append('longitude', String(form.value.longitude))
  payload.append('endereco', form.value.endereco || '')
  payload.append('anonimo', form.value.anonimo ? 'true' : '')

  const selectedFiles = Array.isArray(files.value) ? files.value : [files.value].filter(Boolean)
  selectedFiles.forEach((file) => {
    payload.append('imagens', file)
  })

  return payload
}

const resetForm = () => {
  form.value = {
    endereco: '',
    latitude: DEFAULT_LOCATION[0],
    longitude: DEFAULT_LOCATION[1],
    tipo: '',
    urgencia: '',
    detalhes: '',
    anonimo: !getAuthToken(),
  }
  files.value = []
  setPoint(DEFAULT_LOCATION[0], DEFAULT_LOCATION[1])
  formRef.value?.resetValidation()
}

const handleSubmit = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  const isValid = formRef.value ? await formRef.value.validate() : true
  if (!isValid) return

  loading.value = true
  try {
    if (isEditing.value) {
      await updateDenuncia(denunciaId.value, buildPayload(), { isFormData: true })
      successMessage.value = 'Denúncia atualizada e enviada para nova análise.'
      await router.push('/dashboard')
    } else {
      await createDenuncia(buildPayload(), { isFormData: true, skipAuth: form.value.anonimo })
      successMessage.value = 'Denúncia enviada com sucesso.'
      resetForm()
    }
  } catch (err) {
    errorMessage.value = err?.message || 'Erro ao salvar denúncia.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.report-page {
  padding: 40px 0 80px;
  background: var(--brand-muted);
}

.page-header {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: flex-start;
  margin-bottom: 24px;
}

.page-title {
  font-size: clamp(30px, 4vw, 40px);
  font-weight: 700;
}

.page-subtitle,
.map-hint,
.info-panel p {
  color: var(--brand-ink-soft);
}

.report-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 18px;
  align-items: start;
}

.report-panel,
.info-panel {
  background: var(--brand-card);
  border-radius: var(--brand-radius);
  box-shadow: var(--brand-shadow);
  padding: 20px;
}

.message {
  margin-bottom: 16px;
}

.message-error {
  background: var(--brand-danger-soft);
  color: var(--brand-danger-text);
}

.message-success {
  background: var(--brand-success-soft);
  color: var(--brand-success-text);
}

.form-section {
  display: grid;
  gap: 12px;
  margin-bottom: 22px;
}

.section-title-small,
.info-title {
  font-weight: 700;
  color: var(--brand-ink);
}

.leaflet-map {
  height: 360px;
  border: 1px solid var(--brand-line);
  border-radius: var(--brand-radius);
  overflow: hidden;
}

.location-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.coords-row,
.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.submit-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

@media (max-width: 900px) {
  .page-header,
  .submit-row {
    flex-direction: column;
    align-items: stretch;
  }

  .report-grid {
    grid-template-columns: 1fr;
  }

  .leaflet-map {
    height: 300px;
  }
}
</style>
