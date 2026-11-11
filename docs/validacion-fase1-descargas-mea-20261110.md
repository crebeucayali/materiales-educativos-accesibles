# Fase 1. Validación funcional de descargas MEA
Fecha de ejecución: 10 de noviembre de 2026 (hora Perú). Auditoría de descarga con Chromium automatizado.

## Alcance
Verificación de siete acciones en seis herramientas, sin escribir registros en Supabase de producción. El servidor usado fue local y las respuestas de Supabase, ARASAAC y el banco LSP se simularon para obtener pruebas reproducibles.

## Hallazgos y correcciones
1. **Pictogramas PNG:** el botón de descarga se generaba sin un listener para invocar `descargarImagenPng`. Se añadió delegación al contenedor de resultados y bloqueo del botón durante el proceso, conservando la ruta alternativa de apertura cuando falla la descarga. Se actualizó `pictogramas.js` a caché `v=5`.
2. **Generadores LSP (dactilología y apoyos):** las reglas CSP de ambas páginas no autorizaban la consulta y la carga de imágenes desde el diccionario de BDA, a pesar de que los scripts solicitan recursos de `https://crebeucayali.github.io/banco-digital-accesible/lsp/`. Se añadió el origen institucional a `connect-src` e `img-src`, sin permisos generales innecesarios.
3. **Instrumentación del contador:** se conserva el envío no bloqueante de las siete categorías tras iniciar la descarga; no se recopilan palabras, imágenes personales ni archivos.

## Evidencia automatizada
- 7/7 casos desktop Chromium: PNG de pictogramas, JPG y PDF de rutinas, PDF de braille, PDF de dactilología LSP, PDF de apoyos LSP, HTML de conciencia fonológica.
- 7/7 casos con viewport móvil de Chromium (390x844, tacto simulado).
- 3/3 casos con respuesta 503 del RPC estadístico: pictogramas PNG, rutinas PDF y conciencia fonológica HTML siguen descargando.
- Cada caso positivo confirmó un solo evento de herramienta, formato y acción con campos técnicos únicamente.
- Se confirmó que los archivos descargados tienen tamaño positivo y cabeceras según formato; LSP también comprobó la carga de imágenes de señas simuladas.
- GitHub Actions 42947844190: satisfactorio.
- Regresiones anteriores de `estadisticas-recursos-mea.test.cjs`: satisfactorias, run 42947844199.

## Limitaciones y validación pendiente
- Chromium con viewport móvil no equivale a prueba física en Android, iOS o una PC real.
- Los archivos del diccionario de señas utilizados en estas pruebas fueron muestras simuladas; la prueba no garantiza la integridad de todas las 1118 entradas ni las condiciones de CORS del banco real.
- No se midió la descarga posterior a un error de acceso real al banco ni se hizo inspección pedagógica o visual detallada del contenido del PDF generado.
- No se enviaron eventos reales a Supabase y por ello **esta fase no verifica aún la recepción real de contadores**. Corresponde a la fase 2.
- El contador representa una exportación iniciada o una solicitud, no confirma que el usuario conserve físicamente el archivo.
- El botón JPG de rutinas está oculto en la interfaz pública; la prueba lo habilitó temporalmente. No afirmar que JPG sea una opción pública visible.
- Cuando fallen APIs externas, las herramientas seguirán sus comportamientos particulares; esto requiere revisión física aparte.

## Siguiente paso
Validar siete acciones en un teléfono y una computadora mediante la versión publicada y luego contrastar solo las acciones reales con agregados de Supabase. Mantener los contadores global y por módulo intactos.
