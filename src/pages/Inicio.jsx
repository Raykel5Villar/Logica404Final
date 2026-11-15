import { useState } from 'react'
import FormularioConsulta from '../components/FormularioConsulta.jsx'
import { Icon, Button } from '../components/UI.jsx'
import { navegar, useApp } from '../context.jsx'
import { sumarDias, dinero } from '../domain/datos.js'
import { almacen } from '../domain/almacen.js'

export const DESTINOS = [
  { ciudad: 'San Juan', pais: 'Puerto Rico', codigo: 'SJU', precio: 129, imagen: 'san-juan', etiqueta: 'Una escapada al Caribe', tipo: 'playa' },
  { ciudad: 'Miami', pais: 'Estados Unidos', codigo: 'MIA', precio: 189, imagen: 'miami', etiqueta: 'Sol, arte y nuevas historias', tipo: 'ciudad' },
  { ciudad: 'Nueva York', pais: 'Estados Unidos', codigo: 'JFK', precio: 269, imagen: 'new-york', etiqueta: 'La ciudad que siempre sorprende', tipo: 'ciudad' },
  { ciudad: 'Punta Cana', pais: 'República Dominicana', codigo: 'PUJ', origen: 'SJU', precio: 119, imagen: 'santo-domingo', etiqueta: 'Tu pausa frente al mar', tipo: 'playa' },
]
export function buscarDestino(destino) { navegar(`/vuelos?${new URLSearchParams({ origen: destino.origen || 'SDQ', destino: destino.codigo, fecha: sumarDias(1, almacen.ahora()), pasajeros: '1', clase: 'economica' })}`) }
export function TarjetaDestino({ destino }) {
  return <button className="destination-card" onClick={() => buscarDestino(destino)} aria-label={`Buscar vuelos a ${destino.ciudad}, tarifa de referencia desde ${dinero(destino.precio)} por persona`}><div className={`destination-photo ${destino.sinFoto ? 'destination-placeholder' : ''}`}>{destino.sinFoto ? <><strong aria-hidden="true">{destino.codigo}</strong><span>Explora esta ruta</span></> : <><img src={`/images/${destino.imagen}.jpg`} alt="" loading="lazy" /><span className="destination-tag">{destino.codigo}</span></>}<span className="destination-arrow"><Icon name="arrow" size={20} /></span></div><div className="destination-body"><span className="destination-country">{destino.pais}</span><h3>{destino.ciudad}</h3><p>{destino.etiqueta}</p><div className="destination-price"><span>Solo ida desde</span><strong>{dinero(destino.precio)}<small> / persona</small></strong></div></div></button>
}
export default function Inicio() {
  const [categoria, setCategoria] = useState('todos')
  const { usuario } = useApp()
  return <>
    <section className="hero-wrap container" aria-labelledby="inicio-titulo">
      <div className="hero"><div className="hero-content"><span className="hero-eyebrow">DE AQUÍ, A DONDE QUIERAS IR</span><h1 id="inicio-titulo">El Caribe,<br /><em>más cerca.</em></h1><p>Hay viajes que empiezan con ganas de volver.<br className="desktop-only" /> Y otros, con ganas de descubrir.</p><a className="hero-explore" href="#/destinos">Encuentra tu próximo destino <Icon name="arrow" size={18} /></a></div><figure className="hero-photo"><img src="/images/caribe.jpg" alt="Orilla de aguas turquesas al atardecer" fetchPriority="high" /><figcaption><span>EL ORIGEN DE NUESTRAS HISTORIAS</span><strong>Nacimos en el Caribe.</strong></figcaption></figure></div>
      <div className="search-panel"><nav className="search-tabs" aria-label="Organiza tu viaje"><span className="active" aria-current="page"><Icon name="flight" size={18} /> Buscar vuelos</span><a href="#/viajes"><Icon name="luggage" size={18} /> Mis viajes</a><a href="#/check-in"><Icon name="ticket" size={18} /> Check-in</a></nav><FormularioConsulta /></div>
    </section>
    <section className="trust-strip container" aria-label="Todo para tu viaje">{[
      ['/viajes', '01', 'Tu reserva, a mano', 'Consulta tu itinerario y gestiona tus viajes.'], ['/check-in', '02', 'Listo para abordar', 'Haz check-in y descarga tu pase en línea.'], ['/ayuda?tema=equipaje', '03', 'Prepara tu equipaje', 'Conoce los servicios antes de viajar.'],
    ].map(([href, numero, titulo, texto]) => <a className="trust-item" href={`#${href}`} key={titulo}><span className="trust-number" aria-hidden="true">{numero}</span><span><strong>{titulo}</strong><small>{texto}</small></span><Icon name="arrow" size={17} /></a>)}</section>
    <section className="section container destinations-section" aria-labelledby="destinos-titulo"><div className="section-heading"><div><span className="eyebrow">ELIGE TU PRÓXIMA PARADA</span><h2 id="destinos-titulo">Un poco de mar. Otra ciudad.</h2><p>Vuelos directos para volver a lo que te gusta o descubrir algo nuevo.</p></div><a className="link-arrow" href="#/destinos">Explorar destinos <Icon name="arrow" size={18} /></a></div><div className="destination-filters" role="group" aria-label="Filtrar destinos">{[['todos', 'Todos los destinos'], ['playa', 'Sol y playa'], ['ciudad', 'Vida de ciudad']].map(([id, nombre]) => <button key={id} aria-pressed={categoria === id} className={categoria === id ? 'active' : ''} onClick={() => setCategoria(id)}>{nombre}</button>)}</div><div className="destination-grid">{DESTINOS.filter(d => categoria === 'todos' || d.tipo === categoria).map(destino => <TarjetaDestino key={destino.codigo} destino={destino} />)}</div><p className="fare-note">Tarifas de referencia por persona, solo ida. Impuestos y servicios se detallan antes de pagar.</p></section>
    <section className="container"><div className="corporate-feature"><div className="corporate-intro"><span className="eyebrow">LÓGICA 404 · CORPORATE CLUB</span><h2>Viaja por trabajo.<br /><em>Vuelve por gusto.</em></h2><p>Los viajes de tu empresa también pueden acercarte a tu próximo descanso.</p><Button variant="white" icon="arrow" onClick={() => navegar(usuario?.perfil === 'corporativo' ? '/millas' : '/registro?perfil=corporativo')}>Conoce los beneficios</Button></div><div className="corporate-details"><span className="eyebrow">CADA MILLA CUENTA</span><div><span>01</span><div><h3>Suma con cada reserva</h3><p>Consulta las millas de cada ruta y acumúlalas con tu cuenta corporativa.</p></div></div><div><span>02</span><div><h3>Acércate a tu siguiente viaje</h3><p>Cada 1,000 millas equivalen a {dinero(10)} de descuento. Úsalas para cubrir hasta el 30 % de la tarifa base.</p></div></div><a className="link-arrow" href="#/millas">Cómo funcionan las millas <Icon name="arrow" size={17} /></a></div></div></section>
    <section className="container section closing-section"><div><span className="eyebrow">ANTES DE DESPEGAR</span><h2>Viaja con las cosas claras.</h2><p>Equipaje, check-in y condiciones de tu reserva, en un solo lugar.</p></div><a className="link-arrow" href="#/ayuda">Visita nuestro centro de ayuda <Icon name="arrow" size={18} /></a></section>
  </>
}
