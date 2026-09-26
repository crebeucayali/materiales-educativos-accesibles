# Estructura del proyecto

Este documento registra la estructura **vigente** del repositorio Materiales Educativos Accesibles (MEA), módulo del Ecosistema Virtual Accesible (EVA).

La organización actual separa la portada general, herramientas educativas específicas, datos compartidos, recursos de terceros incorporados localmente y documentación de respaldo.

## Estructura general vigente

```text
materiales-educativos-accesibles/
├── index.html
├── estilos.css
├── index-csp.css
├── README.md
├── LICENSE
├── LICENCIAS_RECURSOS_TERCEROS.md
├── logo-crebe.png
├── logo-crebe.webp
├── patron-shipibo.webp
├── datos/
│   └── buscador.json
├── generador/
│   ├── generador.html
│   ├── generador.js
│   └── estilos.css
├── generador-lsp/
│   ├── index.html
│   ├── generador-senas.js
│   └── generador-senas.css
├── apoyos-lsp/
│   ├── generador-lsp.html
│   ├── generador-lsp.js
│   └── generador-lsp.css
├── pictogramas/
│   ├── pictogramas.html
│   ├── pictogramas.js
│   └── estilos.css
├── rutinas/
│   ├── rutinas.html
│   ├── rutinas.js
│   └── estilos.css
├── conciencia-fonologica/
│   ├── conciencia-fonologica.html
│   ├── conciencia-fonologica.js
│   └── estilos.css
├── practica-braille-opciones/
├── practica-braille/
├── practica-braille-v2/
├── paginas/
│   └── privacidad-seguimiento-braille.html
├── vendor/
│   ├── html2canvas/
│   └── jspdf/
└── docs/
    └── documentación pedagógica, autoral, técnica y de mantenimiento
```

## Archivos principales

- `index.html`: portada general de MEA.
- `estilos.css` e `index-csp.css`: estilos de la portada y reglas externalizadas para mantener la política CSP.
- `datos/buscador.json`: índice de recursos del módulo.
- `logo-crebe.png`: copia canónica PNG del logo dentro de MEA.
- `logo-crebe.webp`: variante WebP.
- `patron-shipibo.webp`: recurso visual compartido.
- `LICENCIAS_RECURSOS_TERCEROS.md`: inventario concreto de servicios, bibliotecas y recursos de terceros.

## Herramientas educativas

Cada carpeta funcional mantiene su HTML, JavaScript y CSS específicos cuando corresponde. Esta separación es intencional porque las herramientas tienen lógicas distintas y no deben fusionarse solo por compartir identidad visual.

## Práctica Braille

La estructura de práctica Braille se mantiene separada por función:

- `practica-braille-opciones/`: selector de modalidad;
- `practica-braille/`: práctica básica;
- `practica-braille-v2/`: práctica progresiva organizada por niveles.

La ruta `practica-braille-v2/` se conserva por compatibilidad con enlaces ya publicados. Aunque su nombre técnico contiene `v2`, funcionalmente corresponde a la modalidad **Práctica por niveles**.

No debe fusionarse ni renombrarse esta estructura sin una migración específica de URLs y redirecciones.

## Recursos de terceros

La carpeta `vendor/` conserva dependencias distribuidas localmente cuando la herramienta necesita generar o exportar materiales. Sus archivos de licencia deben mantenerse junto a cada biblioteca.

El documento `LICENCIAS_RECURSOS_TERCEROS.md` registra el uso de servicios, bibliotecas y otros recursos externos; `docs/fuentes-y-creditos.md` establece el criterio general de reconocimiento. Ambos cumplen funciones distintas.

## Documentación

La carpeta `docs/` reúne documentos de autoría, sustento, alcance pedagógico, criterios de adaptación, fuentes y créditos, uso permitido, estructura y bitácora.

## Criterio de mantenimiento

- Evitar copias locales de recursos gráficos cuando exista una fuente canónica dentro del repositorio o del ecosistema.
- Mantener separadas las herramientas cuando su lógica sea distinta.
- No eliminar rutas publicadas sin crear antes una estrategia de compatibilidad.
- Mantener las licencias de bibliotecas y servicios de terceros.
- Actualizar este documento cuando cambie la estructura real del repositorio.
