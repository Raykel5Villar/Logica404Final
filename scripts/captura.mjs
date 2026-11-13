import fs from 'node:fs/promises'
import { conectar, esperar } from './cdp.mjs'
const cdp = await conectar()
try {
  await cdp.enviar('Emulation.setDeviceMetricsOverride', { width: Number(process.argv[2] || 1440), height: Number(process.argv[3] || 1000), deviceScaleFactor: 1, mobile: false })
  await cdp.enviar('Page.navigate', { url: 'http://127.0.0.1:5173/' + (process.argv[4] || '#/') })
  await esperar(1200)
  const captura = await cdp.enviar('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true })
  await fs.mkdir('artifacts', { recursive: true })
  await fs.writeFile(`artifacts/${process.argv[5] || 'inicio'}.png`, Buffer.from(captura.data, 'base64'))
  console.log(JSON.stringify({ titulo: await cdp.evaluar('document.title'), dimensiones: await cdp.evaluar('({pantalla:innerWidth,contenido:document.documentElement.scrollWidth,alto:document.documentElement.scrollHeight})'), errores: cdp.errores }, null, 2))
} finally { cdp.cerrar() }
