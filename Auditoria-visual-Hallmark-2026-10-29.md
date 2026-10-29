# Auditoría visual independiente de PRISMO

29 de octubre de 2026 · Hallmark 2.0.0 · frontend del commit `d7cd0841b5783ae841b0c5d2bf416869106e0108`.

**Mi recomendación es conservar las capacidades y reconsiderar la organización de las pantallas.** PRISMO permite identificar campañas, materiales, personas y expedientes, pero obliga a atravesar demasiado contexto antes de actuar. Sus módulos no hablan un lenguaje visual consistente: algunos son mesas de trabajo, otros directorios y Macro se presenta casi como una portada promocional. Un cambio de colores no resolvería la principal fricción.

Priorizaría la mesa de revisión del Cliente, el acceso al material y la navegación móvil. Después reconstruiría la composición de Macro y simplificaría la Home del Operador. No hay evidencia para recomendar reescribir todo el producto.

## Qué se auditó realmente

Se utilizó el frontend compilado de PRISMO sin modificar sus componentes, estilos ni lógica. Un adaptador HTTP local, separado del repositorio, sirve respuestas ficticias de sus API. La instancia abre en Chromium con actores de Operador y Cliente independientes; la prueba del Cliente no depende sólo del botón «Vista Cliente» del operador.

Se inspeccionó `lib/cloudflare-access.ts`: existe `PRISMO_ALLOW_DEV_IDENTITY`, restringido a loopback, con `PRISMO_DEV_EMAIL`. Ese mecanismo resuelve identidad, pero no sustituye las dependencias de Google del estado operativo. Para esta auditoría se aisló la frontera HTTP de datos: las API de demostración nunca se remiten al backend de PRISMO. Los perfiles devueltos son ficticios, no sesiones reales de Cloudflare Access. Esto permite auditar presentación y navegación, no autorización.

La demo escucha exclusivamente en `127.0.0.1:5190`. El frontend compilado se sirve desde otro proceso local. Todas las escrituras del adaptador responden 409; las integraciones no implementadas responden 501. El navegador automatizado bloquea destinos externos, y el adaptador restringe conexiones, medios y marcos a origen local. No se usaron credenciales, bases de datos de producción, Master, Drive ni campañas reales.

La muestra contiene dos campañas operativas ficticias, seis talentos y participaciones, seis piezas con revisiones, un cliente ficticio, una agencia y un contrato Macro de muestra. Los importes y métricas son exclusivamente datos de demostración. Se incluyeron estados pendiente, aprobado, cambios solicitados y publicado, además de vacío, carga lenta y error.

No se consultaron diagnósticos previos, documentación histórica ni decisiones aprobadas para esta evaluación. Las conclusiones siguientes proceden de las capturas nuevas, los recorridos ejecutados y mediciones del DOM actual.

### Cobertura

| Superficie | Recorrido observado | Límite |
|---|---|---|
| Operador: Home | Pendientes, Seguimiento, cifras, abrir material; escritorio y móvil | Distribución de trabajo ficticia |
| Campañas | Creadores, Piezas, selección y detalle; escritorio | Sin altas ni modificaciones persistentes |
| Talentos | Directorio y ficha; recarga desde esta ubicación | Sin documentos privados |
| Clientes | Directorio, campañas y accesos mostrados | Sin gestión real de permisos |
| Contratos | Lista, nuevo expediente y validación de campos vacíos | No se completaron los cuatro pasos ni se generó un documento |
| Agencias | Entrada, formulario y selección de ficha | Expediente documental vacío |
| Macro | Resumen, selección de talento, acuerdos, cobros/pagos y expediente | Acuerdo sin precio cliente; documentos y movimientos vacíos |
| Herramientas | Editor de mensajes y Mantenimiento | Sin enviar mensajes ni ejecutar reparaciones |
| Cliente | Centro de decisiones, Campañas, revisión textual y aprobación fallida; escritorio y móvil | Sin guardados exitosos ni reproducción audiovisual |
| Estados globales | Sin datos para ambos roles, carga de 8 segundos y error 503 simulado | No representa disponibilidad o latencia de producción |

Hay 31 registros visuales principales en `tour.json` y `details.json`, con capturas de viewport y de página completa; una reproducción adicional mide el fallo de guardado. Las capturas completas con cabeceras sticky pueden situar la cabecera en mitad del archivo por la posición de scroll: no se considera eso un defecto del producto. Se usan las capturas de viewport para juzgar lo que vio el navegador.

