export const AEROPUERTOS = [
  { codigo: 'SDQ', ciudad: 'Santo Domingo', pais: 'República Dominicana', nombre: 'Las Américas' },
  { codigo: 'PUJ', ciudad: 'Punta Cana', pais: 'República Dominicana', nombre: 'Internacional de Punta Cana' },
  { codigo: 'STI', ciudad: 'Santiago', pais: 'República Dominicana', nombre: 'Internacional del Cibao' },
  { codigo: 'SJU', ciudad: 'San Juan', pais: 'Puerto Rico', nombre: 'Luis Muñoz Marín' },
  { codigo: 'MIA', ciudad: 'Miami', pais: 'Estados Unidos', nombre: 'Internacional de Miami' },
  { codigo: 'JFK', ciudad: 'Nueva York', pais: 'Estados Unidos', nombre: 'John F. Kennedy' },
  { codigo: 'PTY', ciudad: 'Ciudad de Panamá', pais: 'Panamá', nombre: 'Tocumen' },
]
export const SERVICIOS = [
  { id: 'equipaje', nombre: 'Equipaje adicional', descripcion: 'Una maleta de hasta 23 kg por pasajero', precio: 35, icono: 'luggage' },
  { id: 'comida', nombre: 'Comida especial', descripcion: 'Menú vegetariano por pasajero', precio: 18, icono: 'meal' },
  { id: 'prioridad', nombre: 'Abordaje prioritario', descripcion: 'Más comodidad desde la puerta de embarque', precio: 15, icono: 'sparkles' },
]
export const ASIENTOS = Array.from({ length: 8 }, (_, i) => ['A', 'B', 'C', 'D', 'E', 'F'].map(letra => `${i + 1}${letra}`)).flat()
export const PERFILES = { minorista: 'Cliente minorista', corporativo: 'Cliente corporativo', agente: 'Agente de boletos' }
export const aeropuerto = codigo => AEROPUERTOS.find(a => a.codigo === codigo)
export const fechaLocal = (fecha = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santo_Domingo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(fecha))
export const sumarDias = (dias, desde = new Date()) => fechaLocal(new Date(new Date(desde).getTime() + dias * 86400000))
export { formatearDinero as dinero } from './moneda.js'
export const hora = fecha => new Intl.DateTimeFormat('es-DO', { timeZone: 'America/Santo_Domingo', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(fecha))
export const fechaBonita = (fecha, largo = false) => {
  const valor = String(fecha)
  const date = new Date(valor.includes('T') ? valor : `${valor}T12:00:00-04:00`)
  return Number.isFinite(date.getTime()) ? new Intl.DateTimeFormat('es-DO', { timeZone: 'America/Santo_Domingo', day: 'numeric', month: largo ? 'long' : 'short', ...(largo ? { year: 'numeric' } : {}) }).format(date) : 'Fecha no válida'
}

export function crearDatosIniciales() {
  const ahora = new Date()
  const rutas = [
    ['SDQ', 'SJU', 129, 65, 250], ['SDQ', 'MIA', 189, 145, 850], ['SDQ', 'JFK', 269, 235, 1550],
    ['SDQ', 'PTY', 179, 160, 930], ['PUJ', 'SJU', 119, 55, 210], ['STI', 'MIA', 169, 130, 780],
    ['SJU', 'SDQ', 129, 65, 250], ['MIA', 'SDQ', 189, 145, 850], ['JFK', 'SDQ', 269, 235, 1550],
    ['PTY', 'SDQ', 179, 160, 930], ['SJU', 'PUJ', 119, 55, 210], ['MIA', 'STI', 169, 130, 780],
  ]
  const vuelos = []
  for (let dia = 0; dia <= 30; dia++) {
    rutas.forEach(([origen, destino, tarifa, duracion, millas], ruta) => {
      ;['08:30', '13:45', '18:20'].forEach((salida, turno) => {
        const horaPartida = `${sumarDias(dia, ahora)}T${salida}:00-04:00`
        vuelos.push({ idVuelo: `${sumarDias(dia, ahora)}-${ruta}-${turno}`, numeroVuelo: `L4 ${100 + ruta * 10 + turno}`, origen, destino,
          horaPartida, horaLlegada: new Date(new Date(horaPartida).getTime() + duracion * 60000).toISOString(),
          tarifa: tarifa + turno * 12, duracion, millas, capacidad: 48, asientosOcupados: ['1B', '2C', '3A', '4D', '6F', '7B'],
          disponibilidadAsientos: 42, estado: 'Programado', puerta: `B${ruta + 1}`,
        })
      })
    })
  }
  const demoVuelo = { ...vuelos[0], idVuelo: 'vuelo-checkin-demo', numeroVuelo: 'L4 404',
    horaPartida: new Date(ahora.getTime() + 4 * 3600000).toISOString(), horaLlegada: new Date(ahora.getTime() + 5.1 * 3600000).toISOString(),
    asientosOcupados: ['1B', '2C', '3A', '4D', '5A'], disponibilidadAsientos: 43, puerta: 'B4' }
  vuelos.push(demoVuelo)
  const usuarios = [
    { idUsuario: 'cliente-demo', nombre: 'Sofía', apellido: 'Reyes', direccion: 'Santo Domingo, República Dominicana', telefono: '8095550101', correo: 'cliente@logica404.com', contrasena: 'Demo404!', perfil: 'minorista', nombreCompania: '', millas: 0 },
    { idUsuario: 'corporativo-demo', nombre: 'Carlos', apellido: 'Méndez', direccion: 'Santo Domingo, República Dominicana', telefono: '8095550102', correo: 'empresa@logica404.com', contrasena: 'Demo404!', perfil: 'corporativo', nombreCompania: 'Caribe Tech', millas: 12500 },
    { idUsuario: 'agente-demo', nombre: 'Ana', apellido: 'García', direccion: 'Santo Domingo, República Dominicana', telefono: '8095550103', correo: 'agente@logica404.com', contrasena: 'Demo404!', perfil: 'agente', nombreCompania: 'Lógica 404', millas: 0 },
  ]
  const crearReserva = (pnr, vuelo, fechaReserva, asiento) => ({ codigoPNR: pnr, vueloId: vuelo.idVuelo, clienteId: 'cliente-demo',
    asientoAsignado: asiento, asientos: [asiento], pasajeros: [{ nombre: 'Sofía', apellido: 'Reyes', documento: 'RD1234567', asiento }],
    nombrePasajero: 'Sofía', apellidoPasajero: 'Reyes', numeroVuelo: vuelo.numeroVuelo, fechaHoraAbordaje: new Date(new Date(vuelo.horaPartida).getTime() - 1800000).toISOString(),
    montoTotal: 149, estadoReserva: 'CONFIRMADA', fechaReserva, millasDescontadas: 0, millasGanadas: 0, servicios: [], clase: 'economica', estadoCheckIn: 'PENDIENTE', pagoReferencia: 'DEMO-404' })
  const antiguoVuelo = vuelos.find(v => v.origen === 'SDQ' && v.destino === 'MIA' && fechaLocal(v.horaPartida) === sumarDias(7, ahora))
  antiguoVuelo.asientosOcupados.push('5B'); antiguoVuelo.disponibilidadAsientos--
  return { version: 1, usuarios, vuelos, reservas: [crearReserva('L404DE', demoVuelo, ahora.toISOString(), '5A'), crearReserva('ANT404', antiguoVuelo, new Date(ahora.getTime() - 9 * 86400000).toISOString(), '5B')],
    mensajes: [{ id: 'bienvenida', clienteId: 'cliente-demo', para: usuarios[0].correo, asunto: 'Tu viaje está por comenzar · L404DE', contenido: 'Tu reservación L404DE está confirmada. Puedes realizar el check-in entre 2 y 5 horas antes del abordaje. ¡Nos vemos a bordo!', fecha: ahora.toISOString(), leido: false, estado: 'Entregado' }],
    sesion: null, configuracion: { pago: 'aprobado', migracion: 'aprobada', correo: 'disponible', ahora: null }, actividad: [],
  }
}
