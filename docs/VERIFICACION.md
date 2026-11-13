# Verificación de la entrega

Realizada el 13 de noviembre de 2026.

- **Compilación de producción**: `npm.cmd run build`, correcta.
- **Reglas de negocio y moneda**: `npm.cmd test`, 19 pruebas aprobadas.
- **Interfaz real en Chrome**: 10 comprobaciones aprobadas con `scripts/verificar-interfaz.mjs`, incluyendo acceso público y protegido, continuidad del itinerario al iniciar sesión, selección de asientos y servicios, pago, persistencia tras recargar, cancelación, migración rechazada y reintento, pase de abordar, actualización por agente, reserva corporativa de dos pasajeros con descuento de millas, registro y navegación móvil.
- **Tamaños revisados**: 320, 390, 768, 1024 y 1440 píxeles. La tabla administrativa mantiene desplazamiento dentro de su contenedor en pantallas estrechas.
- **Red**: la revisión de interfaz no registró peticiones a servicios externos. Imágenes, estilos, scripts y datos de la aplicación se sirven localmente.
- **Errores de JavaScript**: ninguno durante los recorridos aprobados.

Las capturas y el informe JSON de interfaz quedan en `artifacts/`, una carpeta de trabajo excluida de Git. Las comprobaciones usan un perfil de Chrome separado del navegador habitual del usuario.

## Bordes y selector de moneda

Los componentes usan radios de 2 a 6 px; se conservan los círculos de avatares e indicadores. Se mantiene la tipografía ampliada.

`node scripts/verificar-moneda.mjs` aprobó seis comprobaciones adicionales: conversión entre las tres monedas, persistencia tras recargar, uso con teclado, radios y tamaño de letra, visibilidad y ajuste del selector entre 320 y 1440 px, cambio de moneda durante la reserva sin perder datos, y pago/reembolso con importes originales en USD y presentación convertida. No se registraron errores de JavaScript.
