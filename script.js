// Ultra Compatible JavaScript for All Devices
(function() {
    'use strict';

    // Polyfills para navegadores muy antiguos
    if (!Element.prototype.closest) {
        Element.prototype.closest = function(s) {
            var el = this;
            do {
                if (el.matches && el.matches(s)) return el;
                el = el.parentElement || el.parentNode;
            } while (el !== null && el.nodeType === 1);
            return null;
        };
    }

    if (!Element.prototype.matches) {
        Element.prototype.matches = Element.prototype.msMatchesSelector || 
                                    Element.prototype.webkitMatchesSelector ||
                                    function(s) {
                                        var matches = (this.document || this.ownerDocument).querySelectorAll(s);
                                        var i = matches.length;
                                        while (--i >= 0 && matches.item(i) !== this) {}
                                        return i > -1;
                                    };
    }

    // Polyfill para Array.from
    if (!Array.from) {
        Array.from = function(arrayLike) {
            var result = [];
            for (var i = 0; i < arrayLike.length; i++) {
                result.push(arrayLike[i]);
            }
            return result;
        };
    }

    // Polyfill para Object.assign
    if (!Object.assign) {
        Object.assign = function(target) {
            for (var i = 1; i < arguments.length; i++) {
                var source = arguments[i];
                for (var key in source) {
                    if (source.hasOwnProperty(key)) {
                        target[key] = source[key];
                    }
                }
            }
            return target;
        };
    }

    // Clase principal de la aplicación
    function DigitalMagazine() {
        this.isLoaded = false;
        this.navbar = null;
        this.scrollTopBtn = null;
        this.navToggle = null;
        this.navMenu = null;
        this.loadingScreen = null;
        this.errorBoundary = null;
        this.mainContent = null;
        this.ticking = false;
        this.scrollPosition = 0;
        this.isScrolling = false;
        this.isMobile = false;
        this.touchStartY = 0;
        this.touchEndY = 0;
        this.lastScrollTime = 0;
        this.scrollThrottle = 16; // ~60fps
        this.resizeThrottle = 250;
        this.intersectionObserver = null;
        this.supportsIntersectionObserver = false;
        this.supportsPassiveEvents = false;
        this.supportsRequestAnimationFrame = false;

        this.init();
    }

    DigitalMagazine.prototype.init = function() {
        var self = this;
        
        // Detección de capacidades del navegador
        this.detectCapabilities();
        
        // Manejo de errores global
        this.setupErrorHandling();
        
        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                self.start();
            });
        } else {
            // DOM ya está listo
            setTimeout(function() {
                self.start();
            }, 10);
        }
    };

    DigitalMagazine.prototype.detectCapabilities = function() {
        // Detectar soporte para eventos pasivos
        try {
            var opts = Object.defineProperty({}, 'passive', {
                get: function() {
                    this.supportsPassiveEvents = true;
                    return false;
                }.bind(this)
            });
            window.addEventListener('testPassive', null, opts);
            window.removeEventListener('testPassive', null, opts);
        } catch (e) {
            this.supportsPassiveEvents = false;
        }

        // Detectar soporte para Intersection Observer
        this.supportsIntersectionObserver = 'IntersectionObserver' in window;

        // Detectar soporte para requestAnimationFrame
        this.supportsRequestAnimationFrame = !!(window.requestAnimationFrame || 
                                                window.webkitRequestAnimationFrame || 
                                                window.mozRequestAnimationFrame);

        // Detectar dispositivo móvil
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                       window.innerWidth <= 768;

        // Detectar dispositivo súper pequeño
        this.isSuperSmall = window.innerWidth <= 240;
    };

    DigitalMagazine.prototype.setupErrorHandling = function() {
        var self = this;

        // Error boundary global
        window.onerror = function(msg, url, lineNo, columnNo, error) {
            console.error('Error:', msg, 'at', url, ':', lineNo);
            self.showErrorFallback();
            return false;
        };

        // Para navegadores modernos
        if (window.addEventListener) {
            window.addEventListener('unhandledrejection', function(event) {
                console.error('Unhandled promise rejection:', event.reason);
                self.showErrorFallback();
            });
        }

        // Timeout de seguridad para ocultar loading
        setTimeout(function() {
            self.hideLoadingScreen();
        }, 8000);
    };

    DigitalMagazine.prototype.showErrorFallback = function() {
        if (this.errorBoundary) {
            this.errorBoundary.classList.remove('hidden');
        }
        if (this.loadingScreen) {
            this.loadingScreen.classList.add('hidden');
        }
    };

    DigitalMagazine.prototype.start = function() {
        try {
            this.bindElements();
            this.setupEventListeners();
            this.preloadCriticalImages();
            this.initializeAnimations();
            this.hideLoadingScreen();
            this.markAsLoaded();
            this.optimizeForDevice();
        } catch (error) {
            console.error('Error starting application:', error);
            this.showErrorFallback();
        }
    };

    DigitalMagazine.prototype.bindElements = function() {
        this.navbar = document.getElementById('navbar');
        this.scrollTopBtn = document.getElementById('scrollTopBtn');
        this.navToggle = document.getElementById('navToggle');
        this.navMenu = document.getElementById('navMenu');
        this.loadingScreen = document.getElementById('loadingScreen');
        this.errorBoundary = document.getElementById('errorBoundary');
        this.mainContent = document.getElementById('mainContent');
    };

    DigitalMagazine.prototype.setupEventListeners = function() {
        var self = this;

        // Eventos de scroll con throttling optimizado
        this.addScrollListener(function() {
            self.handleScroll();
        });

        // Menú móvil
        if (this.navToggle && this.navMenu) {
            this.addClickListener(this.navToggle, function(e) {
                e.preventDefault();
                self.toggleMobileMenu();
            });

            // Cerrar menú móvil al hacer clic en enlaces
            var navLinks = this.getAllElements('.nav-menu a');
            for (var i = 0; i < navLinks.length; i++) {
                this.addClickListener(navLinks[i], function() {
                    self.closeMobileMenu();
                });
            }

            // Cerrar menú móvil al hacer clic fuera
            this.addClickListener(document, function(e) {
                self.handleOutsideClick(e);
            });
        }

        // Scroll suave para enlaces de navegación
        var anchorLinks = this.getAllElements('a[href^="#"]');
        for (var i = 0; i < anchorLinks.length; i++) {
            this.addClickListener(anchorLinks[i], function(e) {
                self.handleAnchorClick(e);
            });
        }

        // Botón scroll to top
        if (this.scrollTopBtn) {
            this.addClickListener(this.scrollTopBtn, function(e) {
                e.preventDefault();
                self.scrollToTop();
            });
        }

        // Eventos de redimensionamiento
        this.addResizeListener(function() {
            self.handleResize();
        });

        // Navegación por teclado
        this.addKeyListener(function(e) {
            self.handleKeydown(e);
        });

        // Eventos táctiles para dispositivos móviles
        if (this.isMobile) {
            this.setupTouchEvents();
        }

        // Eventos de visibilidad de página
        this.setupVisibilityEvents();
    };

    DigitalMagazine.prototype.addClickListener = function(element, callback) {
        if (!element) return;
        
        if (element.addEventListener) {
            element.addEventListener('click', callback, false);
        } else if (element.attachEvent) {
            element.attachEvent('onclick', callback);
        }
    };

    DigitalMagazine.prototype.addScrollListener = function(callback) {
        var self = this;
        var isScrolling = false;

        function scrollHandler() {
            var now = Date.now();
            if (now - self.lastScrollTime < self.scrollThrottle) {
                return;
            }
            self.lastScrollTime = now;

            if (!isScrolling) {
                self.requestAnimFrame(function() {
                    callback();
                    isScrolling = false;
                });
                isScrolling = true;
            }
        }

        var eventOptions = this.supportsPassiveEvents ? { passive: true } : false;
        
        if (window.addEventListener) {
            window.addEventListener('scroll', scrollHandler, eventOptions);
        } else if (window.attachEvent) {
            window.attachEvent('onscroll', scrollHandler);
        }
    };

    DigitalMagazine.prototype.addResizeListener = function(callback) {
        var self = this;
        var resizeTimer;

        function resizeHandler() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                callback();
            }, self.resizeThrottle);
        }

        if (window.addEventListener) {
            window.addEventListener('resize', resizeHandler, false);
        } else if (window.attachEvent) {
            window.attachEvent('onresize', resizeHandler);
        }
    };

    DigitalMagazine.prototype.addKeyListener = function(callback) {
        if (document.addEventListener) {
            document.addEventListener('keydown', callback, false);
        } else if (document.attachEvent) {
            document.attachEvent('onkeydown', callback);
        }
    };

    DigitalMagazine.prototype.setupTouchEvents = function() {
        var self = this;

        if (!this.mainContent) return;

        var eventOptions = this.supportsPassiveEvents ? { passive: true } : false;

        if (this.mainContent.addEventListener) {
            this.mainContent.addEventListener('touchstart', function(e) {
                self.touchStartY = e.touches[0].clientY;
            }, eventOptions);

            this.mainContent.addEventListener('touchend', function(e) {
                self.touchEndY = e.changedTouches[0].clientY;
                self.handleSwipe();
            }, eventOptions);
        }
    };

    DigitalMagazine.prototype.setupVisibilityEvents = function() {
        var self = this;

        if (document.addEventListener) {
            document.addEventListener('visibilitychange', function() {
                if (document.hidden) {
                    document.body.classList.add('page-hidden');
                } else {
                    document.body.classList.remove('page-hidden');
                }
            }, false);

            window.addEventListener('load', function() {
                document.body.classList.add('fully-loaded');
            }, false);
        }
    };

    DigitalMagazine.prototype.handleSwipe = function() {
        var swipeThreshold = 50;
        var diff = this.touchStartY - this.touchEndY;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe up - scroll down
                this.smoothScrollBy(200);
            } else {
                // Swipe down - scroll up
                this.smoothScrollBy(-200);
            }
        }
    };

    DigitalMagazine.prototype.handleScroll = function() {
        this.scrollPosition = this.getScrollTop();
        
        if (!this.ticking) {
            var self = this;
            this.requestAnimFrame(function() {
                self.updateNavbarState();
                self.updateScrollTopButton();
                self.updateActiveNavigation();
                self.ticking = false;
            });
            this.ticking = true;
        }
    };

    DigitalMagazine.prototype.updateNavbarState = function() {
        if (this.navbar) {
            if (this.scrollPosition > 100) {
                this.navbar.classList.add('scrolled');
            } else {
                this.navbar.classList.remove('scrolled');
            }
        }
    };

    DigitalMagazine.prototype.updateScrollTopButton = function() {
        if (this.scrollTopBtn) {
            if (this.scrollPosition > 100) {
                this.scrollTopBtn.classList.add('visible');
            } else {
                this.scrollTopBtn.classList.remove('visible');
            }
        }
    };

    DigitalMagazine.prototype.updateActiveNavigation = function() {
        var sections = this.getAllElements('section[id], .card[id]');
        var navLinks = this.getAllElements('.nav-menu a[href^="#"]');
        
        var current = '';
        var scrollPosition = this.scrollPosition + 200;
        
        for (var i = 0; i < sections.length; i++) {
            var section = sections[i];
            var sectionTop = this.getElementTop(section);
            var sectionHeight = section.offsetHeight || section.clientHeight;
            var sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = sectionId;
                
                // Manejar elementos anidados
                if (sectionId === 'articulo2') {
                    current = 'articulos';
                } else if (sectionId === 'libro2') {
                    current = 'libros';
                }
            }
        }

        for (var i = 0; i < navLinks.length; i++) {
            var link = navLinks[i];
            link.classList.remove('active');
            var href = link.getAttribute('href');
            if (href && href.substring(1) === current) {
                link.classList.add('active');
            }
        }
    };

    DigitalMagazine.prototype.toggleMobileMenu = function() {
        if (this.navToggle && this.navMenu) {
            this.navToggle.classList.toggle('active');
            this.navMenu.classList.toggle('mobile-active');
        }
    };

    DigitalMagazine.prototype.closeMobileMenu = function() {
        if (this.navToggle && this.navMenu) {
            this.navToggle.classList.remove('active');
            this.navMenu.classList.remove('mobile-active');
        }
    };

    DigitalMagazine.prototype.handleOutsideClick = function(e) {
        if (this.navToggle && this.navMenu) {
            var target = e.target || e.srcElement;
            if (!this.isDescendant(this.navToggle, target) && 
                !this.isDescendant(this.navMenu, target)) {
                this.closeMobileMenu();
            }
        }
    };

    DigitalMagazine.prototype.handleAnchorClick = function(e) {
        e.preventDefault();
        var target = e.currentTarget || e.srcElement;
        var targetId = target.getAttribute('href');
        var targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            this.smoothScrollToElement(targetElement, targetId);
            this.highlightTarget(targetElement);
        }
    };

    DigitalMagazine.prototype.smoothScrollToElement = function(target, targetId) {
        var self = this;
        var offsetTop;
        
        // Manejo especial para elementos anidados
        if (targetId === '#articulo2' || targetId === '#libro2') {
            offsetTop = this.getElementTop(target) - 160;
        } else {
            offsetTop = this.getElementTop(target) - 120;
        }
        
        offsetTop = Math.max(0, offsetTop);
        
        // Usar scroll nativo suave si está soportado
        if (this.supportsNativeSmoothScroll()) {
            window.scrollTo({
                top: offsetTop,
                left: 0,
                behavior: 'smooth'
            });
        } else {
            // Fallback para navegadores antiguos
            this.animateScrollTo(offsetTop, 800);
        }
        
        // Mecanismo de fallback
        setTimeout(function() {
            var currentScroll = self.getScrollTop();
            
            if (Math.abs(currentScroll - offsetTop) > 50) {
                window.scrollTo(0, offsetTop);
                
                // Fallback final usando scrollIntoView
                setTimeout(function() {
                    var finalScroll = self.getScrollTop();
                    if (Math.abs(finalScroll - offsetTop) > 50) {
                        if (target.scrollIntoView) {
                            target.scrollIntoView();
                        }
                    }
                }, 100);
            }
        }, 800);
    };

    DigitalMagazine.prototype.supportsNativeSmoothScroll = function() {
        return 'scrollBehavior' in document.documentElement.style;
    };

    DigitalMagazine.prototype.animateScrollTo = function(to, duration) {
        var start = this.getScrollTop();
        var change = to - start;
        var currentTime = 0;
        var increment = 20;
        var self = this;
        
        function animateScroll() {
            currentTime += increment;
            var val = self.easeInOutQuad(currentTime, start, change, duration);
            window.scrollTo(0, val);
            if (currentTime < duration) {
                setTimeout(animateScroll, increment);
            }
        }
        animateScroll();
    };

    DigitalMagazine.prototype.smoothScrollBy = function(amount) {
        var currentScroll = this.getScrollTop();
        var targetScroll = currentScroll + amount;
        this.animateScrollTo(targetScroll, 300);
    };

    DigitalMagazine.prototype.easeInOutQuad = function(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    };

    DigitalMagazine.prototype.highlightTarget = function(target) {
        var self = this;
        if (!target || !target.style) return;
        
        target.style.transition = 'all 0.5s ease';
        target.style.backgroundColor = 'rgba(59, 130, 246, 0.08)';
        target.style.transform = 'scale(1.005)';
        target.style.boxShadow = '0 8px 32px rgba(59, 130, 246, 0.2)';
        
        setTimeout(function() {
            if (target.style) {
                target.style.backgroundColor = '';
                target.style.transform = '';
                target.style.boxShadow = '';
            }
        }, 1500);
    };

    DigitalMagazine.prototype.scrollToTop = function() {
        if (this.supportsNativeSmoothScroll()) {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } else {
            this.animateScrollTo(0, 800);
        }
    };

    DigitalMagazine.prototype.handleResize = function() {
        // Cerrar menú móvil en redimensionamiento
        this.closeMobileMenu();
        
        // Redetectar capacidades del dispositivo
        this.detectCapabilities();
        
        // Reoptimizar para el dispositivo
        this.optimizeForDevice();
    };

    DigitalMagazine.prototype.handleKeydown = function(e) {
        var keyCode = e.keyCode || e.which;
        
        // ESC cierra el menú móvil
        if (keyCode === 27) {
            this.closeMobileMenu();
        }
        
        // Navegación por teclado
        if (keyCode === 38) { // Flecha arriba
            e.preventDefault();
            this.smoothScrollBy(-100);
        } else if (keyCode === 40) { // Flecha abajo
            e.preventDefault();
            this.smoothScrollBy(100);
        }
    };

    DigitalMagazine.prototype.initializeAnimations = function() {
        if (this.supportsIntersectionObserver && !this.isSuperSmall) {
            this.setupIntersectionObserver();
        } else {
            this.setupScrollBasedAnimations();
        }
    };

    DigitalMagazine.prototype.setupIntersectionObserver = function() {
        var self = this;
        var observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -10% 0px'
        };

        this.intersectionObserver = new IntersectionObserver(function(entries) {
            for (var i = 0; i < entries.length; i++) {
                var entry = entries[i];
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            }
        }, observerOptions);

        var fadeElements = this.getAllElements('.fade-in');
        for (var i = 0; i < fadeElements.length; i++) {
            this.intersectionObserver.observe(fadeElements[i]);
        }
    };

    DigitalMagazine.prototype.setupScrollBasedAnimations = function() {
        var self = this;
        var fadeElements = this.getAllElements('.fade-in');
        
        function checkFadeElements() {
            var windowHeight = window.innerHeight || document.documentElement.clientHeight;
            var scrollTop = self.getScrollTop();
            
            for (var i = 0; i < fadeElements.length; i++) {
                var element = fadeElements[i];
                var elementTop = self.getElementTop(element);
                
                if (elementTop < scrollTop + windowHeight - 100) {
                    element.classList.add('visible');
                }
            }
        }
        
        this.addScrollListener(checkFadeElements);
        checkFadeElements(); // Verificar en carga
    };

    DigitalMagazine.prototype.preloadCriticalImages = function() {
        if (this.isSuperSmall) return; // Evitar preload en dispositivos muy pequeños
        
        var criticalImages = [
            'https://images.pexels.com/photos/5380650/pexels-photo-5380650.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'
        ];

        for (var i = 0; i < criticalImages.length; i++) {
            var img = new Image();
            img.src = criticalImages[i];
        }
    };

    DigitalMagazine.prototype.hideLoadingScreen = function() {
        var self = this;
        if (this.loadingScreen) {
            setTimeout(function() {
                self.loadingScreen.classList.add('hidden');
                setTimeout(function() {
                    if (self.loadingScreen && self.loadingScreen.parentNode) {
                        self.loadingScreen.parentNode.removeChild(self.loadingScreen);
                    }
                }, 500);
            }, 1000);
        }
    };

    DigitalMagazine.prototype.markAsLoaded = function() {
        var self = this;
        setTimeout(function() {
            document.body.classList.add('loaded');
            self.isLoaded = true;
        }, 100);
    };

    DigitalMagazine.prototype.optimizeForDevice = function() {
        // Optimizaciones específicas para dispositivos súper pequeños
        if (this.isSuperSmall) {
            // Reducir throttling para mejor respuesta
            this.scrollThrottle = 32;
            
            // Simplificar animaciones
            var style = document.createElement('style');
            style.textContent = `
                .ad-section::before,
                .hero::before,
                .ad-icon {
                    animation: none !important;
                }
                .card:hover {
                    transform: none !important;
                }
                .stat-card:hover {
                    transform: translateY(-2px) !important;
                }
            `;
            document.head.appendChild(style);
            
            // Deshabilitar intersection observer en dispositivos muy pequeños
            if (this.intersectionObserver) {
                this.intersectionObserver.disconnect();
                this.setupScrollBasedAnimations();
            }
        }
        
        // Optimizaciones para móviles
        if (this.isMobile) {
            // Reducir frecuencia de scroll
            this.scrollThrottle = 32;
            
            // Optimizar imágenes para móvil
            var images = this.getAllElements('img');
            for (var i = 0; i < images.length; i++) {
                var img = images[i];
                if (img.src && img.src.includes('pexels.com')) {
                    img.src = img.src.replace(/w=\d+/, 'w=600').replace(/h=\d+/, 'h=400');
                }
            }
        }
    };

    // Funciones de utilidad
    DigitalMagazine.prototype.getAllElements = function(selector) {
        var elements = document.querySelectorAll(selector);
        return Array.from ? Array.from(elements) : this.nodeListToArray(elements);
    };

    DigitalMagazine.prototype.nodeListToArray = function(nodeList) {
        var array = [];
        for (var i = 0; i < nodeList.length; i++) {
            array.push(nodeList[i]);
        }
        return array;
    };

    DigitalMagazine.prototype.getElementTop = function(element) {
        var offsetTop = 0;
        do {
            if (!isNaN(element.offsetTop)) {
                offsetTop += element.offsetTop;
            }
        } while (element = element.offsetParent);
        return offsetTop;
    };

    DigitalMagazine.prototype.getScrollTop = function() {
        return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    };

    DigitalMagazine.prototype.isDescendant = function(parent, child) {
        if (!parent || !child) return false;
        var node = child.parentNode;
        while (node != null) {
            if (node === parent) {
                return true;
            }
            node = node.parentNode;
        }
        return false;
    };

    DigitalMagazine.prototype.requestAnimFrame = function(callback) {
        if (this.supportsRequestAnimationFrame) {
            return (window.requestAnimationFrame || 
                   window.webkitRequestAnimationFrame || 
                   window.mozRequestAnimationFrame)(callback);
        } else {
            return setTimeout(callback, 16);
        }
    };

    DigitalMagazine.prototype.debounce = function(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };

    // Inicializar la aplicación
    var magazine;
    
    try {
        magazine = new DigitalMagazine();
    } catch (error) {
        console.error('Error initializing magazine:', error);
        
        // Fallback de emergencia
        setTimeout(function() {
            var loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
            }
            document.body.classList.add('loaded');
            
            var errorBoundary = document.getElementById('errorBoundary');
            if (errorBoundary) {
                errorBoundary.classList.remove('hidden');
            }
        }, 2000);
    }

    // Exportar para uso potencial como módulo
    if (typeof window !== 'undefined') {
        window.DigitalMagazine = DigitalMagazine;
        window.magazineInstance = magazine;
    }

    // Fallback para JavaScript deshabilitado
    document.documentElement.className = document.documentElement.className.replace('no-js', 'js');

})();