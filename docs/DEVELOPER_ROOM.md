# Habitación del desarrollador

El remaster conserva Konami (`↑ ↑ ↓ ↓ ← → ← → B A`), el identificador `developer-room` y la vista `room` de la colección. Al descubrirlo entra directamente a una escena de pantalla completa. No es un séptimo secreto.

## Arte proporcionado

Ambos archivos fueron suministrados por Juan a partir de su fotografía personal y se copiaron sin modificar, comprimir ni recolorear. La fotografía original no forma parte del sitio.

| Tema del portafolio | Archivo público | Dimensiones | Iluminación superpuesta |
| --- | --- | --- | --- |
| Claro | `images/developer-desk-day.png` | 1024 × 765 | Haz solar suave, verde cálido |
| Oscuro | `images/developer-desk-night.jpg` | 2400 × 1792 | Luz lunar tenue, azul grisáceo |

`src/data/developerRoom.js` mantiene esta correspondencia y aplica la ruta base de GitHub Pages. Los tests verifican también las huellas SHA-256 de los originales. La imagen sólo se solicita al entrar; no se descarga el otro tema hasta seleccionarlo. El interruptor de la habitación actualiza la misma preferencia global del portafolio y no recrea el controlador de audio.

## Escena y accesibilidad

`DeveloperScene` usa un diálogo nativo de pantalla completa. Mientras está abierto, la consola es inerte, el teclado del juego no responde y el visitante queda desactivado. Se conserva una salida con botón y Escape, contención del foco y recuperación del foco al cerrar. La colección permite regresar a la habitación explícitamente; recargar la página no abre secretos guardados ni inicia audio.

El arte se muestra completo, sin recortar. La luz, el polvo y las líneas de pantalla son capas CSS independientes; no se integraron en los archivos. El polvo cae lentamente, el haz varía suavemente y no hay destellos. El control de efectos pausa las animaciones; ocultar la pestaña también las pausa y `prefers-reduced-motion` las desactiva. Un error al cargar el arte muestra un aviso accesible sin impedir salir o escuchar música.

## Música

`public/audio/developer-room.mp3` es la grabación **Title Screen / Please, don't touch anything OST** suministrada por Juan. No se atribuye su interpretación ni composición a Juan.

El controlador crea el audio sólo tras Konami o un clic explícito en el secreto. Respeta silencio global, pausa manual y visibilidad; cierra y libera el archivo al salir. Los errores de carga y bloqueos de reproducción tienen estado visible y reintento. La radio y la habitación no se abren simultáneamente ni mezclan pistas. Cambiar el tema no reinicia ni reanuda una pista pausada.

## Verificación

- `npm test`: reglas del controlador musical, temas, rutas, integridad de archivos y conservación de la colección, junto con las pruebas de regresión existentes.
- `npm run lint` y `npm run build`.
- Navegador: Konami desde la pantalla inicial; ambas imágenes y luces; pausa, silencio, efectos; tema conservado al salir; reentrada desde la colección; móvil de 390 × 844; teclado y recuperación del foco.

Publicación: rama `feat/pocket-portfolio`, distribución `gh-pages`. No modificar `main`.
