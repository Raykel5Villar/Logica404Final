import { crearDatosIniciales } from './datos.js'

const CLAVE = 'logica404-prototipo-v1'
const oyentes = new Set()
let avisoPersistencia = ''
function leer() {
  try {
    const guardado = globalThis.localStorage?.getItem(CLAVE)
    if (guardado) {
      const datos = JSON.parse(guardado)
      if (datos.version === 1 && ['usuarios', 'vuelos', 'reservas', 'mensajes', 'actividad'].every(k => Array.isArray(datos[k])) && datos.configuracion) return datos
    }
  } catch { avisoPersistencia = 'No fue posible recuperar los datos locales. Se inició una demostración nueva.' }
  return crearDatosIniciales()
}
let estado = leer()
export const almacen = {
  obtener: () => estado,
  suscribir: fn => { oyentes.add(fn); return () => oyentes.delete(fn) },
  actualizar(cambio) {
    const siguiente = structuredClone(estado)
    cambio(siguiente)
    estado = siguiente
    try { globalThis.localStorage?.setItem(CLAVE, JSON.stringify(estado)) }
    catch { avisoPersistencia = 'El navegador no pudo guardar los cambios. Se conservarán durante esta sesión.' }
    oyentes.forEach(fn => fn())
    return estado
  },
  reiniciar() { estado = crearDatosIniciales(); this.actualizar(() => {}) },
  ahora: () => new Date(estado.configuracion.ahora || Date.now()),
  aviso: () => avisoPersistencia,
}
export function exigirSesion(perfiles) {
  const usuario = almacen.obtener().usuarios.find(u => u.idUsuario === almacen.obtener().sesion?.cuentaUsuario)
  if (!usuario) throw new Error('Inicia sesión para continuar.')
  if (perfiles && !perfiles.includes(usuario.perfil)) throw new Error('Tu perfil no tiene autorización para realizar esta operación.')
  return usuario
}
export function actividad(estado, texto) { estado.actividad.unshift({ id: crypto.randomUUID(), texto, fecha: almacen.ahora().toISOString() }) }
