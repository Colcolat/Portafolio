# Secretos del portafolio

Se implementan uno por uno. Sólo los secretos publicados cuentan en la colección.
Los descubrimientos existentes se conservan en `pocketfolio.secrets.v1`.

## Entregados

- [x] Habitación del desarrollador: código Konami y escena pixelada.
- [x] Encontraste el backend: vista de tecnologías reales, accesible desde el panel interior tras retirar los cuatro tornillos traseros.

- [x] Cartucho secreto: cinco pulsaciones consecutivas sobre el logotipo «pocket» de la consola revelan un cartucho en la pantalla; abre un minijuego de memoria de cuatro parejas.

## Entregado: rediseño del descubrimiento del backend

Solicitado el 12 de septiembre de 2026:

- [x] Sustituir el botón exterior actual por cuatro tornillos interactivos en la parte trasera.
- [x] El usuario debe pulsar los cuatro tornillos distintos; repetir uno no cuenta otra vez. Sin orden ni límite de tiempo.
- [x] Al completar los cuatro, la tapa se desprende y cae, mostrando circuitos y dos baterías dentro de la consola.
- [x] El panel que abre el secreto del backend está dentro, no sobre la tapa exterior.
- [x] Conservar el identificador `backend` y los descubrimientos ya guardados; no añadir un cuarto secreto por este rediseño.
- [x] Mantener el arrastre de la carcasa separado de los tornillos, e incluir acceso táctil/teclado y alternativa sin animación para movimiento reducido.
- [x] Permitir restaurar la tapa y la vista inicial; evitar que la animación interfiera con la navegación.

La apertura se reinicia al recargar; el descubrimiento del backend sigue guardado. «Reponer tapa» permite repetir el mecanismo sin borrar secretos. La alternativa sin WebGL conserva tornillos, caída de tapa, interior y panel accesible.

## Después

Pendientes: tres secretos nuevos y una mejora del cartucho existente.

- [ ] Personalizar el juego de memoria del cartucho secreto con los videojuegos favoritos de Juan: League of Legends, Elden Ring, Team Fortress 2 (TF2) y Ghost of Tsushima.
  - Una pareja por videojuego: cuatro iconos distintos, cada uno repetido dos veces, conservando las ocho cartas.
  - Crear un icono representativo de cada juego en pixel art, siguiendo la cuadrícula, paleta LCD y estilo retro del portafolio.
  - Actualizar los nombres accesibles de las cartas en ambos idiomas; conservar las reglas, controles y progreso de descubrimientos existentes.
- [ ] Radio de bolsillo: secuencia en el altavoz, melodía chiptune original y visualizador; respetar siempre el silencio.
- [ ] Visitante diminuto: personaje pixelado tras permanecer en el menú, sin interrumpir la navegación.
- [ ] Recompensa de Byte Snake: desbloqueo por puntuación, con recompensa visual por definir.
