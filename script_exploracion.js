// ==========================================================================
// SCRIPT EXPLORACION - ENTORNO GENERATIVO CONTINUO DE NODOS Y CONEXIONES
// ==========================================================================

const canvas = document.getElementById('canvas-instalacion');
const ctx = canvas.getContext('2d');

let w = canvas.width = window.innerWidth;
let h = canvas.height = window.innerHeight;

// --- CONFIGURACIÓN Y ESTADOS GLOBALES ---
let nodes = [];
let wordPoints = [];
let selectedWord = "TRAYECTORIA";
let anchors = []; // Anclajes estructurales del Paso 5
let resonanceCharge = 0; // Carga de resonancia en Paso 6
let spacePressed = false; // Estado de la barra espaciadora en Paso 6
let polarizationFactor = 0; // Factor de ordenación por color en Paso 4
let playthroughCount = 0; // Contador de reproducciones
let activeWindSource = null; // Fuente del viento activo para detenerlo al reiniciar

// Máquina de Estados Ampliada (Recorrido de 8 Pasos Fijos)
let currentStep = 0;
let dragTicks = 0;
let stillTicks = 0;
let systemTension = 0; // Tensión acumulada por velocidad en Paso 4
let userChoice = 2;    // Guardará el comportamiento elegido
let time = 0;

// Moduladores de Estado de Física
let activeBehavior = 2; // 1: Dispersión, 2: Conexión, 3: Estabilidad, 4: Fragmentación
let evolutionMode = 0;  // 0: Expansión, 1: Reorganización, 2: Reconfiguración Estructural
let userDensity = 80;   // Densidad base de partículas

// Variables de interacción y AFK
let mx = -1000;
let my = -1000;
let pmx = -1000;
let pmy = -1000;
let mouseClicked = false;
let mousePressed = false;
let interacted = false;
let lastInteractionTime = Date.now();

// Métricas acumuladas para la clasificación del recorrido
let totalClicks = 0;
let totalMouseVel = 0;
let totalDragTicks = 0;
let frameCounter = 0;

// --- PALETA DE COLORES ORIGINAL CON PESOS ---
const ORIGINAL_COLORS = ['#00aaff', '#ff007f', '#e6ff00']; // Cian, Magenta, Amarillo
let colorWeights = [0.33, 0.33, 0.34];

// --- MAPEO VECTORIAL DE LETRAS PARA PALABRAS EMERGENTES ---
const letterMap = {
    'C': [[0,0, 2,0], [0,0, 0,4], [0,4, 2,4]],
    'O': [[0,0, 2,0], [0,0, 0,4], [2,0, 2,4], [0,4, 2,4]],
    'N': [[0,0, 0,4], [0,0, 2,4], [2,0, 2,4]],
    'E': [[0,0, 2,0], [0,0, 0,4], [0,2, 1.5,2], [0,4, 2,4]],
    'T': [[0,0, 2,0], [1,0, 1,4]],
    'A': [[0,4, 0,0], [0,0, 2,0], [2,0, 2,4], [0,2, 2,2]],
    'D': [[0,0, 1.5,0], [1.5,0, 2,1], [2,1, 2,3], [2,3, 1.5,4], [1.5,4, 0,4], [0,4, 0,0]],
    'P': [[0,0, 0,4], [0,0, 2,0], [2,0, 2,2], [2,2, 0,2]],
    'R': [[0,0, 0,4], [0,0, 2,0], [2,0, 2,2], [2,2, 0,2], [0,2, 2,4]],
    'G': [[2,0, 0,0], [0,0, 0,4], [0,4, 2,4], [2,4, 2,2], [2,2, 1,2]],
    'I': [[0,0, 2,0], [1,0, 1,4], [0,4, 2,4]],
    'S': [[2,0, 0,0], [0,0, 0,2], [0,2, 2,2], [2,2, 2,4], [2,4, 0,4]],
    'M': [[0,4, 0,0], [0,0, 1,2], [1,2, 2,0], [2,0, 2,4]],
    'Y': [[0,0, 1,2], [2,0, 1,2], [1,2, 1,4]],
    'L': [[0,0, 0,4], [0,4, 2,4]],
    'Ó': [[0,0, 2,0], [0,0, 0,4], [2,0, 2,4], [0,4, 2,4], [0.8,-0.8, 1.2,-0.2]],
    'U': [[0,0, 0,4], [0,4, 2,4], [2,4, 2,0]]
};

// --- AUDIO GENERATIVO CONTEMPLATIVO ---
let audioCtx = null;
let soundEnabled = true;
let droneOsc = null;
let droneFilter = null;
let droneGain = null;

const PENTATONIC = [130.81, 146.83, 164.81, 196.00, 220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00];

function inicializarAudio() {
    if (audioCtx) return;
    try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContextClass();
        
        droneOsc = audioCtx.createOscillator();
        droneFilter = audioCtx.createBiquadFilter();
        droneGain = audioCtx.createGain();
        
        droneOsc.type = 'triangle';
        droneOsc.frequency.setValueAtTime(60, audioCtx.currentTime); // C2
        
        droneFilter.type = 'lowpass';
        droneFilter.frequency.setValueAtTime(140, audioCtx.currentTime);
        droneFilter.Q.setValueAtTime(4, audioCtx.currentTime);
        
        droneGain.gain.setValueAtTime(0, audioCtx.currentTime); // Silenciado completamente
        
        droneOsc.connect(droneFilter);
        droneFilter.connect(droneGain);
        droneGain.connect(audioCtx.destination);
        
        droneOsc.start(); // Iniciado silencioso
    } catch (e) {
        console.error("AudioContext no soportado:", e);
    }
}

