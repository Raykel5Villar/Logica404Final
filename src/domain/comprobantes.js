import { dinero, fechaBonita, hora } from './datos.js'

export function comprobante(reserva, vuelo) {
  return `LÓGICA 404 AIRLINES
COMPROBANTE DE RESERVACIÓN · SIMULACIÓN ACADÉMICA

Localizador: ${reserva.codigoPNR}
Estado: ${reserva.estadoReserva}
Vuelo: ${vuelo.numeroVuelo}
Ruta: ${vuelo.origen} → ${vuelo.destino}
Salida: ${fechaBonita(vuelo.horaPartida, true)} · ${hora(vuelo.horaPartida)} (UTC-4)
Pasajeros:
${reserva.pasajeros.map(p => `  ${p.nombre} ${p.apellido} · Asiento ${p.asiento}`).join('\n')}
Total pagado: ${dinero(reserva.montoTotal)}
Servicios: ${reserva.servicios.join(', ') || 'Sin servicios adicionales'}
Millas utilizadas: ${reserva.millasDescontadas}
${reserva.reembolso ? `Reembolso: ${dinero(reserva.reembolso)}\n` : ''}
Cancelaciones dentro de 7 días de la reserva, antes del abordaje: devolución del 80 %.
Check-in entre 2 y 5 horas antes del abordaje.
Este comprobante no tiene validez comercial.`
}
