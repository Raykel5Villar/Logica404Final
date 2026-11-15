import { useState } from 'react'
import { AEROPUERTOS, sumarDias, fechaLocal } from '../domain/datos.js'
import { FormularioConsulta as ModeloConsulta } from '../domain/formularios.js'
import { almacen } from '../domain/almacen.js'
import { navegar } from '../context.jsx'
import { Alert, Icon } from './UI.jsx'

export default function FormularioConsulta({ inicial = {}, compact = false }) {
  const [formulario] = useState(() => new ModeloConsulta())
  const [busqueda, setBusqueda] = useState({ origen: 'SDQ', destino: 'SJU', fecha: sumarDias(1, almacen.ahora()), pasajeros: '1', clase: 'economica', horaPartida: '', ...inicial })
  const [mensajeAlerta, setMensajeAlerta] = useState('')
  const [opciones, setOpciones] = useState(false)
  function ingresarCriterios(clave, valor) { setBusqueda(s => ({ ...s, [clave]: valor })); setMensajeAlerta('') }
  function mostrarResultados(e) {
    e.preventDefault()
    try { formulario.enviarBusqueda(busqueda); navegar(`/vuelos?${new URLSearchParams(busqueda)}`) }
    catch (error) { setMensajeAlerta(formulario.mostrarAlerta(error.message)) }
  }
  return <form className={`flight-search ${compact ? 'search-compact' : ''}`} onSubmit={mostrarResultados}>
    <div className="search-options"><span className="trip-type"><span className="radio-dot" /> Solo ida</span><button type="button" className="text-button" onClick={() => setOpciones(!opciones)} aria-expanded={opciones} aria-controls={opciones ? 'opciones-busqueda' : undefined} aria-label={`${busqueda.clase === 'economica' ? 'Clase econ?mica' : 'Clase ejecutiva'}. Cambiar clase de cabina y hora de partida`}>{busqueda.clase === 'economica' ? 'Clase económica' : 'Clase ejecutiva'} <Icon name="down" size={14} /></button><span className="search-note"><Icon name="checkCircle" size={14} /> Tarifas claras, sin sorpresas</span></div>
    {opciones && <div className="advanced-search" id="opciones-busqueda"><label>Clase de cabina<select value={busqueda.clase} onChange={e => ingresarCriterios('clase', e.target.value)}><option value="economica">Económica</option><option value="ejecutiva">Ejecutiva</option></select></label><label>Hora de partida exacta (opcional)<input type="time" value={busqueda.horaPartida} onChange={e => ingresarCriterios('horaPartida', e.target.value)} /></label><span>Todos los horarios se muestran en hora de Santo Domingo (UTC−4).</span></div>}
    <div className="search-fields">
      <label className="search-field"><Icon name="flight" size={22} /><span><small>Origen</small><select aria-label="Origen" value={busqueda.origen} onChange={e => ingresarCriterios('origen', e.target.value)}>{AEROPUERTOS.map(a => <option value={a.codigo} key={a.codigo}>{a.ciudad} ({a.codigo})</option>)}</select></span></label>
      <button className="swap-button" type="button" aria-label="Intercambiar origen y destino" onClick={() => setBusqueda(s => ({ ...s, origen: s.destino, destino: s.origen }))}><Icon name="swap" size={16} /></button>
      <label className="search-field"><Icon name="pin" size={22} /><span><small>Destino</small><select aria-label="Destino" value={busqueda.destino} onChange={e => ingresarCriterios('destino', e.target.value)}>{AEROPUERTOS.map(a => <option value={a.codigo} key={a.codigo}>{a.ciudad} ({a.codigo})</option>)}</select></span></label>
      <label className="search-field date-field"><Icon name="calendar" size={21} /><span><small>Fecha de salida</small><input aria-label="Fecha de salida" type="date" required min={fechaLocal(almacen.ahora())} value={busqueda.fecha} onChange={e => ingresarCriterios('fecha', e.target.value)} /></span></label>
      <label className="search-field passenger-field"><Icon name="users" size={21} /><span><small>Pasajeros</small><select aria-label="Pasajeros" value={busqueda.pasajeros} onChange={e => ingresarCriterios('pasajeros', e.target.value)}>{[1, 2, 3, 4].map(n => <option value={n} key={n}>{n} {n === 1 ? 'adulto' : 'adultos'}</option>)}</select></span></label>
      <button className="btn btn-primary search-submit" type="submit"><Icon name="search" size={21} /> Buscar vuelos</button>
    </div>
    <Alert>{mensajeAlerta}</Alert>
  </form>
}