function updateDroneFrecuencia() {
    if (!audioCtx || !droneOsc) return;
    const targetFreq = 50 + nodes.length * 0.35;
    droneOsc.frequency.setTargetAtTime(targetFreq, audioCtx.currentTime, 0.8);
}

// Sonido cristalino, cálido y agradable mediante osciladores senoidales ligeramente desafinados (chorus suave)
function playGlassChime(freq, duration = 2.0, volume = 0.08) {
    if (!audioCtx || !soundEnabled) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const now = audioCtx.currentTime;
    
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    
    osc1.type = 'sine';
    osc2.type = 'sine';
    
    osc1.frequency.setValueAtTime(freq, now);
    osc2.frequency.setValueAtTime(freq + 1.2, now); // Desafinado sutil para calidez
    
    const gain1 = audioCtx.createGain();
    const gain2 = audioCtx.createGain();
    
    // Envolvente suave y cristalina
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(volume, now + 0.04); // Ataque suave
    gain1.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.linearRampToValueAtTime(volume * 0.7, now + 0.04);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.85);
    
    osc1.connect(gain1);
    osc2.connect(gain2);
    
    const mainGain = audioCtx.createGain();
    mainGain.gain.setValueAtTime(1.0, now);
    
    gain1.connect(mainGain);
    gain2.connect(mainGain);
    mainGain.connect(audioCtx.destination);
    
    osc1.start(now);
    osc2.start(now);
    
    osc1.stop(now + duration + 0.1);
    osc2.stop(now + duration + 0.1);
}

// Barrido de ruido de baja frecuencia (viento cálido, sin asperezas)
function playSoftWind(duration = 3.0) {
    if (!audioCtx || !soundEnabled) return;
    const now = audioCtx.currentTime;
    
    if (activeWindSource) {
        try { activeWindSource.stop(); } catch(e) {}
        activeWindSource = null;
    }
    
    const bufferSize = audioCtx.sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    
    const noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = buffer;
    activeWindSource = noiseSource;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass'; // Filtro de paso bajo suave
    filter.frequency.setValueAtTime(180, now);
    filter.frequency.exponentialRampToValueAtTime(750, now + duration * 0.4);
    filter.frequency.exponentialRampToValueAtTime(120, now + duration);
    
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.04, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    
    noiseSource.onended = () => {
        if (activeWindSource === noiseSource) {
            activeWindSource = null;
        }
    };
    
    noiseSource.start(now);
    noiseSource.stop(now + duration);
}

function playChime(freqIndex) {
    const freq = PENTATONIC[freqIndex % PENTATONIC.length];
    playGlassChime(freq, 1.8, 0.08); // Campana de cristal bonita
}

function playModeChangeChime(behavior) {
    if (!audioCtx || !soundEnabled) return;
    let rootFreq = 261.63; // Do4
    if (behavior === 1) rootFreq = 261.63; // Do
    else if (behavior === 2) rootFreq = 293.66; // Re
    else if (behavior === 3) rootFreq = 329.63; // Mi
    else if (behavior === 4) rootFreq = 392.00; // Sol
    
    // Armonía mayor preciosa
    const freqs = [rootFreq, rootFreq * 1.25, rootFreq * 1.5]; // Tríada mayor pura
    freqs.forEach((freq, idx) => {
        setTimeout(() => {
            playGlassChime(freq, 2.0, 0.06);
        }, idx * 90);
    });
}

function playEvolutionChangeChime(mode) {
    if (!audioCtx || !soundEnabled) return;
    const now = audioCtx.currentTime;
    
    if (mode === 0) {
        // Acorde descendente suave de despedida
        const freqs = [392.00, 329.63, 261.63];
        freqs.forEach((f, idx) => {
            setTimeout(() => {
                playGlassChime(f, 1.8, 0.06);
            }, idx * 110);
        });
        // Silenciar drone y detener viento al reiniciar
        if (droneGain) {
            droneGain.gain.setTargetAtTime(0, now, 0.4);
        }
        if (activeWindSource) {
            try { activeWindSource.stop(); } catch(e) {}
            activeWindSource = null;
        }
    } else if (mode === 2) {
        // ¡El nuevo sonido de revelación dulce, armonioso y cinematográfico!
        // Un viento cálido de fondo con una cascada cristalina de un acorde Gmaj9 extendido
        playSoftWind(3.2);
        const chord = [196.00, 293.66, 392.00, 493.88, 587.33, 783.99, 987.77]; // Sol, Re, Sol, Si, Re, Sol, Si (Preciosa cascada)
        chord.forEach((freq, idx) => {
            setTimeout(() => {
                playGlassChime(freq, 3.0, 0.07);
            }, idx * 150);
        });
    }
}

// --- CONSTRUCTOR DE NODOS CON DISTRIBUCIÓN CROMÁTICA PESADA ---
function getWeightedColor() {
    const r = Math.random();
    if (r < colorWeights[0]) return ORIGINAL_COLORS[0]; // Cian
    if (r < colorWeights[0] + colorWeights[1]) return ORIGINAL_COLORS[1]; // Magenta
    return ORIGINAL_COLORS[2]; // Amarillo
}

