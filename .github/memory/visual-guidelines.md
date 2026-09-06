# Guía visual TV

- Perfil validado: emulador `Television_4K`, 3840×2160 físicos y aproximadamente 960×540 dp lógicos.
- El contenido debe priorizar legibilidad y densidad: varias cards visibles por fila sin perder el foco.
- Base actual de card compacta: aproximadamente 158 dp de ancho × 222 dp de altura total.
- El título, año, género y vistas deben vivir dentro de la imagen, apoyados sobre un degradado inferior/superior.
- El foco debe dibujar un borde rojo estable alrededor de toda la card; no usar `scale` en el estado enfocado porque el `ScrollView` puede recortarlo.
- El encabezado y los títulos de fila deben reservar espacio, pero no desplazar el catálogo fuera de la primera vista útil.
- Captura de emulador para comparar: usar `adb exec-out screencap -p` y revisar el PNG antes/después.
