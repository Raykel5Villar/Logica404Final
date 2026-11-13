import { useEffect, useRef } from 'react'

const paths = {
  plane: <><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></>,
  flight: <><path d="m22 12-8-3V3a2 2 0 0 0-4 0v6l-8 3v3l8-1v5l-3 2v1l5-1 5 1v-1l-3-2v-5l8 1Z" /></>,
  search: <><circle cx="10.5" cy="10.5" r="7" /><path d="m16 16 5 5" /></>,
  arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  back: <path d="M20 12H4m6-6-6 6 6 6" />,
  chevron: <path d="m9 5 7 7-7 7" />,
  down: <path d="m6 9 6 6 6-6" />,
  swap: <><path d="M4 7h16l-4-4M20 17H4l4 4" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M16 3v4M8 3v4M3 11h18" /></>,
  users: <><circle cx="9" cy="7" r="3" /><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6M21 21v-3a6 6 0 0 0-4-5" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 22v-2a8 8 0 0 1 16 0v2" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  checkCircle: <><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></>,
  shield: <><path d="m12 3 8 4v5c0 5-8 10-8 10S4 17 4 12V7Z" /><path d="m8 12 3 3 5-6" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  luggage: <><rect x="5" y="6" width="14" height="15" rx="3" /><path d="M9 6V3h6v3M9 10v7m6-7v7M8 21v1m8-1v1" /></>,
  ticket: <><path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4Z" /><path d="M15 5v3m0 3v2m0 3v3" /></>,
  pin: <><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>,
  sparkles: <><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5ZM21 2v4m-2-2h4" /></>,
  star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9Z" />,
  globe: <><circle cx="12" cy="12" r="9" /><ellipse cx="12" cy="12" rx="4" ry="9" /><path d="M3 12h18" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m3 6 9 7 9-7" /></>,
  lock: <><rect x="5" y="10" width="14" height="11" rx="3" /><path d="M8 10V6a4 4 0 0 1 8 0v4m-4 5v2" /></>,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6m0-10v.01" /></>,
  card: <><rect x="2" y="4" width="20" height="16" rx="3" /><path d="M2 9h20M6 15h3" /></>,
  seat: <><path d="M7 3v11h11v4H7a3 3 0 0 1-3-3V7m3 11-1 3m12-3 1 3M11 7h7v7" /></>,
  meal: <><path d="M4 3v6a2 2 0 0 0 4 0V3M6 3v18M20 3v18m0-18c-6 3-6 9 0 9" /></>,
  download: <><path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4" /></>,
  print: <><path d="M6 9V3h12v6M6 17H3V9h18v8h-3M6 14h12v7H6Z" /></>,
  edit: <><path d="m16 3 5 5-12 12-6 1 1-6ZM14 5l5 5" /></>,
  settings: <><path d="M4 7h16M4 17h16" /><circle cx="9" cy="7" r="3" /><circle cx="16" cy="17" r="3" /></>,
  logout: <><path d="M9 3H3v18h6M9 12h12m-5-5 5 5-5 5" /></>,
  heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />,
  building: <><path d="M4 21V3h12v18M16 9h4v12M2 21h20M8 7h4M8 11h4M8 15h4M9 21v-3h2v3" /></>,
  help: <><circle cx="12" cy="12" r="9" /><path d="M9 9a3 3 0 0 1 6 0c0 2-3 2-3 4m0 4v.01" /></>,
}
export function Icon({ name, size = 20, ...props }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name] || paths.plane}</svg> }
export function Brand({ light = false }) { return <a className={`brand ${light ? 'brand-light' : ''}`} href="#/" aria-label="Lógica 404, inicio"><span className="brand-code">&lt;<b>/</b>&gt;</span><span>Lógica<span className="brand-blue">404</span><small>A I R L I N E S</small></span></a> }
export function Button({ children, icon, variant = 'primary', className = '', ...props }) { return <button className={`btn btn-${variant} ${className}`} {...props}>{icon && <Icon name={icon} size={18} />}{children}</button> }
export function Alert({ children, type = 'error' }) { if (!children) return null; return <div className={`alert alert-${type}`} role={type === 'error' ? 'alert' : 'status'}><Icon name={type === 'success' ? 'checkCircle' : 'info'} size={20} /><span>{children}</span></div> }
export function Badge({ children, type = 'blue' }) { return <span className={`badge badge-${type}`}>{children}</span> }
export function Empty({ icon = 'ticket', title, children, action }) { return <div className="empty"><span className="empty-icon"><Icon name={icon} size={32} /></span><h2>{title}</h2><p>{children}</p>{action}</div> }
export function Field({ label, children, hint, className = '' }) { return <label className={`field ${className}`}><span>{label}</span>{children}{hint && <small>{hint}</small>}</label> }
export function PageHeading({ eyebrow, title, children, action }) { return <div className="page-heading"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1>{children && <p>{children}</p>}</div>{action}</div> }
export function Modal({ title, children, onClose, wide = false }) {
  const ref = useRef(null)
  useEffect(() => {
    const anterior = document.activeElement
    const dialogo = ref.current
    const enfocar = () => dialogo.querySelector('input,select,textarea,button')?.focus()
    enfocar()
    const manejar = e => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab') {
        const elementos = Array.from(dialogo.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),select,textarea,[tabindex="0"]')).filter(el => el.offsetParent !== null)
        const primero = elementos[0], ultimo = elementos.at(-1)
        if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo?.focus() }
        if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero?.focus() }
      }
    }
    document.addEventListener('keydown', manejar)
    const previoOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', manejar); document.body.style.overflow = previoOverflow; anterior?.focus() }
  }, [onClose])
  return <div className="modal-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}><section className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby="modal-title" ref={ref}><div className="modal-heading"><h2 id="modal-title">{title}</h2><button className="icon-button" aria-label="Cerrar" onClick={onClose}><Icon name="close" /></button></div>{children}</section></div>
}
export function descargar(nombre, contenido, tipo = 'text/plain;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([contenido], { type: tipo }))
  const enlace = document.createElement('a'); enlace.href = url; enlace.download = nombre; enlace.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
