import { almacen, exigirSesion } from './almacen.js'
import { CuentaUsuario, Vuelo, Reservacion } from './modelos.js'
import { fechaLocal, hora } from './datos.js'

export class RepositorioUsuarios {
  buscarUsuarioPorCorreo(correo) {
    this.correoConsultado = correo.trim().toLowerCase()
    const datos = almacen.obtener().usuarios.find(u => u.correo.toLowerCase() === this.correoConsultado)
    this.usuarioEncontrado = datos ? new CuentaUsuario(datos, datos.perfil) : null
    return this.usuarioEncontrado
  }
  verificarContrasena(correo, contrasena) { return this.buscarUsuarioPorCorreo(correo)?.validarContrasena(contrasena) || false }
  correoRegistrado(email) { return !!this.buscarUsuarioPorCorreo(email) }
  guardarCuenta(datos, perfil) {
    if (this.correoRegistrado(datos.correo)) throw new Error('Este correo electrónico ya está registrado.')
    const cuenta = new CuentaUsuario(datos, perfil)
    almacen.actualizar(s => s.usuarios.push({ ...cuenta }))
    return cuenta
  }
}
export class RepositorioVuelos {
  cadenaConexion = 'localStorage://logica404-prototipo-v1'
  consultarVuelos(destino, horaPartida, criterios = {}) {
    const ahora = almacen.ahora().getTime()
    return almacen.obtener().vuelos.filter(v => (!destino || v.destino === destino) && (!criterios.origen || v.origen === criterios.origen)
      && (!criterios.fecha || fechaLocal(v.horaPartida) === criterios.fecha) && (!horaPartida || hora(v.horaPartida) === horaPartida)
      && v.estado !== 'Cancelado' && new Date(v.horaPartida).getTime() > ahora
      && v.disponibilidadAsientos >= Number(criterios.pasajeros || 1)).map(v => new Vuelo(v))
  }
  obtenerVuelo(id) { const vuelo = almacen.obtener().vuelos.find(v => v.idVuelo === id); if (!vuelo) throw new Error('Vuelo no encontrado.'); return new Vuelo(vuelo) }
  actualizarVuelo(id, datos) { exigirSesion(['agente']); almacen.actualizar(s => { const vuelo = s.vuelos.find(v => v.idVuelo === id); if (!vuelo) throw new Error('Vuelo no encontrado.'); Object.assign(vuelo, datos) }) }
}
export class RepositorioReservas {
  cadenaConexion = 'localStorage://logica404-prototipo-v1'
  consultarVuelosDisponibles(criterios) { return new RepositorioVuelos().consultarVuelos(criterios.destino, criterios.horaPartida, criterios) }
  guardarReservacion(reserva) { almacen.actualizar(s => s.reservas.push({ ...reserva })); return true }
  consultarReservaciones() { const u = exigirSesion(); return almacen.obtener().reservas.filter(r => r.clienteId === u.idUsuario).map(r => new Reservacion(r)) }
  buscarReservacion(codigo, apellido) {
    const u = exigirSesion()
    const reserva = almacen.obtener().reservas.find(r => r.codigoPNR === codigo.trim().toUpperCase() && r.clienteId === u.idUsuario
      && (!apellido || r.apellidoPasajero.toLocaleLowerCase() === apellido.trim().toLocaleLowerCase()))
    if (!reserva) throw new Error('No encontramos una reservación con ese código y apellido en tu cuenta.')
    return new Reservacion(reserva)
  }
  ActualizarReservacion(reserva) { almacen.actualizar(s => { const i = s.reservas.findIndex(r => r.codigoPNR === reserva.codigoPNR); if (i < 0) throw new Error('Reservación inexistente.'); s.reservas[i] = { ...reserva } }) }
  registrarCheckIn(reserva) { this.ActualizarReservacion({ ...reserva, estadoCheckIn: 'COMPLETADO' }) }
  obtenerPaseAbordar(reserva) { return this.buscarReservacion(reserva.codigoPNR).paseAbordar }
  guardarPaseAbordar(pase) { const reserva = this.buscarReservacion(pase.codigoReservacion); this.ActualizarReservacion({ ...reserva, paseAbordar: pase }) }
}
