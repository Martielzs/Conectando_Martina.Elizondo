/* ==========================================================
   MOTOR INTERACTIVO: ENCADENAMIENTO DINÁMICO DE RETÍCULA
   ========================================================== */

const canvas = document.getElementById('canvas-instalacion');
const ctx = canvas.getContext('2d');

const tamanoUnidad = 30; // Cuadrícula más pequeña y densa para mayor exploración
let columnas, filas;
let matrizTablero = [];

// Lista de casillas que el usuario ya logró conectar correctamente
let caminoConstruido = []; 
let transicionActiva = false;

// Variables cinematográficas (Travelling elástico)
let scrollYActual = 0;
let scrollYObjetivo = 0;

// Configuración de la Ruta Invisible Correcta (Coordenadas relativas)
let rutaCorrecta = []; 
let indiceRutaSiguiente = 1; // Lleva la cuenta de cuál es el siguiente casillero a adivinar

function inicializarMundo() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    columnas = Math.ceil(canvas.width / tamanoUnidad);
    filas = Math.ceil(canvas.height / tamanoUnidad) * 2;

    // Centro exacto de la pantalla (Punto de Salida/Origen)
    const centroX = Math.floor(columnas / 2);
    const centroY = Math.floor((canvas.height / tamanoUnidad) / 2);

    matrizTablero = [];
    for (let c = 0; c < columnas; c++) {
        matrizTablero[c] = [];
        for (let f = 0; f < filas; f++) {
            matrizTablero[c][f] = {
                col: c,
                fila: f,
                esParteDeLaRuta: false,
                esMetaOculta: false,
                colorElemento: '#00aaff'
            };
        }
    }

    // Generamos la ruta correcta uniendo puntos en ángulos de 90° (Ortogonal)
    // Parte en el centro, va a la izquierda, baja, va a la derecha y llega al punto oculto meta
    rutaCorrecta = [];
    
    // Tramo 1: Desde el centro hacia la izquierda
    for (let c = centroX; c >= centroX - 6; c--) rutaCorrecta.push({c: c, f: centroY, color: '#00aaff'}); // Conexión (Cian)
    // Tramo 2: Baja
    let ultimo = rutaCorrecta[rutaCorrecta.length - 1];
    for (let f = ultimo.f + 1; f <= ultimo.f + 5; f++) rutaCorrecta.push({c: ultimo.c, f: f, color: '#ff007f'}); // Relación (Magenta)
    // Tramo 3: Se mueve a la derecha cruzando el mapa
    ultimo = rutaCorrecta[rutaCorrecta.length - 1];
    for (let c = ultimo.c + 1; c <= ultimo.c + 14; c++) rutaCorrecta.push({c: c, f: ultimo.f, color: '#e6ff00'}); // Trayectoria (Amarillo)
    // Tramo 4: Sube un poco
    ultimo = rutaCorrecta[rutaCorrecta.length - 1];
    for (let f = ultimo.f - 1; f >= ultimo.f - 3; f++) rutaCorrecta.push({c: ultimo.c, f: f, color: '#00aaff'}); // Exploración (Cian)
    // Tramo 5: Va a la derecha hasta el Hito Oculto Final
    ultimo = rutaCorrecta[rutaCorrecta.length - 1];
    for (let c = ultimo.c + 1; c <= ultimo.c + 5; c++) rutaCorrecta.push({c: c, f: ultimo.f, color: '#ff007f'}); // Sistema (Meta)

    // Marcamos las casillas en la matriz de datos
    rutaCorrecta.forEach((pos, infoIndex) => {
        if(matrizTablero[pos.c] && matrizTablero[pos.c][pos.f]) {
            matrizTablero[pos.c][pos.f].esParteDeLaRuta = true;
            matrizTablero[pos.c][pos.f].colorElemento = pos.color;
            
            // El último casillero de la lista es la Meta Oculta
            if (infoIndex === rutaCorrecta.length - 1) {
                matrizTablero[pos.c][pos.f].esMetaOculta = true;
            }
        }
    });

    // El juego arranca con el punto del centro ya activado y conectado
    caminoConstruido = [ { c: centroX, f: centroY, color: '#ffffff' } ];
    indiceRutaSiguiente = 1;
    transicionActiva = false;
    scrollYActual = 0;
    scrollYObjetivo = 0;
}

