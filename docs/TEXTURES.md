# Texturas propias: propuesta pendiente

La herramienta incluye presets procedurales. Todavía no permite subir archivos como textura de material; el botón de diseño carga una ilustración.

Para un material propio se propone admitir:

| Archivo | Función |
| --- | --- |
| Color/base color | Pigmento, manchas o pintura, sin luces ni sombras pintadas |
| Roughness | Escala de grises: claro mate, oscuro pulido |
| Normal | Microdetalle de iluminación, con convención de orientación declarada |
| Height opcional | Alturas para un futuro desplazamiento o grabado, con coste geométrico distinto |

Un patrón debería repetirse sin cortes y con una escala conocida. Una foto frontal con luz difusa puede servir de partida, pero sus sombras no equivalen a un mapa de relieve. Conviene preparar los mapas con la misma resolución/alineación y guardar el conjunto como preset.

No confundir: rugosidad regula reflejos, normal simula pequeños relieves y desplazamiento modifica geometría. Un acabado de esmalte puede ser brillante, satinado o mate. Los laterales requieren sus propias coordenadas: proyectar sólo desde el frente comprime el grano en líneas.

La implementación actual usa proyección por cara para evitar ese colapso. Un mapeo continuo o triplanar mejoraría las costuras, con atención a qué se conserva al exportar GLB.
