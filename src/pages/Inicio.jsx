import { useState } from 'react'
import FormularioConsulta from '../components/FormularioConsulta.jsx'
import { Icon, Button, Badge } from '../components/UI.jsx'
import { navegar, useApp } from '../context.jsx'
import { sumarDias } from '../domain/datos.js'
import { almacen } from '../domain/almacen.js'

export const DESTINOS = [
  { ciudad: 'San Juan', pais: 'Puerto Rico', codigo: 'SJU', precio: 129, imagen: 'san-juan', etiqueta: 'Una escapada al Caribe', tipo: 'playa' },
  { ciudad: 'Miami', pais: 'Estados Unidos', codigo: 'MIA', precio: 189, imagen: 'miami', etiqueta: 'Sol, arte y nuevas historias', tipo: 'ciudad' },
  { ciudad: 'Nueva York', pais: 'Estados Unidos', codigo: 'JFK', precio: 269, imagen: 'new-york', etiqueta: 'La ciudad que siempre sorprende', tipo: 'ciudad' },
  { ciudad: 'Punta Cana', pais: 'República Dominicana', codigo: 'PUJ', origen: 'SJU', precio: 119, imagen: 'santo-domingo', etiqueta: 'Tu pausa frente al mar', tipo: 'playa' },
]
export function buscarDestino(destino) { navegar(`/vuelos?${new URLSearchParams({ origen: destino.origen || 'SDQ', destino: destino.codigo, fecha: sumarDias(1, almacen.ahora()), pasajeros: '1', clase: 'economica' })}`) }
export function TarjetaDestino({ destino }) {
  return <button className="destination-card" onClick={() => buscarDestino(destino)}><div className="destination-photo"><img src={`/images/${destino.imagen}.jpg`} alt={`Descubre ${destino.ciudad}`} loading="lazy" /><span className="destination-tag"><Icon name="flight" size={13} /> Vuelo directo</span><span className="destination-arrow"><Icon name="arrow" size={20} /></span></div><div className="destination-body"><span className="destination-country">{destino.pais}</span><h3>{destino.ciudad}</h3><p>{destino.etiqueta}</p><div className="destination-price"><span>Solo ida desde</span><strong>US$ {destino.precio}<small> / persona</small></strong></div></div></button>
}
export default function Inicio() {
  const [categoria, setCategoria] = useState('todos')
  const { usuario } = useApp()
  return <>
    <section className="hero-wrap container">
      <div className="hero"><div className="hero-content"><span className="hero-eyebrow"><span /> EL MUNDO ESTÁ MÁS CERCA</span><h1>Tu próximo destino.<br />Tu próxima <em>historia.</em></h1><p>Conectamos el Caribe con tus ganas de explorar.<br className="desktop-only" /> Vuela fácil, viaja a tu manera.</p><div className="hero-proof"><span className="proof-avatars"><i>AM</i><i>JR</i><i>LC</i></span><span><span className="five-stars">★★★★★</span><small>Más momentos. Más lugares. Más tú.</small></span></div></div><div className="hero-location"><Icon name="pin" size={15} /> Tu próxima escapada empieza aquí</div><div className="hero-route" aria-hidden="true"><svg viewBox="0 0 340 170"><path d="M10 160Q200-100 330 60" fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="5 8" /></svg><Icon name="plane" size={30} /></div></div>
      <div className="search-panel"><div className="search-tabs"><span className="active"><Icon name="flight" size={18} /> Buscar vuelos</span><a href="#/viajes"><Icon name="luggage" size={18} /> Mis viajes</a><a href="#/check-in"><Icon name="ticket" size={18} /> Check-in</a></div><FormularioConsulta /></div>
    </section>
    <section className="trust-strip container" aria-label="Beneficios de viajar con Lógica 404">{[
      ['shield', 'Reserva con tranquilidad', 'Tus planes, en buenas manos.'], ['ticket', 'Todo tu viaje, en un lugar', 'Reserva, gestiona y haz check-in.'], ['sparkles', 'Cada viaje te lleva más lejos', 'Acumula millas con tu cuenta corporativa.'],
    ].map(([icono, titulo, texto]) => <div className="trust-item" key={titulo}><span className="trust-icon"><Icon name={icono} size={23} /></span><span><strong>{titulo}</strong><small>{texto}</small></span></div>)}</section>
    <section className="section container destinations-section"><div className="section-heading"><div><span className="eyebrow">INSPÍRATE Y DESPEGA</span><h2>Un destino para cada versión de ti</h2><p>De una escapada al mar a esa ciudad que siempre has querido conocer.</p></div><a className="link-arrow" href="#/destinos">Explorar destinos <Icon name="arrow" size={18} /></a></div><div className="destination-filters">{[['todos', 'Todos los destinos', 'globe'], ['playa', 'Sol y playa', 'sparkles'], ['ciudad', 'Vida de ciudad', 'building']].map(([id, nombre, icono]) => <button key={id} className={categoria === id ? 'active' : ''} onClick={() => setCategoria(id)}><Icon name={icono} size={16} />{nombre}</button>)}</div><div className="destination-grid">{DESTINOS.filter(d => categoria === 'todos' || d.tipo === categoria).map(destino => <TarjetaDestino key={destino.codigo} destino={destino} />)}</div><p className="fare-note">Tarifas de referencia por persona, solo ida. Impuestos y servicios se detallan antes de pagar.</p></section>
    <section className="container"><div className="miles-banner"><div className="miles-art" aria-hidden="true"><span className="miles-orbit" /><div className="member-card"><span>&lt;/&gt; Lógica<span>404</span></span><small>CORPORATE CLUB</small><Icon name="sparkles" size={30} /><b>UN MUNDO DE POSIBILIDADES</b><div>•••• 4040 <span>MEMBER</span></div></div></div><div className="miles-copy"><Badge>PARA QUIENES SIEMPRE VAN MÁS ALLÁ</Badge><h2>Tus viajes de trabajo.<br />Tus próximas recompensas.</h2><p>Con tu cuenta corporativa acumulas millas y las conviertes en descuentos para tu siguiente destino.</p><Button variant="white" icon="arrow" onClick={() => navegar(usuario?.perfil === 'corporativo' ? '/millas' : '/registro?perfil=corporativo')}>Conoce los beneficios</Button></div></div></section>
    <section className="container section closing-section"><div><span className="eyebrow">CERCA DE TI, EN CADA PASO</span><h2>Viajar debería ser así de fácil.</h2><p>Elige tu destino. Nosotros te acompañamos en el camino.</p></div><a className="link-arrow" href="#/ayuda"><Icon name="help" size={19} /> Visita nuestro centro de ayuda <Icon name="arrow" size={18} /></a></section>
  </>
}
