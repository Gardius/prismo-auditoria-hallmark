# Demo local de auditoría

El frontend es el compilado existente de PRISMO. No se han modificado sus componentes. Los procesos se iniciaron en la instancia actual; no se presupone que sobrevivan a otra tarea.

1. En `/workspace/prismo-oficial`: `pnpm start --port 8787`.
2. En `/workspace/hallmark-audit/demo`: `node server.mjs`.
3. En el navegador interno de Codex, abrir `http://127.0.0.1:5190/__demo` y elegir rol y escenario. Las URL del lanzador son exclusivamente locales.
4. Para repetir los recorridos: `node audit-tour.mjs`, `node details.mjs`, `node metrics.mjs`, `node failure-check.mjs` desde este directorio. Requieren Chromium local y las dependencias temporales ya instaladas en el directorio padre.

El lanzador admite OPERADOR y CLIENTE; escenarios full, empty, error y slow. La cookie sólo selecciona un actor ficticio en este adaptador. No es autenticación de PRISMO ni prueba de sus permisos. El mecanismo nativo PRISMO_ALLOW_DEV_IDENTITY se inspeccionó, pero no se activó en el checkout: el acceso de la demo se resuelve enteramente en el adaptador para no depender de Google ni tocar configuración de aplicación.

Las API GET enumeradas en fixtures.mjs responden con datos inventados. Las escrituras retornan 409 y ninguna API se reenvía al origen. Las rutas de datos no implementadas retornan 501; no se fabrican resultados exitosos. La instancia sólo escucha en loopback. Los scripts de recorrido principal y detalles bloquean destinos externos. No cambiar el host a 0.0.0.0 ni desplegar este adaptador.

Hallmark está instalado para Codex en el directorio temporal padre, `.agents/skills/hallmark`; versión 2.0.0. Auditoría:

```sh
HALLMARK_PUPPETEER=/workspace/hallmark-audit/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js \
CHROME_PATH=/usr/bin/chromium \
node ../.agents/skills/hallmark/scripts/sloplint.mjs \
  /workspace/prismo-oficial/app /workspace/prismo-oficial/components \
  --genre modern-minimal --scope app --render --before \
  --url 'http://127.0.0.1:5190/__demo?role=OPERADOR' \
  --url 'http://127.0.0.1:5190/__demo?role=CLIENTE'
```

Para detener la demo, terminar únicamente el proceso `node server.mjs` que se inició aquí y el Worker local de esta tarea. No detener otros procesos del usuario. No publicar el entorno ni guardar estos fixtures como datos del producto.
