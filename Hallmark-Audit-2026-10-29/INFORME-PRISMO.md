# PRISMO — auditoría independiente con Hallmark

29 de octubre de 2026. Código examinado: `d7cd0841b5783ae841b0c5d2bf416869106e0108`.

**Dictamen:** la experiencia de entrada comprobada falla como producto: presenta un problema técnico y abandona al usuario. La estructura que declara el código merece una revisión de arquitectura de información antes de invertir en pulido visual. No hay evidencia suficiente para declarar que todas las pantallas operativas son confusas, ni para recomendar su reconstrucción indiscriminada.

## Alcance y método

Hallmark 2.0.0 se instaló con `npx --yes skills add nutlope/hallmark --agent codex --yes`, en `/workspace/hallmark-audit`, fuera del checkout. Se verificaron su SKILL.md, el modo audit y la ejecución de sloplint con render. Hallmark es una habilidad con un procedimiento de auditoría; `$hallmark audit` no es un ejecutable independiente.

Se aplicó `--genre modern-minimal --scope app --render --before` sobre `app/` y `components/`, con el servidor real. El género es una clasificación operativa, no una recomendación estética. No se leyeron DESIGN.md, PRODUCT.md, documentación histórica, decisiones aprobadas, Diagnóstico Menta ni auditorías anteriores para formular este informe. Las recomendaciones se apoyan en esta observación y en el código vigente, no en razones históricas para conservarlo.

Hallmark produjo cinco capturas: 1280×800, 1440×900, 1920×1080, escritorio completo y móvil de 375 px. Se añadieron capturas y análisis DOM/axe en 1440×900 y 390×844. Inspección visual directa de escritorio y móvil, incluidos 1920 y 375 px.

**Límite determinante:** la aplicación real termina en «Falta configurar Cloudflare Access para PRISMO». No hay pantallas operativas autenticadas disponibles. No se simuló una sesión ni se inventaron campañas para presentar capturas como si fueran reales. El fallo de configuración es de esta instancia: no demuestra una caída de producción. Sí permite observar cómo la interfaz maneja ese fallo. Se solicitó una URL de prueba accesible para ampliar la evaluación.

Etiquetas de evidencia:

- **Visual/DOM:** observado en el navegador real.
- **Código:** estructura o comportamiento declarado por la implementación; sin recorrido autenticado.
- **Hipótesis:** consecuencia probable o alternativa que necesita probarse con usuarios y pantallas accesibles.

## Hallazgos priorizados

### 1. P1 — El error de entrada es un callejón sin salida

**Comprobado visual/DOM.** En escritorio y móvil sólo aparecen la marca y el mensaje técnico. Cero botones, cero enlaces. No hay recuperación, explicación orientada al usuario ni vía de ayuda. `app/prismo-app.tsx:2136` utiliza el mismo contenedor tanto para carga como para error.

**Impacto:** el usuario no puede saber si debe esperar, identificarse, contactar a alguien o volver más tarde. La presencia visual de la marca no compensa la ausencia de una acción.

**Recomendación:** reconstruir esta pantalla como estado de servicio: encabezado que describa la imposibilidad de acceso, explicación breve y acción apropiada al tipo de fallo. Un error de configuración necesita una vía de soporte; un fallo transitorio permite reintento; una sesión vencida necesita autenticación. Evitar un botón que prometa resolver una configuración que el usuario no puede corregir.

**Validación:** provocar por separado sesión vencida, denegación y fallo de servicio; en cada caso debe existir una siguiente acción comprensible y verificable.

### 2. P1 — Los destinos principales no tienen navegación web completa

**Comprobado en código; pendiente de reproducción autenticada.** Ocho destinos del operador se implementan como botones que cambian `surface` (`app/prismo-app.tsx:2232`). La lectura inicial de URL sólo recupera CAMPAIGNS y MACROS (`:999`). La sincronización borra `surface` para los demás destinos y usa `replaceState` (`:1162`).

**Impacto inferido:** no se pueden compartir de forma equivalente las pantallas Talentos, Clientes, Contratos o Agencias; recargar puede perder el destino, y el historial no representa la secuencia de navegación. No afirmo haber reproducido estos recorridos en navegador autenticado.

**Recomendación:** dar direcciones estables a cada destino, selección y filtro relevante. Navegar mediante enlaces y registrar cambios de destino en el historial. Priorizar esto sobre cambiar colores o radios.

