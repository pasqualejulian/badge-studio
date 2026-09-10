# Texturas propias y galería

La herramienta incluye presets procedurales, seis materiales CC0 de Poly Haven y carga de mapas externos por chapa, marco, esmalte o grupo SVG. El botón de diseño sigue cargando una ilustración, los mapas se cargan desde Materiales y mapas.

Para un material propio se admiten PNG/JPG de hasta 2K y 8 MB por mapa:

| Archivo | Función |
| --- | --- |
| Color/base color | Pigmento, manchas o pintura, sin luces ni sombras pintadas |
| Roughness | Escala de grises: claro mate, oscuro pulido |
| Normal | Microdetalle de iluminación, con convención de orientación declarada |
| Height (pendiente) | No se importa aún. Futuro desplazamiento o grabado con coste geométrico distinto |

Un patrón debería repetirse sin cortes y con una escala conocida. Una foto frontal con luz difusa puede servir de partida, pero sus sombras no equivalen a un mapa de relieve. Conviene preparar los mapas con la misma resolución/alineación y guardar el conjunto como preset.

No confundir: rugosidad regula reflejos, normal simula pequeños relieves y desplazamiento modifica geometría. Un acabado de esmalte puede ser brillante, satinado o mate. Los laterales requieren sus propias coordenadas: proyectar sólo desde el frente comprime el grano en líneas.

La implementación actual usa proyección por cara para evitar ese colapso. Un mapeo continuo o triplanar mejoraría las costuras, con atención a qué se conserva al exportar GLB.

La galería carga mapas desde archivos alojados con la app. El color está desactivado inicialmente para conservar el metal/esmalte elegido. Se puede activar, cambiar repetición, orientación, microrelieve y rugosidad. En el esmalte, el color se compone debajo de la ilustración para no borrarla. Quitar mapas externos restaura el acabado procedural. Los mapas normales usan orientación OpenGL.

Los parámetros no se guardan al recargar, igual que el resto del proyecto. La exportación GLB incluye mapas, pero puede crecer bastante con varias piezas e imágenes de 1K o 2K. Optimización para apps móviles pendiente.
