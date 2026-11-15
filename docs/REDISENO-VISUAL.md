# Evolución visual de Lógica 404 Airlines

Auditoría y trabajo local del 14 de noviembre de 2026. Se conserva React/Vite y el modelo funcional del prototipo.

## Auditoría inicial

La interfaz ya tenía una base aprovechable: marca reconocible en azul y azul marino, buscador con etiquetas, navegación directa, fotografías locales, selector de moneda y componentes con radios pequeños. No había una paleta violeta ni esquinas exageradas que justificaran sustituir el sistema completo.

Los problemas principales estaban en la composición y el contenido visual:

- La portada reunía fotografía con un gran degradado oscuro, una trayectoria aérea decorativa, avatares y cinco estrellas sin reseñas que los respaldaran. Esos recursos restaban protagonismo al buscador y sugerían una prueba social inexistente.
- Los destinos repetían la misma tarjeta, insignia de vuelo directo e iconografía. La información útil de ciudad, código y tarifa debía organizarse con mayor jerarquía.
- La promoción corporativa imitaba una tarjeta de fidelidad inclinada sobre órbitas y brillos. El beneficio real —acumular y canjear millas— quedaba por detrás del adorno.
- Varias pantallas reutilizaban superficies, iconos y encabezados equivalentes pese a tener tareas distintas. Acceso, consulta, reserva y check-in necesitan una orientación específica.
- Parte de los textos secundarios y bordes tenía poco contraste. Los importes, los estados y los pasos del proceso merecían más diferenciación.

Las capturas previas se obtuvieron de la compilación local existente, antes de sustituirla, en `artifacts/antes-inicio-escritorio.png` y `artifacts/antes-inicio-movil.png`.

## Dirección visual

Se adopta una aerolínea con origen caribeño y una presentación editorial funcional. La personalidad viene de la marca, la fotografía, la tipografía y la organización de los datos.

- **Color:** conservar `#041f3f` y `#078ce8`; usar el azul para orientación y énfasis, el azul marino para texto y acciones de alto contraste, y superficies blancas o claras para leer formularios y detalles.
- **Tipografía:** mantener fuentes del sistema y tamaños legibles; diferenciar títulos editoriales de datos operativos. Los horarios, códigos e importes deben poder compararse rápidamente.
- **Composición:** dar prioridad al buscador en el inicio; alternar información editorial, fotografía y filas de datos para reducir la repetición de tarjetas.
- **Componentes:** bordes precisos, radios de 4–6 px, separadores consistentes, controles de al menos 44 px cuando sea posible, botones con estados claros y sin movimiento decorativo.
- **Fotografía:** reutilizar los archivos locales; evitar fotografías o fuentes remotas que introduzcan dependencias de red. Las imágenes de viaje son ilustrativas, no documentación de aeropuertos o servicios concretos.
- **Reserva:** hacer visible el itinerario, el progreso y el total, manteniendo los campos, opciones y validaciones existentes.
- **Accesibilidad:** conservar etiquetas, foco visible, navegación por teclado, avisos accesibles, diálogos y respeto por movimiento reducido; comprobar pantallas estrechas.

Se retiran afirmaciones visuales sin respaldo y adornos que no ayudan a la tarea. Se conserva la condición de prototipo académico y la explicación de operaciones simuladas.

## Referencias y alcance de observación