[Galería de evidencia](Galeria-Hallmark-2026-10-29) · [Recorrido principal](Hallmark-Audit-2026-10-29/demo/tour.json) · [Recorridos de detalle](Hallmark-Audit-2026-10-29/demo/details.json) · [Mediciones](Hallmark-Audit-2026-10-29/demo/metrics.json)

## Hallazgos priorizados

P1: corregir antes de ampliar o pulir la experiencia. P2: cambio relevante de estructura o claridad. P3: consistencia secundaria. «Comprobado» significa reproducido en esta demo; su frecuencia en producción no se ha medido.

### 1. P1 — La revisión del Cliente empieza demasiado tarde en la página

**Comprobado:** la Home repite la campaña en el resumen, selector y título antes de presentar el material. En móvil hay una pantalla casi completa de contexto sin llegar al contenido que se debe aprobar. La acción «Aprobar sin cambios» comienza a **1599 px** desde el inicio del documento en un viewport de 390×844. En escritorio de 1440×1000 empieza a **986 px**, por lo que tampoco cabe completa en el primer viewport. Estas posiciones dependen del contenido de la muestra; no son un objetivo de rendimiento universal.

**Efecto:** el centro de decisiones dedica primero su espacio a describir el trabajo, en lugar de permitir hacerlo. La tabla de seguimiento agrega otro modo de lectura debajo del mismo recorrido.

**Recomendación:** reconstruir la composición de Home Cliente alrededor del material y la decisión. Un encabezado compacto con campaña, creador y posición en la cola; navegación de materiales junto al contenido; controles de decisión persistentes o próximos al material, sin facilitar aprobarlo a ciegas. Mover el seguimiento agregado a una vista secundaria. Eliminar los encabezados y resúmenes repetidos.

**Conservar:** separación de Guion, Pieza y Copy, identificación de versión y comentario de cambios. No recomiendo colapsarlos en una aprobación única.

**Evidencia:** [Cliente escritorio](Hallmark-Audit-2026-10-29/demo/captures/14-cliente-home.png), [Cliente móvil](Hallmark-Audit-2026-10-29/demo/captures/22-cliente-home-movil.png), [zona de decisión](Hallmark-Audit-2026-10-29/demo/captures/23-cliente-decision-movil.png), `metrics.json`.

### 2. P1 — El error de una aprobación puede quedar fuera de la vista

**Comprobado mediante fallo controlado:** tras pulsar Aprobar desde móvil, la API ficticia devuelve 409 con un error explícito. PRISMO añade el mensaje arriba de la página. Su rectángulo queda en **y = −1084.8 px**, con el usuario desplazado a la zona de decisión. La captura en ese punto no muestra el error. No apareció un éxito falso, pero falta feedback visible donde ocurrió la acción.

**Recomendación:** error persistente dentro del panel de decisión, asociado a la acción y anunciado de forma accesible; conservar comentario y selección, explicar que no se guardó y ofrecer reintento cuando corresponda. No depender sólo de un aviso global situado fuera del viewport.

**Criterio de cierre:** provocar fallo de servidor y conexión después de aprobar; el mensaje debe ser visible sin desplazarse y la decisión no debe parecer confirmada.

**Evidencia:** [viewport tras el fallo](Hallmark-Audit-2026-10-29/demo/captures/31-fallo-guardado-visible.png), [medición y HTTP](Hallmark-Audit-2026-10-29/demo/failure-check.json). La causa del fallo es artificial; su presentación es la respuesta real del frontend.

### 3. P1 — «Ver material» lleva a una pantalla dominada por Publicación

**Comprobado:** desde una decisión pendiente de comunicar, «Ver material» abre un diálogo con título grande, identificación y una banda oscura de «Registrar publicación». El contenido, aprobaciones e historial quedan dentro de un bloque cerrado. La acción que invoca el usuario y lo primero que encuentra no coinciden.

**Recomendación:** abrir directamente el material y la versión asociados al botón. Publicación debe aparecer como siguiente tarea cuando aplique, no como bloque dominante de toda pieza. El detalle puede mantenerse como entidad, pero necesita recomponerse según el punto de entrada. Considerar una página de material enlazable en lugar de un diálogo con casi toda la pantalla vacía.

**Límite:** se comprobó el orden y plegado del detalle; no se validó reproducción de video ni archivos Drive.

**Evidencia:** [detalle abierto desde Ver material](Hallmark-Audit-2026-10-29/demo/captures/25-pieza-detalle.png).

### 4. P1 — La ubicación Talentos se pierde al recargar

