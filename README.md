# Lógica 404 Airlines

Prototipo funcional del sistema de reservaciones de vuelos para **INF3290 — Análisis y Diseño de Sistemas, Grupo 05, UASD**. Construido en React y JavaScript a partir del documento del proyecto y los recursos gráficos entregados.

**Sin backend, base de datos, API ni servicios externos en la aplicación.** Los repositorios y servidores del modelo UML son simulaciones en JavaScript. Los datos se guardan en `localStorage`; las imágenes se sirven desde el proyecto.

## Ejecutar

Requiere Node.js 22.12 o posterior compatible con Vite 8. En Windows/PowerShell usa `npm.cmd` si la política de ejecución impide usar `npm`.

```powershell
npm.cmd install
npm.cmd run dev
```

Abre la URL que muestra Vite, normalmente **http://localhost:5173**.

```powershell
npm.cmd test          # Pruebas de reglas de negocio con node:test
npm.cmd run build    # Genera dist/
npm.cmd run preview  # Sirve la compilación local
```

`dist/` se puede alojar en cualquier servidor estático. Las rutas con `#` no requieren redirecciones del servidor.

## Probar el sistema

Abre **Explorar el prototipo** desde el pie de página o la franja superior. También hay accesos de demostración en Iniciar sesión.

| Perfil | Correo | Contraseña |
| --- | --- | --- |
| Cliente minorista · Sofía Reyes | `cliente@logica404.com` | `Demo404!` |
| Cliente corporativo · Carlos Méndez | `empresa@logica404.com` | `Demo404!` |
| Agente de boletos · Ana García | `agente@logica404.com` | `Demo404!` |

La cuenta corporativa empieza con **12,500 millas**. La cuenta de Sofía incluye **L404DE / Reyes**, con salida cuatro horas después de crear la demostración, y **ANT404**, una reserva creada nueve días antes para probar el rechazo de cancelación fuera de plazo.

El centro de demostración permite cambiar los resultados del pago y la devolución, la respuesta migratoria, el correo y el reloj. **Preparar ventana de check-in** sitúa el reloj tres horas antes del abordaje de L404DE. **Reiniciar demostración** restaura los datos de ejemplo, con confirmación dentro de la interfaz.

Tarjeta aprobada: `4242 4242 4242 4242`, vencimiento `12/30`, CVV `123` y titular ficticio. La tarjeta `4000 0000 0000 0002` simula fondos insuficientes. No se realizan cargos ni se guardan números de tarjeta o CVV.

## Funcionalidades

- Consulta pública por origen, destino, fecha, pasajeros, clase y hora exacta opcional; filtros de horario y precio, ordenación y fechas alternativas.
- Registro y autenticación de tres perfiles, validación de campos, correo duplicado y contraseña, sesión persistente y cierre de sesión.
- Reserva de uno a cuatro pasajeros, datos individuales, mapa de asientos, servicios, millas, desglose del precio, pago simulado, PNR y comprobante descargable.
- Mis viajes, detalles, cancelación con devolución del 80 %, liberación de asientos y reversión de millas.
- Check-in con verificación de propietario, apellido, plazo, estado del vuelo y migración; pase por pasajero descargable e imprimible mediante la función PDF del navegador.
- Panel de agente con filtros, exportación CSV, edición de horario, tarifa, estado y puerta, notificación a clientes afectados y actividad reciente.
- Bandeja de correo simulada, mensajes pendientes, reintento de entrega, cuenta personal y movimientos de millas.
- Diseño adaptable, navegación por teclado, diálogos con gestión del foco, alertas accesibles y soporte para movimiento reducido.
- Selector de moneda USD, DOP y EUR, disponible también en móvil, con preferencia persistente y conversión visual mediante tasas fijas de demostración. Los importes del modelo de negocio se conservan en USD.

## Organización

```text
src/
  domain/
    modelos.js        Entidades UML
    repositorios.js   Acceso a las colecciones locales
    controles.js      Reglas y casos de uso
    formularios.js    Contratos UML de presentación
    servicios.js      Pago, correo y migración simulados
    almacen.js        Estado observable y persistencia
    datos.js          Catálogo y datos de ejemplo
  components/         Elementos compartidos y buscador
  pages/              Vistas React para cada flujo
  styles/             CSS adaptado de las referencias
  App.jsx             Navegación, autorización y estructura
public/images/        Logos originales e imágenes locales
tests/                Pruebas de reglas de negocio
scripts/              Revisión con Chrome local
docs/                 Trazabilidad, decisiones y requisitos
```

Consulta [docs/TRAZABILIDAD.md](docs/TRAZABILIDAD.md) para relacionar clases y métodos con el Word; [docs/DECISIONES.md](docs/DECISIONES.md) explica las ambigüedades y reglas de simulación.

## Verificación de interfaz

`npm.cmd run test:ui` utiliza el protocolo de depuración del Chrome instalado, sin dependencias adicionales. Necesita Vite en `http://127.0.0.1:5173` y un Chrome aislado con depuración local en el puerto `9222`. Las pruebas restauran los datos del perfil de QA; no deben ejecutarse en una sesión que se quiera conservar.

En este entorno se utilizó Chromium local abierto sin ventana mediante `Start-Process -WindowStyle Hidden`, con `--headless=new --remote-debugging-port=9222` y perfil separado `.browser-qa`. Informes y capturas se escriben en `artifacts/`, excluido de Git.

## Persistencia y alcance

Clave local: `logica404-prototipo-v1`. Los datos pertenecen a este navegador y origen y no se comparten entre dispositivos. El calendario contiene 30 días desde la creación de la demostración; se puede regenerar reiniciándola. Si el navegador impide guardar datos, se conserva el estado de la sesión y se muestra un aviso.

Las cuentas y credenciales son datos locales de un prototipo: usa información ficticia. La autorización también se comprueba en los controles de negocio; no representa la seguridad de un sistema con servidor.
