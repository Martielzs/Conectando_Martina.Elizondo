/* ==========================================================
   MOTOR PRINCIPAL: EXCAVACIÓN DE REDES Y CONEXIONES MACRO
   ========================================================== */

const canvas = document.getElementById('canvas-instalacion');
const ctx = canvas.getContext('2d');
const interfaz = document.getElementById('interfaz-final');

function redimensionar() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
redimensionar();
window.addEventListener('resize', redimensionar);

const mouse = { x: null, y: null, radio: 90 };
let nivelActual = 1;

// Cinemática elástica de la cámara
let scrollYActual = 0;
let scrollYObjetivo = 0;
let zoomActual = 1.0;
let zoomObjetivo = 1.0;

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY + scrollYActual;
});

/* ==========================================================
   CLASE CASILLA (Comportamiento de desentierro por capas)
   ========================================================== */
class CasillaMosaico {
    constructor(col, fila, tamano) {
        this.col = col;
        this.fila = fila;
        this.tamano = tamano;
        
        this.raspado = false; // Estado de excavación de la superficie
        this.opacidadSuperficie = 1.0; // Los cuadrados nacen 100% opacos
        this.opacidadCaminoOculto = 0;
        this.pulsoAnillo = Math.random() * Math.PI;

        // Paleta original: Cian, Magenta, Amarillo Neón
        const colores = ['#00aaff', '#ff007f', '#e6ff00'];
        this.colorCircuito = colores[Math.floor(Math.random() * colores.length)];

        // INDEXACIÓN DE 5 NIVELES VERTICALES (20 filas de separación por capa)
        if (this.fila < 20) {
            this.nivel = 1; // Capa 1: Conexiones Micro (Líneas finas)
            this.esInterruptorMaster = (this.col === 18 && this.fila === 10);
        } else if (this.fila >= 20 && this.fila < 40) {
            this.nivel = 2; // Capa 2: Conexiones Medianas
            this.esInterruptorMaster = (this.col === 12 && this.fila === 30);
        } else if (this.fila >= 40 && this.fila < 60) {
            this.nivel = 3; // Capa 3: Conexiones Largas y Nodos
            this.esInterruptorMaster = (this.col === 24 && this.fila === 50);
        } else if (this.fila >= 60 && this.fila < 80) {
            this.nivel = 4; // Capa 4: Red Macro de Gran Escala
            this.esInterruptorMaster = (this.col === 18 && this.fila === 70);
        } else {
            this.nivel = 5; // Capa 5: Estructura del Título Oculto
            this.esInterruptorMaster = false;
            this.esEstructuraTitulo = (this.col >= 7 && this.col <= 28 && this.fila >= 86 && this.fila <= 93);
        }
    }

    actualizar() {
        const posX = this.col * this.tamano;
        const posY = this.fila * this.tamano;
        const cX = posX + this.tamano / 2;
        const cY = posY + this.tamano / 2;

        this.pulsoAnillo += 0.05;

        if (mouse.x !== null && mouse.y !== null) {
            const distancia = Math.hypot(mouse.x - cX, mouse.y - cY);

            // Si el cursor pasa encima, "raspa" y desentierra la superficie blanca/gris
            if (distancia < mouse.radio) {
                if (!this.raspado) {
                    this.raspado = true;
                    
                    // Si el mouse desentierra el interruptor maestro de este nivel, la compuerta cede y baja de piso
                    if (this.esInterruptorMaster && nivelActual === this.nivel) {
                        nivelActual++;
                    }
                }
            }
        }

        // Transiciones elásticas viscosas de revelación
        if (this.raspado) {
            this.opacidadSuperficie += (0.05 - this.opacidadSuperficie) * 0.08; // El bloque se vuelve casi transparente
            this.opacidadCaminoOculto += (1.0 - this.opacidadCaminoOculto) * 0.04; // Se enciende el circuito de abajo
        }
    }

