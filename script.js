document.addEventListener("DOMContentLoaded", function () {
            
    /* --- 1. GENERADOR DE PIEZAS FLOTANTES AUTÓNOMAS --- */
    const contenedor = document.getElementById('enjambre-piezas');
    const cantidadPiezas = 25; 
    const formas = ['T', 'L', 'I'];
    const colores = ['#00aaff', '#ff007f', '#e6ff00'];
    
    const svgPaths = {
        'T': '<path d="M10 10 H110 V40 H75 V110 H45 V40 H10 Z" fill="none" stroke="currentColor" stroke-width="2"/>',
        'L': '<path d="M10 10 H40 V90 H80 V120 H10 Z" fill="none" stroke="currentColor" stroke-width="2"/>',
        'I': '<path d="M10 10 H30 V110 H10 Z" fill="none" stroke="currentColor" stroke-width="2"/>'
    };
    const viewBoxes = { 'T': '0 0 120 120', 'L': '0 0 90 120', 'I': '0 0 40 120' };

    for (let i = 0; i < cantidadPiezas; i++) {
        let forma = formas[Math.floor(Math.random() * formas.length)];
        let color = colores[Math.floor(Math.random() * colores.length)];
        
        let div = document.createElement('div');
        div.className = 'bg-piece';
        div.style.color = color; 
        
        let size = 60 + Math.random() * 80;
        div.innerHTML = `<svg width="${size}" height="${size}" viewBox="${viewBoxes[forma]}">${svgPaths[forma]}</svg>`;
        
        let reposoX = Math.random() * 100; 
        let reposoY = Math.random() * 100; 
        let rotacion = Math.floor(Math.random() * 360);
        
        let duracion = 15 + Math.random() * 30;
        let retraso = Math.random() * -30;

        div.style.left = `${reposoX}vw`;
        div.style.top = `${reposoY}vh`;
        div.style.transform = `rotate(${rotacion}deg)`;
        div.style.animationDuration = `${duracion}s`;
        div.style.animationDelay = `${retraso}s`;
        
        contenedor.appendChild(div);
    }

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

    /* --- 3. MOSTRAR FRANJA DE NAVEGACIÓN --- */
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
});