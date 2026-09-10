# Prueba de foco de selección

Rama experimental `experiment/selection-focus`. No cambia producción.

- Al seleccionar, atenúa color y reflejos de otras partes con una entrada suave.
- Conserva la chapa opaca, sin introducir transparencias.
- Aislar capa oculta únicamente las otras capas SVG. El marco y la base siguen visibles.
- Otra selección reinicia el aislamiento. El fondo o Centrar quitan el foco.
- El efecto se aplica únicamente durante el render interactivo y se restaura al terminar, incluso si el render falla. Capturas, archivos, miniaturas y video usan los materiales originales.
- La preferencia no se guarda en proyectos. No modifica sus materiales.

Pendiente de evaluar con el usuario: intensidad de atenuación, conveniencia del aislamiento y legibilidad con ilustraciones complejas. Al deseleccionar la restitución es inmediata, la entrada al foco es gradual. Se respeta reducción de movimiento.
