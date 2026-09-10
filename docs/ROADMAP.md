# Roadmap

Registro de ideas discutidas durante la POC. Las secciones pendientes no son funcionalidades disponibles ni compromisos de fecha.

## Dirección acordada

Priorizar el objeto y la experimentación visual. Abrir sobre el canvas, tocar lo que se quiere modificar y mostrar sólo sus controles. Mantener el panel fijo como alternativa, sin obligar a recorrer todos los parámetros.

## Implementado

- [x] Chapa Boca desde SVG y carga de otra silueta base.
- [x] Espesor, marco, esmalte y curvatura global hacia adentro/afuera.
- [x] Impresión plana y SVG con volumen por formas/trazos.
- [x] Materiales, colores, texturas, rugosidad y altura por grupo.
- [x] Ejemplo de cornetas y estrellas con cinco grupos.
- [x] Selección directa y variantes de inspector fijo/contextual.
- [x] Menú contextual principal en una zona separada del modelo.
- [x] Encuadre adaptativo, aproximación al seleccionar y respeto de movimiento reducido.
- [x] Corrección del colapso de UVs en laterales extruidos.
- [x] PNG y GLB; desenfoque de giro opcional.

## Prioridad elegida: texturas y movimiento/video

El usuario priorizó los puntos 4 y 5. Alcance, bibliotecas, orden y aceptación en [NEXT-ITERATION.md](NEXT-ITERATION.md). Primera implementación disponible, con límites y verificaciones en TEXTURES.md y VIDEO.md.

## Edición confiable: backlog transversal

- [ ] QA visual del canvas, selección y exportaciones en escritorio y móvil.
- [ ] Guardar/abrir proyecto completo, incluyendo SVGs, imágenes y cámara.
- [ ] Deshacer/rehacer y restablecer por propiedad o grupo.
- [ ] Presets guardables y versionados, exportación/importación JSON.
- [ ] Ajustar la transición de foco y su intensidad con pruebas de uso, sin perder el encuadre global.
- [ ] Hover, selección de pieza individual, multiselección y agrupación manual.
- [ ] Manipuladores sobre el canvas para posición, escala y rotación del diseño.
- [ ] Validación visible de elementos fuera del marco o escondidos por otro relieve.

## Texturas y materiales

- [x] Subir texturas propias: color, normales y rugosidad.
- [x] Escala, repetición, rotación y orientación por material.
- [ ] Mapas compartidos como preset reutilizable.
- [ ] Metal arenado, rayado, pátina, oxidación y esmalte irregular o cuarteado.
- [ ] Control de desgaste por bordes y zonas, no sólo patrón uniforme.
- [ ] Desplegado UV continuo o proyección triplanar, con exportación compatible.
- [ ] Alternar material heredado/global y ajustes locales.
- [ ] Calibrar metal, esmalte, vidrio y acabados iridiscentes a partir de las referencias.

## Geometría y SVG

- [ ] Presets de base: círculo, cápsula, hexágono, octágono y rectángulo redondeado.
- [ ] Bases con agujeros y validación de autointersecciones.
- [ ] Marco de ancho uniforme mediante offset geométrico.
- [ ] Bisel editable por pieza, suavidad de borde y esquinas.
- [ ] Relieve positivo y grabado real mediante booleanas.
- [ ] Recorte de ilustración al interior y manejo de intersecciones.
- [ ] Mantener contornos asociados a sus rellenos al cambiar alturas.
- [ ] Importación por grupos nombrados/IDs, reagrupación por color y mapeo semántico.
- [ ] Opciones de simplificación para ilustraciones densas y control de detalle.
- [ ] Reverso del badge con otro diseño, fecha o inscripción.

## Movimiento y video

- [x] Giro 360°, balanceo, duración, pausa y bucle de preview.
- [x] Exportación en tiempo real, fondo sólido y formato detectado, progreso y cancelación. Ver [VIDEO.md](VIDEO.md).

- [ ] Presets: giro 360°, balanceo, entrada de logro y acercamiento de detalle.
- [ ] Duración, velocidad, easing, pausa y bucle.
- [ ] Timeline o previsualización reproducible antes de exportar.
- [ ] Exportar video; evaluar WebM/MP4 y transparencia según el formato.
- [ ] Blur temporal de mayor calidad para el render final.
- [ ] Exportar animación en GLB cuando corresponda.
- [ ] Integración en una pantalla de logro. El confeti es un efecto separado del badge.

## Camino hacia Blender

- [ ] Importar el GLB y comparar visualmente materiales con el navegador.
- [ ] Esquema común de parámetros para regenerar la escena desde SVG y configuración.
- [ ] Script/CLI reproducible de Blender para geometría, materiales, cámara y luces.
- [ ] Render final con Cycles, imágenes transparentes y movimientos predefinidos.
- [ ] Sólo después, evaluar una API de trabajos de render. No hace falta IA para cada edición ni para ejecutar el script.

## Referencias y alcance

Stampstudio inspiró la experiencia de cargar diseño, ajustar parámetros, previsualizar y exportar. El repositorio expo-any-confetti motivó la pantalla de logro, pero no aporta los badges 3D. Las referencias visuales orientan los acabados, no garantizan equivalencia de render.

Fuera de alcance actual: fabricación, impresión 3D certificada, colaboración multiusuario, marketplace, cuentas propias o generación de ilustraciones con IA.
