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
        this.setupHeroCtas();
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
                this.toggleMobileMenu(true);
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
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }
    }

    setupHeroCtas() {
        // In-page navigation buttons (e.g. "View Projects")
        document.querySelectorAll('[data-goto]').forEach((el) => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                const idx = parseInt(el.getAttribute('data-goto'), 10);
                if (window.innerWidth <= 768) {
                    this.sections[idx]?.scrollIntoView({ behavior: 'smooth' });
                } else {
                    this.goToPage(idx);
                }
            });
        });

        // CV download — intercept and check the file exists, fall back gracefully if not
        const cvBtn = document.querySelector('[data-cv]');
        if (cvBtn) {
            cvBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                const href = cvBtn.getAttribute('href');
                try {
                    const res = await fetch(href, { method: 'HEAD' });
                    if (!res.ok) throw new Error('missing');
                    const a = document.createElement('a');
                    a.href = href;
                    a.download = '';
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                } catch (err) {
                    this.showToast('CV is being finalised — please use the contact form for now.', 'warning', 7000);
                }
            });
        }
    }

    setupScrollHijack() {
        // Desktop wheel / trackpad paging.
        // One page per scroll: trigger immediately, then lock for the length of the
        // slide (fixed, NOT reset by further events) so the next scroll advances as
        // soon as the animation finishes — no need to pause between pages. Trackpad
        // momentum during the lock is ignored, and content taller than the viewport
        // never blocks paging.
        this.wheelLocked = false;

        document.addEventListener('wheel', (e) => {
            if (window.innerWidth <= 768) return; // mobile uses native vertical scroll
            e.preventDefault();
            if (this.isAnimating || this.wheelLocked) return;

            // Use whichever axis the user scrolls (horizontal trackpad swipes page
            // too) and normalise line/page deltas across browsers.
            let delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
            if (e.deltaMode === 1) delta *= 16;
            else if (e.deltaMode === 2) delta *= window.innerHeight;

            if (Math.abs(delta) < 12) return; // ignore tiny jitter

            this.wheelLocked = true;
            setTimeout(() => { this.wheelLocked = false; }, 560);

            if (delta > 0) this.nextPage();
            else this.prevPage();
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
        const submitBtn = form.querySelector('.btn-submit');

        // Form inputs validation check
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();

        if (!name || !email || !message) {
            this.showToast('Please fill in all fields before sending.', 'warning');
            return;
        }

        // Web3Forms Access Key check
        const accessKeyInput = form.querySelector('input[name="access_key"]');
        if (accessKeyInput && accessKeyInput.value === 'YOUR_ACCESS_KEY_HERE') {
            this.showToast('Configuration Required: Please insert your Web3Forms Access Key in index.html.', 'error', 10000);
            return;
        }

        // Lock form & show loading state on button and loading toast
        submitBtn.disabled = true;
        submitBtn.classList.add('loading-btn');

        const loadingToast = this.showToast('Sending message... please wait.', 'loading', 0);

        // Collect all form data (includes access_key and botcheck honeypot)
        const formData = new FormData(form);
        const object = Object.fromEntries(formData);
        const json = JSON.stringify(object);

        // Submit to Web3Forms API
        fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: json
        })
        .then(async (response) => {
            let resJson = await response.json();
            // Dismiss loading toast immediately
            if (loadingToast) loadingToast.remove();

            if (response.status === 200) {
                // Success state
                this.showToast('Message sent successfully! I will get back to you shortly.', 'success');
                form.reset();
            } else {
                // Server-side validation or key error
                console.error('Web3Forms Error Response:', resJson);
                this.showToast(`Submission failed: ${resJson.message || 'Verification error'}.`, 'error');
            }
        })
        .catch(error => {
            // Dismiss loading toast immediately
            if (loadingToast) loadingToast.remove();

            // Network/CORS error
            console.error('Network Error:', error);
            this.showToast('Submission failed. Please try again or email directly at faizancode68@gmail.com.', 'error', 8000);
        })
        .finally(() => {
            // Release button lock
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading-btn');
        });
    }

    toggleMobileMenu(forceClose = false) {
        const navMenu = document.querySelector('.nav-menu');
        const menuToggle = document.getElementById('menuToggle');
        if (!navMenu || !menuToggle) return;

        if (forceClose || navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            menuToggle.textContent = '☰';
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.setAttribute('aria-label', 'Open menu');
        } else {
            navMenu.classList.add('active');
            menuToggle.textContent = '✕';
            menuToggle.setAttribute('aria-expanded', 'true');
            menuToggle.setAttribute('aria-label', 'Close menu');
        }
    }

    showToast(message, type = 'success', duration = 6000) {
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast-card ${type}`;
        toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
        
        let icon = '';
        if (type === 'success') {
            icon = `<svg class="toast-svg" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
        } else if (type === 'error') {
            icon = `<svg class="toast-svg" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
        } else if (type === 'loading') {
            icon = '<div class="form-status-spinner"></div>';
        } else if (type === 'warning') {
            icon = `<svg class="toast-svg" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
        }

        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon" aria-hidden="true">${icon}</span>
                <span class="toast-message">${message}</span>
            </div>
            <button class="toast-close" aria-label="Close">
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        `;

        container.appendChild(toast);

        const closeBtn = toast.querySelector('.toast-close');
        const dismissToast = () => {
            toast.style.animation = 'fadeOut var(--transition-fast) forwards';
            setTimeout(() => {
                toast.remove();
            }, 300);
        };

        closeBtn.addEventListener('click', dismissToast);

        if (duration) {
            setTimeout(dismissToast, duration);
        }

        return toast;
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
// HERO ROLE TYPEWRITER
// ========================================
class TypeWriter {
    constructor(el, words, opts = {}) {
        this.el = el;
        this.words = words;
        this.typeSpeed = opts.typeSpeed || 85;
        this.deleteSpeed = opts.deleteSpeed || 40;
        this.holdTime = opts.holdTime || 1700;
        this.wordIndex = 0;
        this.charIndex = 0;
        this.deleting = false;
        this.tick();
    }

    tick() {
        const word = this.words[this.wordIndex % this.words.length];
        this.charIndex += this.deleting ? -1 : 1;
        this.el.textContent = word.substring(0, this.charIndex);

        let delay = this.deleting ? this.deleteSpeed : this.typeSpeed;
        if (!this.deleting && this.charIndex === word.length) {
            delay = this.holdTime;
            this.deleting = true;
        } else if (this.deleting && this.charIndex === 0) {
            this.deleting = false;
            this.wordIndex++;
            delay = 400;
        }
        setTimeout(() => this.tick(), delay);
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
        this.setupCardAnimations();
    }

    setupCardAnimations() {
        // Add ripple effect on card clicks
        const cards = document.querySelectorAll('.service-card.tile, .project-tile');
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
        this.optimizeAnimations();
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

    // Hero role typewriter (respects reduced-motion)
    const roleEl = document.getElementById('heroRole');
    if (roleEl) {
        const roles = ['Backend Developer', 'Automation Engineer', 'Django & REST APIs', 'Selenium & Web Scraping'];
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            roleEl.textContent = roles[0];
        } else {
            new TypeWriter(roleEl, roles);
        }
    }

    // Dynamic copyright year
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Add ripple styles dynamically
    const style = document.createElement('style');
    style.textContent = `
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(45, 212, 191, 0.3);
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
    console.log('%c👋 Welcome to Faizan Ali\'s Portfolio', 'font-size: 20px; color: #2dd4bf; font-weight: bold;');
    console.log('%cKeyboard shortcuts:', 'font-size: 14px; color: #b8b8b8;');
    console.log('  1-5: Jump to sections\n  Esc: Return to home\n  Arrows (↑ / ↓ / ← / →): Navigate sections');
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
