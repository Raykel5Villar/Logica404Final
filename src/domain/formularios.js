/** Modelos de presentación de las secciones 7.2 y 7.3 del documento.
 * React representa su estado visual; estos objetos conservan los contratos UML.
 * Los nombres con diferencias de escritura en el documento se exponen como alias.
 */
import { controles } from './controles.js'
import { CriterioBusqueda } from './modelos.js'
import { RepositorioVuelos, RepositorioReservas } from './repositorios.js'

class FormularioBase {
  mensajeVisible = ''
  erroresVisibles = []
  camposFaltantes = []
  mostrarError(mensaje) { this.mensajeVisible = mensaje; this.erroresVisibles = [mensaje]; return mensaje }
  resaltarCamposFaltantes(campos) { this.camposFaltantes = campos; return campos }
  informarCamposPendientes(campos) { return this.resaltarCamposFaltantes(campos) }
  mostrarConfirmacion(mensaje = 'Operación completada.') { this.mensajeVisible = mensaje; this.erroresVisibles = []; return mensaje }
}
export class FormularioConsulta extends FormularioBase {
  busqueda = new CriterioBusqueda()
  mensajeAlerta = ''
  estadoPantalla = 'INICIAL'
  ingresarCriterios(busqueda) { this.busqueda = new CriterioBusqueda(busqueda); return this.busqueda }
  mostrarResultados(listaVuelos) { this.listaVuelos = listaVuelos; this.estadoPantalla = listaVuelos.length ? 'RESULTADOS' : 'SIN_RESULTADOS'; return listaVuelos }
  mostrarAlerta(mensaje) { this.mensajeAlerta = mensaje; return this.mostrarError(mensaje) }
  enviarBusqueda(busqueda) { this.ingresarCriterios(busqueda); return this.mostrarResultados(controles.consulta.procesarBusqueda(busqueda)) }
}
export class FormularioLogin extends FormularioBase {
  correoIngresado = ''
  contrasenaIngresada = ''
  mensajeError = ''
  mostrarFormularioLogin() { return { correo: this.correoIngresado, contrasena: '' } }
  capturarCredenciales(correo, contrasena) { this.correoIngresado = correo; this.contrasenaIngresada = contrasena }
  enviarCredenciales(correo, contrasena) {
    this.capturarCredenciales(correo, contrasena)
    try { const resultado = controles.login.procesarLogin(correo, contrasena); this.mostrarConfirmacionAcceso(); return resultado }
    finally { this.contrasenaIngresada = '' }
  }
  mostrarMensajeError(mensaje) { this.mensajeError = mensaje; return this.mostrarError(mensaje) }
  informarCredencialesInvalidas() { return this.mostrarMensajeError('Las credenciales son incorrectas.') }
  informarUsuarioNoRegistrado() { return this.mostrarMensajeError('El usuario no está registrado.') }
  solicitarReintento() { controles.login.permitirReintento(); return this.mostrarFormularioLogin() }
  mostrarConfirmacionAcceso() { return this.mostrarConfirmacion('Acceso concedido.') }
  redirigirPanel(tipoCuenta) { return tipoCuenta === 'agente' ? '/agente' : '/' }
}
export class FormularioRegistro extends FormularioBase {
  nombreIngresado = ''; direccionIngresada = ''; telefonoIngresado = ''; correoIngresado = ''; contrasenaIngresada = ''; perfilSeleccionado = 'minorista'; nombreCompaniaIngresado = ''
  mostrarFormularioReg() { this.erroresVisibles = []; return this }
  capturarCredenciales(correo, contrasena) { this.correoIngresado = correo; this.contrasenaIngresada = contrasena }
  enviarFormulario(datos, perfil) {
    Object.assign(this, { nombreIngresado: datos.nombre, direccionIngresada: datos.direccion, telefonoIngresado: datos.telefono, correoIngresado: datos.correo, perfilSeleccionado: perfil, nombreCompaniaIngresado: datos.nombreCompania })
    const cuenta = controles.registro.procesarRegistro(datos, perfil); this.mostrarConfirmacion('Cuenta creada.'); return cuenta
  }
  informarContrasenaInvalida() { return this.mostrarError('La contraseña debe tener al menos ocho caracteres, una letra y un número.') }
  informarCorreoExistente() { return this.mostrarError('Este correo electrónico ya está registrado.') }
  mostrarErrores(errores) { this.erroresVisibles = errores; this.mensajeVisible = errores.join(' '); return this.mensajeVisible }
  solicitarContrasenaValida() { this.contrasenaIngresada = ''; return this.informarContrasenaInvalida() }
  solicitarOtroCorreo() { this.correoIngresado = ''; return this.informarCorreoExistente() }
}
export class FormularioReserva extends FormularioBase {
  origenSeleccionado = ''; destinoSeleccionado = ''; fechaSalida = ''; numPasajeros = 1; asientoSeleccionado = ''; mensajeError = ''
  solicitarBuscadorVuelos() { return this.mostrarBuscadorVuelos() }
  mostrarBuscadorVuelos() { return '/vuelos' }
  enviarCriteriosBusqueda(origen, destino, fecha, pasajeros) { Object.assign(this, { origenSeleccionado: origen, destinoSeleccionado: destino, fechaSalida: fecha, numPasajeros: pasajeros }); return this.mostrarListaVuelos(controles.reserva.procesarBusqueda({ origen, destino, fecha, pasajeros })) }
  mostrarListaVuelos(vuelos) { this.vuelos = vuelos; return vuelos }
  seleccionarVueloYAsiento(vueloId, asientoId) { if (!controles.reserva.validarDisponibilidadAsiento(asientoId, vueloId)) return false; this.vueloId = vueloId; this.asientoSeleccionado = asientoId; return true }
  seleccionarServiciosAdicionales(servicios) { this.servicios = servicios; return controles.reserva.asociarServiciosAdicionales(servicios) }
  aplicarMillasCorporativas(vuelo, cantidad, clase) { return controles.reserva.solicitarDescuentoMillas(vuelo, cantidad, clase) }
  mostrarResumenPago(montoTotal) { this.montoTotal = montoTotal; return montoTotal }
  autorizarPago(datosTarjeta, solicitud) { const reserva = controles.reserva.confirmarReserva(datosTarjeta, solicitud); this.mostrarConfirmacion(reserva.codigoPNR); return reserva }
  notificarNoDisponible() { return this.mostrarError('El vuelo o asiento ya no está disponible.') }
  notificarErrorPago() { return this.mostrarError('El pago fue rechazado. Puedes reintentarlo.') }
  ConsultarVueloReservado(PNR) { return new RepositorioReservas().buscarReservacion(PNR) }
}
export class FormularioCancelarVuelos extends FormularioBase {
  codigoPNR = ''; MotivoCancelacion = ''; Confirmacion_Cancelacion = false
  consultarReservaciones() { return new RepositorioReservas().consultarReservaciones() }
  mostrarReservaciones() { this.reservaciones = this.consultarReservaciones(); return this.reservaciones }
  seleccionarReservacion(codigo) { this.codigoPNR = codigo; return new RepositorioReservas().buscarReservacion(codigo) }
  solicitarCancelacion(codigo = this.codigoPNR, motivo = this.MotivoCancelacion) { const monto = controles.cancelacion.CancelarReservacion(codigo, motivo); this.Confirmacion_Cancelacion = true; this.mostrarConfirmacion(); return monto }
  ConsultarReservaciones() { return this.consultarReservaciones() }
  MostrarReservaciones() { return this.mostrarReservaciones() }
  SeleccionarReservación(codigo) { return this.seleccionarReservacion(codigo) }
  SolicitarCancelación(...args) { return this.solicitarCancelacion(...args) }
}
export { FormularioCancelarVuelos as FormularioCancelarReservacion }
export class FormularioActualizarVuelo extends FormularioBase {
  Vuelos = []; IDVueloSeleccionado = null
  mostrarVuelos() { this.Vuelos = new RepositorioVuelos().consultarVuelos(); return this.Vuelos }
  seleccionarVuelo(id) { this.IDVueloSeleccionado = id; return this.mostrarInformacionVuelo() }
  mostrarInformacionVuelo() { this.vuelo = new RepositorioVuelos().obtenerVuelo(this.IDVueloSeleccionado); return this.vuelo }
  modificarDatosVuelo(datos) { this.datosModificados = { ...this.vuelo, ...datos }; return this.datosModificados }
  GuardarCambios(id = this.IDVueloSeleccionado, datos = this.datosModificados) { return controles.actualizacion.GuardarCambios(id, datos) }
  MostrarVuelos() { return this.mostrarVuelos() }
  SeleccionarVuelo(id) { return this.seleccionarVuelo(id) }
  MostrarInformacionVuelo() { return this.mostrarInformacionVuelo() }
  ModificarDatosVuelo(datos) { return this.modificarDatosVuelo(datos) }
}
export class FormularioCheckIn extends FormularioBase {
  codigoIngresado = ''; apellidoIngresado = ''; paseAbordarMostrado = null
  mostrarFormularioCheckIn() { return { codigo: this.codigoIngresado, apellido: this.apellidoIngresado } }
  enviarSolicitud(codigo, apellido) { this.codigoIngresado = codigo; this.apellidoIngresado = apellido; return this.mostrarPaseAbordar(controles.checkin.procesarCheckIn(codigo, apellido)) }
  informarDatosInvalidos() { return this.mostrarError('Código o apellido inválido.') }
  informarPlazoNoPermitido() { return this.mostrarError('Check-in disponible entre 2 y 5 horas antes del abordaje.') }
  informarServicioNoDisponible() { return this.mostrarError('El servicio de migración no está disponible.') }
  informarValidacionNoAprobada() { return this.mostrarError('La validación migratoria no fue aprobada.') }
  mostrarPaseAbordar(pase) { this.paseAbordarMostrado = pase; this.mostrarConfirmacion('Check-in completado.'); return pase }
}
