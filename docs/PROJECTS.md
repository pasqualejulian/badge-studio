# Proyectos y plantillas

## Uso

1. Abrir **Mis badges** desde la barra superior (icono de carpeta en móvil).
2. Dar un nombre y elegir un destino en Guardar en: una colección o piezas sin colección.
3. **Guardar pieza** conserva la edición actual. **Guardar cambios** reemplaza ese registro guardado.
4. **Guardar como plantilla** crea otro registro. **Crear variante** abre una copia editable de esa plantilla, que debe guardarse para conservarse. Nunca cambia la plantilla original.
5. Importar/exportar `.badge` permite mover una obra completa. Importar añade un registro nuevo incluso si el archivo ya estaba en la biblioteca. Luego se abre desde su tarjeta.

Las tarjetas permiten abrir, duplicar, renombrar, exportar y eliminar. Al abrir se puede guardar primero la edición del canvas o descartarla explícitamente. Eliminar requiere confirmación dentro de la biblioteca. Las colecciones son carpetas con identidad propia y una plantilla base guardada. No hay herencia de cambios entre piezas.

## Qué conserva .badge v1

- Contorno normalizado y SVG fuente de la base.
- SVG de diseño o imagen raster incrustada.
- Espesor, marco, curvatura, materiales, colores y transformación del diseño.
- Grupos de relieve con sus alturas, colores y acabados.
- Mapas externos de color, normal y rugosidad incrustados, con sus ajustes por destino.
- Cámara y punto de enfoque.
- Preset, duración, fondo y bucle del movimiento.
- Nombre, colección, tipo pieza/plantilla, vínculo informativo a la plantilla y miniatura.

No conserva selección activa, panel abierto, reproducción en curso ni historial. Una variante tiene ID y datos propios. Cambiar su plantilla no modifica variantes previas.

El archivo es JSON versionado, no un modelo GLB ni un ZIP. Las imágenes se incorporan como PNG en base64 para evitar depender de archivos externos. Se rechazan versiones desconocidas, valores incompatibles y URLs externas en campos de imagen. Límite: 100 MB por archivo, mapas hasta 2048 × 2048 y raster hasta 40 millones de píxeles. Las restricciones SVG del editor siguen aplicando al abrir.

## Almacenamiento y límites

IndexedDB, base `badge-studio-projects` versión 2, almacenes `projects` y `collections`. El guardado es manual, exclusivamente local al navegador, perfil y origen del sitio. No se suben las obras al servidor ni al repositorio público. Cambiar de navegador, perfil, dominio o equipo no traslada la biblioteca. Borrar los datos del sitio o cerrar una sesión privada puede eliminarla. El navegador controla la cuota y puede desalojar datos.

Exportar `.badge` es la copia transportable. Si falla el guardado por almacenamiento, la biblioteca muestra el error y permite exportar el canvas. Los mapas incrustados pueden volver grandes los archivos. Esta primera versión carga los proyectos completos al listar la biblioteca, por lo que muchas obras con texturas pesadas pueden consumir memoria considerable. No hay sincronización, autosave, deshacer ni herencia de parámetros.

## Verificación de esta iteración

- Pruebas del formato: serialización, variantes independientes, versión desconocida, valores fuera de rango y rechazo de URLs externas.
- Verificación programática en Chromium del motor y IndexedDB: base personalizada, SVG de cinco grupos, alturas/materiales modificados y tres destinos con mapas. Guardar, restaurar y comparar parámetros, fuentes, imágenes y cámara con tolerancia numérica.
- Restauración raster y persistencia tras recargar el contexto.
- Fallo al decodificar un mapa no reemplaza la escena actual.
- TypeScript y build de producción.

Esto no es una validación visual de la biblioteca ni una prueba táctil en dispositivos físicos.

## Inscripción del reverso

`scene.engraving` conserva texto (hasta 3 líneas y 160 caracteres), tipografía, tamaño, posición, rotación e intensidad. Los proyectos v1 anteriores sin ese campo abren sin inscripción. Versiones antiguas del editor pueden descartar este campo al volver a guardar.

## Colecciones como carpetas

Mis badges separa Colecciones, Sin colección y Plantillas. Desde una plantilla se crea una colección con nombre propio. Cada carpeta conserva una copia de esa plantilla: editar o eliminar la plantilla original no cambia su punto de partida ni las piezas existentes.

Agregar pieza abre una variante independiente en el canvas, después de ofrecer guardar la edición actual. La variante aparece en la carpeta cuando se guarda. El selector Guardar en muestra un destino explícito. Se pueden duplicar, renombrar y mover piezas entre carpetas sin modificar su diseño, y renombrar carpetas conservando sus vínculos. No hay herencia de cambios ni generación en lote.

La base IndexedDB se actualiza a versión 2 con un almacén collections. La migración agrupa las piezas antiguas por su etiqueta system y les asigna collectionId. Si se reconoce una única plantilla de origen, se conserva una copia. Si no, la carpeta permite elegir plantilla para futuras piezas sin alterar las existentes. Los cambios se confirman al terminar transacciones que incluyen ambos almacenes. Si hay una pestaña antigua bloqueando la actualización se indica cerrarla.

Los .badge siguen exportando piezas individuales. Al importar se usa el destino elegido en Guardar en, no el ID de carpeta de otro navegador. No se exporta todavía una colección completa. El almacenamiento sigue siendo local al navegador y al dominio.

Verificación: migración sin pérdida de escenas, persistencia de carpetas vacías, copias independientes, conservación del template al eliminar el original, renombrado, movimientos y rechazo atómico de destinos inexistentes. No se realizó QA visual/táctil de esta iteración.