**Comprobado:** se abrió Talentos, se recargó y PRISMO volvió a Home. La URL antes y después era la misma, con `campaign` pero sin destino Talentos. Esto limita compartir una ficha, recuperar contexto y trabajar en varias pestañas.

**Recomendación:** rutas o parámetros estables para destinos, ficha seleccionada y filtros relevantes. Usar navegación web e historial para destinos; reservar estado local para interacción efímera. Verificar también Atrás/Adelante; no se afirma aquí haber probado exhaustivamente ese recorrido.

**Evidencia:** [Talentos antes](Hallmark-Audit-2026-10-29/demo/captures/05-talentos.png), [después de recargar](Hallmark-Audit-2026-10-29/demo/captures/13-recarga-talentos.png), registro `recarga-talentos-evidence` en `tour.json`.

### 5. P1 — Contraste insuficiente en texto funcional y selecciones

**Comprobado con estilos calculados y axe:** la etiqueta REEL de la pestaña seleccionada en Cliente tiene contraste **2.58:1** (`#172334` sobre `#175fc0`) a 12.8 px. El descriptor de cabecera tiene **2.97:1**. Ambos están por debajo de 4.5:1 para ese texto. Hay más incidencias en metadatos de tamaño pequeño; no se suman entre pantallas como problemas independientes.

**Recomendación:** corregir parejas de texto/fondo por estado, empezando por selección y acciones. La selección debe ser más legible que el estado normal. Añadir verificación de nombres accesibles: axe también detectó discrepancias entre texto visible y nombre accesible en botones de Campañas, y atributos ARIA no permitidos en Home.

**Evidencia:** `tour.json`, bloques `axe` de Home Cliente, Home Operador y Campañas; [selección visible](Hallmark-Audit-2026-10-29/demo/captures/14-cliente-home.png). Es una comprobación automatizada focal, no una certificación integral WCAG.

### 6. P2 — La navegación móvil exige descubrir desplazamientos internos

**Comprobado:** la navegación principal del operador ocupa **688 px** en un contenedor de **360 px**. Quedan destinos fuera de la vista, y más abajo la barra de estados introduce otra navegación horizontal. No hay desbordamiento horizontal de toda la página en los viewports de 390 px medidos; el problema es de descubrimiento, no una afirmación de que los destinos sean inaccesibles.

**Recomendación:** sustituir la tira principal por un menú explícito y compacto en móvil, con destino actual visible. Mantener una sola navegación contextual sencilla. Reducir el espacio que ocupan búsqueda, registrar entrega y selector de perspectiva cuando la tarea requiere leer material. No ocultar controles necesarios sin una alternativa localizable.

**Evidencia:** [Home Operador móvil](Hallmark-Audit-2026-10-29/demo/captures/17-operador-movil.png), [Macro móvil](Hallmark-Audit-2026-10-29/demo/captures/18-macros-movil.png), `metrics.json`.

### 7. P2 — La Home del Operador mezcla una cola de acción con un tablero de métricas

**Comprobado visual:** «Tu trabajo» aparece como pestaña y título, seguido de «Decisiones del cliente» y «Pendientes de comunicar». La columna lateral mantiene cifras de logística, entregas, publicaciones, correcciones y flujo, incluso con ceros. En Seguimiento se añade otro conjunto de seis categorías. Las unidades varían entre creadores, decisiones, materiales, piezas y creadores equivalentes.

**Juicio:** el problema no es tener muchos datos, sino pedir varias interpretaciones antes de saber qué resolver. La tarjeta que agrupa decisiones por creador sí ayuda y merece conservarse.

**Recomendación:** transformar Home en cola de trabajo ordenada por próxima acción, bloqueo y vencimiento; mantener filtros opcionales por responsable. Separar los indicadores globales en un resumen desplegable o reporte. Retirar las tarjetas vacías de la jerarquía principal. Explicitar siempre la unidad junto al número. No tratar «Todas las piezas» como otra categoría de responsabilidad.

**Evidencia:** [Home](Hallmark-Audit-2026-10-29/demo/captures/01-operador-home.png), [Seguimiento](Hallmark-Audit-2026-10-29/demo/captures/02-seguimiento.png).

### 8. P2 — Campañas y Macro no se perciben como partes de un mismo producto

**Comprobado visual:** Campañas usa un panel claro, estadísticas, pestañas y directorio; Macro abre con una banda negra, título muy grande, resplandores y otro azul de acción. Contratos, Talentos y Clientes varían a su vez en tamaño y peso de encabezados, márgenes, bordes y colocación de acciones. En Clientes el título tiene mucho menos peso que el nombre de un registro.

