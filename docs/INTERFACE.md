# Interfaz y adaptación móvil

## Escritorio

Canvas como superficie principal, barra superior compacta y accesos a Base, Diseño completo y Acabado y movimiento. La selección abre un inspector con dos secciones: Pieza y Texturas. El panel fijo sigue disponible como alternativa. Los mapas de la chapa en ajustes generales se despliegan bajo un resumen para no desplazar todos los controles.

## Móvil

La edición usa automáticamente el modo Canvas. La preferencia de panel elegida en escritorio se conserva para cuando se vuelve a una pantalla grande.

Al editar, una capa de pantalla completa mantiene el objeto detrás. Los controles se concentran en una superficie translúcida inferior, con scroll propio, contraste de lectura y desenfoque leve. El visor reserva altura arriba para que el badge siga visible. No se usa aria-modal porque la zona libre del canvas continúa siendo interactiva.

- Ver objeto despeja los controles sin cerrar la selección. Volver a editar los recupera.
- Listo cierra la edición y devuelve el foco al visor.
- En horizontal, controles a la derecha y espacio de visualización a la izquierda.
- Áreas táctiles principales de al menos 44 px, inputs de texto de 16 px y espacio para safe areas.
- Movimiento reducido desactiva transiciones. Transparencia reducida usa fondo sólido donde el navegador soporte esa preferencia.
- No se modifica la geometría ni los formatos de exportación.

## Verificación y pendientes

Compilación TypeScript, build y pruebas existentes. Queda la evaluación visual/táctil en teléfonos reales, incluyendo teclado virtual y Safari. Ajustar opacidad y altura del panel a partir de esa prueba. El botón Ver objeto conserva selección y parámetros, pero el resize del visor puede detener la reproducción de movimiento, de acuerdo con el comportamiento actual del motor.

## Dirección visual: estudio de objetos

Grafito cálido, texto marfil y acento champagne. La geometría de la pieza se agrupa en Detalle y relieve, y los archivos de textura en Cargar mis propios mapas. Se conservan los controles y rangos existentes.

La iluminación usa un entorno de softboxes definido en lib/studio-lighting.ts para reflejos sobre el metal. Es iluminación del visor, no se incorpora al GLB. Las seis miniaturas se renderizan desde lib/material-preview.ts y se sirven como PNG estáticos. Representan el material con su color, mientras que la aplicación conserva inicialmente el color elegido hasta activar Usar color del material.

En móvil, arrastrar un slider de propiedades atenúa los controles circundantes. Se mantienen texto y valor del ajuste activo. La textura se sigue editando desde su sección específica.

## Bienvenida al canvas

La primera vez que el motor está listo se abre una guía breve: seleccionar directamente el borde, la base o una capa SVG, editar su acabado y crear un sistema con plantillas y colecciones. El cierre explica que cada pieza se guarda por separado y que la biblioteca es local al navegador.

Se puede saltear, cerrar con Escape o volver a abrir con Ayuda junto a Centrar. Probar en el canvas activa el modo Canvas. La preferencia de cierre se guarda en localStorage con la clave `badge-studio.canvas-guide.v1`. Si el navegador impide guardar preferencias, la ayuda funciona pero puede reaparecer en otra visita.

Validado en navegador a 1200×800 y 390×700: primera apertura, cierre, persistencia tras recargar, reapertura manual y Escape. No se agregó una dependencia de tours.
