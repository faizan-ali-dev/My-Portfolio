// ========================================
// SCROLL SPY NAVIGATION
// ========================================
class HorizontalPageScroller {
    constructor() {
        this.sections = document.querySelectorAll('.section');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.dots = document.querySelectorAll('.dot');
        this.container = document.querySelector('.content-strip');
        this.prevBtn = document.getElementById('prevPageBtn');
        this.nextBtn = document.getElementById('nextPageBtn');
        
        this.currentPage = 0;
        this.totalPages = this.sections.length;
        this.isAnimating = false;
        
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupScrollHijack();
        this.setupButtons();
        this.setupFormHandler();
        this.setupProfileImage();
        this.setupMobileScrollObserver();
        this.updateUI();
    }

    setupNavigation() {
        // Nav links
        this.navLinks.forEach((link, index) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                if (window.innerWidth <= 768) {
                    // Mobile: scroll natively
                    const targetId = link.getAttribute('href').substring(1);
                    const targetSection = document.getElementById(targetId);
                    if (targetSection) {
                        targetSection.scrollIntoView({ behavior: 'smooth' });
                    }
                } else {
                    // Desktop: horizontal slide
                    this.goToPage(index);
                }
                
                // Close mobile menu
                const navMenu = document.querySelector('.nav-menu');
                if (navMenu && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                }
            });
        });

        // Page dots
        this.dots.forEach((dot) => {
            dot.addEventListener('click', (e) => {
                const index = parseInt(dot.getAttribute('data-index'));
                this.goToPage(index);
            });
        });
    }

    setupButtons() {
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prevPage());
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextPage());
        }

        // Mobile menu toggle
        const menuToggle = document.getElementById('menuToggle');
        const navMenu = document.querySelector('.nav-menu');
        if (menuToggle && navMenu) {
            menuToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });
        }
    }

    setupScrollHijack() {
        this.lastWheelTime = Date.now();

        // Mousewheel
        document.addEventListener('wheel', (e) => {
            // If we are on mobile view (vertical scroll fallback), don't hijack
            if (window.innerWidth <= 768) return;
            
            // Allow internal vertical scrolling if target element is scrollable
            const target = e.target.closest('.section');
            if (target) {
                const canScrollUp = target.scrollTop > 0;
                const canScrollDown = Math.ceil(target.scrollTop + target.clientHeight) < target.scrollHeight;
                
                if (e.deltaY < 0 && canScrollUp) return;
                if (e.deltaY > 0 && canScrollDown) return;
            }

            e.preventDefault();

            const now = Date.now();
            const timeSinceLastEvent = now - this.lastWheelTime;
            this.lastWheelTime = now; // Always update on every single wheel event
            
            // If events are firing rapidly (less than 150ms apart), they are part of the same continuous 
            // trackpad swipe or mouse wheel free-spin momentum. We ONLY want to trigger on the FIRST event 
            // of a new scroll action (when timeSinceLastEvent > 150) or if we are currently animating.
            if (this.isAnimating || timeSinceLastEvent < 150) {
                return;
            }

            if (e.deltaY > 0) {
                this.nextPage();
            } else if (e.deltaY < 0) {
                this.prevPage();
            }
        }, { passive: false });

        // Touch support for swipe
        let touchStartX = 0;
        let touchStartY = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            if (window.innerWidth <= 768) return;
            if (this.isAnimating) return;

            const touchEndX = e.changedTouches[0].screenX;
            const touchEndY = e.changedTouches[0].screenY;
            
            const diffX = touchStartX - touchEndX;
            const diffY = touchStartY - touchEndY;

            // Only swipe horizontally if X diff is greater than Y diff
            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (diffX > 50) {
                    this.nextPage();
                } else if (diffX < -50) {
                    this.prevPage();
                }
            }
        }, { passive: true });
    }

    goToPage(index) {
        if (index < 0 || index >= this.totalPages || index === this.currentPage) return;
        if (this.isAnimating) return;

        this.isAnimating = true;
        this.currentPage = index;

        // Apply translation
        if (this.container) {
            this.container.style.transform = `translateX(-${index * 100}vw)`;
        }

        this.updateUI();

        // Release animation lock after transition
        setTimeout(() => {
            this.isAnimating = false;
        }, 500);
    }

    nextPage() {
        if (this.currentPage < this.totalPages - 1) {
            this.goToPage(this.currentPage + 1);
        }
    }

    prevPage() {
        if (this.currentPage > 0) {
            this.goToPage(this.currentPage - 1);
        }
    }

    updateUI() {
        // Update nav links
        this.navLinks.forEach((link, idx) => {
            if (idx === this.currentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Update dots
        this.dots.forEach((dot, idx) => {
            if (idx === this.currentPage) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });

        // Update sections for AOS animations
        this.sections.forEach((section, idx) => {
            if (idx === this.currentPage) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });

        // Update arrows
        if (this.prevBtn) {
            if (this.currentPage === 0) {
                this.prevBtn.classList.add('hidden');
            } else {
                this.prevBtn.classList.remove('hidden');
            }
        }
        
        if (this.nextBtn) {
            if (this.currentPage === this.totalPages - 1) {
                this.nextBtn.classList.add('hidden');
            } else {
                this.nextBtn.classList.remove('hidden');
            }
        }
    }

    setupFormHandler() {
        const contactForm = document.querySelector('.contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit(e.target);
            });
        }
    }

    handleFormSubmit(form) {
        const name = document.getElementById('name').value;
        alert(`Thank you, ${name}! Your message has been received.`);
        form.reset();
    }

    setupProfileImage() {
        const profileImg = document.getElementById('profileImg');
        if (profileImg) {
            profileImg.addEventListener('error', function () {
                this.style.display = 'none';
            });
        }
    }

    setupMobileScrollObserver() {
        // Only run this observer on mobile view
        if (window.innerWidth > 768) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Trigger AOS animations
                    entry.target.classList.add('active');
                    
                    // Update active nav link based on scroll position
                    const id = entry.target.getAttribute('id');
                    this.navLinks.forEach(link => {
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        } else {
                            link.classList.remove('active');
                        }
                    });
                }
            });
        }, { threshold: 0.25 }); // Trigger when 25% of the section is visible

        this.sections.forEach(section => observer.observe(section));
    }
}

