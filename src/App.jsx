import { useEffect, useState } from 'react'
import { AppContext, useDatos, useMoneda, useRuta, navegar } from './context.jsx'
import { controles } from './domain/controles.js'
import { almacen } from './domain/almacen.js'
import { Alert, Brand, Button, Empty, Icon } from './components/UI.jsx'
import Inicio from './pages/Inicio.jsx'
import Vuelos from './pages/Vuelos.jsx'
import Acceso from './pages/Acceso.jsx'
import FormularioReserva from './pages/Reserva.jsx'
import Viajes from './pages/Viajes.jsx'
import FormularioCheckIn from './pages/CheckIn.jsx'
import Agente from './pages/Agente.jsx'
import Cuenta, { Correo, Millas } from './pages/Cuenta.jsx'
import Demo from './pages/Demo.jsx'
import Ayuda, { Destinos } from './pages/Informacion.jsx'
import SelectorMoneda from './components/SelectorMoneda.jsx'
import './App.css'
import './styles/marca.css'

function Protegido({ usuario, agente = false, ruta, children }) {
  if (!usuario) return <div className="container page"><Empty icon="user" title="Tu viaje empieza con una cuenta" action={<div className="button-row"><Button onClick={() => navegar(`/acceso?next=${encodeURIComponent(ruta)}`)} icon="arrow">Iniciar sesión</Button><Button variant="secondary" onClick={() => navegar(`/registro?next=${encodeURIComponent(ruta)}`)}>Crear cuenta</Button></div>}>Inicia sesión para acceder a tus viajes, tus reservaciones y tus beneficios.</Empty></div>
  if (agente && usuario.perfil !== 'agente') return <div className="container page"><Empty icon="shield" title="Acceso para agentes autorizados" action={<Button onClick={() => navegar('/demo')}>Ver perfiles de demostración</Button>}>Esta sección requiere una cuenta con perfil de agente de boletos.</Empty></div>
  return children
}
export default function App() {
  const datos = useDatos()
  const moneda = useMoneda()
  const { ruta, parametros } = useRuta()
  const usuario = datos.usuarios.find(u => u.idUsuario === datos.sesion?.cuentaUsuario)
  const [toast, setToast] = useState(null)
  const [menu, setMenu] = useState(false)
  const [cuentaAbierta, setCuentaAbierta] = useState(false)
  function notificar(mensaje) { setToast({ mensaje, id: crypto.randomUUID() }) }
  useEffect(() => { if (toast) { const timer = setTimeout(() => setToast(null), 5500); return () => clearTimeout(timer) } }, [toast])
  useEffect(() => { window.scrollTo(0, 0); setMenu(false); setCuentaAbierta(false); const titulos = { '/': 'Tu próxima historia', '/vuelos': 'Buscar vuelos', '/viajes': 'Mis viajes', '/check-in': 'Check-in', '/agente': 'Panel de agente', '/demo': 'Demostración', '/millas': 'Millas corporativas', '/destinos': 'Destinos', '/ayuda': 'Centro de ayuda', '/acceso': 'Iniciar sesión', '/registro': 'Crear cuenta', '/reservar': 'Reservar vuelo', '/cuenta': 'Mi cuenta', '/correo': 'Bandeja de viaje' }; document.title = `${titulos[ruta] || 'Página no encontrada'} · Lógica 404 Airlines` }, [ruta])
  useEffect(() => { const cerrar = e => { if (e.key === 'Escape') { setMenu(false); setCuentaAbierta(false) } }; document.addEventListener('keydown', cerrar); return () => document.removeEventListener('keydown', cerrar) }, [])
  const completo = `${ruta}${parametros.size ? `?${parametros}` : ''}`
  const proteger = (pagina, agente = false) => <Protegido usuario={usuario} agente={agente} ruta={completo}>{pagina}</Protegido>
  let pagina
  switch (ruta) {
    case '/': pagina = <Inicio />; break
    case '/vuelos': pagina = <Vuelos parametros={parametros} />; break
    case '/destinos': pagina = <Destinos />; break
    case '/acceso': pagina = <Acceso key={ruta} parametros={parametros} />; break
    case '/registro': pagina = <Acceso key={ruta} registro parametros={parametros} />; break
    case '/reservar': pagina = proteger(<FormularioReserva key={parametros.toString()} parametros={parametros} />); break
    case '/viajes': pagina = proteger(<Viajes key={completo} parametros={parametros} />); break
    case '/check-in': pagina = proteger(<FormularioCheckIn key={completo} parametros={parametros} />); break
    case '/agente': pagina = proteger(<Agente />, true); break
    case '/cuenta': pagina = proteger(<Cuenta key={usuario?.idUsuario} />); break
    case '/correo': pagina = proteger(<Correo key={usuario?.idUsuario} />); break
    case '/millas': pagina = <Millas />; break
    case '/demo': pagina = <Demo />; break
    case '/ayuda': pagina = <Ayuda key={completo} parametros={parametros} />; break
    default: pagina = <div className="container page"><Empty icon="pin" title="Este destino no está en el mapa" action={<Button onClick={() => navegar('/')}>Volver al inicio</Button>}>La página que buscas no existe. Todavía hay muchos lugares por descubrir.</Empty></div>
  }
  const sinLeer = datos.mensajes.filter(m => m.clienteId === usuario?.idUsuario && !m.leido).length
  return <AppContext.Provider value={{ datos, usuario, moneda, notificar }}>
    <a className="skip-link" href="#contenido" onClick={e => { e.preventDefault(); document.getElementById('contenido').focus(); document.getElementById('contenido').scrollIntoView() }}>Ir al contenido</a>
    <div className="announcement"><div className="container"><span>Nacimos en el Caribe. Volamos contigo.</span><a href="#/demo"><span className="demo-dot" /> Prototipo académico <Icon name="arrow" size={13} /></a></div></div>
    <header className="site-header"><div className="container header-inner"><Brand /><nav className={`main-nav ${menu ? 'mobile-open' : ''}`} aria-label="Navegación principal">{[['/', 'Inicio'], ['/vuelos', 'Vuelos'], ['/destinos', 'Destinos'], ['/viajes', 'Mis viajes'], ['/check-in', 'Check-in']].map(([href, nombre]) => <a key={href} href={`#${href}`} className={ruta === href ? 'active' : ''} aria-current={ruta === href ? 'page' : undefined}>{nombre}</a>)}{usuario?.perfil === 'agente' && <a className={ruta === '/agente' ? 'active' : ''} aria-current={ruta === '/agente' ? 'page' : undefined} href="#/agente">Panel de agente</a>}</nav><div className="header-actions"><SelectorMoneda />{usuario ? <div className="account-menu-wrap"><button className="account-toggle" aria-expanded={cuentaAbierta} onClick={() => setCuentaAbierta(!cuentaAbierta)}><span className="user-avatar">{usuario.nombre[0]}</span><span>{usuario.nombre}</span><Icon name="down" size={13} /></button>{cuentaAbierta && <><button className="menu-backdrop" aria-label="Cerrar menú de cuenta" onClick={() => setCuentaAbierta(false)} /><div className="account-dropdown"><span className="dropdown-name">{usuario.nombre} {usuario.apellido}<small>{usuario.correo}</small></span>{[['/cuenta', 'Mi cuenta', 'user'], ['/viajes', 'Mis viajes', 'luggage'], ['/correo', `Bandeja de viaje${sinLeer ? ` (${sinLeer})` : ''}`, 'mail'], ['/millas', 'Millas corporativas', 'sparkles'], ['/demo', 'Demostración', 'settings']].map(([href, label, icono]) => <a href={`#${href}`} key={href} onClick={() => setCuentaAbierta(false)}><Icon name={icono} size={17} />{label}</a>)}<button onClick={() => { controles.login.cerrarSesion(); setCuentaAbierta(false); navegar('/'); notificar('Cerraste tu sesión.') }}><Icon name="logout" size={17} /> Cerrar sesión</button></div></>}</div> : <><a className="login-link" href="#/acceso" aria-label="Iniciar sesión"><Icon name="user" size={17} /><span className="login-label">Iniciar sesión</span></a><Button variant="secondary" className="register-button" onClick={() => navegar('/registro')}>Crear cuenta</Button></>}<button className="icon-button mobile-menu-button" aria-label={menu ? 'Cerrar navegación' : 'Abrir navegación'} aria-expanded={menu} aria-controls="navegacion-principal" onClick={() => setMenu(!menu)}><Icon name={menu ? 'close' : 'menu'} size={23} /></button></div></div></header>
    {datos.configuracion.ahora && <div className="simulated-time-banner"><Icon name="clock" size={15} /> Estás usando el reloj de demostración. <a href="#/demo">Administrar</a></div>}{almacen.aviso() && <div className="container"><Alert type="info">{almacen.aviso()}</Alert></div>}
    <main id="contenido" tabIndex={-1}>{pagina}</main>
    <footer className="site-footer"><div className="container footer-main"><div className="footer-brand"><Brand light /><p>Menos distancia. Más historias.<br />Tu conexión con lo que importa.</p><span className="footer-origin"><Icon name="pin" size={14} /> Hecho con propósito en República Dominicana</span></div><div><h3>Empieza tu viaje</h3><a href="#/vuelos">Buscar vuelos</a><a href="#/destinos">Nuestros destinos</a><a href="#/millas">Millas corporativas</a></div><div><h3>Viaja a tu manera</h3><a href="#/viajes">Mis reservaciones</a><a href="#/check-in">Check-in en línea</a><a href="#/ayuda?tema=equipaje">Equipaje y servicios</a></div><div><h3>Estamos cerca</h3><a href="#/ayuda">Centro de ayuda</a><a href="#/ayuda?tema=cancelaciones">Cambios y cancelaciones</a><a href="#/demo">Explorar el prototipo <Icon name="arrow" size={13} /></a></div></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} Lógica 404 · Grupo 05 · UASD</span><span>Prototipo académico. Vuelos y operaciones simulados.</span><a href="#/ayuda?tema=condiciones">Condiciones de uso</a></div></footer>
    {toast && <div className="toast" role="status"><span><Icon name="checkCircle" size={20} /></span><p>{toast.mensaje}</p><button className="icon-button" onClick={() => setToast(null)} aria-label="Cerrar notificación"><Icon name="close" size={17} /></button></div>}
  </AppContext.Provider>
}
