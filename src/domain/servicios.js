import { almacen, actividad } from './almacen.js'

/** Adaptadores locales: no realizan peticiones de red. Nunca conservan datos de tarjeta. */
export class ServidorPago {
  endpointAPI = 'simulacion-local'
  tokenAutorizacion = 'demo'
  codigoRechazo = ''
  confirmacion = false
  procesarCobro(datos, monto) {
    this.codigoRechazo = ''
    const numero = (datos.numero || '').replace(/\s/g, '')
    const fecha = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(datos.vencimiento || '')
    if (!/^\d{16}$/.test(numero) || !/^\d{3,4}$/.test(datos.cvv || '') || !datos.titular?.trim() || !fecha) {
      this.codigoRechazo = 'Revisa el titular, los 16 dígitos, el vencimiento MM/AA y el CVV.'
    } else if (new Date(2000 + Number(fecha[2]), Number(fecha[1]), 1).getTime() <= almacen.ahora().getTime()) {
      this.codigoRechazo = 'La tarjeta está vencida.'
    } else if (almacen.obtener().configuracion.pago === 'rechazado' || numero === '4000000000000002') {
      this.codigoRechazo = 'Pago rechazado por fondos insuficientes. Intenta con otra tarjeta.'
    } else if (!Number.isFinite(monto) || monto < 0) this.codigoRechazo = 'El importe no es válido.'
    this.confirmacion = !this.codigoRechazo
    return this.confirmacion
  }
  retornarCodigoRechazo() { return this.codigoRechazo }
  retornarConfirmacion() { return this.confirmacion }
  ProcesarDevolucion(_referencia, monto) {
    if (almacen.obtener().configuracion.pago === 'rechazado') throw new Error('No se pudo procesar la devolución. Tu reservación permanece confirmada; puedes reintentar.')
    return Number.isFinite(monto) && monto >= 0
  }
  ProcesarDevolución(...args) { return this.ProcesarDevolucion(...args) }
}
export class ServidorCorreo {
  servidorSMTP = 'bandeja-local'
  enviar(para, clienteId, asunto, contenido) {
    almacen.actualizar(s => s.mensajes.unshift({ id: crypto.randomUUID(), para, clienteId, asunto, contenido, fecha: almacen.ahora().toISOString(), leido: false,
      estado: s.configuracion.correo === 'disponible' ? 'Entregado' : 'Pendiente' }))
    return almacen.obtener().configuracion.correo === 'disponible'
  }
  enviarComprobanteReserva(email, PNR) { const r = almacen.obtener().reservas.find(r => r.codigoPNR === PNR); return this.enviar(email, r.clienteId, `Reservación confirmada · ${PNR}`, `Tu reservación ${PNR} está confirmada. Vuelo ${r.numeroVuelo}, asientos ${r.asientos.join(', ')}. Total pagado: US$ ${r.montoTotal.toFixed(2)}. Encontrarás tu itinerario en Mis viajes.`) }
  EnviarComprobanteCancelacion(email, PNR) { const r = almacen.obtener().reservas.find(r => r.codigoPNR === PNR); return this.enviar(email, r.clienteId, `Reservación cancelada · ${PNR}`, `Cancelamos tu reservación ${PNR}. Reembolso simulado del 80 %: US$ ${r.reembolso.toFixed(2)}. El asiento está disponible nuevamente.`) }
  EnviarComprobanteCancelación(...args) { return this.EnviarComprobanteCancelacion(...args) }
  obtenerClientesAfectados(vueloId) { return almacen.obtener().reservas.filter(r => r.vueloId === vueloId && r.estadoReserva === 'CONFIRMADA') }
  enviarNotificacionActualizacion(vueloId) { const reservas = this.obtenerClientesAfectados(vueloId); reservas.forEach(r => { const u = almacen.obtener().usuarios.find(u => u.idUsuario === r.clienteId); this.enviar(u.correo, u.idUsuario, `Actualización de tu vuelo · ${r.codigoPNR}`, `La información del vuelo ${r.numeroVuelo} ha cambiado. Consulta el horario, estado y puerta actualizados en Mis viajes. Si realizaste check-in, genera de nuevo el pase de abordar.`) }); return reservas.length }
  ObtenerClientesAfectados(vueloId) { return this.obtenerClientesAfectados(vueloId) }
  EnviarNotificaciónActualización(vueloId) { return this.enviarNotificacionActualizacion(vueloId) }
  reintentarPendientes() { almacen.actualizar(s => { if (s.configuracion.correo !== 'disponible') throw new Error('El servicio de correo sigue sin estar disponible.'); s.mensajes.forEach(m => { if (m.estado === 'Pendiente') m.estado = 'Entregado' }); actividad(s, 'Se reenviaron los correos pendientes.') }) }
}
export class ServidorMigracion {
  validarInformacion(pasajeros) {
    const escenario = almacen.obtener().configuracion.migracion
    if (escenario === 'no-disponible') return 'TIMEOUT'
    if (escenario === 'rechazada' || pasajeros.some(p => !/^[\w-]{6,20}$/.test(p.documento))) return 'RECHAZADA'
    return 'APROBADA'
  }
}
