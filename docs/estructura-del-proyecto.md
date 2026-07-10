# Estructura del proyecto

Este documento propone una organización básica para el repositorio Materiales Educativos Accesibles.

La estructura busca mantener separados los archivos principales, los recursos visuales, los materiales descargables y los documentos de respaldo, de manera que el proyecto pueda crecer de forma ordenada.

## Estructura sugerida

```text
materiales-educativos-accesibles/
│
├── index.html
├── estilos.css
├── app.js
├── README.md
├── LICENSE
│
├── datos/
│   └── materiales.json
│
├── imagenes/
│   ├── rutinas/
│   ├── pictogramas/
│   ├── conciencia-fonologica/
│   └── recursos-visuales/
│
├── materiales/
│   ├── fichas-descargables/
│   ├── rutinas-visuales/
│   ├── comunicacion/
│   └── actividades/
│
└── docs/
    ├── autoria-y-contexto.md
    ├── fuentes-y-creditos.md
    ├── uso-permitido.md
    ├── alcance-pedagogico.md
    ├── estructura-del-proyecto.md
    ├── bitacora-de-cambios.md
    └── criterios-de-adaptacion.md
```

## Archivos principales

`index.html` contiene la estructura principal del sitio o página inicial del repositorio.

`estilos.css` define el diseño visual, la adaptación responsiva y la presentación de los materiales.

`app.js` puede contener funciones de búsqueda, filtros, generación de materiales o interacción con el usuario.

`README.md` presenta el proyecto, su finalidad, autoría, uso permitido y estado general.

`LICENSE` establece las condiciones aplicables al código del repositorio.

## Carpeta docs

La carpeta `docs` reúne documentos de respaldo autoral, pedagógico, técnico y organizativo.

Estos documentos ayudan a explicar el alcance del proyecto, las condiciones de uso, los criterios de adaptación y el historial de cambios.

## Organización progresiva

La estructura puede modificarse según el crecimiento real del proyecto. Si se agregan nuevos tipos de materiales, se recomienda crear carpetas específicas y registrar los cambios en la bitácora.
