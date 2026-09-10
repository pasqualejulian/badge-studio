# Prueba de foco de selección

Rama experimental `experiment/selection-focus`. No cambia producción.

- La selección conserva su material. Las demás partes, incluida la base, se muestran como contexto translúcido al 10% de su opacidad original, con reflejos reducidos.
- Solo selección oculta todas las otras partes, también base y marco. Está disponible para cualquier selección, no solo capas SVG.
- Mostrar contexto recupera la vista translúcida. Otra selección reinicia el aislamiento. El fondo o Centrar quitan el foco.
- Las partes ocultas no interceptan clics. Las translúcidas siguen siendo seleccionables.
- Se usan copias temporales de materiales sin escritura de profundidad para el contexto. Se restauran referencias y visibilidad originales al terminar cada render, incluso si falla. Capturas, archivos, miniaturas y video usan el objeto completo y sus materiales originales.
- La preferencia no se guarda en proyectos. Las copias se liberan al dejar de usarlas o destruir el motor.

Pendiente de evaluar con el usuario: legibilidad de transparencias superpuestas con ilustraciones complejas. Al deseleccionar la restitución es inmediata, la entrada al foco es gradual. Se respeta reducción de movimiento.

## Activación opcional

Resaltar selección está apagado por defecto. Apagado conserva la visualización de main: selección, contorno y cámara originales, sin transparencias ni aislamiento. Encendido habilita el contexto translúcido y Solo selección. Apagarlo cancela también el aislamiento. Se mantiene durante la sesión entre selecciones, pero no se persiste ni se exporta.
