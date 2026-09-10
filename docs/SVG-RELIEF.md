# SVG para metal y esmalte

La ilustración puede combinar zonas de esmalte con líneas metálicas internas. El importador actual convierte rellenos y trazos en geometría extruida, con color, altura y material editables por capa. El marco exterior es independiente.

## Preparación

- Usar formas vectoriales y trazos visibles. Separar rellenos de esmalte y líneas metálicas.
- Nombrar grupos con `id`, o cada trazado con `data-layer`. La agrupación actual usa nombre y color. Sin nombres, agrupa como Formas o Trazos por color.
- Para controlar partes del mismo color por separado, asignar nombres distintos. El nombre del grupo debe estar en el padre inmediato del trazado.
- Convertir textos a curvas. Evitar imágenes, filtros, máscaras, recortes, degradados, patrones y referencias `use`.
- Límites actuales: menos de 500 KB, hasta 160 trazados y 4000 segmentos.

## Ejemplo revisado: bombonera.svg

Tiene 122 trazados, sin grupos nombrados. Combina trazos blancos, amarillos y azul grisáceo con algunos rellenos, incluyendo azul oscuro. Es un buen candidato para líneas metálicas sobre una base esmaltada. Prueba con el importador actual: 124 geometrías, 7 capas por tipo y color, coordenadas finitas. Esto verifica compatibilidad geométrica, no la calidad visual del render. No se incluyó el archivo del usuario en el repositorio.

No todas las zonas visuales están definidas como rellenos cerrados. El importador no inventa regiones de esmalte a partir de líneas abiertas. Para colorear zonas adicionales deben dibujarse esas formas.

## Mejora pendiente

Los relieves internos actualmente no tienen bisel. Para los reflejos suaves de las referencias de pins esmaltados, sumar bisel o perfil redondeado a líneas y contornos interiores, manteniendo alturas independientes. Revisar uniones y líneas finas antes de habilitarlo para SVG complejos. No está implementado en esta corrección de biblioteca.
