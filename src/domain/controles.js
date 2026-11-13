import { almacen, exigirSesion, actividad } from './almacen.js'
import { ASIENTOS, AEROPUERTOS, PERFILES, SERVICIOS, fechaLocal } from './datos.js'
import { Sesion, Reservacion, PaseAbordar } from './modelos.js'
import { RepositorioUsuarios, RepositorioVuelos, RepositorioReservas } from './repositorios.js'
import { ServidorPago, ServidorCorreo, ServidorMigracion } from './servicios.js'

export class ControlRegistro {
  erroresValidacion = []
  registroValido = false
  validarCamposObligatorios(datos) { return ['nombre', 'apellido', 'direccion', 'telefono', 'correo', 'contrasena'].filter(k => !datos[k]?.trim()) }
  validarContrasena(contrasena) { return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(contrasena) }
  marcarDatosValidos() { this.registroValido = true }
  procesarRegistro(datos, perfil) {
    this.erroresValidacion = []
    const faltantes = this.validarCamposObligatorios(datos)
    if (faltantes.length) this.erroresValidacion.push('Completa todos los campos obligatorios.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo || '')) this.erroresValidacion.push('Introduce un correo electrónico válido.')
    if (!/^[+\d\s()-]{7,20}$/.test(datos.telefono || '')) this.erroresValidacion.push('Introduce un teléfono válido.')
    if (!this.validarContrasena(datos.contrasena || '')) this.erroresValidacion.push('La contraseña debe tener al menos 8 caracteres, una letra y un número.')
    if (!PERFILES[perfil]) this.erroresValidacion.push('Selecciona un perfil válido.')
    if (perfil === 'corporativo' && !datos.nombreCompania?.trim()) this.erroresValidacion.push('Indica el nombre de tu compañía.')
    if (new RepositorioUsuarios().correoRegistrado(datos.correo || '')) this.erroresValidacion.push('Este correo electrónico ya está registrado.')
    if (this.erroresValidacion.length) throw new Error(this.erroresValidacion.join(' '))
    this.marcarDatosValidos()
    return new RepositorioUsuarios().guardarCuenta({ ...datos, correo: datos.correo.trim().toLowerCase(), nombre: datos.nombre.trim(), apellido: datos.apellido.trim() }, perfil)
  }
}
export class ControlLogin {
  intentosFallidos = 0
  autenticado = false
  validarCamposObligatorios(correo, contrasena) { return [!correo?.trim() && 'correo', !contrasena && 'contrasena'].filter(Boolean) }
  procesarLogin(correo, contrasena) {
    if (this.validarCamposObligatorios(correo, contrasena).length) throw new Error('Completa tu correo y contraseña.')
    const repositorio = new RepositorioUsuarios()
    const cuenta = repositorio.buscarUsuarioPorCorreo(correo)
    if (!cuenta) { this.intentosFallidos++; throw new Error('Este usuario no está registrado. Crea una cuenta para continuar.') }
    if (!repositorio.verificarContrasena(correo, contrasena)) { this.intentosFallidos++; throw new Error('Las credenciales son incorrectas. Vuelve a intentarlo.') }
    this.correoValidado = cuenta.correo; this.contrasenaValidada = true; this.autenticado = true
    this.crearSesion(cuenta)
    return true
  }
  iniciarSesion(...args) { return this.procesarLogin(...args) }
  verificarTipoCuenta(id) { return almacen.obtener().usuarios.find(u => u.idUsuario === id)?.perfil }
  crearSesion(cuenta) { const sesion = new Sesion(cuenta); almacen.actualizar(s => { s.sesion = { ...sesion } }); return sesion }
  permitirReintento() { this.autenticado = false }
  cerrarSesion() { almacen.actualizar(s => { s.sesion = null }) }
}
export class ControlConsulta {
  criteriosValidos = false
  validarCamposObligatorios(destino, fecha) { return !!destino && !!fecha }
  evaluarCoincidencias(vuelos) { return vuelos.length > 0 }
  procesarBusqueda(criterios) {
    this.criteriosValidos = this.validarCamposObligatorios(criterios.destino, criterios.fecha)
    if (!this.criteriosValidos) throw new Error('Selecciona el destino y la fecha de salida.')
    if (!/^\d{4}-\d{2}-\d{2}$/.test(criterios.fecha) || !Number.isFinite(new Date(`${criterios.fecha}T12:00:00-04:00`).getTime())) throw new Error('Introduce una fecha de salida válida.')
    if (criterios.fecha < fechaLocal(almacen.ahora())) throw new Error('La fecha de salida no puede estar en el pasado.')
    if (!AEROPUERTOS.some(a => a.codigo === criterios.destino) || (criterios.origen && !AEROPUERTOS.some(a => a.codigo === criterios.origen))) throw new Error('Selecciona aeropuertos válidos.')
    if (criterios.horaPartida && !/^([01]\d|2[0-3]):[0-5]\d$/.test(criterios.horaPartida)) throw new Error('Introduce una hora de partida válida.')
    if (criterios.origen === criterios.destino) throw new Error('El origen y el destino deben ser diferentes.')
    if (!Number.isInteger(Number(criterios.pasajeros)) || Number(criterios.pasajeros) < 1 || Number(criterios.pasajeros) > 4) throw new Error('Puedes reservar de 1 a 4 pasajeros por operación.')
    return new RepositorioVuelos().consultarVuelos(criterios.destino, criterios.horaPartida, criterios)
  }
}
export class ControlReserva {
  montoTotalCalculado = 0
  estadoTransaccion = 'PENDIENTE'
  codigoPNRGenerado = ''
  servicios = []
  procesarBusqueda(criterios) { return new ControlConsulta().procesarBusqueda(criterios) }
  validarDisponibilidadAsiento(asientoId, vueloId) { return ASIENTOS.includes(asientoId) && !new RepositorioVuelos().obtenerVuelo(vueloId).asientosOcupados.includes(asientoId) }
  asociarServiciosAdicionales(servicios) { this.servicios = servicios; return servicios }
  solicitarDescuentoMillas(vuelo, cantidad, clase = 'economica') {
    const cuenta = exigirSesion(['minorista', 'corporativo'])
    const base = vuelo.tarifa * (clase === 'ejecutiva' ? 1.7 : 1) * cantidad
    const descuento = cuenta.perfil === 'corporativo' ? Math.max(0, Math.min(Math.floor(cuenta.millas / 1000), Math.floor(base * 0.3 / 10))) * 10 : 0
    return { descuento, millas: descuento * 100 }
  }
  calcularResumen(vueloId, cantidad, servicios = [], usarMillas = false, clase = 'economica') {
    const vuelo = new RepositorioVuelos().obtenerVuelo(vueloId)
    const base = Math.round(vuelo.tarifa * (clase === 'ejecutiva' ? 1.7 : 1) * cantidad * 100) / 100
    const impuestos = 24 * cantidad
    const adicionales = SERVICIOS.filter(s => servicios.includes(s.id)).reduce((total, s) => total + s.precio * cantidad, 0)
    const beneficio = usarMillas ? this.solicitarDescuentoMillas(vuelo, cantidad, clase) : { descuento: 0, millas: 0 }
    const total = Math.round((base + impuestos + adicionales - beneficio.descuento) * 100) / 100
    this.montoTotalCalculado = total
    return { base, impuestos, adicionales, ...beneficio, total }
  }
  procesarCobro(datosTarjeta, monto) { const pago = new ServidorPago(); if (!pago.procesarCobro(datosTarjeta, monto)) throw new Error(pago.retornarCodigoRechazo()); return true }
  generarCodigoPNR() {
    const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let codigo
    do { codigo = Array.from(crypto.getRandomValues(new Uint8Array(6)), n => letras[n % letras.length]).join('') } while (almacen.obtener().reservas.some(r => r.codigoPNR === codigo))
    this.codigoPNRGenerado = codigo; return codigo
  }
  liberarBloqueoAsiento() { this.estadoTransaccion = 'PENDIENTE' }
  confirmarReserva(datosPago, solicitud) {
    const cuenta = exigirSesion(['minorista', 'corporativo'])
    const vuelo = new RepositorioVuelos().obtenerVuelo(solicitud.vueloId)
    if (vuelo.estado === 'Cancelado' || new Date(vuelo.horaPartida) <= almacen.ahora()) throw new Error('Este vuelo ya no está disponible.')
    if (!['economica', 'ejecutiva'].includes(solicitud.clase)) throw new Error('Selecciona una clase válida.')
    const pasajeros = solicitud.pasajeros
    if (!Array.isArray(pasajeros) || pasajeros.length < 1 || pasajeros.length > 4) throw new Error('Indica de 1 a 4 pasajeros.')
    if (pasajeros.some(p => !p.nombre?.trim() || !p.apellido?.trim() || !/^[\w-]{6,20}$/.test(p.documento || ''))) throw new Error('Completa el nombre, apellido y documento de cada pasajero (6 a 20 caracteres).')
    const asientos = pasajeros.map(p => p.asiento)
    if (new Set(asientos).size !== pasajeros.length || asientos.some(a => !this.validarDisponibilidadAsiento(a, vuelo.idVuelo))) throw new Error('Selecciona un asiento disponible y diferente para cada pasajero.')
    const servicios = [...new Set(solicitud.servicios || [])].filter(id => SERVICIOS.some(s => s.id === id))
    this.asociarServiciosAdicionales(servicios)
    const resumen = this.calcularResumen(vuelo.idVuelo, pasajeros.length, servicios, solicitud.usarMillas, solicitud.clase)
    this.procesarCobro(datosPago, resumen.total)
    const reserva = new Reservacion({ codigoPNR: this.generarCodigoPNR(), pasajeros, asientos, asientoAsignado: asientos.join(', '),
      nombrePasajero: pasajeros[0].nombre.trim(), apellidoPasajero: pasajeros[0].apellido.trim(), numeroVuelo: vuelo.numeroVuelo,
      fechaHoraAbordaje: new Date(new Date(vuelo.horaPartida).getTime() - 1800000).toISOString(), montoTotal: resumen.total,
      resumen, fechaReserva: almacen.ahora().toISOString(), clase: solicitud.clase, millasGanadas: cuenta.perfil === 'corporativo' ? vuelo.millas * pasajeros.length : 0,
      pagoReferencia: `SIM-${crypto.randomUUID().slice(0, 8)}` })
    reserva.crearReserva(vuelo.idVuelo, cuenta.idUsuario); reserva.descontarMillas(resumen.millas); reserva.asociarServicios(servicios)
    // Una única mutación publica reserva, ocupación y saldo de fidelización juntos.
    almacen.actualizar(s => {
      const v = s.vuelos.find(v => v.idVuelo === vuelo.idVuelo)
      if (asientos.some(a => v.asientosOcupados.includes(a))) throw new Error('El asiento ya no está disponible.')
      v.asientosOcupados.push(...asientos); v.disponibilidadAsientos = v.capacidad - v.asientosOcupados.length
      s.reservas.push({ ...reserva })
      const u = s.usuarios.find(u => u.idUsuario === cuenta.idUsuario)
      u.millas += reserva.millasGanadas - reserva.millasDescontadas
      actividad(s, `Reservación ${reserva.codigoPNR} confirmada: ${vuelo.numeroVuelo}.`)
    })
    this.estadoTransaccion = 'CONFIRMADA'
    new ServidorCorreo().enviarComprobanteReserva(cuenta.correo, reserva.codigoPNR)
    return reserva
  }
}
export class ControlCancelacion {
  Monto_Reembolso_Calculado = 0
  Fecha_Y_Plazo = ''
  VerificarFechaYPlazo(reserva) {
    const antiguedad = almacen.ahora() - new Date(reserva.fechaReserva)
    this.Fecha_Y_Plazo = new Date(new Date(reserva.fechaReserva).getTime() + 7 * 86400000).toISOString()
    return antiguedad >= 0 && antiguedad <= 7 * 86400000 && new Date(reserva.fechaHoraAbordaje) > almacen.ahora()
  }
  CalcularReembolso(monto) { this.Monto_Reembolso_Calculado = Math.round(monto * 80) / 100; return this.Monto_Reembolso_Calculado }
  CancelarReservacion(codigo, motivo = '') {
    const cuenta = exigirSesion(['minorista', 'corporativo'])
    const reserva = new RepositorioReservas().buscarReservacion(codigo)
    if (reserva.estadoReserva !== 'CONFIRMADA') throw new Error('Esta reservación ya está cancelada.')
    if (!this.VerificarFechaYPlazo(reserva)) throw new Error('No se puede cancelar: han transcurrido más de siete días o el abordaje ya comenzó.')
    if (!motivo.trim()) throw new Error('Indica el motivo de la cancelación.')
    const reembolso = this.CalcularReembolso(reserva.montoTotal)
    if (!new ServidorPago().ProcesarDevolucion(reserva.pagoReferencia, reembolso)) throw new Error('No se pudo completar el reembolso.')
    almacen.actualizar(s => {
      const r = s.reservas.find(r => r.codigoPNR === codigo)
      Object.assign(r, { estadoReserva: 'CANCELADA', reembolso, motivoCancelacion: motivo, fechaCancelacion: almacen.ahora().toISOString(), paseAbordar: null, estadoCheckIn: 'PENDIENTE' })
      const vuelo = s.vuelos.find(v => v.idVuelo === reserva.vueloId)
      vuelo.asientosOcupados = vuelo.asientosOcupados.filter(a => !reserva.asientos.includes(a)); vuelo.disponibilidadAsientos = vuelo.capacidad - vuelo.asientosOcupados.length
      const u = s.usuarios.find(u => u.idUsuario === cuenta.idUsuario)
      u.millas = Math.max(0, u.millas - reserva.millasGanadas) + reserva.millasDescontadas
      actividad(s, `Reservación ${codigo} cancelada. Reembolso: US$ ${reembolso.toFixed(2)}.`)
    })
    new ServidorCorreo().EnviarComprobanteCancelacion(cuenta.correo, codigo)
    return reembolso
  }
}
export class ControlActualizarVuelo {
  validarInformacion(datos) {
    if (!Number.isFinite(Number(datos.tarifa)) || Number(datos.tarifa) < 1) throw new Error('La tarifa debe ser un número mayor que cero.')
    if (!datos.puerta?.trim()) throw new Error('Indica la puerta de abordaje.')
    if (!['Programado', 'Retrasado', 'Cancelado'].includes(datos.estado)) throw new Error('El estado del vuelo no es válido.')
    if (!Number.isFinite(new Date(datos.horaPartida).getTime()) || new Date(datos.horaPartida) <= almacen.ahora()) throw new Error('La salida debe ser una fecha y hora futuras.')
    return true
  }
  verificarClientesAfectados(id) { return new ServidorCorreo().obtenerClientesAfectados(id) }
  GuardarCambios(id, datos) {
    exigirSesion(['agente']); this.validarInformacion(datos)
    const vuelo = new RepositorioVuelos().obtenerVuelo(id)
    const cambioHorario = new Date(vuelo.horaPartida).getTime() !== new Date(datos.horaPartida).getTime()
    almacen.actualizar(s => {
      const v = s.vuelos.find(v => v.idVuelo === id)
      Object.assign(v, { ...datos, tarifa: Number(datos.tarifa), horaLlegada: new Date(new Date(datos.horaPartida).getTime() + vuelo.duracion * 60000).toISOString() })
      s.reservas.filter(r => r.vueloId === id && r.estadoReserva === 'CONFIRMADA').forEach(r => {
        r.fechaHoraAbordaje = new Date(new Date(datos.horaPartida).getTime() - 1800000).toISOString()
        if (cambioHorario || vuelo.puerta !== datos.puerta || datos.estado === 'Cancelado') { r.estadoCheckIn = 'PENDIENTE'; r.paseAbordar = null }
      })
      actividad(s, `El agente actualizó el vuelo ${vuelo.numeroVuelo}: ${datos.estado}.`)
    })
    return new ServidorCorreo().enviarNotificacionActualizacion(id)
  }
  ValidarInformación(datos) { return this.validarInformacion(datos) }
  VerificarClientesAfectados(id) { return this.verificarClientesAfectados(id) }
}
export class ControlCheckIn {
  mensajeError = ''
  resultadoValidacionMigratoria = ''
  checkInCompletado = false
  verificarPlazo(reservacion) { const horas = (new Date(reservacion.fechaHoraAbordaje) - almacen.ahora()) / 3600000; return horas >= 2 && horas <= 5 }
  verificarEstadoCheckIn(reservacion) { return reservacion.estadoCheckIn === 'COMPLETADO' }
  detectarTimeOut() { return this.resultadoValidacionMigratoria === 'TIMEOUT' }
  verificarResultadoMigratorio(resultado) { return resultado === 'APROBADA' }
  generarPaseAbordar(reserva) {
    const vuelo = new RepositorioVuelos().obtenerVuelo(reserva.vueloId)
    return new PaseAbordar({ codigoPase: `BP-${reserva.codigoPNR}`, codigoReservacion: reserva.codigoPNR, nombrePasajero: reserva.nombrePasajero,
      apellidoPasajero: reserva.apellidoPasajero, pasajeros: reserva.pasajeros, numeroVuelo: reserva.numeroVuelo,
      asiento: reserva.asientoAsignado, fechaHoraAbordaje: reserva.fechaHoraAbordaje, origen: vuelo.origen, destino: vuelo.destino, puerta: vuelo.puerta })
  }
  completarCheckIn(reserva) {
    const pase = this.generarPaseAbordar(reserva)
    almacen.actualizar(s => { Object.assign(s.reservas.find(r => r.codigoPNR === reserva.codigoPNR), { estadoCheckIn: 'COMPLETADO', paseAbordar: { ...pase } }); actividad(s, `Check-in completado: ${reserva.codigoPNR}.`) })
    this.checkInCompletado = true
    return pase
  }
  procesarCheckIn(codigo, apellido) {
    exigirSesion(['minorista', 'corporativo'])
    if (!codigo.trim() || !apellido.trim()) throw new Error('Completa el código de reservación y el apellido del primer pasajero.')
    const reserva = new RepositorioReservas().buscarReservacion(codigo, apellido)
    if (reserva.estadoReserva !== 'CONFIRMADA') throw new Error('Esta reservación está cancelada.')
    if (new RepositorioVuelos().obtenerVuelo(reserva.vueloId).estado === 'Cancelado') throw new Error('Este vuelo está cancelado. No es posible realizar el check-in.')
    if (this.verificarEstadoCheckIn(reserva)) return new RepositorioReservas().obtenerPaseAbordar(reserva)
    if (!this.verificarPlazo(reserva)) throw new Error('El check-in está disponible entre 2 y 5 horas antes del abordaje.')
    this.resultadoValidacionMigratoria = new ServidorMigracion().validarInformacion(reserva.pasajeros)
    if (this.detectarTimeOut()) throw new Error('El servicio de migración no está disponible. Inténtalo nuevamente.')
    if (!this.verificarResultadoMigratorio(this.resultadoValidacionMigratoria)) throw new Error('Migración no aprobó la validación. Revisa los documentos del pasajero.')
    return this.completarCheckIn(reserva)
  }
}

export const controles = { registro: new ControlRegistro(), login: new ControlLogin(), consulta: new ControlConsulta(), reserva: new ControlReserva(), cancelacion: new ControlCancelacion(), actualizacion: new ControlActualizarVuelo(), checkin: new ControlCheckIn() }