// Registro del movimiento del cursor sobre las casillas pequeñas
window.addEventListener('mousemove', (e) => {
    if (transicionActiva) return;

    // Convertimos la posición del mouse al índice de la cuadrícula correspondiente
    const mX = Math.floor(e.clientX / tamanoUnidad);
    const mY = Math.floor((e.clientY + scrollYActual) / tamanoUnidad);

    if (mX >= 0 && mX < columnas && mY >= 0 && mY < filas) {
        // Buscamos cuál es el casillero que el usuario debería tocar ahora
        const proximoPasoEsperado = rutaCorrecta[indiceRutaSiguiente];

        if (proximoPasoEsperado && mX === proximoPasoEsperado.c && mY === proximoPasoEsperado.f) {
            // ¡Adivinó el camino! Lo añadimos a la cadena visible
            caminoConstruido.push({ c: mX, f: mY, color: proximoPasoEsperado.color });
            indiceRutaSiguiente++;

            // Si tocó el punto oculto final de la cadena, se gatilla la cinemática
            if (matrizTablero[mX][mY].esMetaOculta) {
                transicionActiva = true;
                scrollYObjetivo = canvas.height; // Travelling vertical continuo
            }
        }
    }
});

/* ==========================================================
   BUCLE DE RENDERIZADO (Dibujo e Iluminación Dinámica)
   ========================================================== */
function loopInstalacion() {
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Movimiento fluido de la cámara al ganar
    if (transicionActiva) {
        scrollYActual += (scrollYObjetivo - scrollYActual) * 0.02;
    }

    ctx.save();
    ctx.translate(0, -scrollYActual);

    // 1. DIBUJAR LA RETÍCULA BASE UNIFORME OSCURA
    ctx.lineWidth = 0.5;
    for (let c = 0; c < columnas; c++) {
        for (let f = 0; f < filas; f++) {
            const pX = c * tamanoUnidad;
            const pY = f * tamanoUnidad;

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
            ctx.strokeRect(pX, pY, tamanoUnidad, tamanoUnidad);
        }
    }

    // 2. DIBUJAR EL CAMINO QUE SE VA ARMANDO (CONECTADO EN TIEMPO REAL)
    for (let i = 0; i < caminoConstruido.length; i++) {
        const nodo = caminoConstruido[i];
        const pX = nodo.c * tamanoUnidad;
        const pY = nodo.f * tamanoUnidad;

        // Pintamos el bloque con su color del sistema
        ctx.fillStyle = nodo.color;
        ctx.fillRect(pX + 1, pY + 1, tamanoUnidad - 2, tamanoUnidad - 2);
        
        // Si es el punto de inicio del centro, lo destacamos con un núcleo blanco
        if (i === 0) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(pX + 6, pY + 6, tamanoUnidad - 12, tamanoUnidad - 12);
        }

        // Tramos de puentes: Unimos esta casilla con la siguiente con una línea de luz continua
        if (i < caminoConstruido.length - 1) {
            const sigNodo = caminoConstruido[i + 1];
            ctx.strokeStyle = nodo.color;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(nodo.c * tamanoUnidad + tamanoUnidad / 2, nodo.f * tamanoUnidad + tamanoUnidad / 2);
            ctx.lineTo(sigNodo.c * tamanoUnidad + tamanoUnidad / 2, sigNodo.f * tamanoUnidad + tamanoUnidad / 2);
            ctx.stroke();
        }
    }

    // 3. REACCIÓN ESPECIAL SI ENCUENTRA LA META OCULTA
    if (transicionActiva) {
        const meta = rutaCorrecta[rutaCorrecta.length - 1];
        ctx.save();
        ctx.shadowColor = '#ff007f';
        ctx.shadowBlur = 25;
        ctx.fillStyle = '#ffffff'; // Destello blanco en la salida
        ctx.fillRect(meta.c * tamanoUnidad, meta.f * tamanoUnidad, tamanoUnidad, tamanoUnidad);
        ctx.restore();
    }

    ctx.restore();
    requestAnimationFrame(loopInstalacion);
}

// Encendido del script
inicializarMundo();
window.addEventListener('resize', inicializarMundo);
requestAnimationFrame(loopInstalacion);