**Validación:** abrir cada destino, copiar su URL a otra pestaña, recargar y usar Atrás/Adelante. Deben conservarse ubicación y contexto autorizado.

### 3. P1 de investigación — La navegación mezcla tareas, entidades y categorías internas

**Base comprobada en código; dificultad de comprensión hipotética.** La navegación es Home, Campañas, Macros, Talentos, Clientes, Contratos, Agencias y Herramientas (`:2235`). «Macros» aparece como destino paralelo a «Campañas», mientras su implementación habla de datos de campaña y expedientes de talentos (`components/prismo/macro-campaign-workspace.tsx:153`, `:172`, `:185`). «Home» no expresa el trabajo que contiene.

**Crítica:** quien llega por primera vez necesita aprender la clasificación del sistema antes de saber dónde actuar. La existencia de módulos separados no demuestra que deban ser destinos separados.

**Recomendación concreta:** probar una entrada única de Campañas con tipos o vistas diferenciadas, conservando las diferencias de negocio que el trabajo realmente necesite. Evaluar agrupar Talentos, Clientes y Agencias bajo un directorio de personas y organizaciones, con accesos contextuales. Renombrar Home por el propósito real, por ejemplo Trabajo pendiente. Contratos debería conservar independencia sólo si existe un trabajo frecuente que comienza allí sin contexto de campaña o talento.

**Validación:** pedir a personas nuevas localizar una campaña Macro, resolver un pendiente y encontrar la representación de un talento sin instrucciones. Comparar primer destino elegido, retrocesos y comprensión. No fusionar datos ni permisos por una recomendación de navegación.

### 4. P2 — La página de trabajo contiene varios criterios de clasificación superpuestos

**Comprobado en código; sobrecarga visual no comprobada.** Home combina selección de campaña, progreso de publicaciones, pestañas por responsable, búsqueda, categorías de pendiente y otras entradas al material (`app/prismo-app.tsx:4541`, `:4553`, `:4602`). Las pestañas «Tu trabajo», «En revisión», «Seguimiento», «Todas las piezas» mezclan acción personal, estado, proceso e inventario (`:4404`). Seguimiento añade seis categorías (`:4306`).

**Riesgo:** elegir el lugar correcto puede exigir entender simultáneamente quién debe actuar, qué material es y en qué estado está. «Todas las piezas» también aparece conceptualmente en Campañas → Piezas (`:2542`).

**Recomendación:** evaluar reconstruir Home como una cola de acciones priorizadas, con responsable, próxima acción y vencimiento explícitos. Llevar el inventario completo al espacio de campaña, o compartir una misma vista enlazable en lugar de mantener recorridos paralelos. Conservar filtros por responsable cuando ayuden a resolver trabajo, sin hacerlos una obligación previa para descubrirlo.

**Validación:** comparar tiempo y errores al responder «¿qué debo resolver ahora?» y «¿qué está bloqueado?». No basta con reducir el número de controles.

### 5. P2 — El cambio de perspectiva puede confundirse con el contexto de trabajo

**Comprobado en código; confusión hipotética.** El operador dispone de «Vista Operador» y «Vista Cliente» dentro de la navegación. Cambiar de vista puede cambiar también de superficie (`app/prismo-app.tsx:2249`).

**Riesgo:** el mismo espacio cambia de significado y destino sin que necesariamente cambie la identidad. Esto es una observación de UX, no evidencia de un fallo de permisos.

**Recomendación:** si su objetivo es verificar lo que verá el cliente, convertirlo en una acción explícita de vista previa, con contexto de cliente/campaña, aviso persistente y salida inequívoca. Si es una tarea diaria central, demostrarlo antes de relegarla.

### 6. P2 — La jerarquía del estado de error privilegia la marca sobre la necesidad

**Comprobado visual.** En escritorio la marca domina el centro con un tamaño de hasta 12rem, mientras el mensaje funcional queda subordinado en monoespaciada. En móvil se adapta, pero sigue sin un título que explique el estado ni una acción. Evidencia: `desktop.png`, `mobile.png`, `app/globals.css:80`.

**Recomendación:** reducir la marca a identificación secundaria y hacer dominante el estado y su resolución. No convertir los estados vacíos, de carga y de fallo en la misma composición con una frase intercambiada. No hace falta reconstruir la identidad visual para resolverlo.

### 7. P2 — Semántica accesible incompleta en el estado comprobado y la navegación declarada