    dibujar() {
        const posX = this.col * this.tamano;
        const posY = this.fila * this.tamano;
        const cX = posX + this.tamano / 2;
        const cY = posY + this.tamano / 2;

        // 1. DIBUJO DE LA SUPERFICIE (La cuadrícula uniforme de bloques que esconde el sistema)
        ctx.fillStyle = `rgba(24, 24, 24, ${this.opacidadSuperficie})`; // Cuadrados oscuros mate iniciales
        ctx.fillRect(posX + 2, posY + 2, this.tamano - 4, this.tamano - 4);
        
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacidadSuperficie * 0.03})`;
        ctx.lineWidth = 0.5;
        ctx.strokeRect(posX, posY, this.tamano, this.tamano);

        // 2. EL HINT DEL INTERRUPTOR: Destello blanco parpadeante muy sutil bajo el bloque para guiar la búsqueda
        if (this.esInterruptorMaster && nivelActual === this.nivel) {
            ctx.beginPath();
            ctx.arc(cX, cY, 5 + Math.sin(this.pulsoAnillo) * 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + Math.sin(this.pulsoAnillo) * 0.2})`;
            ctx.fill();
        }

        // 3. RENDER DE LOS CAMINOS OCULTOS (Crecen en tamaño y escala según el nivel)
        if (this.opacidadCaminoOculto > 0.01) {
            ctx.save();
            ctx.strokeStyle = this.colorCircuito;
            ctx.globalAlpha = this.opacidadCaminoOculto * 0.75;
            ctx.lineCap = 'round';

            // ASIGNACIÓN DE ESCALA CRECIENTE POR NIVEL (Más grande y grueso a medida que bajas)
            let grosorLinea = this.nivel * 1.3; // Nivel 1 = 1.3px, Nivel 4 = 5.2px ¡Macro conexiones!
            ctx.lineWidth = grosorLinea;

            ctx.beginPath();
            switch (this.nivel) {
                case 1: // Nivel 1: Conexiones micro lineales simples
                    ctx.moveTo(posX, cY); ctx.lineTo(posX + this.tamano, cY);
                    break;

                case 2: // Nivel 2: Líneas que se extienden el doble y doblan en L
                    ctx.moveTo(posX, cY);
                    ctx.quadraticCurveTo(cX, cY, cX, posY + this.tamano * 2);
                    break;

                case 3: // Nivel 3: Cruces estructurales con ramificaciones triples
                    ctx.moveTo(posX - this.tamano, cY); ctx.lineTo(posX + this.tamano * 2, cY);
                    ctx.moveTo(cX, posY); ctx.lineTo(cX, posY + this.tamano);
                    break;

                case 4: // Nivel 4: Conexiones masivas gigantes que atraviesan varios módulos
                    ctx.strokeStyle = this.colorCircuito;
                    ctx.moveTo(posX - this.tamano * 2, cY); ctx.lineTo(posX + this.tamano * 3, cY);
                    ctx.moveTo(cX, posY - this.tamano * 2); ctx.lineTo(cX, posY + this.tamano * 3);
                    break;

                case 5: // Nivel 5: La estructura final blanca que enmarca el título
                    if (this.esEstructuraTitulo) {
                        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
                        ctx.lineWidth = 1.5;
                        ctx.strokeRect(posX, posY, this.tamano, this.tamano);
                    } else {
                        ctx.strokeStyle = 'rgba(0, 170, 255, 0.1)';
                        ctx.lineWidth = 0.8;
                        ctx.moveTo(posX, posY); ctx.lineTo(posX + this.tamano, posY + this.tamano);
                    }
                    break;
            }
            ctx.stroke();
            ctx.restore();

            // Pequeña ficha central de luz que delata los puntos de pivote
            ctx.beginPath();
            ctx.arc(cX, cY, grosorLinea * 0.6 + 0.5, 0, Math.PI * 2);
            ctx.fillStyle = this.esInterruptorMaster ? '#ffffff' : `rgba(255, 255, 255, ${this.opacidadCaminoOculto * 0.8})`;
            ctx.fill();
        }
    }
}

/* ==========================================================
   CONSTRUCCIÓN DE LA MATRIZ DE TRABAJO (100 FILAS)
   ========================================================== */
const columnas = 36;
const filas = 100; // 5 niveles x 20 filas por etapa
const tamanoUnidad = 52;
const cuadriculaSistemica = [];

for (let c = 0; c < columnas; c++) {
    cuadriculaSistemica[c] = [];
    for (let f = 0; f < filas; f++) {
        cuadriculaSistemica[c][f] = new CasillaMosaico(c, f, tamanoUnidad);
    }
}

/* ==========================================================
   BUCLE OPERATIVO CINEMÁTICO (TRANSLACIÓN DE CÁMARA)
   ========================================================== */
function cicloRenderizado() {
    ctx.fillStyle = '#060606';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // GESTIÓN DEL MOVIMIENTO VERTICAL AUTOMÁTICO SEGÚN LA CAPA DESBLOQUEADA
    if (nivelActual === 1) scrollYObjetivo = 0;
    else if (nivelActual === 2) scrollYObjetivo = tamanoUnidad * 18;
    else if (nivelActual === 3) scrollYObjetivo = tamanoUnidad * 38;
    else if (nivelActual === 4) scrollYObjetivo = tamanoUnidad * 58;
    else if (nivelActual >= 5) {
        scrollYObjetivo = tamanoUnidad * 78;
        zoomObjetivo = 0.42; // Zoom out macro de revelación
        interfaz.classList.add('emergido'); // Despliega la palabra CONECTANDO
    }

    // Suavizado cinemático continuo (Inercia elástica)
    scrollYActual += (scrollYObjetivo - scrollYActual) * 0.035;
    zoomActual += (zoomObjetivo - zoomActual) * 0.015;

    ctx.save();
    
    // Centramos la cámara antes de aplicar la escala del zoom out
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(zoomActual, zoomActual);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    ctx.translate(0, -scrollYActual);

    // Ejecutar lógica y dibujo de la matriz
    for (let c = 0; c < columnas; c++) {
        for (let f = 0; f < filas; f++) {
            cuadriculaSistemica[c][f].actualizar();
            cuadriculaSistemica[c][f].dibujar();
        }
    }

    ctx.restore();
    requestAnimationFrame(cicloRenderizado);
}

// Ignición del motor web
requestAnimationFrame(cicloRenderizado);