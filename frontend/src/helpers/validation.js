export const required = (message) => (value) => {
  if (typeof value === 'string') return !!value.trim() || message
  return value !== null && value !== undefined && value !== '' || message
}

export const email = (message = 'E-mail inválido') => (value) =>
  /.+@.+\..+/.test(value) || message

export const minLength = (min, message = `Mínimo ${min} caracteres`) => (value) =>
  !value || value.length >= min || message

export const sameAs = (getExpected, message) => (value) => value === getExpected() || message
