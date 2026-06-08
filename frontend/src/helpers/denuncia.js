const DESCRICAO_SEPARADOR = ' | '

export function formatDescricaoDenuncia({ tipo, urgencia, detalhes }) {
  const partes = []

  if (tipo) partes.push(`Tipo: ${tipo}`)
  if (urgencia) partes.push(`Urgencia: ${urgencia}`)
  if (detalhes) partes.push(detalhes)

  return partes.join(DESCRICAO_SEPARADOR)
}

export function parseDescricaoDenuncia(descricao) {
  if (!descricao) {
    return { tipo: '', urgencia: '', detalhes: '' }
  }

  const partes = descricao.split(DESCRICAO_SEPARADOR)
  const tipoRaw = partes.find((parte) => parte.startsWith('Tipo: '))
  const urgenciaRaw = partes.find((parte) => parte.startsWith('Urgencia: '))
  const detalhes = partes
    .filter((parte) => !parte.startsWith('Tipo: ') && !parte.startsWith('Urgencia: '))
    .join(DESCRICAO_SEPARADOR)

  return {
    tipo: tipoRaw ? tipoRaw.replace('Tipo: ', '') : '',
    urgencia: urgenciaRaw ? urgenciaRaw.replace('Urgencia: ', '') : '',
    detalhes: detalhes || '',
  }
}

export function formatLocalizacao(denuncia) {
  if (denuncia?.endereco) return denuncia.endereco
  if (denuncia?.latitude != null && denuncia?.longitude != null) {
    return `${Number(denuncia.latitude).toFixed(4)}, ${Number(denuncia.longitude).toFixed(4)}`
  }
  return 'Localizacao nao informada'
}
