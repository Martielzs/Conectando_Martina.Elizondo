document.addEventListener("DOMContentLoaded", function () {
           
    /* --- 0. PRECARGADOR MINIMALISTA (Estilo Arcturis) --- */
    const preloader = document.getElementById('preloader');
    const body = document.body;
    
    if (preloader) {
        body.classList.add('loading');
        
        // Simular tiempo de carga minimalista de 1.2s
        setTimeout(() => {
            preloader.classList.add('fade-out');
            body.classList.remove('loading');
        }, 1200);
    }

    /* --- 1. CURSOR DE SISTEMA RESTAURADO --- */
    // El cursor del sistema normal ha sido restaurado y se maneja por defecto.

    /* --- 2. REVELACIÓN AL HACER SCROLL (Aparece una sola vez y se queda) --- */
    const reveals = document.querySelectorAll(".reveal");
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                observer.unobserve(entry.target);
            }
        });
    }, { root: null, rootMargin: "-5% 0px -5% 0px", threshold: 0.15 });

    reveals.forEach(reveal => revealObserver.observe(reveal));

    /* --- 2. MOSTRAR FRANJA DE NAVEGACIÓN --- */
    const sections = document.querySelectorAll(".scroll-section");
    const navLinks = document.querySelectorAll(".nav-link");
    const franjaNav = document.getElementById("main-nav");
    const heroSlide = document.getElementById("slide-hero");

    const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                franjaNav.classList.remove("is-visible");
            } else {
                franjaNav.classList.add("is-visible");
            }
        });
    }, { root: null, rootMargin: "-10% 0px -90% 0px", threshold: 0 });
   
    heroObserver.observe(heroSlide);

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => link.classList.remove("active-nav"));
                const activeId = entry.target.id;
                const activeLink = document.querySelector(`.nav-link[href="#${activeId}"]`);
                if (activeLink) activeLink.classList.add("active-nav");
            }
        });
    }, { root: null, rootMargin: "-30% 0px -70% 0px", threshold: 0 });

    sections.forEach(sec => navObserver.observe(sec));

    /* --- 3. CONTROL DE LA GALERÍA DESLIZANTE --- */
    const track = document.getElementById('galeria-track');
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    if (track && btnPrev && btnNext) {
        let index = 0;
        const getVisibleItems = () => {
            if (window.innerWidth <= 600) return 1;
            if (window.innerWidth <= 1024) return 2;
            return 3;
        };
        const updateSlider = () => {
            const items = track.children.length;
            if (items === 0) return;
            const visible = getVisibleItems();
            const maxIndex = Math.max(0, items - visible);
            index = Math.min(index, maxIndex);
            const itemWidth = track.children[0].getBoundingClientRect().width;
            const gap = 24; // Espaciado gap en style.css (.galeria-track { gap: 24px })
            const offset = index * (itemWidth + gap);
            track.style.transform = `translateX(-${offset}px)`;
        };
        btnNext.addEventListener('click', () => {
            const items = track.children.length;
            const visible = getVisibleItems();
            if (index < items - visible) {
                index++;
                updateSlider();
            }
        });
        btnPrev.addEventListener('click', () => {
            if (index > 0) {
                index--;
                updateSlider();
            }
        });
        window.addEventListener('resize', updateSlider);
        setTimeout(updateSlider, 300);
    }

});

