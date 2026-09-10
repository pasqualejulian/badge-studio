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

- Los cambios viven en la sesión y se pierden al recargar. No hay guardado de proyectos, presets, historial ni deshacer.
- La base SVG usa el contorno cerrado más grande. No interpreta perforaciones internas, múltiples chapas ni contornos abiertos. Conviene usar una silueta simple, centrada y sin efectos.
- Un SVG de ilustración admite hasta 160 trazados, 4000 segmentos y 500 KB. Texto, máscaras, filtros, degradados e imágenes incrustadas requieren simplificación o rasterización.
- La selección de la ilustración edita un grupo, no cada estrella o trazo individual. El ejemplo tiene cinco grupos y 26 piezas.
- El marco se genera por escalado del contorno, no por un offset uniforme. Las formas muy cóncavas pueden producir solapamientos.
- El relieve no se recorta automáticamente al marco. Al cambiar de base, ampliar o mover el diseño, revisar que siga dentro de la chapa. Las alturas pueden ocultar otras piezas.
- Las texturas simulan microdetalle mediante mapas normales y de rugosidad. No deforman físicamente la malla. Puede haber costuras entre proyecciones laterales.
- La impresión se compone a 1024 × 1024. El PNG de salida tiene 2048 × 2048, sin aumentar el detalle original de la impresión.
- El desenfoque es una aproximación de pantalla, no una simulación de obturador. No se graban videos todavía. Los PNG son nítidos.
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
