import { MONEDAS, preferenciaMoneda } from '../domain/moneda.js'
import { useApp } from '../context.jsx'
import { Icon } from './UI.jsx'

export default function SelectorMoneda() {
  const { moneda, notificar } = useApp()
  function cambiarMoneda(evento) {
    const codigo = evento.target.value
    preferenciaMoneda.seleccionar(codigo)
    const detalle = codigo === 'USD' ? 'moneda base del prototipo' : `tasa de demostración: 1 USD = ${MONEDAS[codigo].tasa} ${codigo}`
    notificar(`Precios en ${MONEDAS[codigo].nombre.toLocaleLowerCase()}. ${detalle}.`)
  }
  return <label className="currency" title="Moneda de visualización. Tasas fijas de demostración: 1 USD = 60 DOP = 0.92 EUR.">
    <span className="sr-only">Moneda de visualización</span>
    <select aria-label="Moneda de visualización" aria-describedby="moneda-descripcion" value={moneda} onChange={cambiarMoneda}>
      {Object.values(MONEDAS).map(opcion => <option value={opcion.codigo} key={opcion.codigo}>{opcion.codigo}</option>)}
    </select>
    <Icon name="down" size={12} />
    <span className="sr-only" id="moneda-descripcion">Conversión con tasas fijas de demostración. Los importes originales se conservan en dólares estadounidenses.</span>
  </label>
}