/* ==========================================================
   INTERACTIVIDAD DE LA EXPOSICIÓN DEL SISTEMA
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {
    // Inicializar todos los módulos visuales interactivos
    initConceptosCanvas();
    initCierreCanvas();
    initScrollFlashTitles();
    initFondoCuadradosScroll();
    initShowroom();
    initGaleriaTilt();
    initGaleriaLightbox();
    initHeroCanvas();
});





/* --- MÓDULO 4: CONCEPTOS SEMANTIC CANVAS --- */
function initConceptosCanvas() {
    const canvas = document.getElementById("conceptos-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    let w = canvas.width = canvas.offsetWidth;
    let h = canvas.height = canvas.offsetHeight;
    
    let mx = -1000, my = -1000;
    
    window.addEventListener("resize", () => {
        if (!canvas) return;
        w = canvas.width = canvas.offsetWidth;
        h = canvas.height = canvas.offsetHeight;
    });
    
    canvas.addEventListener("mousemove", (e) => {
        const rect = canvas.getBoundingClientRect();
        mx = e.clientX - rect.left;
        my = e.clientY - rect.top;
    });
    
    let concepts = [
        { label: "Conexión", x: 0.15, y: 0.3, links: [1, 3] },
        { label: "Relación", x: 0.38, y: 0.25, links: [0, 2, 3] },
        { label: "Transformación", x: 0.62, y: 0.2, links: [1, 6] },
        { label: "Trayectoria", x: 0.26, y: 0.65, links: [0, 1, 4, 5] },
        { label: "Exploración", x: 0.48, y: 0.72, links: [3, 7] },
        { label: "Progresión", x: 0.72, y: 0.58, links: [3, 6] },
        { label: "Descubrimiento", x: 0.82, y: 0.32, links: [2, 5, 7] },
        { label: "Incertidumbre", x: 0.85, y: 0.75, links: [4, 6] }
    ];
    
    // Asignar posiciones de píxeles
    function updatePos() {
        concepts.forEach(c => {
            c.px = c.x * w;
            c.py = c.y * h;
            c.vx = (Math.random() - 0.5) * 0.15;
            c.vy = (Math.random() - 0.5) * 0.15;
            c.hover = false;
        });
    }
    updatePos();
    window.addEventListener("resize", updatePos);
    
    let hoveredIdx = -1;
    
    function loop() {
        ctx.fillStyle = "#050505";
        ctx.fillRect(0, 0, w, h);
        
        ctx.font = "bold 13px 'Geist Mono', monospace";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        
        // Actualizar posiciones (flotamiento leve)
        concepts.forEach((c, idx) => {
            c.px += c.vx;
            c.py += c.vy;
            
            // Límites de flote
            let originalX = c.x * w;
            let originalY = c.y * h;
            if (Math.hypot(c.px - originalX, c.py - originalY) > 18) {
                c.vx *= -1;
                c.vy *= -1;
            }
            
            // Medir dimensiones del texto para hover
            let width = ctx.measureText(c.label).width + 20;
            let height = 30;
            
            // Validar si cursor está sobre palabra
            if (mx > c.px - width/2 && mx < c.px + width/2 && my > c.py - height/2 && my < c.py + height/2) {
                c.hover = true;
                hoveredIdx = idx;
            } else {
                c.hover = false;
            }
        });
        
        // Resetear hover si no hay ninguno activo
        let anyHover = concepts.some(c => c.hover);
        if (!anyHover) hoveredIdx = -1;
        
        // Dibujar filamentos de conexión
        concepts.forEach((c, i) => {
            c.links.forEach(linkIdx => {
                let target = concepts[linkIdx];
                let isHighlighted = false;
                
                if (hoveredIdx !== -1) {
                    // Iluminar si pertenece a la palabra hoverada
                    if (hoveredIdx === i || hoveredIdx === linkIdx) {
                        isHighlighted = true;
                    }
                }
                
                ctx.beginPath();
                ctx.moveTo(c.px, c.py);
                ctx.lineTo(target.px, target.py);
                
                if (hoveredIdx === -1) {
                    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
                    ctx.lineWidth = 1;
                    ctx.stroke();
                } else if (isHighlighted) {
                    ctx.strokeStyle = "rgba(255, 0, 127, 0.5)";
                    ctx.shadowBlur = 4;
                    ctx.shadowColor = "#ff007f";
                    ctx.lineWidth = 1.8;
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                } else {
                    ctx.strokeStyle = "rgba(255, 255, 255, 0.01)";
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            });
        });
        
        // Dibujar palabras clave
        concepts.forEach((c, idx) => {
            let opacity = 0.7;
            let fillStyle = "#ffffff";
            let shadowColor = "";
            let shadowBlur = 0;
            
            if (hoveredIdx !== -1) {
                if (c.hover) {
                    fillStyle = "#ff007f";
                    opacity = 1.0;
                    shadowBlur = 10;
                    shadowColor = "#ff007f";
                } else if (concepts[hoveredIdx].links.includes(idx)) {
                    fillStyle = "#00aaff";
                    opacity = 0.95;
                    shadowBlur = 8;
                    shadowColor = "#00aaff";
                } else {
                    opacity = 0.15;
                }
            } else {
                if (idx % 3 === 0) fillStyle = "#00aaff";
                else if (idx % 3 === 1) fillStyle = "#ff007f";
                else fillStyle = "#e6ff00";
            }
            
            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.fillStyle = fillStyle;
            if (shadowBlur > 0) {
                ctx.shadowColor = shadowColor;
                ctx.shadowBlur = shadowBlur;
            }
            
            // Dibujar fondo de palabra en hover
            if (c.hover || (hoveredIdx !== -1 && concepts[hoveredIdx].links.includes(idx))) {
                ctx.strokeStyle = fillStyle;
                ctx.lineWidth = 0.8;
                let textW = ctx.measureText(c.label).width + 16;
                ctx.strokeRect(c.px - textW/2, c.py - 12, textW, 24);
            }
            
            ctx.fillText(c.label.toUpperCase(), c.px, c.py);
            ctx.restore();
        });
        
        requestAnimationFrame(loop);
    }
    loop();
}



/* --- MÓDULO 6: CIERRE VORTEX CANVAS --- */
function initCierreCanvas() {
    const canvas = document.getElementById("cierre-canvas");
    const button = document.getElementById("btn-ingresar-exploracion");
    if (!canvas || !button) return;
    const ctx = canvas.getContext("2d");
    
    let w = canvas.width = canvas.offsetWidth;
    let h = canvas.height = canvas.offsetHeight;
    
    let particles = [];
    let isHovered = false;
    
    window.addEventListener("resize", () => {
        if (!canvas) return;
        w = canvas.width = canvas.offsetWidth;
        h = canvas.height = canvas.offsetHeight;
    });
    
    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.color = ["#00aaff", "#ff007f", "#e6ff00"][Math.floor(Math.random() * 3)];
            this.radius = Math.random() * 2 + 1;
            this.angle = Math.random() * Math.PI * 2;
            this.speed = Math.random() * 0.02 + 0.005;
        }
        update(bx, by) {
            if (isHovered) {
                // Aceleración y espiral hacia el centro del botón
                let dx = bx - this.x;
                let dy = by - this.y;
                let dist = Math.hypot(dx, dy);
                
                if (dist < 10) {
                    this.reset();
                } else {
                    // Rotación espiral
                    this.angle += this.speed * 2.5;
                    let targetX = bx + Math.cos(this.angle) * (dist * 0.96);
                    let targetY = by + Math.sin(this.angle) * (dist * 0.96);
                    
                    this.x += (targetX - this.x) * 0.12;
                    this.y += (targetY - this.y) * 0.12;
                }
            } else {
                // Deriva aleatoria suave
                this.x += this.vx;
                this.y += this.vy;
                
                if (this.x < 0 || this.x > w) this.vx *= -1;
                if (this.y < 0 || this.y > h) this.vy *= -1;
            }
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }
    
    for (let i = 0; i < 50; i++) {
        particles.push(new Particle());
    }
    
    button.addEventListener("mouseenter", () => {
        isHovered = true;
    });
    
    button.addEventListener("mouseleave", () => {
        isHovered = false;
    });
    
    function loop() {
        ctx.clearRect(0, 0, w, h);
        
        // Obtener coordenadas del centro del botón relativas al canvas
        const btnRect = button.getBoundingClientRect();
        const canvRect = canvas.getBoundingClientRect();
        let bx = btnRect.left - canvRect.left + btnRect.width / 2;
        let by = btnRect.top - canvRect.top + btnRect.height / 2;
        
        particles.forEach(p => {
            p.update(bx, by);
            p.draw();
        });
        
        requestAnimationFrame(loop);
    }
    loop();
}

/* --- MÓDULO 7: SCROLL FLASH TITLES --- */
function initScrollFlashTitles() {
    const titulosSecciones = document.querySelectorAll('.section-title');
    let titulosIluminados = new Set();
    
    window.addEventListener('scroll', () => {
        titulosSecciones.forEach(titulo => {
            let limites = titulo.getBoundingClientRect();
            
            // Latigazo de destello al cruzar el centro óptico vertical
            if (limites.top > window.innerHeight * 0.3 && limites.top < window.innerHeight * 0.58) {
                if (!titulosIluminados.has(titulo)) {
                    titulo.classList.add('iluminacion-flash');
                    titulosIluminados.add(titulo);
                    setTimeout(() => {
                        titulo.classList.remove('iluminacion-flash');
                    }, 180); 
                }
            } else {
                if (limites.top < 0 || limites.top > window.innerHeight) {
                    titulosIluminados.delete(titulo);
                }
            }
        });
    });
}

/* --- MÓDULO 8: FONDO DE CUADRADITOS CON SCROLL (PARALAJE) --- */
function initFondoCuadradosScroll() {
    const container = document.getElementById("fondo-cuadrados-scroll");
    if (!container) return;
    
    const numSquares = 40;
    const squaresData = [];
    const colors = ["#00aaff", "#ff007f", "#e6ff00"];
    
    // Calcular el alto total de la página de forma dinámica
    const docHeight = Math.max(
        document.body.scrollHeight, 
        document.documentElement.scrollHeight,
        document.body.offsetHeight, 
        document.documentElement.offsetHeight,
        document.body.clientHeight, 
        document.documentElement.clientHeight
    ) || 6000;
    
    for (let i = 0; i < numSquares; i++) {
        const sq = document.createElement("div");
        sq.className = "cuadradito-petit";
        
        // Atributos aleatorios
        const size = Math.random() * 5 + 3; // de 3px a 8px
        const left = Math.random() * 100; // 0% a 100% de ancho
        // Distribuir a lo largo de toda la página en píxeles
        const topPx = Math.random() * docHeight; 
        const factor = Math.random() * 0.35 + 0.15; // factor de paralaje entre 0.15 y 0.50
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        sq.style.width = `${size}px`;
        sq.style.height = `${size}px`;
        sq.style.left = `${left}%`;
        sq.style.top = `${topPx}px`;
        sq.style.backgroundColor = color;
        
        container.appendChild(sq);
        
        squaresData.push({
            element: sq,
            factor: factor
        });
    }
    
    // Aplicar traducción en scroll
    window.addEventListener("scroll", () => {
        const scrolled = window.scrollY;
        squaresData.forEach(data => {
            data.element.style.transform = `translate3d(0, ${scrolled * (1 - data.factor)}px, 0)`;
        });
    });
}

/* --- MÓDULO 9: VISOR DE COMPONENTES DEL JUEGO (SHOWROOM) --- */
function initShowroom() {
    const data = {
        caminos: [
            {
                id: 'pieza-t',
                name: 'Pieza T',
                meta: '20 unidades (10 por pareja)',
                desc: 'Intersección triple (T). Diseñada para ramificar caminos en múltiples direcciones, aumentando las posibilidades de esquivar bloqueos y conectar salidas.',
                html: `<svg viewBox="0 0 120 120" width="120" height="120" style="filter: drop-shadow(0 0 8px rgba(0,170,255,0.45))">
                    <path d="M 20 20 H 100 V 50 H 75 V 100 H 45 V 50 H 20 Z" fill="none" stroke="var(--cyan)" stroke-width="3.5" stroke-linejoin="round"/>
                </svg>`
            },
            {
                id: 'pieza-l-g',
                name: 'Pieza L Grande',
                meta: '24 unidades (12 por pareja)',
                desc: 'Curva de radio amplio. Permite desviar la dirección de la trayectoria de manera suave para rodear obstáculos u otros caminos.',
                html: `<svg viewBox="0 0 120 120" width="120" height="120" style="filter: drop-shadow(0 0 8px rgba(255,0,127,0.45))">
                    <path d="M 15 15 H 45 V 75 H 105 V 105 H 15 Z" fill="none" stroke="var(--magenta)" stroke-width="3.5" stroke-linejoin="round"/>
                </svg>`
            },
            {
                id: 'pieza-l-c',
                name: 'Pieza L Chica',
                meta: '40 unidades (20 por pareja)',
                desc: 'Curva cerrada y compacta. Ideal para realizar giros rápidos en espacios reducidos y optimizar las trayectorias cortas.',
                html: `<svg viewBox="0 0 120 120" width="120" height="120" style="filter: drop-shadow(0 0 8px rgba(230,255,0,0.45))">
                    <path d="M 30 30 H 60 V 60 H 90 V 90 H 30 Z" fill="none" stroke="var(--yellow)" stroke-width="3.5" stroke-linejoin="round"/>
                </svg>`
            },
            {
                id: 'pieza-recta-g',
                name: 'Pieza Recta Grande',
                meta: '24 unidades (12 por pareja)',
                desc: 'Conexión lineal larga. Permite avanzar distancias considerables de forma recta a lo largo del tablero con eficiencia.',
                html: `<svg viewBox="0 0 120 120" width="120" height="120" style="filter: drop-shadow(0 0 8px rgba(0,170,255,0.45))">
                    <rect x="10" y="45" width="100" height="30" fill="none" stroke="var(--cyan)" stroke-width="3.5" rx="2"/>
                </svg>`
            },
            {
                id: 'pieza-recta-c',
                name: 'Pieza Recta Chica',
                meta: '40 unidades (20 por pareja)',
                desc: 'Conexión lineal corta. Esencial para conectar tramos adyacentes estrechos y realizar ajustes de precisión.',
                html: `<svg viewBox="0 0 120 120" width="120" height="120" style="filter: drop-shadow(0 0 8px rgba(230,255,0,0.45))">
                    <rect x="30" y="45" width="60" height="30" fill="none" stroke="var(--yellow)" stroke-width="3.5" rx="2"/>
                </svg>`
            },
            {
                id: 'esquinas',
                name: 'Cuadrados de Esquina',
                meta: '4 unidades (3 rojas, 1 verde)',
                desc: 'Se ubican boca abajo en cada esquina al iniciar. Tres de ellos son salidas falsas (rojos) y uno es la salida real (verde), la cual debes conectar para ganar la partida.',
                html: `<svg viewBox="0 0 120 120" width="120" height="120">
                    <rect x="30" y="30" width="60" height="60" fill="none" stroke="#ffffff" stroke-width="2" rx="4"/>
                    <rect x="35" y="35" width="22" height="22" fill="#ff007f" rx="2" opacity="0.8"/>
                    <rect x="63" y="35" width="22" height="22" fill="#ff007f" rx="2" opacity="0.8"/>
                    <rect x="35" y="63" width="22" height="22" fill="#ff007f" rx="2" opacity="0.8"/>
                    <rect x="63" y="63" width="22" height="22" fill="#00ff66" rx="2" filter="drop-shadow(0 0 6px #00ff66)"/>
                </svg>`
            }
        ],
        comodines: [
            {
                id: 'comodin-bloquear',
                name: 'Comodín: Bloquear Tramo',
                meta: '8 en total (4 por jugador)',
                desc: 'Coloca una X sobre un tramo del camino rival. Si tu oponente no cuenta con una ruta alternativa construida, pierde su siguiente jugada.',
                html: `<div class="token-3d-container">
                    <div class="token-3d" style="--token-color: var(--magenta); --token-color-rgb: 255,0,127;">
                        <svg viewBox="0 0 100 100" width="60" height="60" class="token-icon">
                            <line x1="30" y1="30" x2="70" y2="70" stroke="#fff" stroke-width="8" stroke-linecap="round"/>
                            <line x1="70" y1="30" x2="30" y2="70" stroke="#fff" stroke-width="8" stroke-linecap="round"/>
                        </svg>
                    </div>
                </div>`
            },
            {
                id: 'comodin-proteger',
                name: 'Comodín: Proteger Tramo',
                meta: '8 en total (4 por jugador)',
                desc: 'Coloca un escudo sobre una de tus piezas. Queda protegida: nadie puede moverla, girarla ni modificarla por el resto de la partida.',
                html: `<div class="token-3d-container">
                    <div class="token-3d" style="--token-color: var(--cyan); --token-color-rgb: 0,170,255;">
                        <svg viewBox="0 0 100 100" width="60" height="60" class="token-icon">
                            <path d="M30 25 C45 25 50 20 50 20 C50 20 55 25 70 25 V50 C70 65 50 80 50 80 C50 80 30 65 30 50 Z" fill="none" stroke="#fff" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>
                        </svg>
                    </div>
                </div>`
            },
            {
                id: 'comodin-girar',
                name: 'Comodín: Girar Tramo',
                meta: '8 en total (4 por jugador)',
                desc: 'Te permite rotar una pieza de camino ya colocada en el tablero (tuya o de tu oponente) para reorientar las trayectorias.',
                html: `<div class="token-3d-container">
                    <div class="token-3d" style="--token-color: var(--yellow); --token-color-rgb: 230,255,0;">
                        <svg viewBox="0 0 100 100" width="60" height="60" class="token-icon">
                            <path d="M30 50 A20 20 0 1 1 70 50" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/>
                            <path d="M30 38 L30 50 L42 50" fill="none" stroke="#fff" stroke-width="6" stroke-linejoin="round"/>
                            <path d="M70 62 L70 50 L58 50" fill="none" stroke="#fff" stroke-width="6" stroke-linejoin="round"/>
                        </svg>
                    </div>
                </div>`
            },
            {
                id: 'comodin-congelar',
                name: 'Comodín: Congelar Turno',
                meta: '8 en total (4 por jugador)',
                desc: 'El oponente que recibe este comodín queda congelado, perdiendo su próximo turno de colocación de piezas.',
                html: `<div class="token-3d-container">
                    <div class="token-3d" style="--token-color: var(--cyan); --token-color-rgb: 0,170,255;">
                        <svg viewBox="0 0 100 100" width="60" height="60" class="token-icon">
                            <line x1="50" y1="20" x2="50" y2="80" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
                            <line x1="20" y1="50" x2="80" y2="50" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
                            <line x1="28" y1="28" x2="72" y2="72" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
                            <line x1="72" y1="28" x2="28" y2="72" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
                            <circle cx="50" cy="50" r="8" fill="#fff"/>
                        </svg>
                    </div>
                </div>`
            }
        ],
        cartas: [
            {
                id: 'card-recta-c',
                type: 'ficha',
                name: 'Carta Ficha: Recta Chica',
                meta: 'Cartas Ficha',
                desc: 'Carta de camino. Instruye la colocación de una pieza recta corta (PEQUEÑA) de tu reserva en el tablero.',
                color: 'var(--yellow)',
                label: 'PEQUEÑA',
                pieceOutline: `<rect x="45" y="92" width="60" height="30" fill="none" stroke="var(--yellow)" stroke-width="4.5" rx="2"/>`
            },
            {
                id: 'card-recta-g',
                type: 'ficha',
                name: 'Carta Ficha: Recta Grande',
                meta: 'Cartas Ficha',
                desc: 'Carta de camino. Instruye la colocación de una pieza recta larga (GRANDE) de tu reserva en el tablero.',
                color: 'var(--yellow)',
                label: 'GRANDE',
                pieceOutline: `<rect x="25" y="92" width="100" height="30" fill="none" stroke="var(--yellow)" stroke-width="4.5" rx="2"/>`
            },
            {
                id: 'card-l-c',
                type: 'ficha',
                name: 'Carta Ficha: L Chica',
                meta: 'Cartas Ficha',
                desc: 'Carta de camino. Instruye la colocación de una pieza en L corta (L CHICA) de tu reserva en el tablero.',
                color: 'var(--yellow)',
                label: 'L CHICA',
                pieceOutline: `<path d="M 45 77 H 75 V 107 H 105 V 137 H 45 Z" fill="none" stroke="var(--yellow)" stroke-width="4.5" stroke-linejoin="round"/>`
            },
            {
                id: 'card-l-g',
                type: 'ficha',
                name: 'Carta Ficha: L Grande',
                meta: 'Cartas Ficha',
                desc: 'Carta de camino. Instruye la colocación de una pieza en L larga (L GRANDE) de tu reserva en el tablero.',
                color: 'var(--yellow)',
                label: 'L GRANDE',
                pieceOutline: `<path d="M 30 62 H 60 V 122 H 120 V 152 H 30 Z" fill="none" stroke="var(--yellow)" stroke-width="4.5" stroke-linejoin="round"/>`
            },
            {
                id: 'card-t',
                type: 'ficha',
                name: 'Carta Ficha: Pieza T',
                meta: 'Cartas Ficha',
                desc: 'Carta de camino. Instruye la colocación de una pieza en T de tu reserva en el tablero.',
                color: 'var(--yellow)',
                label: 'EN T',
                pieceOutline: `<path d="M 35 67 H 115 V 97 H 90 V 147 H 60 V 97 H 35 Z" fill="none" stroke="var(--yellow)" stroke-width="4.5" stroke-linejoin="round"/>`
            },
            {
                id: 'card-especial-salida',
                type: 'especial',
                name: 'Carta Especial: Elijan una salida',
                meta: 'Cartas Especiales',
                desc: 'Habilidad secreta: permite a tu dupla mirar en secreto una de las esquinas del tablero. Mantengan el secreto y elijan su estrategia.',
                color: '#00cc44',
                title: 'Elijan una salida',
                text: 'Solo tu dupla puede mirar una de las salidas del tablero. Mantengan el secreto y elijan su estrategia. Ningún otro jugador puede verla.',
                icon: ``
            },
            {
                id: 'card-guia',
                type: 'penitencia',
                name: 'Penitencia 1: Guía con Voz',
                meta: 'Cartas Penitencia',
                desc: '¡RETO! Un jugador cierra los ojos y coloca la pieza guiado únicamente por las instrucciones verbales de su compañero. Tienen 30 segundos; si falla, el turno es inválido.',
                color: 'var(--magenta)',
                title: 'Guía con voz',
                text: 'Un jugador no puede mirar el tablero mientras el otro jugador le guía con la voz.',
                icon: `<svg viewBox="0 0 100 100" width="38" height="38" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M25 65 C25 60 28 55 33 55 V48 C33 48 30 46 30 40 C30 32 35 28 42 28 C49 28 52 32 52 40 C52 46 49 48 49 48 V55 C54 55 57 60 57 65" />
                    <path d="M63 43 A 5 5 0 0 1 63 53" />
                    <path d="M68 38 A 10 10 0 0 1 68 58" />
                    <path d="M78 40 C78 35 83 32 86 35 C89 38 87 45 84 48 C81 51 82 56 79 58 C76 60 74 55 75 51" />
                    <path d="M68 48 A 6 6 0 0 1 68 58" />
                </svg>`
            },
            {
                id: 'card-mirar',
                type: 'penitencia',
                name: 'Penitencia 2: Sin Mirar',
                meta: 'Cartas Penitencia',
                desc: '¡RETO! Ambos jugadores cierran los ojos. Deben encontrar la pieza correcta en su reserva y encajarla usando únicamente el tacto en menos de 30 segundos.',
                color: 'var(--magenta)',
                title: 'Sin mirar',
                text: 'Una vez leída esta carta, cierren los ojos. Coloquen la pieza en el tablero usando solo el tacto. Tienen 30 segundos.',
                icon: `<svg viewBox="0 0 100 100" width="38" height="38" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round">
                    <path d="M20 50 C30 35 70 35 80 50 C70 65 30 65 20 50 Z" />
                    <circle cx="50" cy="50" r="10" />
                    <line x1="15" y1="15" x2="85" y2="85" stroke="#ffffff" stroke-width="4.5" />
                </svg>`
            },
            {
                id: 'card-silencio',
                type: 'penitencia',
                name: 'Penitencia 3: Silencio Total',
                meta: 'Cartas Penitencia',
                desc: '¡RETO! La dupla no puede hablar ni emitir sonidos. Deben coordinar la jugada y tomar decisiones usando únicamente gestos y lenguaje corporal.',
                color: 'var(--magenta)',
                title: 'Silencio total',
                text: 'Prohibido hablar o emitir sonidos. Deben coordinar la jugada y tomar decisiones usando únicamente gestos.',
                icon: `<svg viewBox="0 0 100 100" width="38" height="38" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round">
                    <path d="M35 55 Q 45 45 55 55 Q 45 65 35 55 Z" />
                    <path d="M20 55 H 30" />
                    <circle cx="50" cy="50" r="35" stroke-dasharray="4 4" />
                    <line x1="25" y1="25" x2="75" y2="75" stroke="#ffffff" stroke-width="4.5" />
                </svg>`
            },
            {
                id: 'card-traidora',
                type: 'penitencia',
                name: 'Penitencia 4: Pieza Traidora',
                meta: 'Cartas Penitencia',
                desc: '¡RETO! La dupla contraria toma el control total de tu turno. Ellos deciden qué pieza de tu reserva debes colocar y en qué posición del tablero se ubicará.',
                color: 'var(--magenta)',
                title: 'Pieza traidora',
                text: 'El rival juega por ti esta ronda, eligiendo pieza y ubicación. No puedes intervenir. Usar un comodín cuenta como la jugada de esa ronda.',
                icon: `<svg viewBox="0 0 100 100" width="38" height="38" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M30 75 V45 C30 40 35 35 40 35 C45 35 47 40 47 45 V55 H53 V40 C53 35 58 35 63 35 C68 35 70 40 70 45 V65 C70 75 55 85 45 85 H35" />
                    <circle cx="75" cy="50" r="8" fill="#ffffff"/>
                </svg>`
            },
            {
                id: 'card-tiempo',
                type: 'penitencia',
                name: 'Penitencia 5: Tiempo Limitado',
                meta: 'Cartas Penitencia',
                desc: '¡RETO! Al revelar la carta, el equipo rival inicia una cuenta regresiva de 5 segundos. Debes colocar la pieza antes de que se agote el tiempo.',
                color: 'var(--magenta)',
                title: 'Tiempo limitado',
                text: '¡RÁPIDO! Tienes 5 segundos para colocar la pieza desde este momento. Si el tiempo termina y no está puesta, la jugada es inválida.',
                icon: `<svg viewBox="0 0 100 100" width="38" height="38" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round">
                    <circle cx="50" cy="55" r="30" />
                    <path d="M50 35 V55 L65 65" />
                    <path d="M30 20 L20 30" stroke-width="4.5" />
                    <path d="M70 20 L80 30" stroke-width="4.5" />
                </svg>`
            }
        ]
    };

    let activeCategory = 'caminos';
    let activeItemIndex = 0;

    const tabs = document.querySelectorAll('.showroom-tab');
    const titleEl = document.getElementById('showroom-title');
    const metaEl = document.getElementById('showroom-meta');
    const descEl = document.getElementById('showroom-description');
    const renderContainer = document.getElementById('showroom-render-container');
    const thumbsContainer = document.getElementById('showroom-thumbnails');
    const actionsContainer = document.getElementById('showroom-actions');
    const btnAction = document.getElementById('showroom-btn-action');

    function buildCardBackSvg(color) {
        return `<svg viewBox="0 0 150 215" width="100%" height="100%" style="display: block; position: absolute; top:0; left:0; width:100%; height:100%;">
            <rect x="0" y="0" width="150" height="215" fill="#000000" rx="8"/>
            <!-- Border grueso -->
            <rect x="4" y="4" width="142" height="207" rx="8" fill="none" stroke="${color}" stroke-width="5.5"/>
            <!-- Border fino -->
            <rect x="12" y="12" width="126" height="191" rx="6" fill="none" stroke="${color}" stroke-width="1.5"/>
            <!-- Laberinto -->
            <g stroke="${color}" stroke-width="2" fill="none" stroke-linecap="square" opacity="0.9">
                <path d="M 95 12 V 50"/>
                <path d="M 12 50 H 138"/>
                <path d="M 50 50 V 100"/>
                <path d="M 12 100 H 95"/>
                <path d="M 95 50 V 140"/>
                <path d="M 50 140 H 138"/>
                <path d="M 50 140 V 203"/>
                <path d="M 12 175 H 50"/>
                <path d="M 95 175 H 138"/>
                <path d="M 95 175 V 203"/>
                <path d="M 72 140 V 175"/>
            </g>
        </svg>`;
    }

    function buildFichaFrontSvg(color, pieceOutline) {
        return `<svg viewBox="0 0 150 215" width="100%" height="100%" style="display: block; position: absolute; top:0; left:0; width:100%; height:100%;">
            <rect x="0" y="0" width="150" height="215" fill="#000000" rx="8"/>
            <!-- Border grueso -->
            <rect x="4" y="4" width="142" height="207" rx="8" fill="none" stroke="${color}" stroke-width="5.5"/>
            <!-- Filete interior delgado transparente -->
            <rect x="12" y="12" width="126" height="191" rx="6" fill="none" stroke="${color}" stroke-width="1.2" opacity="0.2"/>
            <!-- Laberinto en baja opacidad -->
            <g stroke="${color}" stroke-width="1.8" fill="none" stroke-linecap="square" opacity="0.08">
                <path d="M 95 12 V 50"/>
                <path d="M 12 50 H 138"/>
                <path d="M 50 50 V 100"/>
                <path d="M 12 100 H 95"/>
                <path d="M 95 50 V 140"/>
                <path d="M 50 140 H 138"/>
                <path d="M 50 140 V 203"/>
                <path d="M 12 175 H 50"/>
                <path d="M 95 175 H 138"/>
                <path d="M 95 175 V 203"/>
                <path d="M 72 140 V 175"/>
            </g>
            <!-- Outline de pieza -->
            ${pieceOutline}
            <!-- Label y barra -->
            <g transform="translate(25, 176)">
                <rect x="0" y="2" width="12" height="3" fill="${color}"/>
                <text x="20" y="6" fill="#ffffff" font-family="'Geist Mono', monospace" font-size="9" font-weight="bold" letter-spacing="1.5">__LABEL__</text>
            </g>
        </svg>`;
    }

    function buildPenitenciaFrontSvg(color) {
        return `<svg viewBox="0 0 150 215" width="100%" height="100%" style="display: block; position: absolute; top:0; left:0; width:100%; height:100%;">
            <rect x="0" y="0" width="150" height="215" fill="#000000" rx="8"/>
            <!-- Border grueso -->
            <rect x="4" y="4" width="142" height="207" rx="8" fill="none" stroke="${color}" stroke-width="5.5"/>
            <!-- Filete interior delgado transparente -->
            <rect x="12" y="12" width="126" height="191" rx="6" fill="none" stroke="${color}" stroke-width="1.2" opacity="0.2"/>
            <!-- Laberinto en baja opacidad -->
            <g stroke="${color}" stroke-width="1.8" fill="none" stroke-linecap="square" opacity="0.07">
                <path d="M 95 12 V 50"/>
                <path d="M 12 50 H 138"/>
                <path d="M 50 50 V 100"/>
                <path d="M 12 100 H 95"/>
                <path d="M 95 50 V 140"/>
                <path d="M 50 140 H 138"/>
                <path d="M 50 140 V 203"/>
                <path d="M 12 175 H 50"/>
                <path d="M 95 175 H 138"/>
                <path d="M 95 175 V 203"/>
                <path d="M 72 140 V 175"/>
            </g>
        </svg>`;
    }

    function buildCardHTML(item) {
        let frontContent = '';
        let backContent = buildCardBackSvg(item.color);
        
        if (item.type === 'ficha') {
            // Reemplazar la etiqueta dinámicamente en el SVG de la ficha
            const fichaSvg = buildFichaFrontSvg(item.color, item.pieceOutline)
                .replace('__LABEL__', item.label);
            frontContent = fichaSvg;
        } else if (item.type === 'especial') {
            frontContent = `
                ${buildPenitenciaFrontSvg(item.color)}
                <div class="card-front-content" style="position: absolute; top: 12px; bottom: 12px; left: 12px; right: 12px; display: flex; flex-direction: column; justify-content: space-between; pointer-events: none; padding: 12px 8px; box-sizing: border-box; height: calc(100% - 24px);">
                    <div style="font-family: 'Geist Mono', monospace; font-size: 7px; color: #ffffff; letter-spacing: 2px; text-align: center; font-weight: bold; opacity: 0.9; padding-top: 4px;">CARTA ESPECIAL</div>
                    
                    <div style="display: flex; justify-content: center; align-items: center; height: 60px; margin-top: 5px;">
                        <svg viewBox="0 0 120 120" width="48" height="48" style="display: block;">
                            <!-- Shackle (open) -->
                            <path d="M 45 50 V 32 A 13 13 0 0 1 71 32 V 42" fill="none" stroke="${item.color}" stroke-width="5.5" stroke-linecap="round"/>
                            <!-- Lock body -->
                            <rect x="36" y="50" width="48" height="36" rx="5" fill="${item.color}"/>
                            <!-- Keyhole -->
                            <circle cx="60" cy="66" r="4.5" fill="#000000"/>
                            <path d="M 60 66 V 76" stroke="#000000" stroke-width="3" stroke-linecap="round"/>
                            <!-- Key -->
                            <path d="M 84 66 H 100" stroke="${item.color}" stroke-width="4.5" stroke-linecap="round"/>
                            <circle cx="106" cy="66" r="6" fill="none" stroke="${item.color}" stroke-width="4"/>
                            <path d="M 90 66 V 72 M 95 66 V 72" stroke="${item.color}" stroke-width="3"/>
                        </svg>
                    </div>

                    <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 4px; padding: 5px 0;">
                        <div class="card-3d-title" style="color: #ffffff; text-align: center; font-size: 8.5px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; margin: 0;">${item.title}</div>
                        <p class="card-3d-text" style="color: rgba(255, 255, 255, 0.85) !important; text-align: center; font-size: 6.8px; line-height: 1.25; margin: 0 !important; font-weight: 300; padding: 0 2px;">${item.text}</p>
                    </div>
                </div>
            `;
        } else {
            frontContent = `
                ${buildPenitenciaFrontSvg(item.color)}
                <div class="card-front-content" style="position: absolute; top: 12px; bottom: 12px; left: 12px; right: 12px; display: flex; flex-direction: column; justify-content: space-between; pointer-events: none; padding: 12px 8px; box-sizing: border-box; height: calc(100% - 24px);">
                    <div class="card-3d-title" style="color: #ffffff; text-align: center; font-size: 8.5px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; margin: 0; padding-top: 4px;">${item.title}</div>
                    
                    <div style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 5px 0;">
                        <p class="card-3d-text" style="color: rgba(255, 255, 255, 0.85) !important; text-align: center; font-size: 6.8px; line-height: 1.25; margin: 0 !important; font-weight: 300; padding: 0 2px;">${item.text}</p>
                    </div>
                    
                    <div style="display: flex; justify-content: center; align-items: center; height: 38px; margin-bottom: 2px;">
                        ${item.icon}
                    </div>
                </div>
            `;
        }
        
        return `<div class="card-3d-wrapper" onclick="this.querySelector('.card-3d-inner').classList.toggle('flipped')">
            <div class="card-3d-inner">
                <!-- Frente -->
                <div class="card-3d-front">
                    ${frontContent}
                </div>
                <!-- Reverso -->
                <div class="card-3d-back">
                    ${backContent}
                </div>
            </div>
        </div>`;
    }

    function renderActiveItem() {
        const item = data[activeCategory][activeItemIndex];
        if (!item) return;

        titleEl.textContent = item.name;
        metaEl.textContent = item.meta;
        
        if (activeCategory === 'cartas') {
            descEl.textContent = '';
        } else {
            descEl.textContent = item.desc;
        }

        if (activeCategory === 'cartas') {
            renderContainer.innerHTML = buildCardHTML(item);
        } else {
            renderContainer.innerHTML = item.html;
        }

        // Mostrar / Ocultar acción de voltear si es carta
        if (activeCategory === 'cartas') {
            actionsContainer.style.display = 'block';
            btnAction.onclick = () => {
                const inner = renderContainer.querySelector('.card-3d-inner');
                if (inner) inner.classList.toggle('flipped');
            };
        } else {
            actionsContainer.style.display = 'none';
        }

        // Mouse tilting interactivo en el visor
        const displayBox = document.getElementById('showroom-visor-box');
        if (displayBox) {
            displayBox.onmousemove = (e) => {
                const boxRect = displayBox.getBoundingClientRect();
                const x = e.clientX - boxRect.left;
                const y = e.clientY - boxRect.top;
                const xc = boxRect.width / 2;
                const yc = boxRect.height / 2;
                const dx = x - xc;
                const dy = y - yc;
                
                const rx = -(dy / yc) * 15;
                const ry = (dx / xc) * 15;

                const model = renderContainer.firstElementChild;
                if (model) {
                    model.style.transition = 'none';
                    if (model.classList.contains('card-3d-wrapper')) {
                        model.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
                    } else {
                        model.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(20px)`;
                    }
                }
            };

            displayBox.onmouseleave = () => {
                const model = renderContainer.firstElementChild;
                if (model) {
                    model.style.transition = 'transform 0.5s ease';
                    model.style.transform = 'rotateX(0deg) rotateY(0deg)';
                }
            };
        }

        // Actualizar thumbnails activos
        const thumbs = thumbsContainer.querySelectorAll('.showroom-thumb');
        thumbs.forEach((t, idx) => {
            if (idx === activeItemIndex) {
                t.classList.add('active');
            } else {
                t.classList.remove('active');
            }
        });
    }

    function loadCategory(cat) {
        activeCategory = cat;
        activeItemIndex = 0;

        thumbsContainer.innerHTML = '';
        data[activeCategory].forEach((item, idx) => {
            const thumb = document.createElement('div');
            thumb.className = `showroom-thumb ${idx === 0 ? 'active' : ''}`;
            
            if (activeCategory === 'cartas') {
                if (item.type === 'ficha') {
                    thumb.innerHTML = `<div style="width: 32px; height: 46px; border: 1.5px solid ${item.color}; background-color: #000; border-radius: 3px; display: flex; align-items: center; justify-content: center; position: relative;">
                        <div style="width: 10px; height: 10px; border: 1px solid ${item.color}; border-radius: 1px; opacity: 0.8;"></div>
                        <div style="position: absolute; bottom: 4px; left: 4px; right: 4px; height: 2px; background-color: ${item.color}; opacity: 0.6;"></div>
                    </div>`;
                } else {
                    thumb.innerHTML = `<div style="width: 32px; height: 46px; border: 1.5px solid ${item.color}; background-color: #000; border-radius: 3px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; padding: 2px; box-sizing: border-box;">
                        <div style="width: 16px; height: 1.5px; background-color: rgba(255,255,255,0.4); margin-bottom: 2px;"></div>
                        <div style="width: 12px; height: 1.5px; background-color: rgba(255,255,255,0.4); margin-bottom: 4px;"></div>
                        <div style="width: 10px; height: 10px; border-radius: 50%; border: 1.2px solid ${item.color}; opacity: 0.8; display: flex; align-items: center; justify-content: center;">
                            <div style="width: 3px; height: 3px; background-color: #fff; border-radius: 50%;"></div>
                        </div>
                    </div>`;
                }
            } else if (activeCategory === 'comodines') {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = item.html;
                const innerSvg = tempDiv.querySelector('svg');
                if (innerSvg) {
                    innerSvg.setAttribute('width', '24');
                    innerSvg.setAttribute('height', '24');
                    thumb.appendChild(innerSvg);
                }
            } else {
                thumb.innerHTML = item.html;
                const svg = thumb.querySelector('svg');
                if (svg) {
                    svg.setAttribute('width', '28');
                    svg.setAttribute('height', '28');
                }
            }

            thumb.onclick = () => {
                activeItemIndex = idx;
                renderActiveItem();
            };
            thumbsContainer.appendChild(thumb);
        });

        tabs.forEach(t => {
            if (t.getAttribute('data-category') === activeCategory) {
                t.classList.add('active');
            } else {
                t.classList.remove('active');
            }
        });

        renderActiveItem();
    }

    tabs.forEach(tab => {
        tab.onclick = () => {
            loadCategory(tab.getAttribute('data-category'));
        };
    });

    loadCategory('caminos');
}


/* --- MÓDULO 6: GALERÍA TILT EFFECT IN 3D --- */
function initGaleriaTilt() {
    const cards = document.querySelectorAll('.item-slider');
    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const xc = rect.width / 2;
            const yc = rect.height / 2;
            
            // Inclinación máxima de 12 grados
            const rx = -((y - yc) / yc) * 12;
            const ry = ((x - xc) / xc) * 12;
            
            card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02, 1.02, 1.02)`;
            
            // Paralaje de la imagen moviéndose en dirección opuesta
            const img = card.querySelector('img');
            if (img) {
                const px = ((x - xc) / xc) * 8;
                const py = ((y - yc) / yc) * 8;
                img.style.transform = `translateX(${-px}px) translateY(${-py}px) scale(1.1)`;
            }
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            card.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
            
            const img = card.querySelector('img');
            if (img) {
                img.style.transform = `translateX(0px) translateY(0px) scale(1)`;
                img.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
            }
        });

        card.addEventListener('mouseenter', () => {
            card.style.transition = 'none';
            const img = card.querySelector('img');
            if (img) {
                img.style.transition = 'none';
            }
        });
    });
}

/* --- MÓDULO 7: VISUALIZADOR DE ALTA GAMA (LIGHTBOX) --- */
function initGaleriaLightbox() {
    const lightbox = document.getElementById('galeria-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeBtn = document.querySelector('.lightbox-close');
    const items = document.querySelectorAll('.item-slider');

    if (!lightbox || !lightboxImg || !lightboxCaption) return;

    items.forEach(item => {
        const img = item.querySelector('img');
        const caption = item.querySelector('.caption-galeria');

        if (img) {
            img.style.cursor = 'zoom-in';
            img.addEventListener('click', (e) => {
                e.stopPropagation();
                lightboxImg.src = img.src;
                lightboxImg.alt = img.alt;
                
                if (caption) {
                    lightboxCaption.innerHTML = `<span>// REGISTRO DE SISTEMA</span><br><strong>${caption.textContent}</strong>`;
                } else {
                    lightboxCaption.innerHTML = `<span>// REGISTRO DE SISTEMA</span><br><strong>CONECTANDO - DETALLE</strong>`;
                }

                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        }
    });

    const closeLightbox = () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => {
            lightboxImg.src = '';
        }, 300);
    };

    if (closeBtn) {
        closeBtn.addEventListener('click', closeLightbox);
    }

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
}


/* --- MÓDULO 8: HERO GENERATIVE NODES AND CONNECTIONS --- */
function initHeroCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let w = canvas.width = canvas.offsetWidth;
    let h = canvas.height = canvas.offsetHeight;
    
    window.addEventListener('resize', () => {
        if (!canvas) return;
        w = canvas.width = canvas.offsetWidth;
        h = canvas.height = canvas.offsetHeight;
    });
    
    const colors = ['#00aaff', '#ff007f', '#e6ff00']; // Cian, Magenta, Amarillo
    const numNodes = 30;
    const nodes = [];
    
    for (let i = 0; i < numNodes; i++) {
        const size = Math.random() * 2 + 1.2;
        nodes.push({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.6,
            vy: (Math.random() - 0.5) * 0.6,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: Math.random() * 0.5 + 0.35,
            size: size
        });
    }
    
    const threshold = 85;
    
    function animate() {
        ctx.clearRect(0, 0, w, h);
        
        // Draw connections
        for (let i = 0; i < numNodes; i++) {
            const n1 = nodes[i];
            for (let j = i + 1; j < numNodes; j++) {
                const n2 = nodes[j];
                const dx = n2.x - n1.x;
                const dy = n2.y - n1.y;
                const dist = Math.hypot(dx, dy);
                
                if (dist < threshold) {
                    const alpha = (1 - dist / threshold) * 0.16;
                    ctx.strokeStyle = n1.color; // use color of first node
                    ctx.lineWidth = 0.45;
                    ctx.globalAlpha = alpha;
                    ctx.beginPath();
                    ctx.moveTo(n1.x, n1.y);
                    ctx.lineTo(n2.x, n2.y);
                    ctx.stroke();
                }
            }
        }
        ctx.globalAlpha = 1.0;
        
        // Draw squares (cuadritos)
        nodes.forEach(n => {
            n.x += n.vx;
            n.y += n.vy;
            
            // Bounce or wrap borders
            if (n.x < 10) { n.x = 10; n.vx *= -1; }
            else if (n.x > w - 10) { n.x = w - 10; n.vx *= -1; }
            
            if (n.y < 10) { n.y = 10; n.vy *= -1; }
            else if (n.y > h - 10) { n.y = h - 10; n.vy *= -1; }
            
            ctx.fillStyle = n.color;
            ctx.globalAlpha = n.alpha;
            ctx.fillRect(n.x - n.size, n.y - n.size, n.size * 2, n.size * 2);
        });
        ctx.globalAlpha = 1.0;
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

