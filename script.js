document.addEventListener("DOMContentLoaded", function () {

    // --- 1. PARALLAX DE LAS 3 PIEZAS GRANDES ---
    const floatingPieces = document.querySelectorAll('.parallax-container .floating-piece');
    
    // --- 2. GENERACIÓN DEL ENJAMBRE DE PIEZAS PEQUEÑAS ---
    const contenedor = document.getElementById('enjambre-piezas');
    const cantidadPiezas = 24;
    const formas = ['T', 'L', 'I'];
    const colores = ['#00aaff', '#ff007f', '#e6ff00'];
    
    const svgPaths = {
        'T': '<path d="M10 10 H110 V40 H75 V110 H45 V40 H10 Z" fill="none" stroke="currentColor" stroke-width="4"/>',
        'L': '<path d="M10 10 H40 V90 H80 V120 H10 Z" fill="none" stroke="currentColor" stroke-width="4"/>',
        'I': '<path d="M10 10 H30 V110 H10 Z" fill="none" stroke="currentColor" stroke-width="4"/>'
    };

    const viewBoxes = { 'T': '0 0 120 120', 'L': '0 0 90 120', 'I': '0 0 40 120' };
    const piezasDinamicas = [];

    for (let i = 0; i < cantidadPiezas; i++) {
        let forma = formas[Math.floor(Math.random() * formas.length)];
        let color = colores[Math.floor(Math.random() * colores.length)];
        
        let div = document.createElement('div');
        div.className = 'pieza-dinamica';
        div.style.color = color; 
        div.innerHTML = `<svg width="40" height="40" viewBox="${viewBoxes[forma]}">${svgPaths[forma]}</svg>`;
        
        let reposoX = Math.random() * 100; 
        let reposoY = Math.random() * 100; 
        let rotacion = Math.floor(Math.random() * 360);
        
        div.style.transform = `translate(${reposoX}vw, ${reposoY}vh) rotate(${rotacion}deg) scale(1)`;
        contenedor.appendChild(div);
        
        piezasDinamicas.push({ elemento: div, rX: reposoX, rY: reposoY, rot: rotacion });
    }

    // --- 3. LÓGICA DE SCROLL (PARALLAX + ENJAMBRE) ---
    let scrollTimeout;

    window.addEventListener('scroll', function() {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Animar las 3 piezas grandes
        floatingPieces.forEach(piece => {
            let speed = parseFloat(piece.getAttribute('data-speed'));
            let yPos = -(scrollTop * speed);
            
            if (piece.classList.contains('piece-t')) {
                piece.style.transform = `translateY(${yPos}px) rotate(15deg)`;
            } else if (piece.classList.contains('piece-l')) {
                piece.style.transform = `translateY(${yPos}px) rotate(-25deg)`;
            } else if (piece.classList.contains('piece-i')) {
                piece.style.transform = `translateY(${yPos}px) rotate(45deg)`;
            }
        });

        // Agrupar el enjambre de piezas pequeñas
        document.body.classList.add('is-scrolling');
        
        piezasDinamicas.forEach((pieza, index) => {
            let posicionCaminoY = 10 + (index * (80 / cantidadPiezas)); 
            pieza.elemento.style.transform = `translate(50vw, ${posicionCaminoY}vh) rotate(0deg) scale(1.4)`;
        });

        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            document.body.classList.remove('is-scrolling');
            piezasDinamicas.forEach(pieza => {
                pieza.elemento.style.transform = `translate(${pieza.rX}vw, ${pieza.rY}vh) rotate(${pieza.rot}deg) scale(1)`;
            });
        }, 400); 
    });

    // --- 4. DETECTOR PARA LA APARICIÓN DE TEXTOS Y WIREFRAMES ---
    const observerOptions = { root: null, rootMargin: "0px", threshold: 0.1 };
    
    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    };
    
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const elementsToAnimate = document.querySelectorAll(".animate-on-scroll");
    
    elementsToAnimate.forEach(element => {
        observer.observe(element);
    });
});