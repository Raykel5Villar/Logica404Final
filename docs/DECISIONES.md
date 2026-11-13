# Decisiones del prototipo

## Ambigüedades

1. **Cancelación**. El Paso 2 dice “después de una semana”, pero los casos de uso y escenarios especifican “dentro del plazo permitido de siete días” y rechazan solicitudes posteriores. Se sigue el detalle: **hasta siete días desde la reserva, inclusive, antes del abordaje; devolución del 80 %**.
2. **Búsqueda**. El SRS menciona destino y hora; el escenario de reservación añade origen, fecha, pasajeros y clase. Se ofrecen esos campos y una **hora exacta opcional** en las opciones de cabina. Al indicarla solo se devuelven coincidencias exactas.
3. **Check-in**. Se respetan **2 a 5 horas antes del abordaje**, inclusive. El abordaje se fija 30 minutos antes de la salida. Todos los horarios se muestran en **America/Santo_Domingo, UTC−4**, incluso los de destinos con otra zona horaria.
4. **Perfiles**. Se pueden registrar minoristas, corporativos y agentes, como indica el documento. El agente actualiza vuelos; reserva y check-in requieren un perfil de cliente. Las comprobaciones se realizan en vistas y controles.
5. **Clases de presentación**. Se conservan las clases de formulario JavaScript y se conectan a React. Las variantes de nombres son alias de una misma implementación.

## Reglas añadidas para la simulación

El documento no fija importes ni fórmula de fidelización. Se adoptan estas reglas, visibles antes de pagar:

- Moneda base USD e impuestos de US$ 24 por pasajero. El selector permite visualizar precios en USD, DOP o EUR y conserva la preferencia local. Las conversiones usan tasas fijas de demostración: 1 USD = 60 DOP = 0.92 EUR. Los importes originales, cobros y reembolsos del modelo permanecen en USD; no se consultan tasas externas.
- Ejecutiva: 1.7 veces la tarifa base económica; mismos impuestos y servicios.
- Maleta adicional de hasta 23 kg: US$ 35; menú vegetariano: US$ 18; prioridad de abordaje: US$ 15 por persona. Cada servicio seleccionado se aplica a todos los pasajeros.
- De uno a cuatro pasajeros por reserva; mapa de 48 asientos con un mismo precio.
- 1,000 millas = US$ 10, hasta el 30 % de la tarifa base y en bloques de 1,000 millas. La cuenta corporativa acumula las millas publicadas del trayecto por pasajero al reservar.
- Cancelar resta las millas ganadas y devuelve las usadas. Si las ganadas ya se gastaron, su reversión se limita al saldo disponible para evitar saldos negativos en esta simulación.
- 12 rutas dirigidas y tres salidas diarias durante 30 días, más un vuelo preparado para check-in. Se regeneran al reiniciar la demostración.
- Cambiar horario o puerta invalida los pases anteriores. La tarifa pagada de reservas existentes se conserva.
- El fallo de correo deja la operación vigente y la notificación pendiente. El fallo de pago o devolución conserva la situación previa.

## Implementación

Se mantienen React y Vite del proyecto disponible. No se añaden dependencias de runtime. `node:test` comprueba las reglas; la interfaz se revisa con Chrome mediante CDP y WebSocket de Node en un perfil aislado.

El estado se publica mediante `useSyncExternalStore`. Reserva, asientos y millas se actualizan juntos en una mutación local. Lo mismo sucede al cancelar. No hay bloqueo remoto ni concurrencia entre dispositivos en este prototipo sin servidor.

El pase se descarga como texto y se puede imprimir o guardar en PDF desde el navegador. El código de barras es una representación visual para la presentación, sin validación aeroportuaria.

“Lógica 404 Airlines”, textos de portada, catálogo, cuentas y tarifas hacen demostrable el modelo. Los archivos externos originales no se modifican. La entrega es local en la carpeta del usuario; no se registra ni publica un sitio alojado.