// ========================================
// INTERACTIVE ELEMENTS
// ========================================
class InteractiveEffects {
    constructor() {
        this.init();
    }

    init() {
        this.setupProjectButtons();
        // this.setupScrollEffects(); // Disabled for horizontal scroll
        this.setupCardAnimations();
    }

    setupProjectButtons() {
        const projectButtons = document.querySelectorAll('.project-card .btn-primary');
        projectButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const projectTitle = button.closest('.project-card').querySelector('.project-title').textContent;
                alert(`Project: ${projectTitle}\n\nThis is a placeholder. In a real portfolio, this would link to the project details or demo.`);
            });
        });
    }

    setupScrollEffects() {
        // Add scroll-based animations for elements
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe cards and sections
        const animatedElements = document.querySelectorAll('.service-card, .project-card, .skill-item');
        animatedElements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
            observer.observe(el);
        });
    }

    setupCardAnimations() {
        // Add ripple effect on card clicks
        const cards = document.querySelectorAll('.link-card, .service-card, .project-card');
        cards.forEach(card => {
            card.addEventListener('click', function (e) {
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.classList.add('ripple');

                this.appendChild(ripple);

                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });
    }
}

// ========================================
// PERFORMANCE & UTILITIES
// ========================================
class PerformanceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        this.lazyLoadImages();
        this.optimizeAnimations();
        // this.setupScrollIndicator(); // Disabled for horizontal scroll
    }

    lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    optimizeAnimations() {
        // Reduce motion for users who prefer it
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) {
            document.documentElement.style.setProperty('--transition-fast', '0s');
            document.documentElement.style.setProperty('--transition-base', '0s');
            document.documentElement.style.setProperty('--transition-slow', '0s');
            document.documentElement.style.scrollBehavior = 'auto';
        }
    }

    setupScrollIndicator() {
        const scrollIndicator = document.querySelector('.scroll-indicator');
        if (scrollIndicator) {
            window.addEventListener('scroll', () => {
                const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;

                // Hide indicator when scrolled past 20%
                if (scrollPercentage > 20) {
                    scrollIndicator.style.opacity = '0.3';
                } else {
                    scrollIndicator.style.opacity = '1';
                }
            });
        }
    }
}

// ========================================
// KEYBOARD NAVIGATION
// ========================================
class KeyboardNavigation {
    constructor(navigator) {
        this.navigator = navigator;
        this.init();
    }

    init() {
        document.addEventListener('keydown', (e) => {
            if (window.innerWidth <= 768) return; // Disable custom keys on mobile
            
            // Number keys 1-5
            if (e.key >= '1' && e.key <= '5') {
                e.preventDefault();
                this.navigator.goToPage(parseInt(e.key) - 1);
            }

            // Escape to home
            if (e.key === 'Escape') {
                this.navigator.goToPage(0);
            }

            // Arrows
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigator.nextPage();
            }

            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigator.prevPage();
            }
        });
    }
}

// ========================================
// INITIALIZE APPLICATION
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    const navigator = new HorizontalPageScroller();
    const effects = new InteractiveEffects();
    const optimizer = new PerformanceOptimizer();
    const keyboard = new KeyboardNavigation(navigator);

    // Add ripple styles dynamically
    const style = document.createElement('style');
    style.textContent = `
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(212, 175, 55, 0.3);
            transform: scale(0);
            animation: ripple-animation 0.6s ease-out;
            pointer-events: none;
        }

        @keyframes ripple-animation {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Console welcome message
    console.log('%c👋 Welcome to Faizan Ali\'s Portfolio', 'font-size: 20px; color: #d4af37; font-weight: bold;');
    console.log('%cKeyboard shortcuts:', 'font-size: 14px; color: #b8b8b8;');
    console.log('  1-5: Jump to sections\n  Esc: Return to home\n  Ctrl+↑/↓: Navigate sections');
});

// ========================================
// EXPORT FOR TESTING (if needed)
// ========================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        HorizontalPageScroller,
        InteractiveEffects,
        PerformanceOptimizer
    };
}
