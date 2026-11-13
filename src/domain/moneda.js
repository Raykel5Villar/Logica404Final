/** Tasas fijas para la demostración. Todos los importes de negocio se conservan en USD. */
export const MONEDAS = Object.freeze({
  USD: Object.freeze({ codigo: 'USD', nombre: 'Dólares estadounidenses', tasa: 1 }),
  DOP: Object.freeze({ codigo: 'DOP', nombre: 'Pesos dominicanos', tasa: 60 }),
  EUR: Object.freeze({ codigo: 'EUR', nombre: 'Euros', tasa: 0.92 }),
})

const CLAVE = 'logica404-moneda'
const oyentes = new Set()
function leerMoneda() {
  try {
    const guardada = globalThis.localStorage?.getItem(CLAVE)
    if (Object.hasOwn(MONEDAS, guardada)) return guardada
  } catch { /* La preferencia sigue funcionando en memoria si el navegador bloquea el almacenamiento. */ }
  return 'USD'
}
let seleccionada = leerMoneda()

export const preferenciaMoneda = {
  obtener: () => seleccionada,
  suscribir(fn) { oyentes.add(fn); return () => oyentes.delete(fn) },
  seleccionar(codigo) {
    if (!Object.hasOwn(MONEDAS, codigo)) throw new Error('Selecciona una moneda válida.')
    if (seleccionada === codigo) return
    seleccionada = codigo
    try { globalThis.localStorage?.setItem(CLAVE, codigo) } catch { /* Preferencia de sesión. */ }
    oyentes.forEach(fn => fn())
  },
}

export function convertirDesdeUSD(valor, codigo = seleccionada) {
  if (!Object.hasOwn(MONEDAS, codigo)) throw new Error('Moneda no disponible.')
  return Math.round(Number(valor) * MONEDAS[codigo].tasa * 100) / 100
}

export function formatearDinero(valor, codigo = seleccionada) {
  return new Intl.NumberFormat('es-DO', { style: 'currency', currency: codigo, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(convertirDesdeUSD(valor, codigo))
}

function sincronizar(evento) {
  if (evento.key !== CLAVE && evento.key !== null) return
  const siguiente = leerMoneda()
  if (siguiente !== seleccionada) {
    seleccionada = siguiente
    oyentes.forEach(fn => fn())
  }
}
globalThis.addEventListener?.('storage', sincronizar)
if (import.meta.hot) import.meta.hot.dispose(() => globalThis.removeEventListener?.('storage', sincronizar))
