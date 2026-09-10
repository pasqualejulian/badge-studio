# Interfaz y adaptación móvil

## Escritorio

Canvas como única superficie de edición. La selección abre un inspector con Material y Brillo, seguido de Textura y Volumen desplegables. Las texturas simples, de biblioteca y propias se encuentran juntas. Brillo controla la rugosidad efectiva: la del mapa externo cuando existe y la del material en caso contrario. Iluminación y movimiento quedan en Escena y movimiento. La interfaz anterior con panel está conservada en la etiqueta Git `interface-panel-v11`.

## Móvil

La edición usa el mismo modo Canvas que escritorio. Guardar mantiene su texto visible en la barra y Biblioteca usa un icono con nombre accesible. Exportar agrupa PNG y GLB.

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

En móvil, arrastrar un slider de propiedades atenúa los controles circundantes. Se mantienen texto y valor del ajuste activo. La textura se edita dentro del inspector de la pieza.

## Guardado explícito

Guardar está en la barra principal y admite Cmd/Ctrl+S. En el primer guardado abre un formulario breve con nombre y colección. En una pieza ya abierta guarda directamente. Cada escritura completada muestra confirmación y la hora del último guardado en escritorio, sin afirmar que no haya cambios posteriores. El guardado sigue siendo manual y local.

Biblioteca se abre sin reemplazar el canvas y lo explica al entrar. Su confirmación para abrir otra pieza sigue ofreciendo guardar primero. Guardar como plantilla y exportar el proyecto editable permanecen en el formulario de guardado, también accesible desde Guardar pieza actual en la biblioteca. El logo deja de ser un enlace que recarga el editor.
