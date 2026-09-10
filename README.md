# Badge Studio

POC de un editor web de badges 3D. El objeto ocupa el centro de la experiencia: girarlo, tocar una pieza y editar sus propiedades sin buscarla en una lista.

Funciona en el navegador. No requiere IA, Blender ni claves de API para crear y exportar un badge.

## Probar

Requiere Node.js 22.13 o superior y npm.

```sh
npm ci
npm run dev
```

Abrir la dirección que imprime el servidor.

1. Abrir **Ajustes generales**. Usar la base Boca o **Cambiar base · SVG** para cargar otra silueta.
2. Cargar **Cornetas en relieve**, un SVG propio o una imagen para impresión plana.
3. Tocar una pieza. Ajustar su material, color, textura y relieve en el inspector contextual.
4. Arrastrar para girar y usar la rueda para zoom. El zoom manual permite acercarse al detalle. Seleccionar enfoca la pieza y tocar el fondo vuelve al encuadre general.
5. Exportar un PNG transparente o un GLB.

El menú flotante es el modo inicial. Tiene una zona propia al lado del canvas, o debajo en pantallas pequeñas. **Panel fijo** permite comparar la otra variante. Esc o un clic vacío quitan la selección. El selector de piezas ofrece una alternativa por teclado.

## Qué incluye

| Área | Implementado |
| --- | --- |
| Base | Escudo Boca y silueta SVG propia, espesor, ancho de marco y curvatura cóncava/convexa |
| Diseño | PNG/JPG/WebP planos o SVG con formas y trazos extruidos |
| Materiales | Chapa, marco y esmalte independientes; grupos SVG con color, metal/esmalte, rugosidad y altura |
| Texturas | Liso, grano, cepillado, martillado y desgastado, con intensidad ajustable |
| Interacción | Selección directa, contorno de selección, inspector contextual o fijo y transición de encuadre |
| Movimiento | Órbita, zoom y desenfoque direccional opcional durante el giro |
| Exportación | PNG transparente 2048 × 2048 y GLB con geometría, materiales y mapas de textura |

## Límites de esta POC

- El guardado es manual en Mis badges y vive en este navegador. Las ediciones sin guardar se pierden al recargar. No hay sincronización, historial ni deshacer. Exportar .badge permite conservar una copia fuera del navegador.
- La base SVG usa el contorno cerrado más grande. No interpreta perforaciones internas, múltiples chapas ni contornos abiertos. Conviene usar una silueta simple, centrada y sin efectos.
- Un SVG de ilustración admite hasta 160 trazados, 4000 segmentos y 500 KB. Texto, máscaras, filtros, degradados e imágenes incrustadas requieren simplificación o rasterización.
- La selección de la ilustración edita un grupo, no cada estrella o trazo individual. El ejemplo tiene cinco grupos y 26 piezas.
- El marco se genera por escalado del contorno, no por un offset uniforme. Las formas muy cóncavas pueden producir solapamientos.
- El relieve no se recorta automáticamente al marco. Al cambiar de base, ampliar o mover el diseño, revisar que siga dentro de la chapa. Las alturas pueden ocultar otras piezas.
- Las texturas simulan microdetalle mediante mapas normales y de rugosidad. No deforman físicamente la malla. Puede haber costuras entre proyecciones laterales.
- La impresión se compone a 1024 × 1024. El PNG de salida tiene 2048 × 2048, sin aumentar el detalle original de la impresión.
- El desenfoque es una aproximación de pantalla, no una simulación de obturador. El video se graba nítido en tiempo real y con fondo sólido. Los PNG son nítidos.
- Un visor externo puede iluminar el GLB de otra manera. No se exportan las luces de estudio ni la interfaz de edición.

## Desarrollo y verificación

```sh
npm test
npx tsc --noEmit
npm run build
```

Las pruebas cubren lectura de SVG, grupos de relieve, geometría finita, curvatura, mapas de textura, selección del objeto más cercano, distinción entre clic y arrastre, UVs laterales y bases personalizadas. No sustituyen una prueba visual e interactiva en navegador. La exportación y la experiencia en dispositivos reales requieren esa verificación adicional.

Stack: React, TypeScript, Three.js, Vinext/Vite y componentes Base UI/Shadcn. El proyecto admite despliegue con Sites/Cloudflare. La copia pública contiene configuración local sin identificadores privados del despliegue original.

## Documentación

- [Roadmap y decisiones de alcance](docs/ROADMAP.md)
- [Arquitectura y flujo hacia Blender](docs/ARCHITECTURE.md)
- [Texturas propias: formato propuesto](docs/TEXTURES.md)
- [Assets y publicación](docs/ASSETS.md)

El roadmap está únicamente en el repositorio, no en la interfaz del editor.

### Controles del canvas

En menú flotante, **Base** cambia el SVG y la geometría, **Diseño completo** carga la ilustración y ajusta escala, posición y rotación global, y **Acabado y movimiento** edita materiales y desenfoque. Los sliders admiten arrastre y teclado. Desenfoque: 0–0,05, inicial 0,02. El encuadre automático no aplica desenfoque.

Registro de esta iteración: [texturas propias y movimiento/video](docs/NEXT-ITERATION.md), con alcance original y pendientes.

### Materiales propios y video

Seleccioná una pieza para abrir **Materiales y mapas**: seis presets CC0, carga de color/normal/rugosidad y controles de repetición, orientación e intensidad. En **Acabado y movimiento** podés reproducir un giro o balanceo y exportar un ciclo a video. [Texturas](docs/TEXTURES.md) · [Video y límites](docs/VIDEO.md).

La edición móvil usa una [capa translúcida con controles inferiores](docs/INTERFACE.md), vista despejada del objeto y distribución lateral en horizontal. En escritorio, el inspector separa Pieza y Texturas.

La dirección visual usa grafito cálido y acentos champagne. La biblioteca muestra chapas renderizadas con sus materiales, y la escena usa softboxes para definir los reflejos. Detalle y relieve y la carga de mapas propios se despliegan cuando hacen falta.

### Piezas, plantillas y sistemas

**Mis badges** permite guardar la pieza completa, abrirla, duplicarla, renombrarla y eliminarla. Una plantilla crea variantes independientes con la misma base y materiales. El campo sistema/colección y la búsqueda ayudan a organizar familias. Los archivos `.badge` incluyen SVGs, imágenes, mapas, alturas por grupo, cámara y movimiento. Se pueden importar en otro navegador o equipo. No hay herencia de cambios entre variantes ni guardado automático. [Formato, almacenamiento y límites](docs/PROJECTS.md).

## Despliegue en Vercel

El repositorio incluye una salida estática con el mismo editor y assets. `vercel.json` configura Vite, `npm run build:vercel` y `dist-vercel`. No requiere variables de entorno ni backend. Las fuentes Geist se sirven desde el propio sitio.

Para publicar, importar este repositorio en Vercel o ejecutar `npx vercel --prod` con una sesión autenticada. La configuración Sites original se conserva para el entorno de desarrollo anterior.

Cada persona guarda sus piezas en el navegador. La biblioteca del dominio anterior no se traslada automáticamente: exportar `.badge` allí e importarlo en el nuevo dominio. Compartir la URL del editor no comparte las piezas guardadas. No activar protección por inicio de sesión en producción si se busca acceso público.