**Comprobado visual/DOM:** axe reportó ausencia de encabezado principal en ambas capturas. Es una recomendación de buenas prácticas de axe, no por sí sola una certificación de incumplimiento WCAG. El error de datos no declara `role="alert"` o una región de estado (`app/prismo-app.tsx:2136`), aunque el error de carga del módulo sí lo hace (`app/prismo-client-shell.tsx:46`).

**Comprobado en código:** los botones de navegación principal usan clase `active` sin `aria-current` o `aria-pressed` (`:2235`).

**Recomendación:** encabezado semántico para el estado, anuncio apropiado al aparecer el error, y destino actual identificable por tecnologías de asistencia. Comprobar teclado y lector de pantalla en el flujo autenticado antes de concluir que el resto es accesible. No se observaron más infracciones de axe en esta pantalla mínima; ese resultado no cubre la aplicación.

### 8. P3 — Hay deuda de consistencia visual, pero el volumen del linter no mide la gravedad del producto

**Comprobado por Hallmark estático:** 781 FAIL, 1137 REFLEX y 44 WARN sobre 92 archivos y una URL. Entre ellos: 651 incidencias de literales de color/fuente fuera de tokens, 1113 de espaciado fuera de su escala, 75 de etiquetas en mayúsculas/espaciadas y 16 de transiciones prohibidas por su criterio.

**Interpretación:** esos números incluyen componentes genéricos, estilos posiblemente sobreescritos y reglas de gusto de Hallmark. No son 1962 problemas visibles independientes ni pruebas de una interfaz fallida. La marca en mayúsculas, por ejemplo, no merece corregirse sólo por una alarma. Sus avisos de contraste, superposición sticky y desbordamiento en superficies inaccesibles siguen sin confirmación visual; no los presento como errores comprobados.

**Recomendación:** consolidar tokens y estilos activos después de resolver navegación y tareas. Confirmar contraste sobre estilos calculados y pantallas reales; corregir primero texto funcional, foco y controles. No sustituir la auditoría de uso por perseguir cero alertas del linter.

## Qué conservar y qué cuestionar

La pantalla observada tiene contraste claro, identifica el producto y se adapta sin recorte visible en las capturas examinadas. El código declara búsqueda global, separación de perspectivas y agrupación de trabajo: son capacidades potencialmente útiles, aunque no se validaron sus recorridos. No recomiendo eliminarlas por el hecho de que el sistema sea complejo.

Sí cuestionaría conservar ocho destinos como estructura incuestionable, una Home que también actúa como inventario y un selector de perspectiva integrado en la navegación diaria. La complejidad del negocio puede justificar información abundante; no justifica obligar a aprender su organización interna antes de resolver una tarea.

**Intervención mínima:** reconstruir los estados de acceso/error y reparar el contrato de navegación. **Intervención profunda a evaluar:** unificar el acceso a campañas, convertir Home en trabajo accionable y reducir los directorios principales mediante agrupación contextual. Son recomendaciones de producto, no rediseños producidos ni cambios autorizados.

## Evidencia y reproducción

- [Captura real de escritorio](desktop.png) y [captura real móvil](mobile.png).
- [Registro Hallmark](hallmark-run.log), [hallazgos detallados](.hallmark/before.txt), [registro de elementos](.hallmark/before.json).
- [DOM y axe escritorio](desktop.json), [DOM y axe móvil](mobile.json).
- [Habilidad instalada](.agents/skills/hallmark/SKILL.md).

Comando del análisis, desde `/workspace/hallmark-audit`:

```sh
HALLMARK_PUPPETEER=/workspace/hallmark-audit/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js \
CHROME_PATH=/usr/bin/chromium \
node .agents/skills/hallmark/scripts/sloplint.mjs \
  /workspace/prismo-oficial/app /workspace/prismo-oficial/components \
  --genre modern-minimal --scope app --render --before \
  --url http://127.0.0.1:5173
```

La ejecución terminó correctamente, produjo capturas y reportó hallazgos: instalación operativa, no una aprobación de la interfaz. Todos los archivos de auditoría y dependencias adicionales se guardaron fuera de PRISMO. El estado Git de PRISMO permanece igual al inicial: únicamente `public/ffmpeg/` preexistente sin seguimiento; sin diferencias en archivos versionados. No se produjo rediseño, despliegue ni publicación del entorno.

**Cobertura pendiente:** evaluación visual de Home operativa, campañas con datos, detalle de pieza, Macro, contratos, formularios, navegación móvil y recorridos del cliente. Para cerrarla hace falta una instancia de prueba con acceso. Este informe no presenta esa cobertura como completada.
