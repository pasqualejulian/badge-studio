# Movimiento y exportación de video

## Disponible

- Giro 360° y balanceo de cámara alrededor del objetivo actual.
- Duración 2–15 segundos, reproducir, pausar, continuar y volver al inicio.
- Bucle opcional para preview. La exportación graba un solo ciclo.
- Fondo sólido configurable para el video. Exportación cuadrada 1080 × 1080, objetivo 30 fps.
- Detecta codecs de MediaRecorder: WebM VP9/VP8, WebM genérico o MP4 si está soportado. La extensión corresponde al contenedor elegido.
- Progreso, cancelación, bloqueo de edición durante captura y restauración de cámara, tamaño del canvas, fondo y controles.
- Al ocultar la pestaña se interrumpe la grabación con un error, no se presenta como éxito.
- Se añade duración a WebM mediante fix-webm-duration cuando falta.

## Límites

La captura es en tiempo real. La fluidez efectiva depende del dispositivo, cantidad de geometría y mapas. No garantiza 30 frames distintos por segundo ni exportación determinista offline. Mantener la pestaña visible.

El video tiene fondo sólido. No hay transparencia, audio, timeline avanzada ni conversión garantizada a MP4. No se exporta animación en el GLB. El blur direccional del visor no se aplica a la grabación, cuyo primer alcance prioriza captura nítida. Un render con blur temporal queda pendiente.

El recorrido usa el encuadre elegido. Un zoom de detalle puede recortar el badge en la salida cuadrada. Los materiales y la escena se mantienen, los controles no se graban.

## Verificación

Pruebas de fórmulas de movimiento y fallback de formatos en tests/animation.mjs. Pruebas del motor en Chromium con WebGL: carga de mapas en cuatro destinos, exportación/reapertura de GLB, pausa/restauración, captura y cancelación. No equivalen a una auditoría visual completa ni a pruebas en iPhone/Android reales.

Resultado de la prueba de integración de esta entrega: GLB reabierto con 29 mallas texturizadas, video WebM de 1080 × 1080 y duración leída de 2,018799 s para un ciclo de 2 s. Cancelación y rechazo de archivo inválido correctos. Resize del motor a 360 × 430 sin valores inválidos, sin inspección visual móvil. El GLB del caso con mapas aplicados a cuatro destinos pesó 24,9 MB: no está optimizado para producción móvil.
