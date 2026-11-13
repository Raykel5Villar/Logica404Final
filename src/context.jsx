import { createContext, useContext, useSyncExternalStore } from 'react'
import { almacen } from './domain/almacen.js'
import { preferenciaMoneda } from './domain/moneda.js'
export const AppContext = createContext(null)
export const useApp = () => useContext(AppContext)
export function useDatos() { return useSyncExternalStore(almacen.suscribir, almacen.obtener) }
export function useMoneda() { return useSyncExternalStore(preferenciaMoneda.suscribir, preferenciaMoneda.obtener) }
export function navegar(ruta) { window.location.hash = ruta }
export function useRuta() {
  const hash = useSyncExternalStore(fn => { window.addEventListener('hashchange', fn); return () => window.removeEventListener('hashchange', fn) }, () => window.location.hash || '#/')
  const [ruta, consulta = ''] = hash.replace(/^#/, '').split('?')
  return { ruta, parametros: new URLSearchParams(consulta) }
}