function crearNode(x, y, id) {
    const r = Math.random() * 3 + 1.5;
    return {
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        targetX: x,
        targetY: y,
        isMorphed: false,
        charIndex: -1,
        radius: r,
        baseRadius: r,
        color: getWeightedColor(), // Retorno exclusivo a la paleta original
        alpha: Math.random() * 0.6 + 0.4,
        id: id
    };
}

function inicializarNodos(density = 80) {
    // Variación generativa sutil: redistribuir los pesos de la paleta original en cada inicio
    const r1 = Math.random();
    const r2 = Math.random();
    const r3 = Math.random();
    const sum = r1 + r2 + r3;
    colorWeights = [r1 / sum, r2 / sum, r3 / sum];

    nodes = [];
    for (let i = 0; i < density; i++) {
        // En paso 0 se inicializan agrupados al centro (bloqueados e invisibles)
        nodes.push(crearNode(w / 2, h / 2, i));
    }
    
    resetMetrics();
}

function resetMetrics() {
    totalClicks = 0;
    totalMouseVel = 0;
    totalDragTicks = 0;
    frameCounter = 0;
}

// --- CLASIFICACIÓN DE TRAYECTORIA ---
function classifyJourney() {
    const frames = Math.max(1, frameCounter);
    const avgVel = totalMouseVel / frames;
    
    // 1. Conectando: Si pasó mucho tiempo arrastrando y uniendo filamentos
    if (totalDragTicks > 180) {
        return "CONECTANDO";
    }
    
    // 2. Progresión: Si movió el mouse muy rápido (alto dinamismo cinético)
    if (avgVel > 5.2) {
        return "PROGRESIÓN";
    }
    
    // 3. Relación: Si realizó muchos clics (ondas expansivas de choques locales)
    if (totalClicks > 8) {
        return "RELACIÓN";
    }
    
    // 4. Sistema: Si modificó drásticamente la densidad (alta complejidad o extremo vacío)
    if (Math.abs(userDensity - 80) > 35) {
        return "SISTEMA";
    }
    
    // 5. Trayectoria: Recorrido equilibrado
    return "TRAYECTORIA";
}

// --- GENERADOR DE COORDENADAS DE PALABRAS ---
function generateWordPoints(word, w, h) {
    const letters = word.toUpperCase().split('');
    const numLetters = letters.length;
    const letterWidth = 2;
    const letterHeight = 4;
    const spacing = 1.3;
    const totalUnitsWidth = numLetters * letterWidth + (numLetters - 1) * spacing;
    
    let scale = (w * 0.88) / totalUnitsWidth;
    if (letterHeight * scale > h * 0.48) {
        scale = (h * 0.48) / letterHeight;
    }
    
    const wordWidth = totalUnitsWidth * scale;
    const wordHeight = letterHeight * scale;
    const offsetX = (w - wordWidth) / 2;
    const offsetY = (h - wordHeight) / 2;
    
    const pts = [];
    
    letters.forEach((char, idx) => {
        const charCode = (char === 'O' && (word === 'PROGRESIÓN' || word === 'RELACIÓN')) ? 'Ó' : char;
        const segments = letterMap[charCode] || letterMap['O'];
        const charOffsetX = offsetX + idx * (letterWidth + spacing) * scale;
        
        segments.forEach(seg => {
            const x1 = charOffsetX + seg[0] * scale;
            const y1 = offsetY + seg[1] * scale;
            const x2 = charOffsetX + seg[2] * scale;
            const y2 = offsetY + seg[3] * scale;
            
            const dist = Math.hypot(x2 - x1, y2 - y1);
            const step = Math.max(6, scale * 0.22);
            const numSteps = Math.ceil(dist / step);
            
            for (let s = 0; s <= numSteps; s++) {
                const t = s / numSteps;
                pts.push({
                    x: x1 + t * (x2 - x1),
                    y: y1 + t * (y2 - y1),
                    charIndex: idx
                });
            }
        });
    });
    
    return pts;
}

function mapNodesToWord() {
    nodes.forEach(n => {
        n.isMorphed = false;
        n.charIndex = -1;
    });
    
    const limit = Math.min(nodes.length, wordPoints.length);
    for (let i = 0; i < limit; i++) {
        const n = nodes[i];
        n.targetX = wordPoints[i].x;
        n.targetY = wordPoints[i].y;
        n.charIndex = wordPoints[i].charIndex;
        n.isMorphed = true;
    }
}

function ajustarNodos(targetSize) {
    while (nodes.length < targetSize) {
        nodes.push(crearNode(Math.random() * w, Math.random() * h, nodes.length));
    }
    while (nodes.length > targetSize) {
        nodes.pop();
    }
    updateDroneFrecuencia();
    actualizarHUD();
}

function modificarDensidad(amount) {
    userDensity = Math.max(30, Math.min(200, userDensity + amount));
    if (evolutionMode !== 2 && currentStep > 0) {
        ajustarNodos(userDensity);
    }
    actualizarHUD();
}

// --- SECUENCIA DE PASOS INTERACTIVA CON FADE E INSTRUCCIONES ---

