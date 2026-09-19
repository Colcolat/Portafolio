# Secretos del portafolio

Se implementan uno por uno. Sólo los secretos publicados cuentan en la colección.
Los descubrimientos existentes se conservan en `pocketfolio.secrets.v1`.

## Entregados

- [x] Habitación del desarrollador: código Konami y escena pixelada.
- [x] Encontraste el backend: vista de tecnologías reales, accesible desde el panel interior tras retirar los cuatro tornillos traseros.

- [x] Cartucho secreto: cinco pulsaciones consecutivas sobre el logotipo «pocket» de la consola revelan un cartucho en la pantalla; abre un minijuego de memoria de cuatro parejas.
- [x] Radio de bolsillo: tres pulsaciones consecutivas en el altavoz abren una frecuencia musical y el recorrido secreto hacia la sala de piano.
- [x] Visitante diminuto: Bit aparece tras esperar en el menú; saludarlo registra el descubrimiento.
- [x] Guardián de bytes: recoger ocho bytes de comida en una sola partida de Byte Snake registra un trofeo secreto sin interrumpir la partida.

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

## Entregado: cartucho de videojuegos favoritos

- [x] Personalizar el juego de memoria del cartucho secreto con los videojuegos favoritos de Juan: League of Legends, Elden Ring, Team Fortress 2 (TF2) y Ghost of Tsushima.
  - Una pareja por videojuego: cuatro iconos distintos, cada uno repetido dos veces, conservando las ocho cartas.
  - Interpretaciones en pixel art de los emblemas y la máscara samurái, siguiendo la cuadrícula, paleta LCD y estilo retro del portafolio.
  - Nombres completos accesibles en ambos idiomas y etiquetas cortas en las cartas reveladas. Las cartas boca abajo no exponen su videojuego.
  - Las reglas, controles, intentos, reinicio y progreso de descubrimientos existentes se conservan; no se añade otro secreto.

## Entregado: radio de bolsillo y sala de piano

- [x] Pulsar tres veces el altavoz, con un máximo de 1.2 segundos entre pulsaciones. Funciona con ratón, tacto o Enter/Espacio sin contar teclas mantenidas.
- [x] La secuencia sólo funciona con la consola encendida, de frente, sin diálogos abiertos ni una partida de Byte Snake. No interfiere con el arrastre de la carcasa.
- [x] Reproducir el archivo de Moonlight proporcionado al activar la radio, con una pequeña tarjeta que presenta una de las piezas que Juan puede tocar al piano y anuncia que abajo hay una pieza de su alma.
- [x] Oscurecer gradualmente el fondo con textura pixelada; mostrar abajo una ola luminosa blanca y partículas flotantes.
- [x] Al bajar hacia la luz, desvanecer el portafolio y descubrir una sala blanca de concierto con detalles negros y dorados, pianista animado y la dedicatoria «Te dedico mi melodía favorita».
- [x] Cambiar al archivo de Chopin proporcionado al entrar a la sala, sin dos pistas simultáneas. Volver hacia la radio recupera Moonlight.
- [x] Relatar que Juan toca el piano desde los cinco años, participó en conciertos y tuvo como maestra a **Irina Decheva**. Mostrar las seis piezas favoritas que indicó, sin inventar conciertos ni atribuirle las grabaciones adjuntas.
- [x] Mantener la sala fuera del recorrido y del foco hasta activar el secreto en esa visita. Guardar sólo el descubrimiento `radio`: recargar no abre la sala ni inicia música, y la colección permite volver a entrar explícitamente.
- [x] Conservar pausa, silencio global y controles para volver o salir con Escape. Respetar movimiento reducido y pausar la reproducción al ocultar la pestaña.

Las grabaciones proporcionadas se alojan en `public/audio/pocket-moonlight.mp3` y `public/audio/piano-chopin.mp3`. No se crean ni descargan audios antes de la activación explícita. Si el navegador bloquea la reproducción, el control permite reintentar; la experiencia sigue navegable sin sonido. Este secreto amplía la colección a cuatro descubrimientos y conserva los tres anteriores.

### Entregado: refinamientos del recorrido y visualizador

- [x] Ampliar el pasaje a `320svh` en escritorio y `300svh` en móvil para dar espacio a la transición.
- [x] Desvanecer la tarjeta y Moonlight con el descenso mediante una envolvente suave; introducir Chopin gradualmente al entrar al recital, sin superponer dos pistas.
- [x] Llevar todo el fondo al mismo marfil de la sala antes de que aparezca su primer contenido, sin un corte horizontal entre ambas escenas.
- [x] Aumentar la altura y el brillo del pulso blanco conforme el usuario baja, manteniendo las partículas ambientales.
- [x] Transformar la pantalla LCD en negro con un visualizador SVG de `16 × 12` bloques pixelados, alimentado por niveles reales de la grabación.
- [x] Usar análisis opcional de `captureStream()` sobre el audio interno, sin micrófono ni permisos de grabación. Si no está disponible, conservar una línea base quieta; no simular un espectro ficticio.
- [x] Detener la animación del espectro al pausar, desactivar la escena u ocultar la pestaña. Con movimiento reducido se mantiene un fotograma estático.
- [x] Mostrar controles compactos durante el pasaje cuando la tarjeta ya desapareció; conservar pausa manual, silencio global, Escape y regreso al portafolio.

