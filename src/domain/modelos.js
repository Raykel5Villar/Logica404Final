export class CuentaUsuario {
  constructor(datos, perfil) {
    Object.assign(this, { idUsuario: crypto.randomUUID(), millas: 0, nombreCompania: '' }, datos, { perfil, tipoCuenta: perfil, nombreUsuario: datos.correo })
  }
  getTipoCuenta() { return this.perfil }
  validarContrasena(contrasena) { return this.contrasena === contrasena }
}
export class Sesion {
  constructor(cuenta) { if (cuenta) this.crearSesion(cuenta) }
  crearSesion(cuenta) { Object.assign(this, { idSesion: crypto.randomUUID(), cuentaUsuario: cuenta.idUsuario, estadoSesion: true, fechaInicio: new Date().toISOString() }); return this }
  getEstado() { return this.estadoSesion }
  cerrarSesion() { this.estadoSesion = false }
}
export class CriterioBusqueda {
  constructor(datos = {}) { Object.assign(this, { destinoFiltro: '', horaPartidaFiltro: '' }, datos); this.destinoFiltro = datos.destino || datos.destinoFiltro; this.horaPartidaFiltro = datos.horaPartida || datos.horaPartidaFiltro }
}
export { CriterioBusqueda as CriteriosBusqueda }
export class Vuelo { constructor(datos) { Object.assign(this, datos) } }
export class Reservacion {
  constructor(datos = {}) { Object.assign(this, { estadoReserva: 'CONFIRMADA', millasDescontadas: 0, estadoCheckIn: 'PENDIENTE', servicios: [] }, datos) }
  crearReserva(vueloId, clienteId) { this.vueloId = vueloId; this.clienteId = clienteId; return this }
  descontarMillas(millas) { this.millasDescontadas = millas }
  asociarServicios(servicios) { this.servicios = servicios }
  getPNR() { return this.codigoPNR }
  getEstado() { return this.estadoReserva }
}
export class PaseAbordar { constructor(datos) { Object.assign(this, datos, { fechaEmision: new Date().toISOString() }) } }
