// SCROLL ULTRA-FLUIDO OPTIMIZADO ESPECÍFICAMENTE PARA MÓVILES
(function() {
    'use strict';

    // Polyfills esenciales para compatibilidad móvil
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

    // Configuración ultra-optimizada para móviles
    var MOBILE_CONFIG = {
        // Throttling ultra-agresivo para máxima fluidez en móviles
        scrollThrottle: 4,          // ~240fps para ultra-fluidez
        touchThrottle: 8,           // ~120fps para touch events
        resizeThrottle: 100,        // Responsive para orientación
        animationDuration: 600,     // Más rápido en móviles
        
        // Configuraciones específicas por tipo de dispositivo
        highEnd: {
            scrollThrottle: 4,      // Dispositivos potentes
            animationDuration: 600,
            enableParallax: false,  // Deshabilitado en móviles
            enableComplexAnimations: true
        },
        
        midRange: {
            scrollThrottle: 8,      // Dispositivos medios
            animationDuration: 400,
            enableParallax: false,
            enableComplexAnimations: true
        },
        
        lowEnd: {
            scrollThrottle: 16,     // Dispositivos básicos
            animationDuration: 300,
            enableParallax: false,
            enableComplexAnimations: false
        }
    };

    // Clase principal optimizada para scroll ultra-fluido en móviles
    function MobileFluidScroll() {
        this.isLoaded = false;
        this.navbar = null;
        this.scrollTopBtn = null;
        this.navToggle = null;
        this.navMenu = null;
        this.loadingScreen = null;
        this.errorBoundary = null;
        this.mainContent = null;
        
        // Variables de scroll optimizadas para móviles
        this.ticking = false;
        this.scrollPosition = 0;
        this.lastScrollPosition = 0;
        this.scrollVelocity = 0;
        this.scrollDirection = 0;
        this.isScrolling = false;
        this.lastScrollTime = 0;
        this.animationId = null;
        
        // Variables de touch optimizadas
        this.touchStartY = 0;
        this.touchEndY = 0;
        this.touchStartTime = 0;
        this.touchVelocity = 0;
        this.isDragging = false;
        this.momentumScrolling = false;
        
        // Detección de dispositivo y capacidades
        this.isMobile = false;
        this.isIOS = false;
        this.isAndroid = false;
        this.deviceTier = 'highEnd';
        this.supportsPassiveEvents = false;
        this.supportsIntersectionObserver = false;
        this.supportsRequestAnimationFrame = false;
        this.config = MOBILE_CONFIG;

        this.init();
    }

    MobileFluidScroll.prototype.init = function() {
        var self = this;
        
        // Detección inmediata de capacidades móviles
        this.detectMobileCapabilities();
        
        // Optimizaciones inmediatas para scroll móvil
        this.optimizeMobileScrollPerformance();
        
        // Configurar según el tier del dispositivo
        this.configureMobileSettings();
        
        // Manejo de errores optimizado para móviles
        this.setupMobileErrorHandling();
        
        // Inicialización cuando el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                self.start();
            });
        } else {
            setTimeout(function() {
                self.start();
            }, 10);
        }
    };

    MobileFluidScroll.prototype.detectMobileCapabilities = function() {
        var userAgent = navigator.userAgent || navigator.vendor || window.opera;
        
        // Detección precisa de dispositivos móviles
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) ||
                       window.innerWidth <= 768 ||
                       ('ontouchstart' in window) ||
                       (navigator.maxTouchPoints > 0);
        
        this.isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
        this.isAndroid = /Android/.test(userAgent);
        
        // Detección de tier del dispositivo basado en capacidades
        this.detectDeviceTier();
        
        // Detección de soporte para eventos pasivos
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

        // Otras detecciones de capacidades
        this.supportsIntersectionObserver = 'IntersectionObserver' in window;
        this.supportsRequestAnimationFrame = !!(window.requestAnimationFrame || 
                                                window.webkitRequestAnimationFrame || 
                                                window.mozRequestAnimationFrame);
    };

    MobileFluidScroll.prototype.detectDeviceTier = function() {
        var memory = navigator.deviceMemory || 4; // Default 4GB
        var cores = navigator.hardwareConcurrency || 4; // Default 4 cores
        var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        var effectiveType = connection ? connection.effectiveType : '4g';
        
        // Algoritmo de clasificación de dispositivos
        var score = 0;
        
        // Memoria RAM
        if (memory >= 8) score += 3;
        else if (memory >= 4) score += 2;
        else if (memory >= 2) score += 1;
        
        // Núcleos del procesador
        if (cores >= 8) score += 3;
        else if (cores >= 4) score += 2;
        else if (cores >= 2) score += 1;
        
        // Conexión de red
        if (effectiveType === '4g') score += 2;
        else if (effectiveType === '3g') score += 1;
        
        // Resolución de pantalla (indicador de capacidad gráfica)
        var pixelRatio = window.devicePixelRatio || 1;
        var screenArea = window.screen.width * window.screen.height * pixelRatio;
        if (screenArea > 2000000) score += 2; // Pantallas de alta resolución
        else if (screenArea > 1000000) score += 1;
        
        // Clasificación final
        if (score >= 8) {
            this.deviceTier = 'highEnd';
        } else if (score >= 5) {
            this.deviceTier = 'midRange';
        } else {
            this.deviceTier = 'lowEnd';
        }
        
        console.log('Device tier detected:', this.deviceTier, 'Score:', score);
    };

    MobileFluidScroll.prototype.optimizeMobileScrollPerformance = function() {
        // Configuraciones críticas para scroll ultra-fluido en móviles
        document.documentElement.style.webkitOverflowScrolling = 'touch';
        document.documentElement.style.overscrollBehavior = 'contain';
        document.documentElement.style.overscrollBehaviorY = 'contain';
        document.documentElement.style.scrollBehavior = 'smooth';
        
        // Aceleración por hardware global
        document.documentElement.style.webkitTransform = 'translateZ(0)';
        document.documentElement.style.transform = 'translateZ(0)';
        document.documentElement.style.willChange = 'scroll-position';
        
        // Optimizaciones específicas para el body
        document.body.style.webkitOverflowScrolling = 'touch';
        document.body.style.overscrollBehaviorY = 'contain';
        document.body.style.touchAction = 'pan-y';
        document.body.style.webkitTransform = 'translateZ(0)';
        document.body.style.transform = 'translateZ(0)';
        document.body.style.willChange = 'transform';
        
        // Optimizaciones específicas para iOS
        if (this.isIOS) {
            document.body.style.webkitOverflowScrolling = 'touch';
            document.body.style.webkitBackfaceVisibility = 'hidden';
            document.body.style.webkitPerspective = '1000';
        }
        
        // Optimizaciones específicas para Android
        if (this.isAndroid) {
            document.body.style.overflowX = 'hidden';
            document.body.style.overscrollBehavior = 'contain';
        }
    };

    MobileFluidScroll.prototype.configureMobileSettings = function() {
        // Configurar según el tier del dispositivo
        var tierConfig = this.config[this.deviceTier];
        if (tierConfig) {
            this.config = Object.assign({}, this.config, tierConfig);
        }
        
        console.log('Mobile config applied:', this.config);
    };

    MobileFluidScroll.prototype.setupMobileErrorHandling = function() {
        var self = this;

        window.onerror = function(msg, url, lineNo, columnNo, error) {
            console.error('Mobile Error:', msg, 'at', url, ':', lineNo);
            self.showErrorFallback();
            return false;
        };

        if (window.addEventListener) {
            window.addEventListener('unhandledrejection', function(event) {
                console.error('Mobile Promise rejection:', event.reason);
                self.showErrorFallback();
            });
        }

        // Timeout más corto para móviles
        setTimeout(function() {
            self.hideLoadingScreen();
        }, 3000);
    };

    MobileFluidScroll.prototype.showErrorFallback = function() {
        if (this.errorBoundary) {
            this.errorBoundary.classList.remove('hidden');
        }
        if (this.loadingScreen) {
            this.loadingScreen.classList.add('hidden');
        }
    };

    MobileFluidScroll.prototype.start = function() {
        try {
            this.bindElements();
            this.setupMobileEventListeners();
            this.initializeMobileScrollSystem();
            this.preloadCriticalImages();
            this.initializeMobileAnimations();
            this.hideLoadingScreen();
            this.markAsLoaded();
            this.optimizeForMobileDevice();
        } catch (error) {
            console.error('Error starting mobile application:', error);
            this.showErrorFallback();
        }
    };

    MobileFluidScroll.prototype.bindElements = function() {
        this.navbar = document.getElementById('navbar');
        this.scrollTopBtn = document.getElementById('scrollTopBtn');
        this.navToggle = document.getElementById('navToggle');
        this.navMenu = document.getElementById('navMenu');
        this.loadingScreen = document.getElementById('loadingScreen');
        this.errorBoundary = document.getElementById('errorBoundary');
        this.mainContent = document.getElementById('mainContent');
    };

    MobileFluidScroll.prototype.initializeMobileScrollSystem = function() {
        var self = this;
        
        // Sistema de scroll ultra-optimizado para móviles
        this.setupUltraFluidMobileScrollListener();
        
        // Sistema de velocidad y momentum
        this.setupMobileVelocityTracking();
        
        // Scroll suave mejorado para móviles
        this.initializeEnhancedMobileScrolling();
    };

    MobileFluidScroll.prototype.setupUltraFluidMobileScrollListener = function() {
        var self = this;
        var isScrolling = false;
        var scrollTimeout;

        function ultraFluidMobileScrollHandler() {
            var now = performance.now();
            
            // Calcular velocidad de scroll ultra-precisa
            var currentPosition = self.getScrollTop();
            self.scrollVelocity = Math.abs(currentPosition - self.lastScrollPosition);
            self.scrollDirection = currentPosition > self.lastScrollPosition ? 1 : -1;
            self.lastScrollPosition = currentPosition;

            // Throttling ultra-agresivo para máxima fluidez en móviles
            if (now - self.lastScrollTime < self.config.scrollThrottle) {
                return;
            }
            self.lastScrollTime = now;

            self.isScrolling = true;
            
            clearTimeout(scrollTimeout);
            
            // Usar RAF para máxima fluidez
            if (!isScrolling) {
                self.requestAnimFrame(function() {
                    self.handleUltraFluidMobileScroll();
                    isScrolling = false;
                });
                isScrolling = true;
            }
            
            // Detectar fin de scroll más rápido en móviles
            scrollTimeout = setTimeout(function() {
                self.isScrolling = false;
                self.scrollVelocity = 0;
                self.onMobileScrollEnd();
            }, 100);
        }

        // Event listener ultra-optimizado para móviles
        var eventOptions = this.supportsPassiveEvents ? { passive: true } : false;
        
        if (window.addEventListener) {
            window.addEventListener('scroll', ultraFluidMobileScrollHandler, eventOptions);
        } else if (window.attachEvent) {
            window.attachEvent('onscroll', ultraFluidMobileScrollHandler);
        }
    };

    MobileFluidScroll.prototype.setupMobileVelocityTracking = function() {
        var self = this;
        var velocityBuffer = [];
        var bufferSize = 3; // Más pequeño para móviles

        this.updateMobileVelocity = function() {
            velocityBuffer.push(self.scrollVelocity);
            if (velocityBuffer.length > bufferSize) {
                velocityBuffer.shift();
            }
            
            var avgVelocity = velocityBuffer.reduce(function(a, b) { return a + b; }, 0) / velocityBuffer.length;
            self.smoothVelocity = avgVelocity;
        };
    };

    MobileFluidScroll.prototype.initializeEnhancedMobileScrolling = function() {
        var self = this;
        
        // Override del comportamiento de scroll para móviles
        var anchorLinks = this.getAllElements('a[href^="#"]');
        for (var i = 0; i < anchorLinks.length; i++) {
            this.addClickListener(anchorLinks[i], function(e) {
                e.preventDefault();
                self.handleEnhancedMobileAnchorClick(e);
            });
        }
    };

    MobileFluidScroll.prototype.handleEnhancedMobileAnchorClick = function(e) {
        var target = e.currentTarget || e.srcElement;
        var targetId = target.getAttribute('href');
        var targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            this.ultraFluidMobileScrollToElement(targetElement, targetId);
            this.highlightMobileTarget(targetElement);
        }
    };

    MobileFluidScroll.prototype.ultraFluidMobileScrollToElement = function(target, targetId) {
        var self = this;
        var offsetTop;
        
        // Cancelar cualquier animación activa
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // Calcular offset optimizado para móviles
        if (targetId === '#articulo2' || targetId === '#libro2') {
            offsetTop = this.getElementTop(target) - 100; // Menos offset en móviles
        } else {
            offsetTop = this.getElementTop(target) - 80;
        }
        
        offsetTop = Math.max(0, offsetTop);
        
        // Usar scroll nativo suave si está disponible y es confiable en móviles
        if (this.supportsNativeSmoothScroll() && this.deviceTier !== 'lowEnd') {
            this.momentumScrolling = true;
            window.scrollTo({
                top: offsetTop,
                left: 0,
                behavior: 'smooth'
            });
            
            this.monitorMobileScrollCompletion(offsetTop);
        } else {
            // Sistema de scroll ultra-fluido personalizado para móviles
            this.animateUltraFluidMobileScrollTo(offsetTop, this.config.animationDuration);
        }
    };

    MobileFluidScroll.prototype.monitorMobileScrollCompletion = function(targetPosition) {
        var self = this;
        var checkInterval = 16; // 60fps
        var tolerance = 3; // Más preciso en móviles
        var maxChecks = 100; // Menos tiempo máximo
        var checks = 0;
        
        function checkPosition() {
            checks++;
            var currentPosition = self.getScrollTop();
            
            if (Math.abs(currentPosition - targetPosition) <= tolerance || checks >= maxChecks) {
                self.momentumScrolling = false;
                return;
            }
            
            setTimeout(checkPosition, checkInterval);
        }
        
        checkPosition();
    };

    MobileFluidScroll.prototype.animateUltraFluidMobileScrollTo = function(to, duration) {
        var self = this;
        var start = this.getScrollTop();
        var change = to - start;
        var startTime = performance.now();
        
        this.momentumScrolling = true;

        function animateFrame(currentTime) {
            var elapsed = currentTime - startTime;
            var progress = Math.min(elapsed / duration, 1);
            
            // Easing ultra-suave optimizado para móviles
            var easedProgress = self.mobileEaseInOutCubic(progress);
            var currentPosition = start + (change * easedProgress);
            
            window.scrollTo(0, currentPosition);
            
            if (progress < 1) {
                self.animationId = self.requestAnimFrame(animateFrame);
            } else {
                self.momentumScrolling = false;
                self.animationId = null;
            }
        }
        
        this.animationId = this.requestAnimFrame(animateFrame);
    };

    MobileFluidScroll.prototype.setupMobileEventListeners = function() {
        var self = this;

        // Eventos de scroll ya configurados en initializeMobileScrollSystem

        // Menú móvil optimizado
        if (this.navToggle && this.navMenu) {
            this.addClickListener(this.navToggle, function(e) {
                e.preventDefault();
                self.toggleMobileMenu();
            });

            var navLinks = this.getAllElements('.nav-menu a');
            for (var i = 0; i < navLinks.length; i++) {
                this.addClickListener(navLinks[i], function() {
                    self.closeMobileMenu();
                });
            }

            this.addClickListener(document, function(e) {
                self.handleOutsideClick(e);
            });
        }

        // Botón scroll to top optimizado para móviles
        if (this.scrollTopBtn) {
            this.addClickListener(this.scrollTopBtn, function(e) {
                e.preventDefault();
                self.ultraFluidMobileScrollToTop();
            });
        }

        // Eventos de redimensionamiento optimizados para móviles
        this.addMobileResizeListener(function() {
            self.handleMobileResize();
        });

        // Navegación por teclado (para dispositivos con teclado físico)
        this.addKeyListener(function(e) {
            self.handleMobileKeydown(e);
        });

        // Eventos táctiles ultra-optimizados
        this.setupUltraFluidMobileTouchEvents();

        // Eventos de visibilidad optimizados para móviles
        this.setupMobileVisibilityEvents();
    };

    MobileFluidScroll.prototype.setupUltraFluidMobileTouchEvents = function() {
        var self = this;
        var touchMoving = false;
        var lastTouchY = 0;
        var touchVelocityBuffer = [];

        if (!this.mainContent) return;

        var eventOptions = this.supportsPassiveEvents ? { passive: true } : false;

        if (this.mainContent.addEventListener) {
            // Touch start ultra-optimizado
            this.mainContent.addEventListener('touchstart', function(e) {
                self.touchStartY = e.touches[0].clientY;
                self.touchStartTime = performance.now();
                lastTouchY = self.touchStartY;
                touchMoving = false;
                touchVelocityBuffer = [];
                self.isDragging = true;
            }, eventOptions);

            // Touch move ultra-optimizado con throttling
            var lastTouchMoveTime = 0;
            this.mainContent.addEventListener('touchmove', function(e) {
                var now = performance.now();
                
                // Throttling para touch move
                if (now - lastTouchMoveTime < self.config.touchThrottle) {
                    return;
                }
                lastTouchMoveTime = now;
                
                if (!touchMoving) {
                    touchMoving = true;
                }
                
                var currentY = e.touches[0].clientY;
                var deltaY = lastTouchY - currentY;
                var deltaTime = now - self.touchStartTime;
                
                // Calcular velocidad táctil instantánea
                var instantVelocity = Math.abs(deltaY) / Math.max(deltaTime, 1);
                touchVelocityBuffer.push(instantVelocity);
                
                // Mantener buffer pequeño para responsividad
                if (touchVelocityBuffer.length > 5) {
                    touchVelocityBuffer.shift();
                }
                
                // Calcular velocidad promedio
                self.touchVelocity = touchVelocityBuffer.reduce(function(a, b) { return a + b; }, 0) / touchVelocityBuffer.length;
                
                lastTouchY = currentY;
            }, eventOptions);

            // Touch end ultra-optimizado
            this.mainContent.addEventListener('touchend', function(e) {
                self.touchEndY = e.changedTouches[0].clientY;
                self.isDragging = false;
                
                // Solo procesar swipe si hay velocidad significativa
                if (self.touchVelocity > 0.1) {
                    self.handleUltraFluidMobileSwipe();
                }
                
                // Limpiar variables
                touchVelocityBuffer = [];
                self.touchVelocity = 0;
            }, eventOptions);

            // Touch cancel
            this.mainContent.addEventListener('touchcancel', function(e) {
                self.isDragging = false;
                touchVelocityBuffer = [];
                self.touchVelocity = 0;
            }, eventOptions);
        }
    };

    MobileFluidScroll.prototype.handleUltraFluidMobileSwipe = function() {
        var swipeThreshold = 20; // Más sensible en móviles
        var velocityThreshold = 0.2; // Más sensible
        var diff = this.touchStartY - this.touchEndY;

        if (Math.abs(diff) > swipeThreshold || this.touchVelocity > velocityThreshold) {
            // Calcular scroll amount basado en velocidad y distancia
            var baseScrollAmount = Math.min(Math.abs(diff) * 1.5, 200);
            var velocityMultiplier = Math.min(this.touchVelocity * 100, 300);
            var scrollAmount = Math.max(baseScrollAmount, velocityMultiplier);
            
            if (diff > 0) {
                // Swipe up - scroll down
                this.ultraFluidMobileScrollBy(scrollAmount);
            } else {
                // Swipe down - scroll up
                this.ultraFluidMobileScrollBy(-scrollAmount);
            }
        }
    };

    MobileFluidScroll.prototype.handleUltraFluidMobileScroll = function() {
        this.scrollPosition = this.getScrollTop();
        
        // Actualizar velocidad móvil
        if (this.updateMobileVelocity) {
            this.updateMobileVelocity();
        }
        
        if (!this.ticking) {
            var self = this;
            this.requestAnimFrame(function() {
                self.updateMobileNavbarState();
                self.updateMobileScrollTopButton();
                self.updateMobileActiveNavigation();
                self.applyMobileScrollEffects();
                self.ticking = false;
            });
            this.ticking = true;
        }
    };

    MobileFluidScroll.prototype.applyMobileScrollEffects = function() {
        // Efectos optimizados para móviles basados en velocidad
        if (this.smoothVelocity > 5) {
            document.body.classList.add('mobile-fast-scrolling');
        } else {
            document.body.classList.remove('mobile-fast-scrolling');
        }
        
        // No aplicar paralaje en móviles para mejor rendimiento
    };

    MobileFluidScroll.prototype.onMobileScrollEnd = function() {
        // Limpiar efectos cuando termina el scroll
        document.body.classList.remove('mobile-fast-scrolling');
    };

    MobileFluidScroll.prototype.ultraFluidMobileScrollBy = function(amount) {
        var currentScroll = this.getScrollTop();
        var targetScroll = Math.max(0, currentScroll + amount);
        
        this.animateUltraFluidMobileScrollTo(targetScroll, 
            Math.min(this.config.animationDuration, 400));
    };

    MobileFluidScroll.prototype.ultraFluidMobileScrollToTop = function() {
        this.animateUltraFluidMobileScrollTo(0, this.config.animationDuration);
    };

    MobileFluidScroll.prototype.updateMobileNavbarState = function() {
        if (this.navbar) {
            if (this.scrollPosition > 50) { // Más sensible en móviles
                this.navbar.classList.add('scrolled');
            } else {
                this.navbar.classList.remove('scrolled');
            }
        }
    };

    MobileFluidScroll.prototype.updateMobileScrollTopButton = function() {
        if (this.scrollTopBtn) {
            if (this.scrollPosition > 200) { // Más alto en móviles
                this.scrollTopBtn.classList.add('visible');
            } else {
                this.scrollTopBtn.classList.remove('visible');
            }
        }
    };

    MobileFluidScroll.prototype.updateMobileActiveNavigation = function() {
        var sections = this.getAllElements('section[id], .card[id]');
        var navLinks = this.getAllElements('.nav-menu a[href^="#"]');
        
        var current = '';
        var scrollPosition = this.scrollPosition + 150; // Ajustado para móviles
        
        for (var i = 0; i < sections.length; i++) {
            var section = sections[i];
            var sectionTop = this.getElementTop(section);
            var sectionHeight = section.offsetHeight || section.clientHeight;
            var sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = sectionId;
                
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

    MobileFluidScroll.prototype.toggleMobileMenu = function() {
        if (this.navToggle && this.navMenu) {
            this.navToggle.classList.toggle('active');
            this.navMenu.classList.toggle('mobile-active');
        }
    };

    MobileFluidScroll.prototype.closeMobileMenu = function() {
        if (this.navToggle && this.navMenu) {
            this.navToggle.classList.remove('active');
            this.navMenu.classList.remove('mobile-active');
        }
    };

    MobileFluidScroll.prototype.handleOutsideClick = function(e) {
        if (this.navToggle && this.navMenu) {
            var target = e.target || e.srcElement;
            if (!this.isDescendant(this.navToggle, target) && 
                !this.isDescendant(this.navMenu, target)) {
                this.closeMobileMenu();
            }
        }
    };

    MobileFluidScroll.prototype.highlightMobileTarget = function(target) {
        var self = this;
        if (!target || !target.style) return;
        
        target.style.transition = 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)';
        target.style.backgroundColor = 'rgba(59, 130, 246, 0.06)';
        target.style.transform = 'scale(1.002)';
        target.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.15)';
        
        setTimeout(function() {
            if (target.style) {
                target.style.backgroundColor = '';
                target.style.transform = '';
                target.style.boxShadow = '';
            }
        }, 1200);
    };

    MobileFluidScroll.prototype.addMobileResizeListener = function(callback) {
        var self = this;
        var resizeTimer;

        function mobileResizeHandler() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                callback();
            }, self.config.resizeThrottle);
        }

        if (window.addEventListener) {
            window.addEventListener('resize', mobileResizeHandler, false);
            window.addEventListener('orientationchange', mobileResizeHandler, false);
        } else if (window.attachEvent) {
            window.attachEvent('onresize', mobileResizeHandler);
        }
    };

    MobileFluidScroll.prototype.handleMobileResize = function() {
        this.closeMobileMenu();
        this.detectMobileCapabilities();
        this.configureMobileSettings();
        this.optimizeMobileScrollPerformance();
    };

    MobileFluidScroll.prototype.handleMobileKeydown = function(e) {
        var keyCode = e.keyCode || e.which;
        
        if (keyCode === 27) { // ESC
            this.closeMobileMenu();
        }
        
        // Navegación por teclado optimizada para móviles
        if (keyCode === 38) { // Flecha arriba
            e.preventDefault();
            this.ultraFluidMobileScrollBy(-80);
        } else if (keyCode === 40) { // Flecha abajo
            e.preventDefault();
            this.ultraFluidMobileScrollBy(80);
        }
    };

    MobileFluidScroll.prototype.initializeMobileAnimations = function() {
        if (this.supportsIntersectionObserver && this.deviceTier !== 'lowEnd') {
            this.setupMobileIntersectionObserver();
        } else {
            this.setupMobileScrollBasedAnimations();
        }
    };

    MobileFluidScroll.prototype.setupMobileIntersectionObserver = function() {
        var self = this;
        var observerOptions = {
            threshold: 0.05, // Más sensible en móviles
            rootMargin: '0px 0px -5% 0px'
        };

        this.intersectionObserver = new IntersectionObserver(function(entries) {
            for (var i = 0; i < entries.length; i++) {
                var entry = entries[i];
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Dejar de observar para mejor rendimiento
                    self.intersectionObserver.unobserve(entry.target);
                }
            }
        }, observerOptions);

        var fadeElements = this.getAllElements('.fade-in');
        for (var i = 0; i < fadeElements.length; i++) {
            this.intersectionObserver.observe(fadeElements[i]);
        }
    };

    MobileFluidScroll.prototype.setupMobileScrollBasedAnimations = function() {
        var self = this;
        var fadeElements = this.getAllElements('.fade-in');
        
        function checkMobileFadeElements() {
            var windowHeight = window.innerHeight || document.documentElement.clientHeight;
            var scrollTop = self.getScrollTop();
            
            for (var i = 0; i < fadeElements.length; i++) {
                var element = fadeElements[i];
                if (!element.classList.contains('visible')) {
                    var elementTop = self.getElementTop(element);
                    
                    if (elementTop < scrollTop + windowHeight - 50) { // Más sensible en móviles
                        element.classList.add('visible');
                    }
                }
            }
        }
        
        this.checkMobileFadeElements = checkMobileFadeElements;
        checkMobileFadeElements();
    };

    MobileFluidScroll.prototype.preloadCriticalImages = function() {
        // Solo preload en dispositivos de gama alta
        if (this.deviceTier === 'lowEnd') return;
        
        var criticalImages = [
            'https://images.pexels.com/photos/5380650/pexels-photo-5380650.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1'
        ];

        for (var i = 0; i < criticalImages.length; i++) {
            var img = new Image();
            img.src = criticalImages[i];
        }
    };

    MobileFluidScroll.prototype.hideLoadingScreen = function() {
        var self = this;
        if (this.loadingScreen) {
            setTimeout(function() {
                self.loadingScreen.classList.add('hidden');
                setTimeout(function() {
                    if (self.loadingScreen && self.loadingScreen.parentNode) {
                        self.loadingScreen.parentNode.removeChild(self.loadingScreen);
                    }
                }, 300);
            }, 500); // Más rápido en móviles
        }
    };

    MobileFluidScroll.prototype.markAsLoaded = function() {
        var self = this;
        setTimeout(function() {
            document.body.classList.add('loaded');
            self.isLoaded = true;
        }, 50);
    };

    MobileFluidScroll.prototype.optimizeForMobileDevice = function() {
        // Optimizaciones específicas por tier de dispositivo
        if (this.deviceTier === 'lowEnd') {
            // Simplificar para dispositivos de gama baja
            var style = document.createElement('style');
            style.textContent = `
                .ad-section::before,
                .hero::before,
                .ad-icon {
                    animation: none !important;
                }
                .card:hover,
                .stat-card:hover,
                .index-item:hover {
                    transform: none !important;
                }
                * {
                    transition-duration: 0.2s !important;
                }
            `;
            document.head.appendChild(style);
            
            // Deshabilitar intersection observer
            if (this.intersectionObserver) {
                this.intersectionObserver.disconnect();
                this.setupMobileScrollBasedAnimations();
            }
        }
        
        // Optimizar imágenes para móviles
        var images = this.getAllElements('img');
        for (var i = 0; i < images.length; i++) {
            var img = images[i];
            if (img.src && img.src.includes('pexels.com')) {
                img.src = img.src.replace(/w=\d+/, 'w=600').replace(/h=\d+/, 'h=400');
            }
        }
    };

    MobileFluidScroll.prototype.setupMobileVisibilityEvents = function() {
        var self = this;

        if (document.addEventListener) {
            document.addEventListener('visibilitychange', function() {
                if (document.hidden) {
                    document.body.classList.add('mobile-page-hidden');
                    // Pausar animaciones cuando no es visible
                    if (self.animationId) {
                        cancelAnimationFrame(self.animationId);
                        self.momentumScrolling = false;
                    }
                } else {
                    document.body.classList.remove('mobile-page-hidden');
                }
            }, false);

            window.addEventListener('load', function() {
                document.body.classList.add('mobile-fully-loaded');
            }, false);
        }
    };

    // Funciones de utilidad optimizadas para móviles
    MobileFluidScroll.prototype.mobileEaseInOutCubic = function(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    MobileFluidScroll.prototype.supportsNativeSmoothScroll = function() {
        return 'scrollBehavior' in document.documentElement.style;
    };

    MobileFluidScroll.prototype.addClickListener = function(element, callback) {
        if (!element) return;
        
        if (element.addEventListener) {
            element.addEventListener('click', callback, false);
        } else if (element.attachEvent) {
            element.attachEvent('onclick', callback);
        }
    };

    MobileFluidScroll.prototype.addKeyListener = function(callback) {
        if (document.addEventListener) {
            document.addEventListener('keydown', callback, false);
        } else if (document.attachEvent) {
            document.attachEvent('onkeydown', callback);
        }
    };

    MobileFluidScroll.prototype.getAllElements = function(selector) {
        var elements = document.querySelectorAll(selector);
        return Array.from ? Array.from(elements) : this.nodeListToArray(elements);
    };

    MobileFluidScroll.prototype.nodeListToArray = function(nodeList) {
        var array = [];
        for (var i = 0; i < nodeList.length; i++) {
            array.push(nodeList[i]);
        }
        return array;
    };

    MobileFluidScroll.prototype.getElementTop = function(element) {
        var offsetTop = 0;
        do {
            if (!isNaN(element.offsetTop)) {
                offsetTop += element.offsetTop;
            }
        } while (element = element.offsetParent);
        return offsetTop;
    };

    MobileFluidScroll.prototype.getScrollTop = function() {
        return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    };

    MobileFluidScroll.prototype.isDescendant = function(parent, child) {
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

    MobileFluidScroll.prototype.requestAnimFrame = function(callback) {
        if (this.supportsRequestAnimationFrame) {
            return (window.requestAnimationFrame || 
                   window.webkitRequestAnimationFrame || 
                   window.mozRequestAnimationFrame)(callback);
        } else {
            return setTimeout(callback, 16);
        }
    };

    // Inicializar la aplicación móvil
    var mobileApp;
    
    try {
        mobileApp = new MobileFluidScroll();
    } catch (error) {
        console.error('Error initializing mobile app:', error);
        
        // Fallback de emergencia para móviles
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
        }, 1000);
    }

    // Exportar para uso potencial
    if (typeof window !== 'undefined') {
        window.MobileFluidScroll = MobileFluidScroll;
        window.mobileAppInstance = mobileApp;
    }

    // Fallback para JavaScript deshabilitado
    document.documentElement.className = document.documentElement.className.replace('no-js', 'js');

})();