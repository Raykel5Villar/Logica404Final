/** QA local con el Chrome instalado. No se incluye en el código de la aplicación. */
export async function conectar() {
  const pestañas = await (await fetch('http://127.0.0.1:9222/json/list')).json()
  const pestaña = pestañas.find(t => t.type === 'page')
  const socket = new WebSocket(pestaña.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject })
  let id = 0
  const pendientes = new Map()
  const errores = []
  const peticiones = []
  socket.onmessage = evento => {
    const mensaje = JSON.parse(evento.data)
    if (mensaje.method === 'Runtime.exceptionThrown') errores.push(mensaje.params.exceptionDetails)
    if (mensaje.method === 'Runtime.consoleAPICalled' && mensaje.params.type === 'error') errores.push({ consola: mensaje.params.args.map(a => a.value || a.description).join(' ') })
    if (mensaje.method === 'Network.requestWillBeSent') peticiones.push(mensaje.params.request.url)
    if (mensaje.id) { const promesa = pendientes.get(mensaje.id); pendientes.delete(mensaje.id); mensaje.error ? promesa?.reject(mensaje.error) : promesa?.resolve(mensaje.result) }
  }
  const enviar = (method, params = {}) => new Promise((resolve, reject) => { const numero = ++id; pendientes.set(numero, { resolve, reject }); socket.send(JSON.stringify({ id: numero, method, params })) })
  const evaluar = async expression => { const r = await enviar('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + ': ' + r.exceptionDetails.exception?.description); return r.result?.value }
  await enviar('Page.enable'); await enviar('Runtime.enable'); await enviar('Network.enable')
  return { enviar, evaluar, errores, peticiones, cerrar: () => socket.close() }
}
export const esperar = ms => new Promise(resolve => setTimeout(resolve, ms))