function transitionToStep(nextStep) {
    currentStep = nextStep;
    lastInteractionTime = Date.now();
    
    // resetear contadores de paso
    dragTicks = 0;
    stillTicks = 0;
    systemTension = 0;
    
    const hint = document.getElementById('hint-text');
    if (hint) {
        hint.classList.add('fade-out');
        
        setTimeout(() => {
            let txt = "";
            switch (nextStep) {
                case 0:
                    txt = "presiona el nodo central para despertar la unidad";
                    break;
                case 1:
                    txt = "presiona las flechas o +/- para modular la densidad. presiona enter para continuar";
                    break;
                case 2:
                    txt = "arrastra el cursor para conectar los cuadros y tejer el camino. presiona enter para continuar";
                    break;
                case 3:
                    txt = "presiona 1-4 para modular el comportamiento de la red. presiona enter para continuar";
                    break;
                case 4:
                    txt = "arrastra el cursor para tensionar y vibrar la red. presiona enter para continuar";
                    break;
                case 5:
                    txt = "arrastra o gira la rueda (scroll) para polarizar y separar los colores";
                    break;
                case 6:
                    txt = "presiona 3 puntos en el lienzo para implantar anclajes estructurales";
                    break;
                case 7:
                    txt = "presiona y manten la barra espaciadora para revelar tu camino";
                    break;
                case 8:
                    txt = "presiona cualquier parte para reiniciar tu camino";
                    break;
            }
            hint.innerText = txt;
            hint.classList.remove('fade-out');
            actualizarHUD();
        }, 800);
    }
    
    // Mostrar HUD del paso 1 en adelante
    const hud = document.getElementById('hud-container');
    if (hud) {
        if (nextStep > 0) {
            hud.classList.add('visible');
        } else {
            hud.classList.remove('visible');
        }
    }

    // Toggle de visibilidad del botón "Volver al inicio"
    const btnVolver = document.getElementById('btn-volver-landing');
    if (btnVolver) {
        if (nextStep === 8) {
            btnVolver.classList.add('visible');
        } else {
            btnVolver.classList.remove('visible');
        }
    }
}

// --- ACTUALIZACIÓN DE HUD MINIMALISTA ---
function actualizarHUD() {
    const hudBehavior = document.getElementById('hud-behavior');
    const hudEvolution = document.getElementById('hud-evolution');
    const hudDensity = document.getElementById('hud-density');
    
    if (hudBehavior) {
        let text = "";
        let color = "";
        if (activeBehavior === 1) { text = "dispersión"; color = "#00aaff"; }
        else if (activeBehavior === 2) { text = "conexión"; color = "#ff007f"; }
        else if (activeBehavior === 3) { text = "estabilidad"; color = "#e6ff00"; }
        else if (activeBehavior === 4) { text = "fragmentación"; color = "#00aaff"; }
        
        hudBehavior.innerText = text;
        hudBehavior.style.color = color;
        hudBehavior.style.textShadow = `0 0 8px ${color}`;
    }
    
    if (hudEvolution) {
        let text = "";
        if (currentStep === 4) text = "tensionando";
        else if (currentStep === 5) text = "polarizando";
        else if (currentStep === 6) text = "cristalizando";
        else if (currentStep === 7) text = "sintonizando";
        else if (currentStep === 8) text = "reconfiguración";
        else text = "expansión";
        hudEvolution.innerText = text;
    }
    
    if (hudDensity) {
        hudDensity.innerText = currentStep >= 8 ? `${nodes.length} (word)` : userDensity;
    }
}

function handleInitialInteraction() {
    if (interacted) return;
    interacted = true;
    inicializarAudio();
}

// --- GESTIÓN DE EVENTOS DE ENTRADA ---

window.addEventListener('mousemove', (e) => {
    handleInitialInteraction();
    lastInteractionTime = Date.now();
    pmx = mx;
    pmy = my;
    mx = e.clientX;
    my = e.clientY;
    
    const vel = Math.hypot(mx - pmx, my - pmy);
    
    // Acumular velocidad si estamos jugando
    if (currentStep > 0 && currentStep < 7) {
        totalMouseVel += vel;
    }
    
    // Condición Paso 5: Carga de tensión cinética por velocidad (auto-avanza al completar)
    if (currentStep === 5 && vel > 8.0) {
        systemTension += vel * 0.0055;
        if (systemTension >= 1.0) {
            transitionToStep(6);
        }
    }
});

window.addEventListener('mousedown', () => {
    mousePressed = true;
    lastInteractionTime = Date.now();
});

window.addEventListener('mouseup', () => {
    mousePressed = false;
});

window.addEventListener('click', (e) => {
    handleInitialInteraction();
    lastInteractionTime = Date.now();
    
    // Asegurar coordenadas actualizadas del ratón al momento de hacer clic
    mx = e.clientX;
    my = e.clientY;
    
    mouseClicked = true;
    
    // Registrar clic
    if (currentStep > 0 && currentStep < 6) {
        totalClicks++;
    }
    
    // Condición Paso 0: Click en el nodo central
    if (currentStep === 0) {
        const sqX = w / 2;
        const sqY = h / 2;
        if (Math.hypot(mx - sqX, my - sqY) < 65) {
            // Asegurar que el drone permanezca silenciado
            if (droneGain && audioCtx) {
                droneGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.5);
            }
            // Explosión de partículas desde el centro
            nodes.forEach(n => {
                n.x = w / 2;
                n.y = h / 2;
                n.vx = (Math.random() - 0.5) * 16;
                n.vy = (Math.random() - 0.5) * 16;
            });
            playChime(6);
            transitionToStep(1);
        }
    }
    
    else if (currentStep === 6) {
        if (anchors.length < 3) {
            const anchorColor = ORIGINAL_COLORS[anchors.length % ORIGINAL_COLORS.length];
            anchors.push({
                x: mx,
                y: my,
                color: anchorColor
            });
            playChime(anchors.length * 3);
            if (anchors.length === 3) {
                setTimeout(() => {
                    transitionToStep(7);
                }, 400);
            }
        }
    }
    // Condición Paso 8: Reiniciar experiencia (limpieza completa de estados)
    else if (currentStep === 8) {
        evolutionMode = 0;
        activeBehavior = 2; // Reiniciar comportamiento a Conexión
        userDensity = 80;   // Reiniciar densidad base
        anchors = [];
        resonanceCharge = 0;
        polarizationFactor = 0;
        spacePressed = false;
        wordPoints = [];
        selectedWord = "TRAYECTORIA";
        inicializarNodos(userDensity);
        transitionToStep(0);
        playEvolutionChangeChime(0);
    }
});

