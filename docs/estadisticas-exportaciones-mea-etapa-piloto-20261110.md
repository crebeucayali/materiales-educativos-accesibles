# Estadísticas de exportaciones de recursos MEA: etapa piloto
Fecha de preparación: 10 de noviembre de 2026 (Perú).

## Objetivo y alcance
Registrar acciones técnicas asociadas con la descarga o exportación de recursos educativos. Esto NO mide aprendizaje, personas únicas ni archivos efectivamente guardados. Las estadísticas de sesiones universales y módulos no se modifican.

## Eventos incorporados
- `pictogramas/png/descarga_solicitada`: luego de activar la descarga del Blob; si falla y se abre la imagen en otra pestaña, no se registra una descarga.
- `rutinas/jpg/exportacion_iniciada`: después de generar la imagen y pulsar su enlace de descarga.
- `rutinas/pdf/exportacion_iniciada`: luego de ejecutar `pdf.save`.
- `braille/pdf/exportacion_iniciada`: luego de ejecutar `pdf.save`.
- `dactilologia_lsp/pdf/exportacion_iniciada`: después de iniciar guardado del PDF.
- `apoyos_lsp/pdf/exportacion_iniciada`: después de iniciar guardado del PDF.
- `conciencia_fonologica/html/exportacion_iniciada`: luego de solicitar descarga del HTML.

La impresión de conciencia fonológica desde el diálogo del navegador no se contabiliza como PDF descargado; tampoco se miden la búsqueda, vista previa, reproducción de voz, tamaño de pantalla ni fallos de exportación.

## Diseño de privacidad
El cliente `estadisticas/recursos-mea.js` transmite únicamente UUID efímera por acción, código fijo de herramienta, formato y tipo de acción. No transmite palabras buscadas, imágenes cargadas, texto de la ficha, contenido del PDF, URL del pictograma, IP desde el código de la aplicación, cuenta de usuario ni identificador permanente. El proveedor Supabase puede recibir información técnica inherente a una solicitud HTTP. La base agrega por fecha de Perú, herramienta, formato y acción. El almacenamiento de UUID se limita a deduplicación temporal, con depuración después de 72 horas al recibirse nuevos eventos. La agregación es por día, no por usuario.

Las funciones del cliente son no bloqueantes: si el servidor estadístico falla o no hay conexión, la exportación educativa continúa. El cliente no envía eventos pendientes posteriormente ni obliga a recopilar datos.

## Seguridad
- Tabla privada `eva_recursos_api.mea_acciones_diarias` con RLS y sin privilegios directos para `anon` o `authenticated`.
- RPC público `registrar_accion_recurso_mea` como `SECURITY INVOKER`, delegado a función interna que valida exactamente siete combinaciones.
- Consulta `admin_estadisticas_recursos_mea(7/30/90/365)` restringida a usuario master con MFA AAL2 mediante `private.es_admin_mfa()`.
- Toda llamada pública anónima puede ser simulada; estos datos son aproximados y no una prueba de actividad humana.

## Orden recomendado de despliegue
1. Aprobar pruebas SQL de GitHub Actions y pruebas de cliente Node.
2. Aplicar migración SQL a Supabase.
3. Verificar con consultas de solo lectura funciones, RLS y agregados en cero (sin emitir visitas artificiales).
4. Fusionar cambios de MEA y comprobar acceso real a los scripts con caché actualizada.
5. Validar descargas manualmente en PC y móvil, observando que no se interrumpen si el RPC falla.
6. Solo entonces ampliar interfaz del panel administrativo con la consulta ya preparada.

## Pendientes
- Pruebas humanas de descargas (PNG, JPG, PDF, HTML) y corrección si aparece regresión.
- Comprobación del panel de estadísticas y ampliación visual en etapa separada.
- No activar métricas en adaptaciones con `publicado:false` ni otras categorías pendientes.
