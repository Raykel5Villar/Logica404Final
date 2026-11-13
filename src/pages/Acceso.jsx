import { useState } from 'react'
import { PERFILES } from '../domain/datos.js'
import { exigirSesion } from '../domain/almacen.js'
import { FormularioLogin as ModeloLogin, FormularioRegistro as ModeloRegistro } from '../domain/formularios.js'
import { navegar, useApp } from '../context.jsx'
import { Alert, Button, Field, Icon } from '../components/UI.jsx'

export function FormularioLogin({ parametros }) {
  const [formulario] = useState(() => new ModeloLogin())
  const { notificar } = useApp()
  const [correoIngresado, setCorreo] = useState(parametros.get('correo') || '')
  const [contrasenaIngresada, setContrasena] = useState('')
  const [mensajeError, setMensajeError] = useState('')
  function enviarCredenciales(e, correo = correoIngresado, contrasena = contrasenaIngresada) {
    e?.preventDefault()
    try { formulario.enviarCredenciales(correo, contrasena); notificar('¡Qué bueno tenerte de vuelta!'); const perfil = exigirSesion().perfil; const next = parametros.get('next'); navegar(perfil === 'agente' ? '/agente' : next?.startsWith('/') ? next : formulario.redirigirPanel(perfil)) }
    catch (error) { setMensajeError(formulario.mostrarMensajeError(error.message)) }
  }
  return <><span className="eyebrow">TU SIGUIENTE VIAJE TE ESPERA</span><h1>Qué bueno verte<br />de nuevo.</h1><p className="auth-intro">Inicia sesión para reservar y gestionar tus viajes.</p>{parametros.get('creada') && <Alert type="success">Tu cuenta está lista. Ya puedes iniciar sesión.</Alert>}<form onSubmit={enviarCredenciales} className="stack-form"><Field label="Correo electrónico"><input type="email" autoComplete="email" placeholder="tu@correo.com" required value={correoIngresado} onChange={e => setCorreo(e.target.value)} /></Field><Field label="Contraseña"><input type="password" autoComplete="current-password" placeholder="Tu contraseña" required value={contrasenaIngresada} onChange={e => setContrasena(e.target.value)} /></Field><Alert>{mensajeError}</Alert><Button type="submit" icon="arrow" className="full-width">Iniciar sesión</Button></form><p className="auth-switch">¿Tu primer viaje con nosotros? <a href={`#/registro${parametros.get('next') ? `?next=${encodeURIComponent(parametros.get('next'))}` : ''}`}>Crea tu cuenta</a></p><div className="demo-accounts"><span>EXPLORA EL PROTOTIPO</span><p>Entra con una cuenta de demostración.</p><div>{[['cliente', 'Cliente', 'user'], ['empresa', 'Corporativo', 'building'], ['agente', 'Agente', 'ticket']].map(([email, texto, icono]) => <button type="button" key={email} onClick={e => enviarCredenciales(e, `${email}@logica404.com`, 'Demo404!')}><Icon name={icono} size={17} />{texto}</button>)}</div><small>Contraseña de las cuentas de prueba: <b>Demo404!</b></small></div></>
}
export function FormularioRegistro({ parametros }) {
  const [formulario] = useState(() => new ModeloRegistro())
  const [datos, setDatos] = useState({ nombre: '', apellido: '', direccion: '', telefono: '', correo: '', contrasena: '', nombreCompania: '' })
  const [perfil, setPerfil] = useState(parametros.get('perfil') === 'corporativo' ? 'corporativo' : 'minorista')
  const [erroresVisibles, setErrores] = useState('')
  const [aceptado, setAceptado] = useState(false)
  function enviarFormulario(e) {
    e.preventDefault()
    try { if (!aceptado) throw new Error('Acepta las condiciones para continuar.'); formulario.enviarFormulario(datos, perfil); navegar(`/acceso?${new URLSearchParams({ creada: '1', correo: datos.correo, ...(parametros.get('next') ? { next: parametros.get('next') } : {}) })}`) }
    catch (error) { setErrores(formulario.mostrarErrores([error.message])) }
  }
  const campo = (id, label, type = 'text', hint) => <Field label={label} hint={hint}><input type={type} required value={datos[id]} autoComplete={id === 'contrasena' ? 'new-password' : id === 'correo' ? 'email' : undefined} onChange={e => setDatos(d => ({ ...d, [id]: e.target.value }))} /></Field>
  return <><span className="eyebrow">HAY MUCHO POR DESCUBRIR</span><h1>Tu próxima historia<br />empieza contigo.</h1><p className="auth-intro">Crea tu cuenta y prepárate para despegar.</p><form className="stack-form" onSubmit={enviarFormulario}><Field label="Tipo de cuenta"><select value={perfil} onChange={e => setPerfil(e.target.value)}>{Object.entries(PERFILES).map(([id, texto]) => <option key={id} value={id}>{texto}</option>)}</select></Field><div className="form-grid">{campo('nombre', 'Nombre')}{campo('apellido', 'Apellido')}</div>{campo('direccion', 'Dirección')}<div className="form-grid">{campo('telefono', 'Teléfono', 'tel')}{campo('correo', 'Correo electrónico', 'email')}</div>{perfil === 'corporativo' && campo('nombreCompania', 'Nombre de la compañía')}{campo('contrasena', 'Contraseña', 'password', 'Al menos 8 caracteres, una letra y un número.')}<label className="checkbox-label"><input type="checkbox" required checked={aceptado} onChange={e => setAceptado(e.target.checked)} /><span>Acepto las <a href="#/ayuda?tema=condiciones" target="_blank" rel="noreferrer">condiciones de uso del prototipo</a>.</span></label><Alert>{erroresVisibles}</Alert><Button type="submit" icon="arrow" className="full-width">Crear mi cuenta</Button></form><p className="auth-switch">¿Ya tienes una cuenta? <a href={`#/acceso${parametros.get('next') ? `?next=${encodeURIComponent(parametros.get('next'))}` : ''}`}>Inicia sesión</a></p></>
}
export default function Acceso({ registro, parametros }) {
  return <div className="auth-layout container"><div className="auth-visual"><div className="auth-visual-copy"><span className="hero-eyebrow">CERCA DE LO QUE IMPORTA</span><h2>Menos distancia.<br />Más encuentros.</h2><p>Hay lugares que esperan por ti.<br />Y personas que también.</p><span className="auth-visual-bottom"><Icon name="globe" size={18} /> Conectando historias desde el Caribe.</span></div></div><div className={`auth-form ${registro ? 'auth-register' : ''}`}>{registro ? <FormularioRegistro parametros={parametros} /> : <FormularioLogin parametros={parametros} />}</div></div>
}