window.addEventListener('keydown', (e) => {
    if (e.repeat) {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
        }
        return;
    }
    handleInitialInteraction();
    lastInteractionTime = Date.now();
    const key = e.key.toUpperCase();

    // Modificar Comportamiento (Paso 3 en adelante)
    if (currentStep >= 3) {
        if (key === '1' || key === 'A') {
            activeBehavior = 1;
            playModeChangeChime(1);
            actualizarHUD();
        } else if (key === '2' || key === 'S') {
            activeBehavior = 2;
            playModeChangeChime(2);
            actualizarHUD();
        } else if (key === '3' || key === 'D') {
            activeBehavior = 3;
            playModeChangeChime(3);
            actualizarHUD();
        } else if (key === '4' || key === 'F') {
            activeBehavior = 4;
            playModeChangeChime(4);
            actualizarHUD();
        }
    }

    // Modificar Densidad (Paso 1 habilitado)
    if (currentStep === 1) {
        if (e.key === 'ArrowUp' || e.key === '+' || e.key === '=') {
            modificarDensidad(5);
        } else if (e.key === 'ArrowDown' || e.key === '-') {
            modificarDensidad(-5);
        }
    }
    
    // Avanzar de etapa con Enter (Control de flujo manual del usuario)
    if (e.key === 'Enter') {
        e.preventDefault();
        if (currentStep === 1) {
            transitionToStep(2);
        } else if (currentStep === 2) {
            transitionToStep(3);
        } else if (currentStep === 3) {
            transitionToStep(4);
        } else if (currentStep === 4) {
            transitionToStep(5);
        } else if (currentStep === 5) {
            transitionToStep(6);
        } else if (currentStep === 6) {
            transitionToStep(7);
        } else if (currentStep === 7) {
            // Forzar la sintonización final
            spacePressed = false;
            selectedWord = "CONECTANDO";
            playthroughCount++;
            activarPalabraEmergente();
        }
    }

    // Carga de resonancia (Paso 7 habilitado)
    if (e.key === ' ' && currentStep === 7) {
        e.preventDefault();
        spacePressed = true;
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key === ' ') {
        spacePressed = false;
    }
});

// Listener para el Paso 5 (Polarizar) mediante scroll del ratón
window.addEventListener('wheel', (e) => {
    if (currentStep === 5) {
        e.preventDefault();
        polarizationFactor = Math.min(1.0, polarizationFactor + 0.08);
        if (polarizationFactor >= 1.0) {
            transitionToStep(6);
        }
    }
}, { passive: false });

function activarPalabraEmergente() {
    evolutionMode = 2; // reconfiguración
    
    wordPoints = generateWordPoints(selectedWord, w, h);
    ajustarNodos(wordPoints.length);
    mapNodesToWord();
    
    playEvolutionChangeChime(2);
    
    // Apagar el sonido final (droneGain) al aparecer la palabra
    if (droneGain && audioCtx) {
        droneGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.4);
    }
    
    transitionToStep(8);
}

window.addEventListener('resize', () => {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    if (evolutionMode === 2) {
        wordPoints = generateWordPoints(selectedWord, w, h);
        ajustarNodos(wordPoints.length);
        mapNodesToWord();
    }
});