Seguimiento: estas mejoras refinan la radio ya entregada, no crean otro secreto ni alteran los descubrimientos guardados.

## Entregado: visitante diminuto

- [x] Abrir el menú inicial con **START / Enter** y esperar **20 segundos** sin actividad. Sólo cuenta el tiempo con la consola encendida, de frente y al menos un 35 % visible, en una pestaña visible y con foco.
- [x] Hacer aparecer a **Bit**, una mascota pixelada original, en su propio margen del menú. No cambia la selección, no reproduce sonidos y no roba el foco.
- [x] Permitir acercar el cursor al visitante sin que desaparezca, o llegar a él con Tab/Mayús+Tab. Pulsarlo con ratón o tacto, o enfocarlo y activar Enter/Espacio, lo saluda y descubre el secreto `visitor`. Verlo aparecer no basta para registrarlo.
- [x] Reiniciar la espera al interactuar en otro lugar. Salir del menú, apagar o girar la consola, abrir un diálogo o la radio, ocultar la pestaña o perder el foco descarta la espera anterior.
- [x] Mantener una versión estática con movimiento reducido. La aparición no interrumpe la navegación ni activa controles de la consola.
- [x] Conservar los cuatro descubrimientos anteriores y añadir el visitante como quinto secreto, sin duplicar saludos. Sólo se guarda el descubrimiento: recargar no restaura su aparición ni lo desbloquea automáticamente.
- [x] Permitir volver a su recompensa desde **Secretos encontrados**. El botón para saludar a Bit es decorativo y no suma otro descubrimiento.

## Entregado: recompensa de Byte Snake

- [x] Recoger **ocho bytes de comida en una sola partida actual** para descubrir `byte-reward`, el sexto secreto. Un récord guardado de una visita anterior no lo desbloquea y las puntuaciones de distintas partidas no se acumulan para este objetivo.
- [x] Registrar el descubrimiento automáticamente y sin sonido al alcanzar el objetivo, con un anuncio accesible no intrusivo y una pequeña estrella de trofeo. No abrir un diálogo, pausar automáticamente ni cambiar el tamaño del tablero.
- [x] Al pausar con **A** o terminar la ronda —por derrota o victoria—, mostrar **Ver trofeo / View trophy** junto al control habitual para continuar o volver a jugar. El usuario decide cuándo abrir la recompensa; también puede visitarla desde **Secretos encontrados** una vez conseguida.
- [x] Conservar los cinco descubrimientos anteriores, el orden de la colección y la clave `pocketfolio.secrets.v1`; no duplicar el trofeo al repetir el logro.

La colección cuenta con **seis secretos implementados**. Quedan **cero secretos nuevos** de la lista acordada; comienza la etapa de refinamiento de los existentes.

## Entregado: pantalla de inicio

- [x] Al cargar la página, mostrar en la consola **Presiona START para empezar / Press START to begin**.
- [x] Su botón, el control físico **START** o **Enter** llevan directamente al menú de selección de secciones, sin iniciar automáticamente Byte Snake. **A / Z** también permite comenzar; las flechas, **B** y **SELECT** conservan la pantalla inicial.
- [x] No guardar este estado de entrada: aparece de nuevo al recargar y no cambia los secretos ni las preferencias conservadas.

## Pendiente: remaster de la habitación del desarrollador

Solicitado el 19 de septiembre de 2026. Se realizará después de terminar el sexto secreto y al refinar los existentes; **todavía no está implementado**.

- [ ] Conservar el código Konami como acceso y el identificador `developer-room`. Es un rediseño del secreto actual, no un séptimo descubrimiento.
- [ ] Sustituir la pequeña recompensa de la consola por una transición en la que la consola se desvanece poco a poco y aparece una escena pixel art del escritorio personal de Juan.
- [ ] Crear el pixel art a partir de la **fotografía del escritorio que Juan enviará más adelante**. Los adjuntos actuales son referencias de estilo; no representan su escritorio ni sustituyen esa fotografía.
- [ ] Aplicar una estética de pantalla retro con paleta verde, líneas de barrido y textura LCD semejante a la referencia, manteniendo el lenguaje visual del portafolio.
- [ ] Iluminar el cuarto con un pequeño rayo de luz y diminutos píxeles de polvo que caen. Respetar movimiento reducido y conservar una salida accesible de la escena.
- [ ] Reproducir de fondo la melodía adjunta: `Title Screen Please, don't touch anything OST.mp3`. Es una referencia pendiente: no se copia, importa ni reproduce en esta entrega.
- [ ] Coordinar el audio futuro con el silencio global y las otras escenas para evitar reproducciones simultáneas; conservar los descubrimientos existentes al sustituir la presentación de la habitación.

Dependencia pendiente: recibir la foto del escritorio antes de crear su arte definitivo. Esto no bloquea la entrega de Byte Snake ni la pantalla de inicio.
