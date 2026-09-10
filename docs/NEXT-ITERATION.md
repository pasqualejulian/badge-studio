# Próxima iteración: texturas y video

Estado: prioridades elegidas por el usuario, pendientes de implementación. Este documento define el alcance propuesto y criterios de aceptación. No describe funciones ya disponibles.

## Decisión y orden

Se priorizan los puntos 4 y 5 de la revisión: texturas propias/materiales y movimientos con exportación de video. Guardar proyectos, deshacer y las demás mejoras siguen en [ROADMAP.md](ROADMAP.md), pero dejan de encabezar la próxima iteración. Las pruebas visuales del trabajo nuevo forman parte de cada entrega.

| Entrega | Alcance | Esfuerzo relativo |
| --- | --- | --- |
| A | Materiales desde archivos y pequeña galería curada | Medio–alto |
| B | Giro y balanceo reproducibles en el visor | Medio |
| C | Exportar esos movimientos a video | Alto |

## A. Materiales con textura propia

Hoy hay patrones procedurales por material y grupo, pero no carga de mapas externos. El objetivo es obtener acabados menos uniformes y permitir materiales reutilizables sin IA.

Primera versión propuesta:

- Galería inicial pequeña, objetivo 6–8 acabados seleccionados para badges. Buscar metal rayado, arenado, metal envejecido, pintura y superficies de esmalte. La selección de archivos concretos está pendiente.
- Importación de mapas de color opcional, normal y rugosidad mediante archivos separados. PNG/JPG como alcance inicial. ZIP y detección automática quedan después.
- Aplicación a chapa, marco, esmalte o grupo seleccionado, desde el inspector flotante.
- Escala/repetición, rotación e intensidad de normal y rugosidad. Mantener el color elegido cuando sólo se carga microtextura.
- Resoluciones iniciales objetivo de 1K, con límite propuesto de 2K por mapa y validación de tamaño. Liberar recursos al reemplazar un material.
- Mantener los mapas en PNG exportado y GLB. El esquema del material debe poder integrarse después con guardar proyectos.

Aceptación: se puede elegir un preset, cargar un material propio, aplicarlo a un grupo y revisar frente/lateral sin que el grano se convierta en líneas. El GLB debe reabrirse conservando mapas y el PNG reflejar el acabado. Verificar escritorio y móvil. No exigir aún desaparición de todas las costuras UV.

Fuera de esta entrega: desplazamiento geométrico, grabado por altura, desgaste automático en bordes, galería remota completa y editor de nodos. Ver [TEXTURES.md](TEXTURES.md) para diferencias entre mapas.

### Bibliotecas verificadas

- **ambientCG**: primera opción para curar materiales. Sus archivos y renders de preview están bajo CC0. Permite incluir los archivos originales en proyectos y uso comercial. [Licencia oficial](https://docs.ambientcg.com/license/). [Galería](https://ambientcg.com/).
- **Poly Haven**: alternativa para texturas y entornos de iluminación. Los assets son CC0 y se pueden redistribuir. Su contenido web y previews no tienen automáticamente esa misma licencia. [Licencia oficial](https://polyhaven.com/license). [Galería](https://polyhaven.com/textures).
- Si luego usamos la API de Poly Haven, cumplir sus términos específicos y crédito visible. La licencia del archivo no sustituye las condiciones del servicio. [API oficial](https://polyhaven.com/our-api).

Propuesta: descargar una selección permitida, optimizarla y alojarla con la herramienta. No depender de hotlinks ni copiar una galería entera. Generar nuestras miniaturas desde los materiales. Registrar proveedor, ID, URL original, licencia y transformaciones en un manifiesto por asset. Todavía no se descargaron ni incorporaron texturas externas.

## B. Movimiento reproducible

Primera versión propuesta:

- Presets de giro 360° y balanceo. Entrada de logro y acercamiento de detalle quedan como ampliaciones.
- Reproducir, pausar, volver al inicio, duración y bucle.
- Una única función de animación calculada por tiempo para preview y exportación, sin depender de cuánto tarda cada frame.
- Guardar temporalmente cámara/posición del usuario y restaurarlas al terminar. Evitar conflictos entre reproducción, selección y gestos.
- Desenfoque sutil opcional. Conservar como referencia el rango actual 0–0,05, inicial 0,02. No prometer blur cinematográfico con el efecto actual.

Aceptación: un mismo preset y duración producen la misma pose en el mismo instante. El giro cierra sin salto y detener la reproducción permite volver a editar.

## C. Exportación de video

Primera versión objetivo: clip cuadrado 1080 × 1080, 30 fps y fondo sólido configurable, usando el mismo preset que la vista previa. Parámetros propuestos, sujetos a una prueba de rendimiento.

Antes de fijar el formato se debe probar la ruta de captura/codificación en los navegadores objetivo. Detectar soporte y mostrar únicamente formatos disponibles. WebM puede servir como primera salida cuando el navegador lo soporte. MP4 requiere verificar codec y contenedor o sumar una conversión explícita. No basta cambiar la extensión.

Incluir progreso, cancelación, prevención de exportaciones simultáneas y restauración del visor incluso ante fallo. Probar reproducción del archivo resultante, duración, resolución, ausencia de controles en el video y estabilidad de texturas.

Transparencia, exportación determinista de alta calidad, blur temporal real, timeline avanzada y animaciones dentro del GLB quedan para después. Un video no reemplaza al modelo 3D interactivo para una app nativa.

## Resto del rastro

- [Roadmap completo](ROADMAP.md): guardado, undo, SVG, geometría, interacción, reverso y Blender.
- Prueba nativa pendiente: cargar un GLB real en Expo y revisar iluminación, memoria y rendimiento en dispositivo. No está validada todavía.
- Blender sigue siendo una salida futura para render final. La primera entrega de video se plantea dentro de la herramienta web.
- Mantener estos documentos en el repositorio, sin agregar una página de roadmap a la app.