// --- BUCLE DE ACTUALIZACIÓN Y SIMULACIÓN FÍSICA ---
function updatePhysics() {
    const springK = 0.055; // resorte elástico suelto
    let friction = (activeBehavior === 3) ? 0.92 : ((activeBehavior === 1) ? 0.98 : 0.95);
    
    // El paso 6 (Cristalizar) y el paso 7 (Sintonizar) aplican una alta fricción para la estabilización
    if (currentStep === 6) {
        friction = 0.82;
    } else if (currentStep === 7) {
        friction = 0.88;
    }
    
    const repelRadius = 240;
    const mouseVel = Math.hypot(mx - pmx, my - pmy);

    // Contabilizar variables de juego (para clasificación)
    if (currentStep > 0 && currentStep < 6) {
        frameCounter++;
        if (mousePressed) {
            totalDragTicks++;
        }
    }
    
    // Incrementar o resetear contador de inactividad del mouse
    if (mx === pmx && my === pmy) {
        stillTicks++;
    } else {
        stillTicks = 0;
    }

    // Al dejar el cursor quieto en Paso 2, los nodos se vuelven a unir lentamente al centro
    if (currentStep === 2 && stillTicks > 10) {
        nodes.forEach(n => {
            n.vx += (w / 2 - n.x) * 0.002;
            n.vy += (h / 2 - n.y) * 0.002;
        });
    }

    // Tensionar (Paso 4) responde dinámicamente al movimiento del ratón sin decaimiento forzado
    if (currentStep === 4) {
        systemTension = systemTension * 0.9 + (mouseVel * 0.05) * 0.1;
        systemTension = Math.min(1.5, systemTension);
    } else {
        systemTension = Math.max(0, systemTension - 0.05);
    }

    // Condición Paso 5: Polarización de colores por scroll
    if (currentStep === 5) {
        nodes.forEach(n => {
            // Fuerza suave de separación por color
            if (n.color === ORIGINAL_COLORS[0]) { // Cian -> Izquierda
                n.vx += (w * 0.22 - n.x) * 0.04 * polarizationFactor;
                n.vy += (h * 0.5 - n.y) * 0.02 * polarizationFactor;
            } else if (n.color === ORIGINAL_COLORS[1]) { // Magenta -> Derecha
                n.vx += (w * 0.78 - n.x) * 0.04 * polarizationFactor;
                n.vy += (h * 0.5 - n.y) * 0.02 * polarizationFactor;
            } else { // Amarillo -> Centro
                n.vx += (w * 0.5 - n.x) * 0.04 * polarizationFactor;
                n.vy += (h * 0.5 - n.y) * 0.02 * polarizationFactor;
            }
            // Dispersión constante lenta
            n.vx += (Math.random() - 0.5) * 0.35;
            n.vy += (Math.random() - 0.5) * 0.35;
        });
    }

    // Aplicar fuerza de anclajes en Paso 6 y 7
    if ((currentStep === 6 || currentStep === 7) && anchors.length > 0) {
        nodes.forEach(n => {
            let nearestAnchor = null;
            let minDist = 999999;
            anchors.forEach(a => {
                const dist = Math.hypot(n.x - a.x, n.y - a.y);
                if (dist < 220 && dist < minDist) {
                    minDist = dist;
                    nearestAnchor = a;
                }
            });
            
            if (nearestAnchor) {
                const dx = n.x - nearestAnchor.x;
                const dy = n.y - nearestAnchor.y;
                const gridSize = 35;
                const targetX = nearestAnchor.x + Math.round(dx / gridSize) * gridSize;
                const targetY = nearestAnchor.y + Math.round(dy / gridSize) * gridSize;
                
                n.vx += (targetX - n.x) * 0.09;
                n.vy += (targetY - n.y) * 0.09;
                n.color = nearestAnchor.color; // Mudar de color al del anclaje
            }
        });
    }

    // Condición Paso 7: Cargar resonancia al mantener presionada la barra espaciadora
    if (currentStep === 7) {
        if (spacePressed) {
            resonanceCharge = Math.min(1.0, resonanceCharge + 0.0065);
            
            // Jitter cinético de resonancia
            nodes.forEach(n => {
                n.vx += (Math.random() - 0.5) * resonanceCharge * 2.8;
                n.vy += (Math.random() - 0.5) * resonanceCharge * 2.8;
            });
            
            // Modulación de sonido crescendo en el drone (Crescendo final)
            if (audioCtx && droneOsc) {
                const pitchShift = resonanceCharge * 180;
                const baseFreq = 50 + nodes.length * 0.35 + pitchShift;
                droneOsc.frequency.setValueAtTime(baseFreq, audioCtx.currentTime);
                if (droneGain) {
                    droneGain.gain.setValueAtTime(resonanceCharge * 0.08, audioCtx.currentTime);
                }
                if (droneFilter) {
                    droneFilter.frequency.setValueAtTime(140 + resonanceCharge * 400, audioCtx.currentTime);
                }
            }
            
            if (resonanceCharge >= 1.0) {
                spacePressed = false;
                selectedWord = "CONECTANDO"; // Siempre dice CONECTANDO
                playthroughCount++;
                activarPalabraEmergente();
            }
        } else {
            resonanceCharge = Math.max(0.0, resonanceCharge - 0.01);
            // Restaurar sonido normal (No silenciar el drone aquí, se apaga al aparecer la palabra)
            if (audioCtx) {
                const baseFreq = 50 + nodes.length * 0.35;
                if (droneOsc) droneOsc.frequency.setTargetAtTime(baseFreq, audioCtx.currentTime, 0.5);
                if (droneFilter) droneFilter.frequency.setTargetAtTime(140, audioCtx.currentTime, 0.5);
            }
        }
    }

    // Blast de clic
    if (mouseClicked && currentStep !== 8 && currentStep !== 0) {
        playChime(4);
        nodes.forEach(n => {
            const dx = n.x - mx;
            const dy = n.y - my;
            const dist = Math.hypot(dx, dy);
            if (dist < 260 && dist > 1) {
                const force = (260 - dist) / 260;
                n.vx += (dx / dist) * force * 15;
                n.vy += (dy / dist) * force * 15;
            }
        });
        mouseClicked = false;
    }

    // Fuerza de arrastre (Gravedad del mouse) - Se activa con mousePressed, o en Paso 2 o 3 / comportamiento 2 por hover
    if (mousePressed || currentStep === 2 || currentStep === 3 || activeBehavior === 2) {
        const pullRadius = (currentStep === 2) ? 550 : 400;
        nodes.forEach(n => {
            if (currentStep === 0) return;
            const dx = mx - n.x;
            const dy = my - n.y;
            const dist = Math.hypot(dx, dy);
            if (dist < pullRadius && dist > 1) {
                const force = (pullRadius - dist) / pullRadius;
                let mult = mousePressed ? 0.75 : 0.45;
                if (currentStep === 2) {
                    mult = 0.95; // Fuerza de arrastre más fuerte por hover en paso 2
                }
                n.vx += (dx / dist) * force * mult;
                n.vy += (dy / dist) * force * mult;
            }
        });
    }

    // Interacción recíproca entre Nodos
    for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
            const n2 = nodes[j];

            if (evolutionMode === 2 && n1.isMorphed && n2.isMorphed) continue;

            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const dist = Math.hypot(dx, dy);

            // Dispersión instantánea lenta en Paso 5
            if (currentStep === 5 && dist < 150) {
                const force = (150 - dist) / 150;
                n1.vx -= (dx / dist) * force * 0.08;
                n1.vy -= (dy / dist) * force * 0.08;
                n2.vx += (dx / dist) * force * 0.08;
                n2.vy += (dy / dist) * force * 0.08;
            }

            if (activeBehavior === 1 && dist < 85) {
                const force = (85 - dist) / 85;
                n1.vx -= (dx / dist) * force * 0.18;
                n1.vy -= (dy / dist) * force * 0.18;
                n2.vx += (dx / dist) * force * 0.18;
                n2.vy += (dy / dist) * force * 0.18;
            } 
            else if (activeBehavior === 2 && dist < 180 && dist > 15) {
                const force = (180 - dist) / 180;
                const pullStrength = (currentStep === 2) ? 0.095 : 0.055;
                n1.vx += (dx / dist) * force * pullStrength;
                n1.vy += (dy / dist) * force * pullStrength;
                n2.vx -= (dx / dist) * force * pullStrength;
                n2.vy -= (dy / dist) * force * pullStrength;
            }
            else if (activeBehavior === 4) {
                if (dist < 60) {
                    const force = (60 - dist) / 60;
                    n1.vx -= (dx / dist) * force * 0.35;
                    n1.vy -= (dy / dist) * force * 0.35;
                    n2.vx += (dx / dist) * force * 0.35;
                    n2.vy += (dy / dist) * force * 0.35;
                } else if (dist < 110) {
                    const force = (110 - dist) / 50;
                    n1.vx += (dx / dist) * force * 0.095;
                    n1.vy += (dy / dist) * force * 0.095;
                    n2.vx -= (dx / dist) * force * 0.095;
                    n2.vy -= (dy / dist) * force * 0.095;
                }
            }
        }
    }

    // Actualizar coordenadas individuales
    nodes.forEach(n => {
        let ax = 0;
        let ay = 0;

        if (evolutionMode === 2 && n.isMorphed) {
            // Fuerza elástica de retorno hacia su posición en la palabra (más rápido y con menor rebote)
            const wordSpringK = 0.16;
            ax += (n.targetX - n.x) * wordSpringK;
            ay += (n.targetY - n.y) * wordSpringK;

            // Integrar movimiento orbital amortiguado para Estabilidad
            if (activeBehavior === 3) {
                const cx = w / 2;
                const cy = h / 2;
                ax += (cx - n.x) * 0.00005;
                ay += (cy - n.y) * 0.00005;
                ax += -(cy - n.y) * 0.00008;
                ay += (cx - n.x) * 0.00008;
            } else if (activeBehavior === 1) {
                // Jitter caótico sutil en dispersión
                ax += (Math.random() - 0.5) * 0.05;
                ay += (Math.random() - 0.5) * 0.05;
            }

            // Swirl vectorial en Paso 2 o 3 o Reorganización
            if (evolutionMode === 1 || currentStep === 2 || currentStep === 3) {
                ax += Math.sin(n.y * 0.005 + time) * 0.06;
                ay += Math.cos(n.x * 0.005 + time) * 0.06;
            }

            n.vx = (n.vx + ax) * 0.76;
            n.vy = (n.vy + ay) * 0.76;
        } else {
            // Físicas del Entorno Libre
            if (activeBehavior === 3) {
                const cx = w / 2;
                const cy = h / 2;
                const rx = cx - n.x;
                const ry = cy - n.y;

                ax += rx * 0.00015;
                ay += ry * 0.00015;
                ax += -ry * 0.00025;
                ay += rx * 0.00025;
            }

            if (evolutionMode === 1 || currentStep === 2 || currentStep === 3) {
                ax += Math.sin(n.y * 0.005 + time) * 0.12;
                ay += Math.cos(n.x * 0.005 + time) * 0.12;
            }

            // Inyectar jitter cinético en Paso 4 (Tensionar) según velocidad del mouse
            if (currentStep === 4 && mouseVel > 5) {
                ax += (Math.random() - 0.5) * mouseVel * 0.35;
                ay += (Math.random() - 0.5) * mouseVel * 0.35;
            }

            n.vx = (n.vx + ax) * friction;
            n.vy = (n.vy + ay) * friction;
        }

        // Si estamos en paso 0, congelar forzosamente los nodos al centro
        if (currentStep === 0) {
            n.x = w / 2;
            n.y = h / 2;
            n.vx = 0;
            n.vy = 0;
        } else {
            n.x += n.vx;
            n.y += n.vy;

            // Bote suave en bordes de pantalla
            const margin = 15;
            if (n.x < margin) { n.x = margin; n.vx *= -0.7; }
            else if (n.x > w - margin) { n.x = w - margin; n.vx *= -0.7; }
            if (n.y < margin) { n.y = margin; n.vy *= -0.7; }
            else if (n.y > h - margin) { n.y = h - margin; n.vy *= -0.7; }
        }
    });
}

