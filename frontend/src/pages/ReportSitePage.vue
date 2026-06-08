<template>
  <q-page class="report-page">
    <section class="page-shell report-hero">
      <div>
        <div class="breadcrumb">Inicio / Reportar foco</div>
        <h1 class="hero-title">Reportar um foco</h1>
        <p class="hero-subtitle">
          Ajude as autoridades a agir rapidamente. Sua denuncia pode evitar surtos no bairro.
        </p>
      </div>
    </section>

    <section class="page-shell report-form">
      <q-card class="report-card">
        <q-card-section>
          <q-banner v-if="errorMessage" class="bg-red-1 text-red-9 q-mb-md" rounded>
            {{ errorMessage }}
          </q-banner>
          <q-banner v-if="successMessage" class="bg-green-1 text-green-9 q-mb-md" rounded>
            {{ successMessage }}
          </q-banner>

          <q-form ref="formRef" class="q-gutter-lg" @submit.prevent="handleSubmit">
            <div class="step-block">
              <div class="step-title">1. Onde esta o foco?</div>
              <div class="location-row">
                <q-btn color="primary" unelevated :loading="locating" @click="handleLocation">
                  Usar minha localizacao
                </q-btn>
                <q-input
                  v-model="form.endereco"
                  outlined
                  dense
                  placeholder="Ou informe o endereco"
                  class="flex-1"
                />
              </div>
              <div class="coords-row">
                <q-input
                  v-model.number="form.latitude"
                  outlined
                  dense
                  type="number"
                  placeholder="Latitude"
                />
                <q-input
                  v-model.number="form.longitude"
                  outlined
                  dense
                  type="number"
                  placeholder="Longitude"
                />
              </div>
              <div class="map-preview">
                <q-icon name="place" size="32px" />
                <span>Coordenadas serao usadas para localizar o foco.</span>
              </div>
            </div>

            <div class="step-block">
              <div class="step-title">2. Envie evidencias</div>
              <q-file
                v-model="file"
                outlined
                dense
                accept="image/*"
                class="file-uploader"
                label="Clique para anexar uma foto"
              >
                <template #prepend>
                  <q-icon name="add_a_photo" />
                </template>
              </q-file>
            </div>

            <div class="step-block">
              <div class="step-title">3. Detalhes do foco</div>
              <div class="details-grid">
                <q-select
                  v-model="form.tipo"
                  :options="tipos"
                  outlined
                  dense
                  label="Tipo de foco"
                  :rules="[(val) => !!val || 'Tipo obrigatorio']"
                />
                <q-select
                  v-model="form.urgencia"
                  :options="urgencias"
                  outlined
                  dense
                  label="Nivel de urgencia"
                  :rules="[(val) => !!val || 'Urgencia obrigatoria']"
                />
              </div>
              <q-input
                v-model="form.detalhes"
                outlined
                type="textarea"
                label="Informacoes adicionais"
                placeholder="Descreva onde esta o foco"
              />
              <q-checkbox v-model="form.anonimo" label="Manter denuncia anonima" />
            </div>

            <div class="action-row">
              <q-btn type="submit" color="primary" unelevated :loading="loading" class="submit-btn">
                Enviar denuncia
              </q-btn>
            </div>
          </q-form>
        </q-card-section>
      </q-card>

      <q-card class="alert-card">
        <q-card-section>
          <div class="alert-title">Aviso de seguranca</div>
          <p>
            Nao entre em propriedades privadas para capturar fotos. Utilize pontos de acesso
            publicos e mantenha distancia segura.
          </p>
        </q-card-section>
      </q-card>
    </section>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { http } from 'src/boot/apiFetch'
import { useDenuncias } from 'src/composables/useDenuncias'
import { formatDescricaoDenuncia } from 'src/helpers/denuncia'

const formRef = ref(null)
const file = ref(null)
const loading = ref(false)
const locating = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const form = ref({
  endereco: '',
  latitude: null,
  longitude: null,
  tipo: '',
  urgencia: '',
  detalhes: '',
  anonimo: false,
})

const tipos = ['Agua parada', 'Pneu com agua', 'Vaso de planta', "Caixa d'agua aberta", 'Outro']

const urgencias = ['Baixa', 'Media', 'Alta']

const { createDenuncia } = useDenuncias()

const handleLocation = () => {
  errorMessage.value = ''

  if (!navigator.geolocation) {
    errorMessage.value = 'Geolocalizacao nao suportada no navegador'
    return
  }

  locating.value = true
  navigator.geolocation.getCurrentPosition(
    (position) => {
      form.value.latitude = Number(position.coords.latitude.toFixed(6))
      form.value.longitude = Number(position.coords.longitude.toFixed(6))
      locating.value = false
    },
    () => {
      errorMessage.value = 'Nao foi possivel obter sua localizacao'
      locating.value = false
    },
  )
}

const uploadImagem = async () => {
  if (!file.value) return null

  const formData = new FormData()
  formData.append('file', file.value)
  const response = await http.post('/api/upload', formData, { isFormData: true })
  return response?.data?.publicUrl || null
}

const handleSubmit = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  const isValid = formRef.value ? await formRef.value.validate() : true
  if (!isValid) return
  if (form.value.latitude == null || form.value.longitude == null) {
    errorMessage.value = 'Informe a localizacao para continuar'
    return
  }

  loading.value = true
  try {
    const imagemUrl = await uploadImagem()
    const descricao = formatDescricaoDenuncia({
      tipo: form.value.tipo,
      urgencia: form.value.urgencia,
      detalhes: form.value.detalhes,
    })

    if (!descricao) {
      errorMessage.value = 'Descreva o foco para continuar'
      loading.value = false
      return
    }

    await createDenuncia({
      descricao,
      latitude: form.value.latitude,
      longitude: form.value.longitude,
      endereco: form.value.endereco,
      imagens: imagemUrl ? [imagemUrl] : [],
      anonimo: form.value.anonimo,
    })

    successMessage.value = 'Denuncia enviada com sucesso'
    form.value = {
      endereco: '',
      latitude: null,
      longitude: null,
      tipo: '',
      urgencia: '',
      detalhes: '',
      anonimo: false,
    }
    file.value = null
  } catch (err) {
    errorMessage.value = err?.message || 'Erro ao enviar denuncia'
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

.report-hero {
  margin-bottom: 24px;
}

.breadcrumb {
  color: var(--brand-ink-soft);
  font-size: 13px;
  margin-bottom: 8px;
}

.hero-title {
  font-size: clamp(30px, 4vw, 40px);
  font-weight: 700;
}

.hero-subtitle {
  color: var(--brand-ink-soft);
}

.report-form {
  display: grid;
  gap: 18px;
}

.report-card {
  border-radius: 26px;
  padding: 8px;
}

.step-block {
  display: grid;
  gap: 12px;
}

.step-title {
  font-weight: 700;
  color: var(--brand-ink);
}

.location-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.coords-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
}

.map-preview {
  min-height: 140px;
  border-radius: 18px;
  border: 2px dashed rgba(255, 90, 31, 0.3);
  display: grid;
  place-items: center;
  color: var(--brand-ink-soft);
  background: #fff7f2;
}

.file-uploader {
  border: 2px dashed rgba(255, 90, 31, 0.3);
  border-radius: 18px;
  padding: 8px;
}

.details-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.action-row {
  display: flex;
  justify-content: flex-end;
}

.submit-btn {
  border-radius: 999px;
  padding: 10px 24px;
  font-weight: 700;
}

.alert-card {
  background: #fff1e9;
  border-radius: 20px;
}

.alert-title {
  font-weight: 700;
  margin-bottom: 6px;
}
</style>
