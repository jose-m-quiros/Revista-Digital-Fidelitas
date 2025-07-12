// SCRIPT ULTRA-SIMPLIFICADO PARA SCROLL NATIVO FLUIDO EN MÓVILES
(function() {
    'use strict';

    // Variables globales simples
    let isLoaded = false;
    let isScrolling = false;
    let scrollTimer = null;

    // Elementos DOM
    let navbar = null;
    let scrollTopBtn = null;
    let navToggle = null;
    let navMenu = null;
    let loadingScreen = null;

    // Configuración simple para móviles
    const config = {
        scrollThreshold: 50,
        buttonThreshold: 300,
        debounceTime: 10
    };

    // Función de inicialización principal
    function init() {
        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', start);
        } else {
            start();
        }
    }

    // Función de inicio
    function start() {
        try {
            bindElements();
            setupEventListeners();
            hideLoadingScreen();
            markAsLoaded();
        } catch (error) {
            console.error('Error:', error);
            hideLoadingScreen();
        }
    }

    // Obtener elementos del DOM
    function bindElements() {
        navbar = document.getElementById('navbar');
        scrollTopBtn = document.getElementById('scrollTopBtn');
        navToggle = document.getElementById('navToggle');
        navMenu = document.getElementById('navMenu');
        loadingScreen = document.getElementById('loadingScreen');
    }

    // Configurar event listeners simples
    function setupEventListeners() {
        // Scroll listener ultra-simple con debounce mínimo
        window.addEventListener('scroll', handleScroll, { passive: true });

        // Menú móvil
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', toggleMobileMenu);
            
            // Cerrar menú al hacer clic en enlaces
            const navLinks = navMenu.querySelectorAll('a');
            navLinks.forEach(link => {
                link.addEventListener('click', closeMobileMenu);
            });

            // Cerrar menú al hacer clic fuera
            document.addEventListener('click', handleOutsideClick);
        }

        // Botón scroll to top
        if (scrollTopBtn) {
            scrollTopBtn.addEventListener('click', scrollToTop);
        }

        // Scroll suave para enlaces ancla
        setupSmoothScrolling();

        // Resize listener simple
        window.addEventListener('resize', handleResize, { passive: true });
    }

    // Handler de scroll ultra-simplificado
    function handleScroll() {
        // Debounce mínimo para mejor rendimiento
        if (scrollTimer) {
            clearTimeout(scrollTimer);
        }

        // Acción inmediata para navbar y botón
        updateUI();

        // Marcar fin de scroll
        scrollTimer = setTimeout(() => {
            isScrolling = false;
        }, 100);
    }

    // Actualizar UI basado en scroll
    function updateUI() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Actualizar navbar
        if (navbar) {
            if (scrollTop > config.scrollThreshold) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }

        // Actualizar botón scroll to top
        if (scrollTopBtn) {
            if (scrollTop > config.buttonThreshold) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        }

        // Actualizar navegación activa de forma simple
        updateActiveNavigation();
    }

    // Actualizar navegación activa
    function updateActiveNavigation() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
        const scrollPos = window.pageYOffset + 200;

        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                current = sectionId;
            }
        });

        // Manejar casos especiales
        if (current === 'articulo2') current = 'articulos';
        if (current === 'libro2') current = 'libros';

        // Actualizar clases activas
        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href').substring(1);
            if (href === current) {
                link.classList.add('active');
            }
        });
    }

    // Configurar scroll suave para enlaces ancla
    function setupSmoothScrolling() {
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        
        anchorLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    // Usar scroll nativo suave del navegador
                    const offsetTop = targetElement.offsetTop - 80;
                    
                    window.scrollTo({
                        top: Math.max(0, offsetTop),
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // Toggle menú móvil
    function toggleMobileMenu() {
        if (navToggle && navMenu) {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('mobile-active');
        }
    }

    // Cerrar menú móvil
    function closeMobileMenu() {
        if (navToggle && navMenu) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('mobile-active');
        }
    }

    // Manejar clics fuera del menú
    function handleOutsideClick(e) {
        if (navToggle && navMenu && 
            !navToggle.contains(e.target) && 
            !navMenu.contains(e.target)) {
            closeMobileMenu();
        }
    }

    // Scroll to top
    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // Manejar resize
    function handleResize() {
        closeMobileMenu();
    }

    // Ocultar loading screen
    function hideLoadingScreen() {
        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                setTimeout(() => {
                    if (loadingScreen.parentNode) {
                        loadingScreen.parentNode.removeChild(loadingScreen);
                    }
                }, 300);
            }, 500);
        }
    }

    // Marcar como cargado
    function markAsLoaded() {
        setTimeout(() => {
            document.body.classList.add('loaded');
            isLoaded = true;
            
            // Activar animaciones de entrada simple
            const fadeElements = document.querySelectorAll('.fade-in');
            fadeElements.forEach((element, index) => {
                setTimeout(() => {
                    element.classList.add('visible');
                }, index * 100);
            });
        }, 100);
    }

    // Error handling simple
    window.onerror = function(msg, url, lineNo) {
        console.error('Error:', msg, 'at', url, ':', lineNo);
        hideLoadingScreen();
        document.body.classList.add('loaded');
        return false;
    };

    // Timeout de seguridad
    setTimeout(() => {
        if (!isLoaded) {
            hideLoadingScreen();
            document.body.classList.add('loaded');
        }
    }, 3000);

    // Inicializar cuando se carga el script
    init();

})();