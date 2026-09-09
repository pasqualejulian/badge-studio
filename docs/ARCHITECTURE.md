# Arquitectura

## Flujo actual

SVG de base → contorno normalizado → chapa/marco/esmalte → ilustración plana o piezas SVG → curvatura → materiales/texturas → visor → PNG/GLB.

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