**Recomendación:** unificar primero el lenguaje de campaña: encabezado, estado, participantes, próxima acción y navegación interna. Evaluar una entrada «Campañas» con tipos y vistas, sin fusionar por ello sus modelos de datos o reglas. Quitar el tratamiento de portada de Macro: la jerarquía debe favorecer expediente y siguiente decisión.

**Hipótesis que requiere prueba:** una entrada común reducirá errores de orientación. No se midió con usuarios si el término Macro ya resulta comprensible ni si los operadores necesitan dos destinos separados.

**Evidencia:** [Campañas](Hallmark-Audit-2026-10-29/demo/captures/03-campanas.png), [Macro](Hallmark-Audit-2026-10-29/demo/captures/11-macros.png), [Clientes](Hallmark-Audit-2026-10-29/demo/captures/07-clientes.png), [Contratos](Hallmark-Audit-2026-10-29/demo/captures/08-contratos.png).

### 9. P2 — Abrir un expediente Macro acumula contextos en una página demasiado larga

**Comprobado:** seleccionar un talento conserva todo el resumen superior y añade acuerdos, identidad y expediente más abajo. Expandir Cobros y pagos alarga la página de muestra hasta aproximadamente **4004 px**, con un solo contrato. Se muestran formularios financieros antes de llegar al expediente documental inferior.

**Recomendación:** reconstruir este espacio con un contexto de campaña compacto y áreas explícitas para trabajo del talento, comercial, documentación y movimientos. No añadir una nueva fila de pestañas a las existentes sin reducir lo que permanece arriba. Mantener visible qué talento se está editando y qué cambios pertenecen a campaña o contrato.

**Límite importante:** los movimientos y documentos están vacíos y el contrato ficticio no tiene precio cliente. El margen negativo mostrado resulta de ese fixture; no se presenta como un error contable. No se evaluaron cálculos reales ni documentos generados.

**Evidencia:** [expediente completo](Hallmark-Audit-2026-10-29/demo/captures/28-macro-expediente-full.png), [finanzas expandidas](Hallmark-Audit-2026-10-29/demo/captures/29-macro-finanzas-full.png).

### 10. P2 — Los estados vacíos y de fallo no orientan al siguiente paso

**Comprobado:** con cero campañas el Cliente ve «No hay campañas que coincidan con la búsqueda» aunque la búsqueda esté vacía. El Operador conserva un tablero largo de ceros. Ante el 503 simulado, toda la interfaz se sustituye por la marca y el mensaje, sin reintento. La carga usa casi la misma composición.

**Recomendación:** diferenciar «todavía no hay campañas», «no tienes campañas asignadas», «no hay coincidencias» y «no se pudieron cargar». Dar una acción apropiada al rol. En Operador, un estado inicial debe enseñar a empezar; en Cliente, explicar asignación o espera. Ante fallo transitorio, permitir recuperación sin prometer corregir problemas de configuración desde el navegador.

**Evidencia:** [vacío Cliente](Hallmark-Audit-2026-10-29/demo/captures/19-vacio-CLIENTE.png), [vacío Operador](Hallmark-Audit-2026-10-29/demo/captures/19-vacio-OPERADOR.png), [error](Hallmark-Audit-2026-10-29/demo/captures/20-error.png), [carga](Hallmark-Audit-2026-10-29/demo/captures/21-carga.png).

### 11. P2 — La validación del contrato señala un lugar poco útil

**Comprobado:** al continuar sin completar datos aparece una lista de campos faltantes, pero el foco se coloca en «Agencia guardada». El error enumera Nombre del talento, Domicilio, RFC, Nombre de la agencia, Razón social y Representante; el selector enfocado no está en esa lista. El desplazamiento deja el resumen de error fuera del viewport capturado y los campos no muestran errores individuales visibles.

**Recomendación:** asociar cada error a su campo, enfocar el primer dato realmente inválido y mantener el resumen visible o accesible mediante enlaces. Conservar la división en pasos y la explicación de las modalidades: son más claras que un formulario único sin estructura.

**Evidencia:** [validación y foco](Hallmark-Audit-2026-10-29/demo/captures/26-contrato-validacion.png), texto completo de `details.json`.

## Decisiones recomendadas por pantalla

