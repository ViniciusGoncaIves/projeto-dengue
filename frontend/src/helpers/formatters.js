const DATE_FORMAT = {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
}

const TIME_FORMAT = {
  hour: '2-digit',
  minute: '2-digit',
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('pt-BR', DATE_FORMAT)
}

export function formatTime(date) {
  return new Date(date).toLocaleTimeString('pt-BR', TIME_FORMAT)
}