Se consultaron las webs oficiales de [Lufthansa](https://www.lufthansa.com/), [Airbnb](https://www.airbnb.com/) y [Linear](https://linear.app/) para revisar principios de navegación, jerarquía y organización de la información. Se tomaron como referencias de claridad, no como plantillas para copiar. La herramienta web no permitió una inspección completa de [Delta](https://www.delta.com/), [United](https://www.united.com/) ni de la referencia desplegada `logica404final.vercel.app`; por ello la auditoría del producto se apoya en el código y la compilación local disponibles.

## Límites del cambio

La intervención es de presentación. No se cambian los módulos de dominio, la persistencia, los contratos, las rutas, los precios, los pagos simulados, la moneda base, las reglas de cancelación ni las condiciones del check-in. No se añaden dependencias. La entrega se mantiene local, tal como establece `docs/DECISIONES.md`.

## Implementación

- **Inicio:** texto sobre azul marino y fotografía en paneles separados. El buscador permanece unido a la portada, sin solapamientos decorativos; el intercambio de aeropuertos dispone de una columna propia en escritorio y tablet. Se retiran avatares, estrellas y trayectoria ficticia. Los accesos rápidos llevan a tareas concretas: gestionar la reserva, hacer check-in y consultar equipaje.
- **Destinos:** fotografías sin cajas que envuelvan todo el contenido, códigos de aeropuerto legibles, tarifas con jerarquía y filtros de texto. Panamá y Santiago usan una composición con su código cuando no hay una fotografía apropiada, en lugar de mostrar una ciudad ajena.
- **Cuenta corporativa:** dos columnas con beneficios y condiciones de canje reales del prototipo, sustituyendo la tarjeta inclinada, las órbitas y el brillo.
- **Acceso y ayuda:** formulario con etiquetas claras y una fotografía editorial separada; perfiles de demostración visibles. La ayuda incorpora accesos por tema y acordeones con relaciones ARIA explícitas.
- **Pantallas operativas:** horarios, origen, destino, importes y estados usan tipografía sans serif y cifras alineadas. La reserva mantiene los pasos, los asientos y el resumen; el check-in organiza sus instrucciones en una secuencia numerada.
- **Sistema compartido:** azul marino en acciones principales para asegurar contraste, textos secundarios más oscuros, bordes consistentes y estados de foco visibles. Se conservan el azul corporativo, el selector de moneda y las rutas existentes. Se añaden relaciones accesibles para los menús y las opciones de cabina.

## Validación

Comprobaciones realizadas el 14 de noviembre de 2026 con Chrome en un perfil aislado:

- `npm.cmd test`: **19 pruebas aprobadas**, incluidas reglas de reserva, pago rechazado, cancelación, millas, check-in, autorización y moneda.
- `npm.cmd run build`: compilación de producción correcta, sin dependencias nuevas.
- `node scripts/verificar-interfaz.mjs`: **10 recorridos aprobados**. Se comprobaron búsqueda pública, continuidad al iniciar sesión, asientos y servicios, pago y persistencia, devolución, migración rechazada y reintento, pase, actualización del agente, reserva corporativa y registro. Cero errores de JavaScript y cero peticiones externas durante el recorrido.
- `node scripts/verificar-moneda.mjs`: **6 comprobaciones aprobadas**. USD, DOP y EUR, persistencia, selector con teclado, ajuste móvil, conservación de campos al cambiar moneda y cálculo base en USD.
- **Ajuste responsive:** 60 combinaciones de página y ancho, entre **320, 390, 768, 1024 y 1440 px**, sin desbordamiento horizontal. Se revisaron inicio, vuelos, destinos, acceso, registro, ayuda, millas, demostración, viajes, check-in, cuenta y correo. La tabla administrativa conserva su desplazamiento interno, comprobado también durante el recorrido funcional.
- **Buscador tras ajustar la cuadrícula:** intercambio de origen/destino y búsqueda operativos en inicio de 390/1440 px y resultados de 320/768/1024 px. En escritorio y tablet el botón de intercambio no invade el campo de destino.
- **Accesibilidad dirigida:** controles visibles con etiquetas, botones con nombre, menú con Enter/Escape, salto al contenido, expansión de cabina y acordeones con teclado. El modo de movimiento reducido deja la transición de botones en `0s`.
- **Contraste medido en ejemplos activos:** acción principal blanco/azul marino **16.50:1**, país y nota de tarifa **6.07:1**, antetítulos azules **5.57:1** y texto de portada **12.55:1**. Este muestreo no equivale a una auditoría completa ni a una certificación WCAG; no se presentan placeholders ni estados deshabilitados como texto activo evaluado.
- **Revisión final de controles:** se oscurecieron los bordes de campos y asientos disponibles, y los textos de la leyenda, columnas, filas y conexión directa. La comprobación dirigida posterior midió bordes de **3.41:1** sobre blanco y **3.17:1** sobre la superficie clara del mapa de asientos; las etiquetas revisadas de reserva quedaron entre **5.65:1 y 8.05:1**. En acceso, los campos y botones de perfiles también alcanzan **3.41:1** en sus bordes. Las capturas de reserva y acceso se actualizaron después del ajuste.
- **Estados hover de los campos revisados:** el borde conserva **6.07:1** en reserva y **3.41:1** en acceso; no se vuelve más tenue al pasar el puntero.

Durante la ejecución se detectó una fragilidad previa del script de interfaz: obtenía la fecha del vuelo de demostración recortando su fecha UTC, mientras el panel usa Santo Domingo. El script ahora importa `fechaLocal`, la misma función del producto; no se modificó el comportamiento de la aplicación. El recorrido se repitió completo y aprobó.

Las capturas posteriores y los informes JSON se conservan en `artifacts/`, excluido de Git. Las capturas largas del inicio se realizaron después de recorrer la página y esperar la decodificación de las imágenes con carga diferida. La validación corresponde al prototipo local con servicios simulados; no incluye un despliegue nuevo ni servicios de una aerolínea real.
