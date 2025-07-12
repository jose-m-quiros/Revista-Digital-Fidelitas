// Ultra-Optimized Smooth Scroll JavaScript for Maximum Fluidity
(function () {
  "use strict";

  // Polyfills para navegadores muy antiguos
  if (!Element.prototype.closest) {
    Element.prototype.closest = function (s) {
      var el = this;
      do {
        if (el.matches && el.matches(s)) return el;
        el = el.parentElement || el.parentNode;
      } while (el !== null && el.nodeType === 1);
      return null;
    };
  }

  if (!Element.prototype.matches) {
    Element.prototype.matches =
      Element.prototype.msMatchesSelector ||
      Element.prototype.webkitMatchesSelector ||
      function (s) {
        var matches = (this.document || this.ownerDocument).querySelectorAll(s);
        var i = matches.length;
        while (--i >= 0 && matches.item(i) !== this) {}
        return i > -1;
      };
  }

  // Polyfill para Array.from
  if (!Array.from) {
    Array.from = function (arrayLike) {
      var result = [];
      for (var i = 0; i < arrayLike.length; i++) {
        result.push(arrayLike[i]);
      }
      return result;
    };
  }

  // Polyfill para Object.assign
  if (!Object.assign) {
    Object.assign = function (target) {
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

  // Configuración optimizada para scroll ultra-fluido
  var SCROLL_CONFIG = {
    // Throttling más agresivo para mejor fluidez
    scrollThrottle: 8, // ~120fps en lugar de 60fps
    resizeThrottle: 100, // Más responsive
    animationDuration: 1200, // Duración más larga para suavidad
    easing: "easeInOutCubic", // Easing más suave

    // Configuración específica por dispositivo
    mobile: {
      scrollThrottle: 16, // En móvil, más conservador
      animationDuration: 800,
      momentumEnabled: true,
    },

    desktop: {
      scrollThrottle: 8, // En desktop, máxima fluidez
      animationDuration: 1200,
      parallaxEnabled: true,
    },
  };

  // Clase principal optimizada para scroll ultra-fluido
  function UltraFluidMagazine() {
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
    this.intersectionObserver = null;
    this.supportsIntersectionObserver = false;
    this.supportsPassiveEvents = false;
    this.supportsRequestAnimationFrame = false;
    this.config = SCROLL_CONFIG;

    // Nuevas propiedades para scroll ultra-fluido
    this.scrollVelocity = 0;
    this.smoothScrollActive = false;
    this.scrollDirection = 0;
    this.lastScrollPosition = 0;
    this.animationId = null;
    this.touchVelocity = 0;
    this.isDragging = false;

    this.init();
  }

  UltraFluidMagazine.prototype.init = function () {
    var self = this;

    // Optimizaciones inmediatas para scroll
    this.optimizeScrollPerformance();

    // Detección de capacidades del navegador
    this.detectCapabilities();

    // Manejo de errores global
    this.setupErrorHandling();

    // Esperar a que el DOM esté listo
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () {
        self.start();
      });
    } else {
      // DOM ya está listo
      setTimeout(function () {
        self.start();
      }, 10);
    }
  };

  UltraFluidMagazine.prototype.optimizeScrollPerformance = function () {
    // Activar aceleración por hardware globalmente
    document.documentElement.style.transform = "translateZ(0)";
    document.documentElement.style.willChange = "scroll-position";

    // Configurar CSS para scroll ultra-suave
    if (document.documentElement.style.scrollBehavior !== undefined) {
      document.documentElement.style.scrollBehavior = "smooth";
    }

    // Habilitar momentum scrolling para iOS
    document.body.style.webkitOverflowScrolling = "touch";
    document.body.style.overscrollBehavior = "contain";

    // Optimizar para scroll en móviles
    if (this.isMobile) {
      document.body.style.touchAction = "pan-y";
      document.body.style.overflowX = "hidden";
    }
  };

  UltraFluidMagazine.prototype.detectCapabilities = function () {
    // Detectar soporte para eventos pasivos
    try {
      var opts = Object.defineProperty({}, "passive", {
        get: function () {
          this.supportsPassiveEvents = true;
          return false;
        }.bind(this),
      });
      window.addEventListener("testPassive", null, opts);
      window.removeEventListener("testPassive", null, opts);
    } catch (e) {
      this.supportsPassiveEvents = false;
    }

    // Detectar soporte para Intersection Observer
    this.supportsIntersectionObserver = "IntersectionObserver" in window;

    // Detectar soporte para requestAnimationFrame
    this.supportsRequestAnimationFrame = !!(
      window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame
    );

    // Detectar dispositivo móvil
    this.isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth <= 768;

    // Detectar dispositivo súper pequeño
    this.isSuperSmall = window.innerWidth <= 240;

    // Configurar según el dispositivo
    if (this.isMobile) {
      this.config = Object.assign({}, this.config, this.config.mobile);
    } else {
      this.config = Object.assign({}, this.config, this.config.desktop);
    }
  };

  UltraFluidMagazine.prototype.setupErrorHandling = function () {
    var self = this;

    // Error boundary global
    window.onerror = function (msg, url, lineNo, columnNo, error) {
      console.error("Error:", msg, "at", url, ":", lineNo);
      self.showErrorFallback();
      return false;
    };

    // Para navegadores modernos
    if (window.addEventListener) {
      window.addEventListener("unhandledrejection", function (event) {
        console.error("Unhandled promise rejection:", event.reason);
        self.showErrorFallback();
      });
    }

    // Timeout de seguridad para ocultar loading
    setTimeout(function () {
      self.hideLoadingScreen();
    }, 8000);
  };

  UltraFluidMagazine.prototype.showErrorFallback = function () {
    if (this.errorBoundary) {
      this.errorBoundary.classList.remove("hidden");
    }
    if (this.loadingScreen) {
      this.loadingScreen.classList.add("hidden");
    }
  };

  UltraFluidMagazine.prototype.start = function () {
    try {
      this.bindElements();
      this.setupEventListeners();
      this.initializeUltraFluidScroll();
      this.preloadCriticalImages();
      this.initializeAnimations();
      this.hideLoadingScreen();
      this.markAsLoaded();
      this.optimizeForDevice();
    } catch (error) {
      console.error("Error starting application:", error);
      this.showErrorFallback();
    }
  };

  UltraFluidMagazine.prototype.bindElements = function () {
    this.navbar = document.getElementById("navbar");
    this.scrollTopBtn = document.getElementById("scrollTopBtn");
    this.navToggle = document.getElementById("navToggle");
    this.navMenu = document.getElementById("navMenu");
    this.loadingScreen = document.getElementById("loadingScreen");
    this.errorBoundary = document.getElementById("errorBoundary");
    this.mainContent = document.getElementById("mainContent");
  };

  UltraFluidMagazine.prototype.initializeUltraFluidScroll = function () {
    var self = this;

    // Configurar scroll listener ultra-optimizado
    this.setupUltraFluidScrollListener();

    // Configurar interpolación de velocidad
    this.setupVelocityTracking();

    // Inicializar scroll suave mejorado
    this.initializeEnhancedSmoothScroll();
  };

  UltraFluidMagazine.prototype.setupUltraFluidScrollListener = function () {
    var self = this;
    var isScrolling = false;
    var scrollTimeout;

    function ultraFluidScrollHandler() {
      var now = performance.now();

      // Calcular velocidad de scroll
      var currentPosition = self.getScrollTop();
      self.scrollVelocity = Math.abs(currentPosition - self.lastScrollPosition);
      self.scrollDirection = currentPosition > self.lastScrollPosition ? 1 : -1;
      self.lastScrollPosition = currentPosition;

      // Throttling ultra-agresivo para máxima fluidez
      if (now - self.lastScrollTime < self.config.scrollThrottle) {
        return;
      }
      self.lastScrollTime = now;

      // Marcar que estamos haciendo scroll
      self.isScrolling = true;

      // Limpiar timeout anterior
      clearTimeout(scrollTimeout);

      // Usar RAF para máxima fluidez
      if (!isScrolling) {
        self.requestAnimFrame(function () {
          self.handleUltraFluidScroll();
          isScrolling = false;
        });
        isScrolling = true;
      }

      // Detectar fin de scroll
      scrollTimeout = setTimeout(function () {
        self.isScrolling = false;
        self.scrollVelocity = 0;
        self.onScrollEnd();
      }, 150);
    }

    // Event listener optimizado
    var eventOptions = this.supportsPassiveEvents ? { passive: true } : false;

    if (window.addEventListener) {
      window.addEventListener("scroll", ultraFluidScrollHandler, eventOptions);
    } else if (window.attachEvent) {
      window.attachEvent("onscroll", ultraFluidScrollHandler);
    }
  };

  UltraFluidMagazine.prototype.setupVelocityTracking = function () {
    var self = this;
    var velocityBuffer = [];
    var bufferSize = 5;

    this.updateVelocity = function () {
      velocityBuffer.push(self.scrollVelocity);
      if (velocityBuffer.length > bufferSize) {
        velocityBuffer.shift();
      }

      // Calcular velocidad promedio para suavizado
      var avgVelocity =
        velocityBuffer.reduce(function (a, b) {
          return a + b;
        }, 0) / velocityBuffer.length;
      self.smoothVelocity = avgVelocity;
    };
  };

  UltraFluidMagazine.prototype.initializeEnhancedSmoothScroll = function () {
    var self = this;

    // Override del comportamiento de scroll nativo para elementos específicos
    var anchorLinks = this.getAllElements('a[href^="#"]');
    for (var i = 0; i < anchorLinks.length; i++) {
      this.addClickListener(anchorLinks[i], function (e) {
        e.preventDefault();
        self.handleEnhancedAnchorClick(e);
      });
    }
  };

  UltraFluidMagazine.prototype.handleEnhancedAnchorClick = function (e) {
    var target = e.currentTarget || e.srcElement;
    var targetId = target.getAttribute("href");
    var targetElement = document.querySelector(targetId);

    if (targetElement) {
      this.ultraFluidScrollToElement(targetElement, targetId);
      this.highlightTarget(targetElement);
    }
  };

  UltraFluidMagazine.prototype.ultraFluidScrollToElement = function (
    target,
    targetId
  ) {
    var self = this;
    var offsetTop;

    // Cancelar cualquier animación de scroll activa
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    // Calcular offset mejorado
    if (targetId === "#articulo2" || targetId === "#libro2") {
      offsetTop = this.getElementTop(target) - 160;
    } else {
      offsetTop = this.getElementTop(target) - 120;
    }

    offsetTop = Math.max(0, offsetTop);

    // Usar scroll nativo suave si está disponible y es confiable
    if (this.supportsNativeSmoothScroll() && !this.isMobile) {
      this.smoothScrollActive = true;
      window.scrollTo({
        top: offsetTop,
        left: 0,
        behavior: "smooth",
      });

      // Monitorear completación
      this.monitorSmoothScrollCompletion(offsetTop);
    } else {
      // Usar nuestro sistema de scroll ultra-fluido
      this.animateUltraFluidScrollTo(offsetTop, this.config.animationDuration);
    }
  };

  UltraFluidMagazine.prototype.monitorSmoothScrollCompletion = function (
    targetPosition
  ) {
    var self = this;
    var checkInterval = 16; // ~60fps
    var tolerance = 5;
    var maxChecks = 150; // Máximo 2.5 segundos
    var checks = 0;

    function checkPosition() {
      checks++;
      var currentPosition = self.getScrollTop();

      if (
        Math.abs(currentPosition - targetPosition) <= tolerance ||
        checks >= maxChecks
      ) {
        self.smoothScrollActive = false;
        return;
      }

      setTimeout(checkPosition, checkInterval);
    }

    checkPosition();
  };

  UltraFluidMagazine.prototype.animateUltraFluidScrollTo = function (
    to,
    duration
  ) {
    var self = this;
    var start = this.getScrollTop();
    var change = to - start;
    var startTime = performance.now();

    this.smoothScrollActive = true;

    function animateFrame(currentTime) {
      var elapsed = currentTime - startTime;
      var progress = Math.min(elapsed / duration, 1);

      // Usar easing ultra-suave
      var easedProgress = self.easeInOutCubic(progress);
      var currentPosition = start + change * easedProgress;

      window.scrollTo(0, currentPosition);

      if (progress < 1) {
        self.animationId = self.requestAnimFrame(animateFrame);
      } else {
        self.smoothScrollActive = false;
        self.animationId = null;
      }
    }

    this.animationId = this.requestAnimFrame(animateFrame);
  };

  UltraFluidMagazine.prototype.setupEventListeners = function () {
    var self = this;

    // Menú móvil
    if (this.navToggle && this.navMenu) {
      this.addClickListener(this.navToggle, function (e) {
        e.preventDefault();
        self.toggleMobileMenu();
      });

      // Cerrar menú móvil al hacer clic en enlaces
      var navLinks = this.getAllElements(".nav-menu a");
      for (var i = 0; i < navLinks.length; i++) {
        this.addClickListener(navLinks[i], function () {
          self.closeMobileMenu();
        });
      }

      // Cerrar menú móvil al hacer clic fuera
      this.addClickListener(document, function (e) {
        self.handleOutsideClick(e);
      });
    }

    // Botón scroll to top
    if (this.scrollTopBtn) {
      this.addClickListener(this.scrollTopBtn, function (e) {
        e.preventDefault();
        self.ultraFluidScrollToTop();
      });
    }

    // Eventos de redimensionamiento
    this.addResizeListener(function () {
      self.handleResize();
    });

    // Navegación por teclado mejorada
    this.addKeyListener(function (e) {
      self.handleKeydown(e);
    });

    // Eventos táctiles ultra-fluidos para dispositivos móviles
    if (this.isMobile) {
      this.setupUltraFluidTouchEvents();
    }

    // Eventos de visibilidad de página
    this.setupVisibilityEvents();
  };

  UltraFluidMagazine.prototype.setupUltraFluidTouchEvents = function () {
    var self = this;
    var touchStartTime;
    var touchMoving = false;

    if (!this.mainContent) return;

    var eventOptions = this.supportsPassiveEvents ? { passive: true } : false;

    if (this.mainContent.addEventListener) {
      this.mainContent.addEventListener(
        "touchstart",
        function (e) {
          self.touchStartY = e.touches[0].clientY;
          touchStartTime = performance.now();
          touchMoving = false;
          self.isDragging = true;
        },
        eventOptions
      );

      this.mainContent.addEventListener(
        "touchmove",
        function (e) {
          if (!touchMoving) {
            touchMoving = true;
            var currentY = e.touches[0].clientY;
            var deltaY = self.touchStartY - currentY;

            // Calcular velocidad táctil
            var currentTime = performance.now();
            var deltaTime = currentTime - touchStartTime;
            self.touchVelocity = Math.abs(deltaY) / deltaTime;
          }
        },
        eventOptions
      );

      this.mainContent.addEventListener(
        "touchend",
        function (e) {
          self.touchEndY = e.changedTouches[0].clientY;
          self.isDragging = false;
          self.handleUltraFluidSwipe();
        },
        eventOptions
      );
    }
  };

  UltraFluidMagazine.prototype.handleUltraFluidSwipe = function () {
    var swipeThreshold = 30;
    var velocityThreshold = 0.5;
    var diff = this.touchStartY - this.touchEndY;

    if (
      Math.abs(diff) > swipeThreshold ||
      this.touchVelocity > velocityThreshold
    ) {
      var scrollAmount = Math.min(Math.abs(diff) * 2, 300);
      if (diff > 0) {
        // Swipe up - scroll down
        this.ultraFluidScrollBy(scrollAmount);
      } else {
        // Swipe down - scroll up
        this.ultraFluidScrollBy(-scrollAmount);
      }
    }
  };

  UltraFluidMagazine.prototype.handleUltraFluidScroll = function () {
    this.scrollPosition = this.getScrollTop();

    // Actualizar velocidad
    if (this.updateVelocity) {
      this.updateVelocity();
    }

    if (!this.ticking) {
      var self = this;
      this.requestAnimFrame(function () {
        self.updateNavbarState();
        self.updateScrollTopButton();
        self.updateActiveNavigation();
        self.applyScrollEffects();
        self.ticking = false;
      });
      this.ticking = true;
    }
  };

  UltraFluidMagazine.prototype.applyScrollEffects = function () {
    // Efectos basados en velocidad de scroll
    if (this.smoothVelocity > 10) {
      document.body.classList.add("fast-scrolling");
    } else {
      document.body.classList.remove("fast-scrolling");
    }

    // Paralaje sutil en elementos específicos (solo desktop)
    if (!this.isMobile && this.config.parallaxEnabled) {
      this.applyParallaxEffects();
    }
  };

  UltraFluidMagazine.prototype.applyParallaxEffects = function () {
    var heroElement = document.querySelector(".hero");
    if (heroElement && this.scrollPosition < window.innerHeight) {
      var parallaxValue = this.scrollPosition * 0.3;
      heroElement.style.transform = "translateY(" + parallaxValue + "px)";
    }
  };

  UltraFluidMagazine.prototype.onScrollEnd = function () {
    // Limpiar efectos cuando termina el scroll
    document.body.classList.remove("fast-scrolling");

    // Restaurar paralaje
    var heroElement = document.querySelector(".hero");
    if (heroElement) {
      heroElement.style.transform = "";
    }
  };

  UltraFluidMagazine.prototype.ultraFluidScrollBy = function (amount) {
    var currentScroll = this.getScrollTop();
    var targetScroll = Math.max(0, currentScroll + amount);

    this.animateUltraFluidScrollTo(
      targetScroll,
      Math.min(this.config.animationDuration, 600)
    );
  };

  UltraFluidMagazine.prototype.ultraFluidScrollToTop = function () {
    this.animateUltraFluidScrollTo(0, this.config.animationDuration);
  };

  UltraFluidMagazine.prototype.updateNavbarState = function () {
    if (this.navbar) {
      if (this.scrollPosition > 100) {
        this.navbar.classList.add("scrolled");
      } else {
        this.navbar.classList.remove("scrolled");
      }
    }
  };

  UltraFluidMagazine.prototype.updateScrollTopButton = function () {
    if (this.scrollTopBtn) {
      if (this.scrollPosition > 100) {
        this.scrollTopBtn.classList.add("visible");
      } else {
        this.scrollTopBtn.classList.remove("visible");
      }
    }
  };

  UltraFluidMagazine.prototype.updateActiveNavigation = function () {
    var sections = this.getAllElements("section[id], .card[id]");
    var navLinks = this.getAllElements('.nav-menu a[href^="#"]');

    var current = "";
    var scrollPosition = this.scrollPosition + 200;

    for (var i = 0; i < sections.length; i++) {
      var section = sections[i];
      var sectionTop = this.getElementTop(section);
      var sectionHeight = section.offsetHeight || section.clientHeight;
      var sectionId = section.getAttribute("id");

      if (
        scrollPosition >= sectionTop &&
        scrollPosition < sectionTop + sectionHeight
      ) {
        current = sectionId;

        // Manejar elementos anidados
        if (sectionId === "articulo2") {
          current = "articulos";
        } else if (sectionId === "libro2") {
          current = "libros";
        }
      }
    }

    for (var i = 0; i < navLinks.length; i++) {
      var link = navLinks[i];
      link.classList.remove("active");
      var href = link.getAttribute("href");
      if (href && href.substring(1) === current) {
        link.classList.add("active");
      }
    }
  };

  UltraFluidMagazine.prototype.toggleMobileMenu = function () {
    if (this.navToggle && this.navMenu) {
      this.navToggle.classList.toggle("active");
      this.navMenu.classList.toggle("mobile-active");
    }
  };

  UltraFluidMagazine.prototype.closeMobileMenu = function () {
    if (this.navToggle && this.navMenu) {
      this.navToggle.classList.remove("active");
      this.navMenu.classList.remove("mobile-active");
    }
  };

  UltraFluidMagazine.prototype.handleOutsideClick = function (e) {
    if (this.navToggle && this.navMenu) {
      var target = e.target || e.srcElement;
      if (
        !this.isDescendant(this.navToggle, target) &&
        !this.isDescendant(this.navMenu, target)
      ) {
        this.closeMobileMenu();
      }
    }
  };

  UltraFluidMagazine.prototype.highlightTarget = function (target) {
    var self = this;
    if (!target || !target.style) return;

    target.style.transition = "all 0.6s cubic-bezier(0.23, 1, 0.32, 1)";
    target.style.backgroundColor = "rgba(59, 130, 246, 0.08)";
    target.style.transform = "scale(1.005)";
    target.style.boxShadow = "0 8px 32px rgba(59, 130, 246, 0.2)";

    setTimeout(function () {
      if (target.style) {
        target.style.backgroundColor = "";
        target.style.transform = "";
        target.style.boxShadow = "";
      }
    }, 2000);
  };

  UltraFluidMagazine.prototype.handleResize = function () {
    // Cerrar menú móvil en redimensionamiento
    this.closeMobileMenu();

    // Redetectar capacidades del dispositivo
    this.detectCapabilities();

    // Reoptimizar para el dispositivo
    this.optimizeForDevice();

    // Reconfigurar scroll
    this.optimizeScrollPerformance();
  };

  UltraFluidMagazine.prototype.handleKeydown = function (e) {
    var keyCode = e.keyCode || e.which;

    // ESC cierra el menú móvil
    if (keyCode === 27) {
      this.closeMobileMenu();
    }

    // Navegación por teclado ultra-fluida
    if (keyCode === 38) {
      // Flecha arriba
      e.preventDefault();
      this.ultraFluidScrollBy(-120);
    } else if (keyCode === 40) {
      // Flecha abajo
      e.preventDefault();
      this.ultraFluidScrollBy(120);
    } else if (keyCode === 33) {
      // Page Up
      e.preventDefault();
      this.ultraFluidScrollBy(-window.innerHeight * 0.8);
    } else if (keyCode === 34) {
      // Page Down
      e.preventDefault();
      this.ultraFluidScrollBy(window.innerHeight * 0.8);
    } else if (keyCode === 36) {
      // Home
      e.preventDefault();
      this.ultraFluidScrollToTop();
    } else if (keyCode === 35) {
      // End
      e.preventDefault();
      this.animateUltraFluidScrollTo(
        document.body.scrollHeight,
        this.config.animationDuration
      );
    }
  };

  UltraFluidMagazine.prototype.initializeAnimations = function () {
    if (this.supportsIntersectionObserver && !this.isSuperSmall) {
      this.setupIntersectionObserver();
    } else {
      this.setupScrollBasedAnimations();
    }
  };

  UltraFluidMagazine.prototype.setupIntersectionObserver = function () {
    var self = this;
    var observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -5% 0px",
    };

    this.intersectionObserver = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          // Performance: dejar de observar una vez visible
          self.intersectionObserver.unobserve(entry.target);
        }
      }
    }, observerOptions);

    var fadeElements = this.getAllElements(".fade-in");
    for (var i = 0; i < fadeElements.length; i++) {
      this.intersectionObserver.observe(fadeElements[i]);
    }
  };

  UltraFluidMagazine.prototype.setupScrollBasedAnimations = function () {
    var self = this;
    var fadeElements = this.getAllElements(".fade-in");

    function checkFadeElements() {
      var windowHeight =
        window.innerHeight || document.documentElement.clientHeight;
      var scrollTop = self.getScrollTop();

      for (var i = 0; i < fadeElements.length; i++) {
        var element = fadeElements[i];
        if (!element.classList.contains("visible")) {
          var elementTop = self.getElementTop(element);

          if (elementTop < scrollTop + windowHeight - 100) {
            element.classList.add("visible");
          }
        }
      }
    }

    // Usar nuestro scroll listener en lugar de uno separado
    this.checkFadeElements = checkFadeElements;
    checkFadeElements(); // Verificar en carga
  };

  UltraFluidMagazine.prototype.preloadCriticalImages = function () {
    if (this.isSuperSmall) return; // Evitar preload en dispositivos muy pequeños

    var criticalImages = [
      "https://images.pexels.com/photos/5380650/pexels-photo-5380650.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1",
    ];

    for (var i = 0; i < criticalImages.length; i++) {
      var img = new Image();
      img.src = criticalImages[i];
    }
  };

  UltraFluidMagazine.prototype.hideLoadingScreen = function () {
    var self = this;
    if (this.loadingScreen) {
      setTimeout(function () {
        self.loadingScreen.classList.add("hidden");
        setTimeout(function () {
          if (self.loadingScreen && self.loadingScreen.parentNode) {
            self.loadingScreen.parentNode.removeChild(self.loadingScreen);
          }
        }, 500);
      }, 1000);
    }
  };

  UltraFluidMagazine.prototype.markAsLoaded = function () {
    var self = this;
    setTimeout(function () {
      document.body.classList.add("loaded");
      self.isLoaded = true;
    }, 100);
  };

  UltraFluidMagazine.prototype.optimizeForDevice = function () {
    // Optimizaciones específicas para dispositivos súper pequeños
    if (this.isSuperSmall) {
      // Reducir throttling para mejor respuesta
      this.config.scrollThrottle = 32;
      this.config.animationDuration = 600;

      // Simplificar animaciones
      var style = document.createElement("style");
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
      // Optimizar imágenes para móvil
      var images = this.getAllElements("img");
      for (var i = 0; i < images.length; i++) {
        var img = images[i];
        if (img.src && img.src.includes("pexels.com")) {
          img.src = img.src.replace(/w=\d+/, "w=600").replace(/h=\d+/, "h=400");
        }
      }
    }
  };

  // Funciones de utilidad y easing mejoradas
  UltraFluidMagazine.prototype.easeInOutCubic = function (t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  UltraFluidMagazine.prototype.easeInOutQuad = function (t, b, c, d) {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t + b;
    t--;
    return (-c / 2) * (t * (t - 2) - 1) + b;
  };

  UltraFluidMagazine.prototype.supportsNativeSmoothScroll = function () {
    return "scrollBehavior" in document.documentElement.style;
  };

  UltraFluidMagazine.prototype.addClickListener = function (element, callback) {
    if (!element) return;

    if (element.addEventListener) {
      element.addEventListener("click", callback, false);
    } else if (element.attachEvent) {
      element.attachEvent("onclick", callback);
    }
  };

  UltraFluidMagazine.prototype.addResizeListener = function (callback) {
    var self = this;
    var resizeTimer;

    function resizeHandler() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        callback();
      }, self.config.resizeThrottle);
    }

    if (window.addEventListener) {
      window.addEventListener("resize", resizeHandler, false);
    } else if (window.attachEvent) {
      window.attachEvent("onresize", resizeHandler);
    }
  };

  UltraFluidMagazine.prototype.addKeyListener = function (callback) {
    if (document.addEventListener) {
      document.addEventListener("keydown", callback, false);
    } else if (document.attachEvent) {
      document.attachEvent("onkeydown", callback);
    }
  };

  UltraFluidMagazine.prototype.setupVisibilityEvents = function () {
    var self = this;

    if (document.addEventListener) {
      document.addEventListener(
        "visibilitychange",
        function () {
          if (document.hidden) {
            document.body.classList.add("page-hidden");
            // Pausar animaciones cuando no es visible
            if (self.animationId) {
              cancelAnimationFrame(self.animationId);
              self.smoothScrollActive = false;
            }
          } else {
            document.body.classList.remove("page-hidden");
          }
        },
        false
      );

      window.addEventListener(
        "load",
        function () {
          document.body.classList.add("fully-loaded");
        },
        false
      );
    }
  };

  // Funciones de utilidad
  UltraFluidMagazine.prototype.getAllElements = function (selector) {
    var elements = document.querySelectorAll(selector);
    return Array.from ? Array.from(elements) : this.nodeListToArray(elements);
  };

  UltraFluidMagazine.prototype.nodeListToArray = function (nodeList) {
    var array = [];
    for (var i = 0; i < nodeList.length; i++) {
      array.push(nodeList[i]);
    }
    return array;
  };

  UltraFluidMagazine.prototype.getElementTop = function (element) {
    var offsetTop = 0;
    do {
      if (!isNaN(element.offsetTop)) {
        offsetTop += element.offsetTop;
      }
    } while ((element = element.offsetParent));
    return offsetTop;
  };

  UltraFluidMagazine.prototype.getScrollTop = function () {
    return (
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0
    );
  };

  UltraFluidMagazine.prototype.isDescendant = function (parent, child) {
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

  UltraFluidMagazine.prototype.requestAnimFrame = function (callback) {
    if (this.supportsRequestAnimationFrame) {
      return (
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame
      )(callback);
    } else {
      return setTimeout(callback, 16);
    }
  };

  // Inicializar la aplicación
  var magazine;

  try {
    magazine = new UltraFluidMagazine();
  } catch (error) {
    console.error("Error initializing magazine:", error);

    // Fallback de emergencia
    setTimeout(function () {
      var loadingScreen = document.getElementById("loadingScreen");
      if (loadingScreen) {
        loadingScreen.classList.add("hidden");
      }
      document.body.classList.add("loaded");

      var errorBoundary = document.getElementById("errorBoundary");
      if (errorBoundary) {
        errorBoundary.classList.remove("hidden");
      }
    }, 2000);
  }

  // Exportar para uso potencial como módulo
  if (typeof window !== "undefined") {
    window.UltraFluidMagazine = UltraFluidMagazine;
    window.magazineInstance = magazine;
  }

  // Fallback para JavaScript deshabilitado
  document.documentElement.className =
    document.documentElement.className.replace("no-js", "js");
})();
