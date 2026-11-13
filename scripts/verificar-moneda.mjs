import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { conectar, esperar } from './cdp.mjs'

const c = await conectar()
const resultados = []
const evaluar = codigo => c.evaluar(codigo)
async function ir(ruta) { await evaluar(`location.hash=${JSON.stringify(ruta)}`); await esperar(130) }
async function llenar(selector, valor) {
  await evaluar(`(() => {const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw Error('Campo ausente: '+${JSON.stringify(selector)});Object.getOwnPropertyDescriptor(e.tagName==='SELECT'?HTMLSelectElement.prototype:HTMLInputElement.prototype,'value').set.call(e,${JSON.stringify(valor)});e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))})()`)
  await esperar(80)
}
async function pulsar(texto, selector = 'button') {
  await evaluar(`(() => {const e=[...document.querySelectorAll(${JSON.stringify(selector)})].find(e=>e.getClientRects().length&&e.innerText.includes(${JSON.stringify(texto)}));if(!e)throw Error('Botón ausente: '+${JSON.stringify(texto)});e.click()})()`)
  await esperar(130)
}
const moneda = codigo => llenar('.currency select', codigo)
async function captura(nombre) { const r = await c.enviar('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true }); await fs.writeFile(`artifacts/${nombre}.png`, Buffer.from(r.data, 'base64')) }
async function comprobar(nombre, accion) { await accion(); resultados.push(nombre); console.log('OK:', nombre) }
const obtenerDatos = () => evaluar('JSON.parse(localStorage.getItem("logica404-prototipo-v1"))')

try {
  await fs.mkdir('artifacts', { recursive: true })
  await c.enviar('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false })
  await c.enviar('Page.navigate', { url: 'http://127.0.0.1:5173/' }); await esperar(700)
  await comprobar('el selector actualiza las tarifas de destino en USD, DOP y EUR', async () => {
    await moneda('USD')
    assert.match(await evaluar('document.querySelector(".destination-price strong").innerText'), /129\.00/)
    await moneda('DOP')
    assert.match(await evaluar('document.querySelector(".destination-price strong").innerText'), /RD\$7,740\.00/)
    await moneda('EUR')
    assert.match(await evaluar('document.querySelector(".destination-price strong").innerText'), /118\.68/)
    await moneda('USD')
    assert.match(await evaluar('document.querySelector(".destination-price strong").innerText'), /129\.00/)
  })
  await comprobar('la preferencia persiste al recargar y el control funciona con teclado', async () => {
    await evaluar('document.querySelector(".currency select").focus()')
    await c.enviar('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowDown', code: 'ArrowDown', windowsVirtualKeyCode: 40 })
    await c.enviar('Input.dispatchKeyEvent', { type: 'keyUp', key: 'ArrowDown', code: 'ArrowDown', windowsVirtualKeyCode: 40 })
    await esperar(100)
    assert.equal(await evaluar('document.querySelector(".currency select").value'), 'DOP')
    await c.enviar('Page.reload'); await esperar(450)
    assert.equal(await evaluar('document.querySelector(".currency select").value'), 'DOP')
    assert.match(await evaluar('document.querySelector(".destination-price strong").innerText'), /7,740/)
  })
  await comprobar('los componentes usan esquinas pequeñas y conservan la letra ampliada', async () => {
    const radios = await evaluar(`[...document.querySelectorAll('.hero,.search-panel,.destination-card,.btn,.search-field,.currency select')].map(e=>({clase:e.className,radio:getComputedStyle(e).borderTopLeftRadius}))`)
    assert.ok(radios.every(r => Number.parseFloat(r.radio) <= 6), JSON.stringify(radios))
    assert.equal(await evaluar('getComputedStyle(document.documentElement).fontSize'), '16px')
    await captura('bordes-moneda-escritorio')
  })
  await comprobar('el selector y el contenido se ajustan a pantallas pequeñas', async () => {
    for (const width of [320, 390, 768, 1024, 1440]) {
      await c.enviar('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false })
      await esperar(80)
      const d = await evaluar('({pantalla:innerWidth,contenido:document.documentElement.scrollWidth,selector:document.querySelector(".currency select").getBoundingClientRect().width})')
      assert.ok(d.selector > 0, 'Selector oculto a ' + width)
      assert.ok(d.contenido <= d.pantalla, JSON.stringify(d))
      if (width === 390) await captura('bordes-moneda-movil')
    }
  })
  await comprobar('cambiar moneda durante la reserva actualiza totales sin perder datos', async () => {
    await ir('/acceso'); await pulsar('Cliente', '.demo-accounts button')
    await ir('/vuelos')
    assert.match(await evaluar('document.querySelector(".flight-price strong").innerText'), /RD\$/)
    assert.match(await evaluar('document.querySelector(".range-labels").innerText'), /RD\$/)
    await pulsar('Seleccionar', '.flight-price button')
    await llenar('input[placeholder="Ej. RD1234567"]', 'RD1234567')
    await evaluar('document.querySelector(".seat:not(:disabled)").click()')
    await pulsar('Continuar a servicios')
    await evaluar('document.querySelector(".services-list input").click()')
    assert.match(await evaluar('document.querySelector(".price-breakdown .total dd").innerText'), /RD\$11,280\.00/)
    await moneda('EUR')
    assert.match(await evaluar('document.querySelector(".price-breakdown .total dd").innerText'), /172\.96/)
    await pulsar('Pasajeros y asientos', '.booking-steps button')
    assert.equal(await evaluar(`document.querySelector('input[placeholder="Ej. RD1234567"]').value`), 'RD1234567')
    assert.ok(await evaluar('!!document.querySelector(".seat.selected")'))
    await moneda('DOP')
    await pulsar('Continuar a servicios')
    await pulsar('Continuar al pago')
  })
  await comprobar('pago y reembolso conservan importes correctos en USD y se muestran convertidos', async () => {
    await llenar('input[placeholder="Como aparece en la tarjeta"]', 'Sofia Reyes')
    await llenar('input[placeholder="4242 4242 4242 4242"]', '4242424242424242')
    await llenar('input[placeholder="MM/AA"]', '1230')
    await llenar('input[placeholder="CVV"]', '123')
    await evaluar('document.querySelector(".booking-form input[type=checkbox]").click()')
    await pulsar('y confirmar', '.booking-form button[type=submit]')
    assert.match(await evaluar('document.querySelector("main").innerText'), /RESERVACIÓN CONFIRMADA/)
    assert.equal((await obtenerDatos()).reservas.at(-1).montoTotal, 188)
    await pulsar('Ver mi viaje'); await pulsar('Cancelar reservación')
    assert.match(await evaluar('document.querySelector(".refund-total").innerText'), /RD\$9,024\.00/)
    await llenar('.modal select', 'Cambio de planes')
    await evaluar('document.querySelector(".modal input[type=checkbox]").click()')
    await pulsar('Confirmar cancelación', '.modal button')
    assert.equal((await obtenerDatos()).reservas.at(-1).reembolso, 150.4)
  })
  assert.equal(c.errores.length, 0, JSON.stringify(c.errores))
  await fs.writeFile('artifacts/verificacion-moneda.json', JSON.stringify({ comprobaciones: resultados, errores: c.errores }, null, 2))
  console.log(`${resultados.length} comprobaciones aprobadas.`)
} catch (error) { console.error(error); await captura('error-moneda'); process.exitCode = 1 }
finally { c.cerrar() }