// --- RENDERIZADO VISUAL ---

function draw() {
    ctx.fillStyle = '#030303';
    ctx.fillRect(0, 0, w, h);

    // DIBUJAR PASO 0: NODO CENTRAL PULSANTE
    if (currentStep === 0) {
        const sqX = w / 2;
        const sqY = h / 2;
        const pulse = 1.0 + 0.07 * Math.sin(time * 2.5);
        const size = 55 * pulse;
        
        ctx.save();
        ctx.strokeStyle = '#00aaff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(sqX - size / 2, sqY - size / 2, size, size);
        
        ctx.shadowColor = '#00aaff';
        ctx.shadowBlur = 12;
        ctx.strokeRect(sqX - size / 2, sqY - size / 2, size, size);
        ctx.restore();
        return; // Detener renderizado del sistema para el paso 0
    }

    // 1. DIBUJAR CONEXIONES DINÁMICAS (LÍNEAS)
    const threshold = (currentStep === 2) ? 190 : 130;
    for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
            const n2 = nodes[j];
            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const dist = Math.hypot(dx, dy);

            if (dist < threshold) {
                const alpha = 1 - dist / threshold;
                let strokeColor = '';

                // Dibujado de líneas de las letras: suaves, finas e integradas (más visibles)
                if (evolutionMode === 2 && n1.isMorphed && n2.isMorphed && 
                    Math.abs(n1.id - n2.id) === 1 && n1.charIndex === n2.charIndex) {
                    strokeColor = `rgba(255, 255, 255, ${alpha * 0.75})`;
                    ctx.lineWidth = 1.35;
                } else {
                    ctx.lineWidth = 0.45;
                    
                    // Modulación de brillo en Paso 4 según la tensión cargada
                    const tensionFactor = (currentStep === 4) ? (1 + systemTension * 1.5) : 1;
                    
                    // Tonalidad neón según comportamiento activo
                    if (activeBehavior === 1) {
                        strokeColor = `rgba(0, 170, 255, ${alpha * 0.16 * tensionFactor})`; // Cian
                    } else if (activeBehavior === 2) {
                        strokeColor = `rgba(255, 0, 127, ${alpha * 0.20 * tensionFactor})`; // Magenta
                    } else if (activeBehavior === 3) {
                        strokeColor = `rgba(230, 255, 0, ${alpha * 0.18 * tensionFactor})`; // Amarillo
                    } else if (activeBehavior === 4) {
                        strokeColor = `rgba(0, 170, 255, ${alpha * 0.15 * tensionFactor})`; // Cian
                    }
                }

                ctx.strokeStyle = strokeColor;
                ctx.beginPath();
                ctx.moveTo(n1.x, n1.y);
                ctx.lineTo(n2.x, n2.y);
                ctx.stroke();
            }
        }
    }

    // 2. DIBUJAR NODOS (CUADRADOS DIGITALES ORIGINALES)
    nodes.forEach(n => {
        ctx.save();
        if (evolutionMode === 2 && n.isMorphed) {
            ctx.globalAlpha = 0.82; // Suavizar opacidad para superposición agradable
            ctx.fillStyle = n.color;
            let size = n.radius * 2.8; // Aumentado para que sean un poco más grandes
            ctx.fillRect(n.x - size, n.y - size, size * 2, size * 2);
        } else {
            ctx.globalAlpha = n.alpha * 0.75; // Mantener transparencia para superposición
            ctx.fillStyle = n.color;
            let size = n.radius * 1.95; // Aumentado para que sean un poco más grandes
            ctx.fillRect(n.x - size, n.y - size, size * 2, size * 2);
        }
        ctx.restore();
    });

    // 3. DIBUJAR ANCLAJES (PASO 6 Y 7)
    if ((currentStep === 6 || currentStep === 7) && anchors.length > 0) {
        anchors.forEach(a => {
            ctx.save();
            ctx.strokeStyle = a.color;
            ctx.lineWidth = 2;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            
            const size = 16;
            ctx.fillRect(a.x - size / 2, a.y - size / 2, size, size);
            ctx.strokeRect(a.x - size / 2, a.y - size / 2, size, size);
            
            // Faint outer boundary
            ctx.strokeStyle = a.color;
            ctx.globalAlpha = 0.12;
            ctx.beginPath();
            ctx.arc(a.x, a.y, 220, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        });
    }

    // 4. INTERFAZ DE CARGA DE RESONANCIA (PASO 7)
    if (currentStep === 7 && resonanceCharge > 0) {
        ctx.save();
        const barW = w * 0.4;
        const barH = 6;
        const bx = (w - barW) / 2;
        const by = h * 0.8;
        
        // Track
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.fillRect(bx, by, barW, barH);
        
        // Fill (Yellow)
        ctx.fillStyle = '#e6ff00';
        ctx.shadowColor = '#e6ff00';
        ctx.shadowBlur = 10;
        ctx.fillRect(bx, by, barW * resonanceCharge, barH);
        
        // Text
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`REVELANDO: ${Math.round(resonanceCharge * 100)}%`, w / 2, by - 12);
        
        // Expanding halo
        ctx.strokeStyle = '#e6ff00';
        ctx.lineWidth = 1;
        ctx.shadowBlur = 15;
        ctx.globalAlpha = resonanceCharge * 0.25;
        const sqSize = w * 0.5 * resonanceCharge;
        ctx.strokeRect((w - sqSize)/2, (h - sqSize)/2, sqSize, sqSize);
        ctx.restore();
    }
}

// --- BUCLE OPERATIVO PRINCIPAL ---
function loop() {
    time += 0.035;



    updatePhysics();
    draw();
    requestAnimationFrame(loop);
}

// Inicialización de arranque
inicializarNodos(userDensity);
requestAnimationFrame(loop);
