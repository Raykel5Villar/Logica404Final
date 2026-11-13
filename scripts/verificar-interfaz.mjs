import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { conectar, esperar } from './cdp.mjs'

const cdp = await conectar()
const log = []
async function evaluar(codigo) { return cdp.evaluar(codigo) }
async function ir(ruta) { await evaluar(`location.hash=${JSON.stringify(ruta)}`); await esperar(160) }
async function pulsar(texto, selector = 'button') {
  await evaluar(`(() => {const e=[...document.querySelectorAll(${JSON.stringify(selector)})].find(e=>e.getClientRects().length && e.innerText.trim().includes(${JSON.stringify(texto)}));if(!e)throw Error('No existe botón: '+${JSON.stringify(texto)});if(e.disabled)throw Error('Botón deshabilitado');e.click()})()`)
  await esperar(120)
}
async function rellenar(selector, valor) {
  await evaluar(`(() => {const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw Error('Campo ausente '+${JSON.stringify(selector)});Object.getOwnPropertyDescriptor(e.tagName==='SELECT'?HTMLSelectElement.prototype:HTMLInputElement.prototype,'value').set.call(e,${JSON.stringify(valor)});e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))})()`)
  await esperar(60)
}
async function texto() { return evaluar('document.querySelector("main").innerText') }
async function datos() { return evaluar('JSON.parse(localStorage.getItem("logica404-prototipo-v1"))') }
async function comprobar(nombre, accion) { await accion(); log.push(nombre); console.log('OK:', nombre) }
async function capturar(nombre) { const r = await cdp.enviar('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true }); await fs.writeFile(`artifacts/${nombre}.png`, Buffer.from(r.data, 'base64')) }

try {
  await fs.mkdir('artifacts', { recursive: true })
  await cdp.enviar('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false })
  await cdp.enviar('Page.navigate', { url: 'http://127.0.0.1:5173/' })
  await esperar(600)
  await evaluar('localStorage.clear(); location.reload()'); await esperar(600)
  await comprobar('visitante consulta pero necesita sesión para Mis viajes', async () => { await ir('/viajes'); assert.match(await texto(), /Tu viaje empieza con una cuenta/); await ir('/'); await pulsar('Buscar vuelos', '.search-submit'); assert.match(await texto(), /vuelos disponibles/) })
  await comprobar('selección de vuelo conserva el itinerario al iniciar sesión', async () => { await pulsar('Seleccionar'); assert.match(await texto(), /Inicia sesión/); await pulsar('Cliente', '.demo-accounts button'); assert.match(await texto(), /Unos pasos más/); assert.match(await evaluar('location.hash'), /reservar/) })
  await comprobar('selección de asiento y servicios', async () => {
    await rellenar('input[placeholder="Ej. RD1234567"]', 'RD1234567')
    await evaluar(`document.querySelector('button[aria-label="Asiento 1A"]').click()`)
    await capturar('reserva-escritorio')
    await pulsar('Continuar a servicios')
    await evaluar('document.querySelector(".services-list input").click()')
    await pulsar('Continuar al pago')
    assert.match(await texto(), /Ya casi estás a bordo/)
  })
  await comprobar('pago, PNR y confirmación de reservación', async () => {
    await rellenar('input[placeholder="Como aparece en la tarjeta"]', 'Sofia Reyes')
    await rellenar('input[placeholder="4242 4242 4242 4242"]', '4242424242424242')
    await rellenar('input[placeholder="MM/AA"]', '1230')
    await rellenar('input[placeholder="CVV"]', '123')
    await evaluar('document.querySelector(".booking-form input[type=checkbox]").click()')
    await pulsar('y confirmar', '.booking-form button[type=submit]')
    assert.match(await texto(), /RESERVACIÓN CONFIRMADA/)
    assert.equal((await datos()).reservas.length, 3)
    await capturar('confirmacion')
  })
  await comprobar('cancelación desde Mis viajes y devolución del 80 %', async () => {
    await pulsar('Ver mi viaje')
    await cdp.enviar('Page.reload'); await esperar(450)
    assert.match(await texto(), /Mis viajes/)
    assert.equal((await datos()).reservas.length, 3)
    await pulsar('Cancelar reservación')
    await rellenar('.modal select', 'Cambio de planes')
    await evaluar('document.querySelector(".modal input[type=checkbox]").click()')
    await pulsar('Confirmar cancelación', '.modal button')
    const reserva = (await datos()).reservas.at(-1)
    assert.equal(reserva.estadoReserva, 'CANCELADA')
    assert.equal(reserva.reembolso, Math.round(reserva.montoTotal * 80) / 100)
  })
  await comprobar('migración rechazada muestra error y permite reintentar', async () => {
    await ir('/demo'); await rellenar('.demo-settings select:nth-of-type(1)', 'aprobado')
    await evaluar(`(() => {const sel=[...document.querySelectorAll('.demo-settings select')][1];Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(sel,'rechazada');sel.dispatchEvent(new Event('change',{bubbles:true}))})()`)
    await ir('/check-in')
    await pulsar('Usar reservación L404DE')
    await pulsar('Continuar al check-in')
    assert.match(await texto(), /Migración no aprobó/)
    await ir('/demo')
    await evaluar(`(() => {const sel=[...document.querySelectorAll('.demo-settings select')][1];Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(sel,'aprobada');sel.dispatchEvent(new Event('change',{bubbles:true}))})()`)
    await ir('/check-in?codigo=L404DE&apellido=Reyes')
    await pulsar('Continuar al check-in')
    assert.match(await texto(), /Listo para despegar/)
    assert.ok((await datos()).reservas[0].paseAbordar)
    await capturar('pase-abordar')
  })
  await comprobar('el panel de agente está protegido y permite actualizar un vuelo', async () => {
    await ir('/agente'); assert.match(await texto(), /Acceso para agentes autorizados/)
    await ir('/demo'); await pulsar('Entrar con este perfil', '.demo-profile:last-child button')
    assert.match(await texto(), /PANEL DE AGENTE/)
    const demo = (await datos()).vuelos.find(v => v.idVuelo === 'vuelo-checkin-demo')
    await rellenar('.agent-filters input[type=date]', demo.horaPartida.slice(0, 10))
    await evaluar(`document.querySelector('button[aria-label^="Editar L4 404"]').click()`)
    await rellenar('.modal input[maxlength="8"]', 'C9')
    await pulsar('Guardar cambios', '.modal button')
    const d = await datos()
    assert.equal(d.vuelos.find(v => v.idVuelo === 'vuelo-checkin-demo').puerta, 'C9')
    assert.equal(d.reservas[0].estadoCheckIn, 'PENDIENTE')
    assert.ok(d.mensajes.some(m => m.asunto.includes('Actualización')))
    await capturar('panel-agente')
  })
  await comprobar('dos pasajeros y descuento con millas en una cuenta corporativa', async () => {
    await ir('/demo'); await pulsar('Entrar con este perfil', '.demo-profile:nth-child(2) button')
    assert.match(await texto(), /12,500|12\.500/)
    await ir('/'); await rellenar('select[aria-label="Pasajeros"]', '2'); await pulsar('Buscar vuelos', '.search-submit'); await pulsar('Seleccionar')
    await rellenar('input[placeholder="Ej. RD1234567"]', 'RD1234567')
    await evaluar(`document.querySelector('button[aria-label="Asiento 1A"]').click()`)
    await pulsar('Pasajero 2', '.passenger-tabs button')
    await evaluar(`(() => {const es=[...document.querySelectorAll('.booking-form .form-grid input')];for(const [i,v] of ['Elena','Santos'].entries()){Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(es[i],v);es[i].dispatchEvent(new Event('input',{bubbles:true}))}})()`)
    await rellenar('input[placeholder="Ej. RD1234567"]', 'RD7654321')
    await evaluar(`document.querySelector('button[aria-label="Asiento 1C"]').click()`)
    await cdp.enviar('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: false })
    assert.ok(await evaluar('document.documentElement.scrollWidth<=innerWidth'))
    await capturar('reserva-movil')
    await cdp.enviar('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false })
    await pulsar('Continuar a servicios')
    await evaluar('document.querySelector(".miles-redeem input").click()')
    await pulsar('Continuar al pago')
    await rellenar('input[placeholder="Como aparece en la tarjeta"]', 'Carlos Mendez')
    await rellenar('input[placeholder="4242 4242 4242 4242"]', '4242424242424242')
    await rellenar('input[placeholder="MM/AA"]', '1230')
    await rellenar('input[placeholder="CVV"]', '123')
    await evaluar('document.querySelector(".booking-form input[type=checkbox]").click()')
    await pulsar('y confirmar', '.booking-form button[type=submit]')
    assert.match(await texto(), /RESERVACIÓN CONFIRMADA/)
    const d=await datos(),r=d.reservas.at(-1)
    assert.equal(r.pasajeros.length,2)
    assert.equal(r.millasDescontadas,7000)
    assert.equal(d.usuarios.find(u=>u.idUsuario==='corporativo-demo').millas,12500-7000+500)
  })
  await comprobar('registro de una nueva cuenta y acceso posterior', async () => {
    await ir('/cuenta'); await pulsar('Cerrar sesión', 'main button')
    await ir('/registro')
    const valores=['Nueva','Persona','Santo Domingo','8095550199','nueva@prueba.test','Nueva404!']
    const selectores=await evaluar(`[...document.querySelectorAll('.auth-register input:not([type=checkbox])')].length`)
    assert.equal(selectores,6)
    for(let i=0;i<valores.length;i++) {
      await evaluar(`(() => {const e=[...document.querySelectorAll('.auth-register input:not([type=checkbox])')][${i}];Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,${JSON.stringify(valores[i])});e.dispatchEvent(new Event('input',{bubbles:true}))})()`)
      await esperar(40)
    }
    await evaluar('document.querySelector(".auth-register input[type=checkbox]").click()')
    await pulsar('Crear mi cuenta')
    assert.match(await texto(), /Tu cuenta está lista/)
    await rellenar('input[autocomplete="current-password"]', 'Nueva404!')
    await pulsar('Iniciar sesión', 'main button[type=submit]')
    assert.match(await evaluar('document.querySelector(".account-toggle").innerText'), /Nueva/)
  })
  await comprobar('navegación móvil sin desbordamiento ni errores de JavaScript', async () => {
    await cdp.enviar('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: false })
    for(const ruta of ['/', '/vuelos', '/destinos', '/viajes', '/check-in', '/millas', '/correo', '/cuenta', '/demo', '/ayuda', '/registro']) {
      await ir(ruta)
      const ancho=await evaluar('({pantalla:innerWidth,contenido:document.documentElement.scrollWidth})')
      assert.ok(ancho.contenido<=ancho.pantalla, `Desbordamiento en ${ruta}: ${JSON.stringify(ancho)}`)
    }
    await ir('/'); await capturar('inicio-movil')
    assert.equal(cdp.errores.length,0,JSON.stringify(cdp.errores))
    assert.ok(cdp.peticiones.every(url=>url.startsWith('http://127.0.0.1:5173/') || url.startsWith('data:')),JSON.stringify(cdp.peticiones))
  })
  await fs.writeFile('artifacts/verificacion-interfaz.json', JSON.stringify({ fecha: new Date().toISOString(), comprobaciones: log, errores: cdp.errores, peticionesExternas: cdp.peticiones.filter(url=>!url.startsWith('http://127.0.0.1:5173/') && !url.startsWith('data:')) }, null, 2))
  await evaluar(`(async()=>{const {almacen}=await import('/src/domain/almacen.js');almacen.reiniciar();location.hash='/'})()`)
  await cdp.enviar('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false })
  console.log(`Completadas ${log.length} comprobaciones de interfaz.`)
} catch(e) { console.error(e); await capturar('error-interfaz'); process.exitCode=1 }
finally { cdp.cerrar() }
