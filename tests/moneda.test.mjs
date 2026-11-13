import { beforeEach, test } from 'node:test'
import assert from 'node:assert/strict'

const memoria = new Map()
Object.defineProperty(globalThis, 'localStorage', {
  value: { getItem: clave => memoria.get(clave) ?? null, setItem: (clave, valor) => memoria.set(clave, valor) },
  configurable: true,
})
const { preferenciaMoneda, convertirDesdeUSD, formatearDinero } = await import('../src/domain/moneda.js')
beforeEach(() => preferenciaMoneda.seleccionar('USD'))

test('cambiar moneda actualiza y persiste la preferencia, notificando a la interfaz', () => {
  let cambios = 0
  const cancelar = preferenciaMoneda.suscribir(() => cambios++)
  preferenciaMoneda.seleccionar('DOP')
  assert.equal(preferenciaMoneda.obtener(), 'DOP')
  assert.equal(memoria.get('logica404-moneda'), 'DOP')
  assert.equal(cambios, 1)
  preferenciaMoneda.seleccionar('DOP')
  assert.equal(cambios, 1)
  cancelar()
})
test('las conversiones usan siempre el importe original, incluso al alternar monedas', () => {
  assert.equal(convertirDesdeUSD(129, 'DOP'), 7740)
  assert.equal(convertirDesdeUSD(129, 'EUR'), 118.68)
  preferenciaMoneda.seleccionar('DOP')
  assert.equal(convertirDesdeUSD(129), 7740)
  preferenciaMoneda.seleccionar('EUR')
  assert.equal(convertirDesdeUSD(129), 118.68)
  preferenciaMoneda.seleccionar('USD')
  assert.equal(convertirDesdeUSD(129), 129)
})
test('el formato diferencia las tres monedas y permite comprobantes con moneda explícita', () => {
  preferenciaMoneda.seleccionar('DOP')
  assert.match(formatearDinero(35), /RD\$/)
  assert.match(formatearDinero(35, 'USD'), /US\$/)
  assert.match(formatearDinero(35, 'EUR'), /€/)
  assert.equal(convertirDesdeUSD(0), 0)
})
test('una moneda inválida no cambia la selección válida', () => {
  preferenciaMoneda.seleccionar('EUR')
  assert.throws(() => preferenciaMoneda.seleccionar('XXX'), /válida/)
  assert.equal(preferenciaMoneda.obtener(), 'EUR')
})