| Pantalla o elemento | Decisión propuesta | Motivo |
|---|---|---|
| Centro de decisiones Cliente | Reconstruir composición | El material y su acción llegan tarde; sobra contexto repetido |
| Detalle de pieza | Reconstruir prioridad y apertura contextual | «Ver material» no debe abrir un bloque dominado por Publicación |
| Home Operador | Reorganizar como cola de acciones | Preservar agrupación por creador; retirar métricas del recorrido principal |
| Macro | Reconstruir organización interna | Resumen, acuerdo, finanzas e identidad se acumulan verticalmente |
| Campañas/Macros | Probar acceso unificado | La separación técnica no obliga a tener dos entradas conceptuales |
| Talentos y Agencias | Conservar capacidad; normalizar directorio/ficha | Patrones reconocibles; corregir navegación y estados iniciales |
| Clientes | Separar claramente ficha, campañas y administración de accesos | Funciones de distinta frecuencia comparten superficie |
| Contratos | Conservar flujo por pasos; corregir validación | La estructura del formulario aporta orientación |
| Herramientas | Reubicar como configuración contextual | Mensajes y mantenimiento son trabajos distintos; hay encabezados duplicados |
| Bloques repetidos y cifras en cero | Eliminar de la jerarquía principal | Añaden lectura sin ayudar a actuar en el estado observado |

Estas son recomendaciones, no un rediseño implementado. No recomiendo eliminar capacidades contractuales, financieras o documentales por la complejidad de sus pantallas.

## Qué funciona y merece conservarse

- La vista Cliente reduce la navegación a dos destinos y evita exponer las herramientas internas en los recorridos examinados. Esto es evidencia de presentación, no de autorización de servidor.
- Guion, Pieza y Copy tienen versión y estado identificables.
- La cola agrupa decisiones por creador y ofrece preparar un mensaje conjunto.
- Directorios con búsqueda y selección lateral permiten alternar registros sin perder toda la estructura.
- El formulario contractual explica quién firma y factura y divide el trabajo en pasos.
- La tabla móvil avisa explícitamente que se puede desplazar; no recomiendo eliminar tablas por una regla estética. Sí conviene reservarlas para seguimiento, en lugar de competir con la revisión de una pieza.

## Lectura de Hallmark y límites de la evidencia

Hallmark terminó con render de ambas vistas y reportó **808 FAIL, 1141 REFLEX y 51 WARN**, sobre 92 archivos y dos URL. Son coincidencias de sus reglas, no 2000 defectos visibles independientes. Muchas son estáticas, se repiten en componentes o responden a preferencias de estilo. No se impone su regla de brevedad de una landing a una herramienta operativa.

Se revisaron capturas y recorridos además del linter. Contraste, posición de acciones, pérdida de ubicación, aviso fuera de vista y focos de formulario tienen evidencia reproducible. La propuesta de unificar Campañas/Macros y reorganizar directorios es una hipótesis de arquitectura de información que debe compararse con usuarios nuevos y operadores habituales.

No se evaluaron: video/audio reales, carga resumible, calidad de documentos, enlaces privados, Google OAuth, Cloudflare Access, autorización backend, guardados exitosos, cálculo financiero end-to-end ni comportamiento con miles de registros. Tampoco se infiere latencia real de la espera artificial. Los errores de fixtures detectados durante la preparación se corrigieron y no se atribuyen al producto.

La fidelidad es alta para composición, estilos y navegación de las pantallas renderizadas; es limitada para datos, medios y transacciones. La auditoría permite decidir dónde concentrar el rediseño; no acredita que los flujos de negocio completos funcionen.

## Entregables y reproducción

- [Galería](Galeria-Hallmark-2026-10-29), con capturas originales sin maquetar un PRISMO alternativo.
- [Fixtures ficticios](Hallmark-Audit-2026-10-29/demo/fixtures.mjs) y [adaptador local](Hallmark-Audit-2026-10-29/demo/server.mjs).
- [Instrucciones de la demo](Hallmark-Audit-2026-10-29/demo/DEMO.md).
- [Salida Hallmark](Hallmark-Audit-2026-10-29/demo/hallmark-demo.log), [.hallmark/before.txt](Hallmark-Audit-2026-10-29/demo/.hallmark/before.txt) y registros JSON de navegador.
- [Prueba del fallo de aprobación](Hallmark-Audit-2026-10-29/demo/failure-check.json).

No hay modificaciones en archivos versionados de PRISMO. `public/ffmpeg/` ya estaba sin seguimiento al comenzar. No se modificó Cloudflare Access, no se usaron secretos y no se desplegó ni publicó nada. Toda la instrumentación está en `/workspace/hallmark-audit/demo`.
