// Digital Magazine JavaScript
class DigitalMagazine {
    constructor() {
        this.isLoaded = false;
        this.navbar = null;
        this.scrollTopBtn = null;
        this.navToggle = null;
        this.navMenu = null;
        this.ticking = false;

        this.init();
    }

    init() {
        this.bindElements();
        this.setupEventListeners();
        this.preloadImages();
        this.initializeAnimations();
        this.markAsLoaded();
    }

    bindElements() {
        this.navbar = document.getElementById('navbar');
        this.scrollTopBtn = document.getElementById('scrollTopBtn');
        this.navToggle = document.getElementById('navToggle');
        this.navMenu = document.getElementById('navMenu');
    }

    setupEventListeners() {
        // Scroll events
        window.addEventListener('scroll', () => this.handleScroll());
        
        // Mobile menu events
        if (this.navToggle && this.navMenu) {
            this.navToggle.addEventListener('click', () => this.toggleMobileMenu());
            
            // Close mobile menu on link click
            document.querySelectorAll('.nav-menu a').forEach(link => {
                link.addEventListener('click', () => this.closeMobileMenu());
            });

            // Close mobile menu when clicking outside
            document.addEventListener('click', (e) => this.handleOutsideClick(e));
        }

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => this.handleAnchorClick(e));
        });

        // Scroll to top button
        if (this.scrollTopBtn) {
            this.scrollTopBtn.addEventListener('click', () => this.scrollToTop());
        }
    }

    handleScroll() {
        if (!this.ticking) {
            requestAnimationFrame(() => {
                this.updateNavbarState();
                this.updateScrollTopButton();
                this.updateActiveNavigation();
                this.ticking = false;
            });
            this.ticking = true;
        }
    }

    updateNavbarState() {
        if (this.navbar) {
            if (window.scrollY > 100) {
                this.navbar.classList.add('scrolled');
            } else {
                this.navbar.classList.remove('scrolled');
            }
        }
    }

    updateScrollTopButton() {
        if (this.scrollTopBtn) {
            if (window.scrollY > 100) {
                this.scrollTopBtn.classList.add('visible');
            } else {
                this.scrollTopBtn.classList.remove('visible');
            }
        }
    }

    updateActiveNavigation() {
        const sections = document.querySelectorAll('section[id], .card[id]');
        const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
        
        let current = '';
        const scrollPosition = window.scrollY + 200;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = sectionId;
                
                // Handle nested elements
                if (sectionId === 'articulo2') {
                    current = 'articulos';
                } else if (sectionId === 'libro2') {
                    current = 'libros';
                }
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href').substring(1);
            if (href === current) {
                link.classList.add('active');
            }
        });
    }

    toggleMobileMenu() {
        if (this.navToggle && this.navMenu) {
            this.navToggle.classList.toggle('active');
            this.navMenu.classList.toggle('mobile-active');
        }
    }

    closeMobileMenu() {
        if (this.navToggle && this.navMenu) {
            this.navToggle.classList.remove('active');
            this.navMenu.classList.remove('mobile-active');
        }
    }

    handleOutsideClick(e) {
        if (this.navToggle && this.navMenu) {
            if (!this.navToggle.contains(e.target) && !this.navMenu.contains(e.target)) {
                this.closeMobileMenu();
            }
        }
    }

    handleAnchorClick(e) {
        e.preventDefault();
        const targetId = e.currentTarget.getAttribute('href');
        const target = document.querySelector(targetId);
        
        if (target) {
            this.smoothScrollToElement(target, targetId);
            this.highlightTarget(target);
        }
    }

    smoothScrollToElement(target, targetId) {
        let offsetTop;
        
        // Special handling for nested elements
        if (targetId === '#articulo2' || targetId === '#libro2') {
            offsetTop = target.offsetTop - 160;
        } else {
            offsetTop = target.offsetTop - 120;
        }
        
        offsetTop = Math.max(0, offsetTop);
        
        // Primary smooth scroll
        window.scrollTo({
            top: offsetTop,
            left: 0,
            behavior: 'smooth'
        });
        
        // Fallback mechanism
        setTimeout(() => {
            const currentScroll = window.scrollY;
            
            if (Math.abs(currentScroll - offsetTop) > 50) {
                window.scrollTo(0, offsetTop);
                
                // Final fallback using scrollIntoView
                setTimeout(() => {
                    const finalScroll = window.scrollY;
                    if (Math.abs(finalScroll - offsetTop) > 50) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start',
                            inline: 'nearest'
                        });
                    }
                }, 100);
            }
        }, 800);
    }

    highlightTarget(target) {
        target.style.transition = 'all 0.5s ease';
        target.style.backgroundColor = 'rgba(59, 130, 246, 0.08)';
        target.style.transform = 'scale(1.005)';
        target.style.boxShadow = '0 8px 32px rgba(59, 130, 246, 0.2)';
        
        setTimeout(() => {
            target.style.backgroundColor = '';
            target.style.transform = '';
            target.style.boxShadow = '';
        }, 1500);
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    initializeAnimations() {
        // Intersection Observer for fade-in animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -10% 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.fade-in').forEach(el => {
            observer.observe(el);
        });
    }

    preloadImages() {
        const criticalImages = [
            'https://images.pexels.com/photos/5380650/pexels-photo-5380650.jpeg',
            'https://staticfiles.acronis.com/images/content/3c77a691d3b8324e18300a730062ea54.png',
            'https://cambiodigital-ol.com/wp-content/uploads/2025/02/Ciberataques.jpg'
        ];

        criticalImages.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }

    markAsLoaded() {
        setTimeout(() => {
            document.body.classList.add('loaded');
            this.isLoaded = true;
        }, 100);
    }
}

// Utility functions for performance optimization
class PerformanceOptimizer {
    static throttle(func, delay) {
        let timeoutId;
        let lastExecTime = 0;
        
        return function (...args) {
            const currentTime = Date.now();
            
            if (currentTime - lastExecTime > delay) {
                func.apply(this, args);
                lastExecTime = currentTime;
            } else {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(this, args);
                    lastExecTime = Date.now();
                }, delay - (currentTime - lastExecTime));
            }
        };
    }

    static debounce(func, delay) {
        let timeoutId;
        
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }
}

// Enhanced scroll performance
class ScrollManager {
    constructor() {
        this.isScrolling = false;
        this.scrollCallbacks = [];
        
        this.init();
    }

    init() {
        window.addEventListener('scroll', () => {
            if (!this.isScrolling) {
                requestAnimationFrame(() => {
                    this.executeCallbacks();
                    this.isScrolling = false;
                });
                this.isScrolling = true;
            }
        }, { passive: true });
    }

    addCallback(callback) {
        this.scrollCallbacks.push(callback);
    }

    executeCallbacks() {
        this.scrollCallbacks.forEach(callback => {
            if (typeof callback === 'function') {
                callback();
            }
        });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize main application
    const magazine = new DigitalMagazine();
    
    // Initialize scroll manager for better performance
    const scrollManager = new ScrollManager();
    
    // Add any additional scroll-based functionality here
    scrollManager.addCallback(() => {
        // Additional scroll-based features can be added here
    });
    
    // Add loading state management
    window.addEventListener('load', () => {
        // Ensure all resources are loaded
        document.body.classList.add('fully-loaded');
    });
    
    // Handle page visibility changes for performance
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // Pause animations when page is not visible
            document.body.classList.add('page-hidden');
        } else {
            // Resume animations when page becomes visible
            document.body.classList.remove('page-hidden');
        }
    });
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DigitalMagazine,
        PerformanceOptimizer,
        ScrollManager
    };
}