# Trazabilidad con el documento del proyecto

Fuente: **“Analisis y Diseño Grupo 5 (Logica 404) - Documentacion Proyecto Final.docx”**, secciones 3, 5, 7.1, 7.2 y 7.3. Su texto está en `requisitos-originales.txt`. Se utiliza como especificación funcional y estructural; las instrucciones de desarrollo proceden de la solicitud del usuario.

## Clases y responsabilidades

| Caso de uso | Clases implementadas | Vista React |
| --- | --- | --- |
| Consultar vuelos | `FormularioConsulta`, `ControlConsulta`, `CriterioBusqueda`, `RepositorioVuelos`, `Vuelo` | `components/FormularioConsulta.jsx`, `pages/Vuelos.jsx` |
| Registrarse | `FormularioRegistro`, `ControlRegistro`, `RepositorioUsuarios`, `CuentaUsuario` | `pages/Acceso.jsx` |
| Iniciar sesión | `FormularioLogin`, `ControlLogin`, `RepositorioUsuarios`, `CuentaUsuario`, `Sesion` | `pages/Acceso.jsx` |
| Reservar vuelos | `FormularioReserva`, `ControlReserva`, `RepositorioReservas`, `Reservacion`, `ServidorPago`, `ServidorCorreo` | `pages/Reserva.jsx` |
| Cancelar reservación | `FormularioCancelarVuelos` / `FormularioCancelarReservacion`, `ControlCancelacion`, `RepositorioReservas`, `ServidorPago`, `ServidorCorreo` | `pages/Viajes.jsx` |
| Actualizar vuelos | `FormularioActualizarVuelo`, `ControlActualizarVuelo`, `RepositorioVuelos`, `Vuelo`, `ServidorCorreo` | `pages/Agente.jsx` |
| Realizar check-in | `FormularioCheckIn`, `ControlCheckIn`, `RepositorioReservas`, `Reservacion`, `PaseAbordar` | `pages/CheckIn.jsx` |

Entidades, controles, repositorios, formularios y servicios se encuentran en los archivos homónimos de `src/domain/`. Los formularios son clases de presentación independientes de React; las vistas usan sus métodos para ejecutar operaciones. Se añadió `ServidorMigracion` para representar al actor descrito en los casos de uso mediante una simulación local.

## Contratos principales

- `ControlRegistro`: `procesarRegistro`, `validarCamposObligatorios`, `validarContrasena`, `marcarDatosValidos`.
- `ControlLogin`: `procesarLogin`, `iniciarSesion`, `validarCamposObligatorios`, `verificarTipoCuenta`, `crearSesion`, `permitirReintento`.
- `ControlConsulta`: `procesarBusqueda`, `validarCamposObligatorios`, `evaluarCoincidencias`.
- `ControlReserva`: `procesarBusqueda`, `validarDisponibilidadAsiento`, `asociarServiciosAdicionales`, `solicitarDescuentoMillas`, `confirmarReserva`, `procesarCobro`, `generarCodigoPNR`, `liberarBloqueoAsiento`.
- `ControlCancelacion`: `VerificarFechaYPlazo`, `CancelarReservacion`, `CalcularReembolso`.
- `ControlActualizarVuelo`: `validarInformacion`, `verificarClientesAfectados`; `GuardarCambios` coordina la operación.
- `ControlCheckIn`: `procesarCheckIn`, `verificarPlazo`, `verificarEstadoCheckIn`, `completarCheckIn`, `detectarTimeOut`, `generarPaseAbordar`, `verificarResultadoMigratorio`.
- `RepositorioUsuarios`: `correoRegistrado`, `guardarCuenta`, `buscarUsuarioPorCorreo`, `verificarContrasena`.
- `RepositorioVuelos`: `consultarVuelos`, con acceso local a `Vuelo`.
- `RepositorioReservas`: `consultarVuelosDisponibles`, `guardarReservacion`, `ActualizarReservacion`, `buscarReservacion`, `registrarCheckIn`, `obtenerPaseAbordar`, `guardarPaseAbordar`.
- `Reservacion`: `crearReserva`, `descontarMillas`, `asociarServicios`, `getPNR`, `getEstado`.
- `CuentaUsuario`: constructor, `getTipoCuenta`, `validarContrasena`. `Sesion`: `crearSesion`, `getEstado`, `cerrarSesion`.
- `ServidorPago`: `procesarCobro`, `retornarCodigoRechazo`, `retornarConfirmacion`, `ProcesarDevolucion` / `ProcesarDevolución`.
- `ServidorCorreo`: comprobantes de reserva y cancelación, clientes afectados y notificación de actualización, con alias de las variantes de escritura del Word.
- `src/domain/formularios.js`: métodos de captura, presentación, errores, confirmaciones y envío de los siete formularios. `CriteriosBusqueda` es alias de `CriterioBusqueda`; los nombres del formulario de cancelación representan la misma clase.

Se unifican las firmas duplicadas cuando difieren las secciones 7.2 y 7.3. JavaScript puede devolver resultados para que React actualice la vista, aunque el diagrama indique `void`. Los atributos de conexión, SMTP y autorización son identificadores locales y no abren conexiones.

## Flujos alternativos

| Requerimiento | Comprobación |
| --- | --- |
| Registro incompleto, contraseña inválida y correo repetido | Alertas del registro y pruebas de negocio |
| Credenciales incorrectas, usuario inexistente o campos vacíos | Alertas del acceso y pruebas de negocio |
| Sin coincidencias y búsqueda inválida | Resultados vacíos y validación del buscador |
| Vuelo o asiento no disponible | Validación al confirmar, ocupación de asientos y vuelo cancelado |
| Servicios y descuento corporativo | Personalización y resumen del precio |
| Pago rechazado | Tarjeta de rechazo o configuración del pago |
| Cancelación fuera de plazo o duplicada | ANT404, reloj y control de cancelación |
| Devolución rechazada | La reserva se conserva sin liberar asientos |
| Agente sin autorización o datos inválidos | Protección de vista y controles |
| Actualización y clientes afectados | Notificaciones en la bandeja de cada propietario |
| PNR o apellido inválido | Check-in y verificación de propietario |
| Check-in fuera de plazo o ya realizado | Reloj, ventana y recuperación del pase |
| Migración no disponible o rechazada | Centro de demostración y errores recuperables |
| Correo no disponible | Mensajes pendientes y reintento |

## Identidad y CSS

Se respetan **#041F3F**, **#078CE8**, **#FFFFFF** y **#000000**. Los logos originales están en `public/images/`. Verde, ámbar y rojo comunican estados.

`src/styles/referencias.css` contiene tokens y reglas extraídas literalmente de los CSS proporcionados, con alias semánticos: `.a5e03e7b9e → .card`, `.d0acd69e66 → .btn`, `.cd3e7df908 → .badge` y `.vg06 → .account-dropdown a`. Los colores se adaptan a la paleta. La composición en `src/App.css` reproduce los patrones de buscador, filtros, tarjetas, precios y botones y añade lo necesario para asientos, administración y pases. Se excluyen publicidad y recursos remotos de las capturas de CSS.
