# Arquitectura

## Flujo actual

SVG de base → contorno normalizado → chapa/marco/esmalte → ilustración plana o piezas SVG → curvatura → materiales/texturas → visor → PNG/GLB/video.

- `app/editor.tsx`: estado de sesión, controles, carga de archivos e inspectores.
- `lib/badge-engine.ts`: escena Three.js, materiales, transformación de piezas, cámara y exportación.
- `lib/base-shape.ts`: selección y normalización del contorno de base.
- `lib/relief.ts`: lectura de formas y trazos, extrusión, grupos y subdivisión para curvar superficies.
- `lib/surfaces.ts`: mapas procedurales deterministas de normales/rugosidad.
- `lib/interaction.ts`: raycasting, umbral clic/arrastre y coordenadas UV según orientación.
- `lib/framing.ts`: distancia de encuadre conservadora para mantener todo el badge visible al orbitar.
- `lib/motion-preview.ts`: filtro de desenfoque direccional de previsualización.

Los archivos seleccionados se leen localmente en el navegador. No hay base de datos ni almacenamiento de diseños en el servidor. La integración WebMCP opcional expone el cambio de acabado, mediante feature detection; no es necesaria para usar la aplicación y no fue validada en un navegador compatible.

## Selección y encuadre

Un clic selecciona la pieza visible más cercana. La ilustración se edita por grupo. El inspector contextual ocupa una región distinta al viewport. La cámara hace una transición de 450 ms hacia el centro y tamaño del grupo seleccionado; el zoom manual es independiente del encuadre automático y permite recortar el badge para explorar detalles. La preferencia de movimiento reducido omite la animación. Arrastrar o usar la rueda interrumpe la transición. Redimensionar el canvas actualiza el destino y vuelve a dibujar antes de pintar para evitar cuadros vacíos. Los cambios de material o relieve conservan la cámara.

## Blender

Hoy se exporta GLB con mallas y materiales. Blender puede importarlo para editar luces, cámara y renderizar. El GLB no lleva los controles paramétricos del editor ni reproduce automáticamente su entorno de iluminación.

La evolución sería guardar una configuración versionada y reconstruir la escena mediante Python/bpy. El motor web seguiría resolviendo la interacción inmediata y Blender podría producir el render final. El script inicial de Blender de este experimento vive fuera de este repositorio web y todavía no es un backend integrado.

## Materiales externos y movimiento

`lib/material-maps.ts` administra imágenes y transformaciones por destino, valida cargas y libera recursos. Se aplica después de los materiales procedurales. El color del esmalte se compone con la ilustración en canvas. `lib/animation.ts` define poses por tiempo y detección de formatos. `lib/motion-controller.ts` administra reproducción, pausa y captura con MediaRecorder, restaurando estado al terminar. La galería se sirve localmente desde `public/materials`, con manifiesto CC0.

## Proyectos editables

`lib/projects.ts` define el formato .badge v1, valida tipos/rangos y limita imágenes a datos incrustados. `projectStore` usa IndexedDB y confirma escrituras al completar la transacción. `app/project-library.tsx` administra biblioteca y metadatos. El motor captura geometría de base, fuentes y ajustes y prepara SVGs e imágenes antes de reemplazar la escena al abrir. Los mapas se reconstituyen sin depender de las URLs de carga originales. La importación agrega una identidad nueva para evitar sobreescrituras. Una plantilla crea una copia profunda independiente. Ver PROJECTS.md.
