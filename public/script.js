// script.js
// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initLoadingScreen();
    initMobileMenu();
    initSmoothScroll();
    initStickyHeader();
    initAnimations();
    initPortfolioFilter();
    // initQuoteCalculator();
    // initTestimonialSlider();
    initContactForm();
    initBackToTop();
    // initCounters();
    initParticles();
    initTypingAnimation();
    initFileUpload();
    initHeroForm();
    initFAQ();
});

function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            // Close other open items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.faq-answer').style.maxHeight = null;
                }
            });
            
            // Toggle current item
            item.classList.toggle('active');
            const answer = item.querySelector('.faq-answer');
            if (item.classList.contains('active')) {
                answer.style.maxHeight = answer.scrollHeight + "px";
            } else {
                answer.style.maxHeight = null;
            }
        });
    });
}

function initHeroForm() {
    const form = document.getElementById('heroContactForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            const originalText = btn.innerHTML;
            
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            btn.disabled = true;
            
            // Get form values
            const name = form.querySelector('input[type="text"]').value;
            const phone = form.querySelector('input[type="tel"]').value;
            const service = form.querySelector('select').value;
            
            // Validate phone number (exactly 10 digits)
            const phoneRegex = /^[0-9]{10}$/;
            if (!phoneRegex.test(phone)) {
                showToast('Please enter exactly 10 digits for phone number');
                btn.innerHTML = originalText;
                btn.disabled = false;
                return;
            }
            
            // Data payload
            const data = {
                name: name,
                phone: phone,
                service: service
            };

            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            btn.disabled = true;
            
            // Send API Request
            fetch('/api/hero', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(async response => {
                const text = await response.text();
                let result;
                try {
                    result = JSON.parse(text);
                } catch (e) {
                    console.error('Raw response:', text);
                    throw new Error('Invalid JSON response');
                }
                if (!response.ok) {
                    throw new Error(result.message || 'Server error');
                }
                return result;
            })
            .then(result => {
                if (result.message && result.message.includes('success')) {
                    showToast(result.preview ? result.message : 'Callback request sent successfully!');
                    form.reset();
                    btn.innerHTML = '<i class="fas fa-check"></i> Sent';
                    btn.style.background = 'var(--success)';
                } else {
                    showToast(result.message || 'Error occurred.');
                    btn.innerHTML = 'Try Again';
                }
            })
            .catch(err => {
                console.error('Error:', err);
                showToast('Error sending request. Please try again.');
                btn.innerHTML = 'Try Again';
            })
            .finally(() => {
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                    btn.style.background = '';
                }, 3000);
            });
        });
    }
}

// Loading Screen
function initLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    
    // Simulate loading
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            document.body.style.overflow = 'auto';
            
            // Initialize AOS after loading
            AOS.init({
                duration: 800,
                once: true,
                offset: 100
            });
        }, 500);
    }, 2000);
}

// Mobile Menu Toggle
function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });
        
        // Close menu when clicking links
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
                
                // Update active link
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
}

// Smooth Scroll
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Sticky Header
function initStickyHeader() {
    const header = document.querySelector('.header');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            header.classList.add('scrolled');
            
            // Hide header on scroll down
            if (currentScroll > lastScroll && currentScroll > 200) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }
        } else {
            header.classList.remove('scrolled');
            header.style.transform = 'translateY(0)';
        }
        
        lastScroll = currentScroll;
    });
}

// Animations on Scroll
function initAnimations() {
    // Animate service cards on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, observerOptions);
    
    // Observe elements
    document.querySelectorAll('.service-card, .portfolio-item, .info-card').forEach(el => {
        observer.observe(el);
    });
}

// Portfolio Filter
function initPortfolioFilter() {
    const portfolioItems = [
    // ===== BOOKS =====
    {
        category: 'books',
        title: 'Hardcover Books',
        description: 'Premium hard binding with custom dust jackets',
        image: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&w=800&q=80'
    },
    {
        category: 'books',
        title: 'Paperback Books',
        description: 'Cost-effective softcover printing',
        image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80'
    },
    {
        category: 'books',
        title: 'Coffee Table Books',
        description: 'High-quality image-rich large format books',
        image: 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?auto=format&fit=crop&w=800&q=80'
    },

    // ===== THESIS =====
    {
        category: 'thesis',
        title: 'Academic Thesis',
        description: 'University-standard thesis printing',
        image: 'https://images.unsplash.com/photo-1764096535068-0e9f652e03f6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8QWNhZGVtaWMlMjBUaGVzaXN8ZW58MHx8MHx8fDA%3D'
    },
    {
        category: 'thesis',
        title: 'PhD Dissertation',
        description: 'Professional dissertation printing & binding',
        image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80'
    },
    {
        category: 'thesis',
        title: 'Project Reports',
        description: 'College and professional project reports',
        image: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=800&q=80'
    },

    // ===== BINDING =====
    {
        category: 'binding',
        title: 'Spiral Binding',
        description: 'Durable coil binding for manuals',
        image: 'https://images.unsplash.com/photo-1626641488286-33dfe6425cb4?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8U3BpcmFsJTIwYmluZGluZ3xlbnwwfHwwfHx8MA%3D%3D'
    },
    {
        category: 'binding',
        title: 'Perfect Binding',
        description: 'Clean and professional glued binding',
        image: 'https://images.unsplash.com/photo-1610116306796-6fea9f4fae38?auto=format&fit=crop&w=800&q=80'
    },
    {
        category: 'binding',
        title: 'Wire-O Binding',
        description: 'Lay-flat binding for presentations',
        image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80'
    },

    // ===== PRINTING =====
    {
        category: 'printing',
        title: 'Offset Printing',
        description: 'High-volume commercial printing',
        image: 'https://media.istockphoto.com/id/1018455688/photo/big-plotter-printer-with-led.webp?a=1&b=1&s=612x612&w=0&k=20&c=ri61nPhZEpEP0_o37o9clyzkqeVGxZuuKZitENPMe7w='
    },
    {
        category: 'printing',
        title: 'Digital Printing',
        description: 'Quick turnaround digital prints',
        image: 'https://images.unsplash.com/photo-1503694978374-8a2fa686963a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8RGlnaXRhbCUyMFByaW50aW5nfGVufDB8fDB8fHww'
    },
    {
    category: 'printing',
    title: 'Large Format Printing',
    description: 'Posters, banners and display prints in high resolution',
    image: 'https://images.unsplash.com/photo-1630327722923-5ebd594ddda9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fExhcmdlJTIwRm9ybWF0JTIwUHJpbnRpbmd8ZW58MHx8MHx8fDA%3D'
}
,

    // ===== DESIGN =====
    {
        category: 'design',
        title: 'Book Cover Design',
        description: 'Creative and market-ready cover designs',
        image: 'https://plus.unsplash.com/premium_photo-1667251758769-398dca4d5f1c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8Qm9vayUyMENvdmVyJTIwRGVzaWdufGVufDB8fDB8fHww'
    },
    {
        category: 'design',
        title: 'Interior Layout Design',
        description: 'Clean, readable and professional layouts',
        image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=800&q=80'
    },
    {
    category: 'design',
    title: 'Typography & Page Styling',
    description: 'Balanced typography with consistent margins and spacing',
    image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=800&q=80'
}
];

    
    const portfolioGrid = document.querySelector('.portfolio-grid');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    // Load portfolio items
    function loadPortfolioItems(items) {
        portfolioGrid.innerHTML = '';
        
        items.forEach((item, index) => {
            const portfolioItem = document.createElement('div');
            portfolioItem.className = 'portfolio-item';
            portfolioItem.setAttribute('data-category', item.category);
            portfolioItem.setAttribute('data-aos', 'fade-up');
            portfolioItem.setAttribute('data-aos-delay', (index % 3) * 100);
            
            portfolioItem.innerHTML = `
                <img src="${item.image}" alt="${item.title}">
                <div class="portfolio-overlay">
                    <h4>${item.title}</h4>
                    <p>${item.description}</p>
                </div>
            `;
            
            portfolioGrid.appendChild(portfolioItem);
        });
    }
    
    // Initial load
    loadPortfolioItems(portfolioItems);
    
    // Filter functionality
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            const filterValue = button.getAttribute('data-filter');
            
            // Filter portfolio items
            const filteredItems = filterValue === 'all' 
                ? portfolioItems 
                : portfolioItems.filter(item => item.category === filterValue);
            
            loadPortfolioItems(filteredItems);
        });
    });
}

// Quote Calculator
function initQuoteCalculator() {
    const quoteCalculator = {
        basePrices: {
            'thesis': 75,
            'book': 150,
            'report': 50,
            'manual': 60,
            'brochure': 30
        },
        
        bindingPrices: {
            'hard': 25,
            'soft': 12,
            'spiral': 8,
            'saddle': 5
        },
        
        paperMultipliers: {
            'standard': 1,
            'premium': 1.3,
            'art': 1.5
        },
        
        colorMultipliers: {
            'bw': 1,
            'color': 1.8,
            'mixed': 1.4
        },
        
        urgencyMultipliers: {
            '7': 1,
            '3': 1.3,
            '1': 1.8
        },
        
        perPageCosts: {
            'thesis': 0.15,
            'book': 0.20,
            'report': 0.10,
            'manual': 0.12,
            'brochure': 0.25
        },
        
        init() {
            this.cacheElements();
            this.bindEvents();
            this.setupSelectors();
            this.calculateQuote();
            this.initFormSteps();
        },
        
        cacheElements() {
            this.pagesSlider = document.getElementById('pages');
            this.pagesValue = document.getElementById('pagesValue');
            this.copiesSlider = document.getElementById('copies');
            this.copiesValue = document.getElementById('copiesValue');
            this.totalAmount = document.getElementById('totalAmount');
            
            // Summary elements
            this.summaryProject = document.getElementById('summaryProject');
            this.summaryBinding = document.getElementById('summaryBinding');
            this.summaryPages = document.getElementById('summaryPages');
            this.summaryCopies = document.getElementById('summaryCopies');
            this.summaryPaper = document.getElementById('summaryPaper');
            this.summaryColor = document.getElementById('summaryColor');
            this.summaryDelivery = document.getElementById('summaryDelivery');
            
            // Breakdown elements
            this.breakdownBase = document.getElementById('breakdownBase');
            this.breakdownBinding = document.getElementById('breakdownBinding');
            this.breakdownPages = document.getElementById('breakdownPages');
            this.breakdownExtras = document.getElementById('breakdownExtras');
            this.breakdownSubtotal = document.getElementById('breakdownSubtotal');
            
            // Selector groups
            this.projectOptions = document.querySelectorAll('.type-option');
            this.bindingOptions = document.querySelectorAll('.binding-option');
            this.paperOptions = document.querySelectorAll('.paper-option');
            this.colorOptions = document.querySelectorAll('.color-option');
            this.urgencyOptions = document.querySelectorAll('.urgency-option');
        },
        
        bindEvents() {
            // Slider changes
            this.pagesSlider.addEventListener('input', (e) => {
                this.pagesValue.textContent = e.target.value;
                this.calculateQuote();
            });
            
            this.copiesSlider.addEventListener('input', (e) => {
                const copies = parseInt(e.target.value);
                this.copiesValue.textContent = copies;
                this.copiesValue.textContent += copies === 1 ? ' copy' : ' copies';
                this.calculateQuote();
            });
            
            // Order now button
            document.getElementById('orderNowBtn').addEventListener('click', this.showOrderModal);
        },
        
        setupSelectors() {
            // Project options
            this.projectOptions.forEach(option => {
                option.addEventListener('click', () => {
                    this.projectOptions.forEach(opt => opt.classList.remove('active'));
                    option.classList.add('active');
                    this.calculateQuote();
                });
            });
            
            // Binding options
            this.bindingOptions.forEach(option => {
                option.addEventListener('click', () => {
                    this.bindingOptions.forEach(opt => opt.classList.remove('active'));
                    option.classList.add('active');
                    this.calculateQuote();
                });
            });
            
            // Paper options
            this.paperOptions.forEach(option => {
                option.addEventListener('click', () => {
                    this.paperOptions.forEach(opt => opt.classList.remove('active'));
                    option.classList.add('active');
                    this.calculateQuote();
                });
            });
            
            // Color options
            this.colorOptions.forEach(option => {
                option.addEventListener('click', () => {
                    this.colorOptions.forEach(opt => opt.classList.remove('active'));
                    option.classList.add('active');
                    this.calculateQuote();
                });
            });
            
            // Urgency options
            this.urgencyOptions.forEach(option => {
                option.addEventListener('click', () => {
                    this.urgencyOptions.forEach(opt => opt.classList.remove('active'));
                    option.classList.add('active');
                    this.calculateQuote();
                });
            });
        },
        
        initFormSteps() {
            const steps = document.querySelectorAll('.form-step');
            const stepButtons = document.querySelectorAll('.step');
            const prevBtn = document.querySelector('.prev-step');
            const nextBtn = document.querySelector('.next-step');
            let currentStep = 0;
            
            function showStep(stepIndex) {
                steps.forEach((step, index) => {
                    step.classList.remove('active');
                    stepButtons[index].classList.remove('active');
                    
                    if (index === stepIndex) {
                        step.classList.add('active');
                        stepButtons[index].classList.add('active');
                    }
                });
                
                // Update button visibility
                prevBtn.style.display = stepIndex === 0 ? 'none' : 'block';
                nextBtn.textContent = stepIndex === steps.length - 1 ? 'Complete' : 'Next';
            }
            
            nextBtn.addEventListener('click', () => {
                if (currentStep < steps.length - 1) {
                    currentStep++;
                    showStep(currentStep);
                } else {
                    this.calculateQuote();
                    showToast('Quote calculated successfully!');
                }
            });
            
            prevBtn.addEventListener('click', () => {
                if (currentStep > 0) {
                    currentStep--;
                    showStep(currentStep);
                }
            });
            
            // Initialize first step
            showStep(0);
        },
        
        getSelectedValue(group) {
            let selected = null;
            
            if (group === 'project') {
                const active = document.querySelector('.type-option.active');
                selected = active ? active.getAttribute('data-type') : 'thesis';
            } else if (group === 'binding') {
                const active = document.querySelector('.binding-option.active');
                selected = active ? active.getAttribute('data-value') : 'hard';
            } else if (group === 'paper') {
                const active = document.querySelector('.paper-option.active');
                selected = active ? active.getAttribute('data-value') : 'standard';
            } else if (group === 'color') {
                const active = document.querySelector('.color-option.active');
                selected = active ? active.getAttribute('data-value') : 'bw';
            } else if (group === 'urgency') {
                const active = document.querySelector('.urgency-option.active');
                selected = active ? active.getAttribute('data-days') : '7';
            }
            
            return selected;
        },
        
        calculateQuote() {
            // Get all values
            const project = this.getSelectedValue('project');
            const binding = this.getSelectedValue('binding');
            const pages = parseInt(this.pagesSlider.value);
            const copies = parseInt(this.copiesSlider.value);
            const paper = this.getSelectedValue('paper');
            const color = this.getSelectedValue('color');
            const urgency = this.getSelectedValue('urgency');
            
            // Calculate costs
            const baseCost = this.basePrices[project] || 0;
            const bindingCost = this.bindingPrices[binding] || 0;
            const pageCost = (pages * (this.perPageCosts[project] || 0.10));
            
            // Apply multipliers
            let total = baseCost + bindingCost + pageCost;
            total *= this.paperMultipliers[paper] || 1;
            total *= this.colorMultipliers[color] || 1;
            total *= copies;
            total *= this.urgencyMultipliers[urgency] || 1;
            
            // Apply discount for large orders
            const discount = total > 300 ? 0.15 : 0;
            const discountAmount = total * discount;
            const finalTotal = total - discountAmount;
            
            // Update summary
            this.updateSummary(project, binding, pages, copies, paper, color, urgency);
            
            // Update breakdown
            this.updateBreakdown(baseCost, bindingCost, pageCost, total, discountAmount, finalTotal);
            
            // Update total amount with animation
            this.animateCounter(this.totalAmount, finalTotal);
        },
        
        updateSummary(project, binding, pages, copies, paper, color, urgency) {
            const projectNames = {
                'thesis': 'Thesis',
                'book': 'Book Publishing',
                'report': 'Business Report',
                'manual': 'Training Manual',
                'brochure': 'Marketing Brochure'
            };
            
            const bindingNames = {
                'hard': 'Hard Cover',
                'soft': 'Soft Cover',
                'spiral': 'Spiral Binding',
                'saddle': 'Saddle Stitch'
            };
            
            const paperNames = {
                'standard': 'Standard (80gsm)',
                'premium': 'Premium (100gsm)',
                'art': 'Art Paper (120gsm)'
            };
            
            const colorNames = {
                'bw': 'Black & White',
                'color': 'Full Color',
                'mixed': 'Mixed Pages'
            };
            
            const deliveryNames = {
                '7': 'Standard (7 days)',
                '3': 'Express (3 days)',
                '1': 'Urgent (24 hours)'
            };
            
            this.summaryProject.textContent = projectNames[project] || project;
            this.summaryBinding.textContent = bindingNames[binding] || binding;
            this.summaryPages.textContent = `${pages} pages`;
            this.summaryCopies.textContent = `${copies} ${copies === 1 ? 'copy' : 'copies'}`;
            this.summaryPaper.textContent = paperNames[paper] || paper;
            this.summaryColor.textContent = colorNames[color] || color;
            this.summaryDelivery.textContent = deliveryNames[urgency] || `${urgency} days`;
        },
        
        updateBreakdown(base, binding, pages, subtotal, discount, total) {
            this.breakdownBase.textContent = `₹${base.toFixed(2)}`;
            this.breakdownBinding.textContent = `₹${binding.toFixed(2)}`;
            this.breakdownPages.textContent = `₹${pages.toFixed(2)}`;
            this.breakdownExtras.textContent = discount > 0 ? `-₹${discount.toFixed(2)}` : '₹0.00';
            this.breakdownSubtotal.textContent = `₹${total.toFixed(2)}`;
        },
        
        animateCounter(element, target) {
            const current = parseFloat(element.textContent);
            const increment = (target - current) / 20;
            let count = current;
            
            const timer = setInterval(() => {
                count += increment;
                
                if ((increment > 0 && count >= target) || (increment < 0 && count <= target)) {
                    count = target;
                    clearInterval(timer);
                }
                
                element.textContent = count.toFixed(2);
            }, 30);
        },
        
        showOrderModal() {
            const project = document.querySelector('.type-option.active').getAttribute('data-type');
            const binding = document.querySelector('.binding-option.active').textContent;
            const pages = document.getElementById('pagesValue').textContent;
            const copies = document.getElementById('copiesValue').textContent;
            const total = document.getElementById('totalAmount').textContent;
            
            const modalHTML = `
                <div class="order-modal">
                    <div class="modal-content">
                        <h3><i class="fas fa-shopping-cart"></i> Proceed with Order</h3>
                        <div class="order-summary">
                            <div class="summary-item">
                                <span>Project:</span>
                                <span>${project}</span>
                            </div>
                            <div class="summary-item">
                                <span>Binding:</span>
                                <span>${binding}</span>
                            </div>
                            <div class="summary-item">
                                <span>Pages:</span>
                                <span>${pages}</span>
                            </div>
                            <div class="summary-item">
                                <span>Copies:</span>
                                <span>${copies}</span>
                            </div>
                            <div class="summary-item total">
                                <span>Total:</span>
                                <span>₹${total}</span>
                            </div>
                        </div>
                        <p class="modal-text">You will be redirected to our secure checkout page.</p>
                        <div class="modal-buttons">
                            <button class="btn btn-secondary" id="cancelOrder">
                                <i class="fas fa-times"></i> Cancel
                            </button>
                            <button class="btn btn-primary" id="confirmOrder">
                                <i class="fas fa-lock"></i> Proceed to Payment
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            const modalContainer = document.createElement('div');
            modalContainer.innerHTML = modalHTML;
            document.body.appendChild(modalContainer.firstChild);
            
            // Add styles
            const modalStyles = `
                <style>
                    .order-modal {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0, 0, 0, 0.8);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 10000;
                        animation: fadeIn 0.3s ease;
                        backdrop-filter: blur(5px);
                    }
                    
                    .modal-content {
                        background: white;
                        padding: 40px;
                        border-radius: 20px;
                        max-width: 500px;
                        width: 90%;
                        text-align: center;
                        animation: slideIn 0.3s ease;
                        box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
                    }
                    
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    
                    @keyframes slideIn {
                        from {
                            opacity: 0;
                            transform: translateY(-50px) scale(0.9);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0) scale(1);
                        }
                    }
                    
                    .order-summary {
                        text-align: left;
                        background: var(--light-gray);
                        padding: 25px;
                        border-radius: 10px;
                        margin: 25px 0;
                    }
                    
                    .summary-item {
                        display: flex;
                        justify-content: space-between;
                        padding: 12px 0;
                        border-bottom: 1px solid #e0e0e0;
                    }
                    
                    .summary-item:last-child {
                        border-bottom: none;
                    }
                    
                    .summary-item.total {
                        font-weight: 700;
                        font-size: 1.1rem;
                        color: var(--primary);
                    }
                    
                    .modal-text {
                        color: var(--gray);
                        margin: 20px 0;
                    }
                    
                    .modal-buttons {
                        display: flex;
                        gap: 15px;
                        margin-top: 30px;
                    }
                    
                    .modal-buttons .btn {
                        flex: 1;
                    }
                </style>
            `;
            
            document.head.insertAdjacentHTML('beforeend', modalStyles);
            
            // Add event listeners
            document.getElementById('cancelOrder').addEventListener('click', () => {
                document.querySelector('.order-modal').remove();
            });
            
            document.getElementById('confirmOrder').addEventListener('click', () => {
                showToast('Order confirmed! Redirecting to checkout...');
                setTimeout(() => {
                    document.querySelector('.order-modal').remove();
                    // In real implementation, redirect to checkout
                    // window.location.href = '/checkout';
                }, 2000);
            });
            
            // Close modal when clicking outside
            document.querySelector('.order-modal').addEventListener('click', (e) => {
                if (e.target.classList.contains('order-modal')) {
                    document.querySelector('.order-modal').remove();
                }
            });
        }
    };
    
    // Initialize calculator
    quoteCalculator.init();
}

// Testimonial Slider
function initTestimonialSlider() {
    const testimonials = [
        {
            quote: "The quality of our university's thesis printing has improved dramatically since we started using KDB Print. Their attention to detail is exceptional.",
            name: "Dr. Sarah Johnson",
            role: "University Professor",
            image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
        },
        {
            quote: "Our company reports look incredibly professional thanks to KDB Print. The binding and paper quality make all the difference in client presentations.",
            name: "Michael Chen",
            role: "Business Director",
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
        },
        {
            quote: "As an author, finding a reliable printing service was crucial. KDB Print delivered my book exactly as I envisioned, with perfect binding and vibrant colors.",
            name: "Emma Wilson",
            role: "Published Author",
            image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
        },
        {
            quote: "The turnaround time for our marketing materials was impressive. Great quality and excellent customer service throughout the process.",
            name: "Robert Davis",
            role: "Marketing Manager",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
        }
    ];
    
    const track = document.querySelector('.testimonial-track');
    const dotsContainer = document.querySelector('.slider-dots');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    let currentSlide = 0;
    let slideInterval;
    
    // Load testimonials
    function loadTestimonials() {
        track.innerHTML = '';
        dotsContainer.innerHTML = '';
        
        testimonials.forEach((testimonial, index) => {
            // Create slide
            const slide = document.createElement('div');
            slide.className = 'testimonial-slide';
            slide.setAttribute('data-aos', 'fade-up');
            slide.setAttribute('data-aos-delay', index * 100);
            
            slide.innerHTML = `
                <div class="testimonial-content">
                    <div class="quote-icon">
                        <i class="fas fa-quote-left"></i>
                    </div>
                    <p>"${testimonial.quote}"</p>
                    <div class="testimonial-author">
                        <img src="${testimonial.image}" alt="${testimonial.name}">
                        <div class="author-info">
                            <h4>${testimonial.name}</h4>
                            <span>${testimonial.role}</span>
                        </div>
                    </div>
                </div>
            `;
            
            track.appendChild(slide);
            
            // Create dot
            const dot = document.createElement('span');
            dot.className = 'dot';
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => showSlide(index));
            dotsContainer.appendChild(dot);
        });
        
        updateSlider();
    }
    
    function showSlide(index) {
        currentSlide = index;
        updateSlider();
    }
    
    function updateSlider() {
        const slides = document.querySelectorAll('.testimonial-slide');
        const dots = document.querySelectorAll('.dot');
        const trackWidth = track.offsetWidth;
        
        // Update slides
        slides.forEach((slide, index) => {
            slide.style.transform = `translateX(${(index - currentSlide) * 100}%)`;
            slide.style.opacity = index === currentSlide ? '1' : '0';
        });
        
        // Update dots
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }
    
    function nextSlide() {
        currentSlide = (currentSlide + 1) % testimonials.length;
        updateSlider();
    }
    
    function prevSlide() {
        currentSlide = (currentSlide - 1 + testimonials.length) % testimonials.length;
        updateSlider();
    }
    
    // Event listeners
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    
    // Initialize
    loadTestimonials();
    
    // Auto slide
    function startAutoSlide() {
        slideInterval = setInterval(nextSlide, 5000);
    }
    
    function stopAutoSlide() {
        clearInterval(slideInterval);
    }
    
    // Start auto slide
    startAutoSlide();
    
    // Pause on hover
    const slider = document.querySelector('.testimonial-slider');
    if (slider) {
        slider.addEventListener('mouseenter', stopAutoSlide);
        slider.addEventListener('mouseleave', startAutoSlide);
    }
    
    // Handle window resize
    window.addEventListener('resize', updateSlider);
}

// Contact Form
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    const newsletterForm = document.querySelector('.newsletter-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = this.querySelector('input[placeholder="Your Name"]').value;
            const email = this.querySelector('input[placeholder="Your Email"]').value;
            const phone = this.querySelector('input[placeholder="Phone Number"]').value;
            const service = this.querySelector('select').value;
            // Handle textarea which might not have placeholder if it was changed
            const messageInput = this.querySelector('textarea');
            const message = messageInput ? messageInput.value : '';
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            // Validate email
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(email)) {
                showToast('Please enter a valid email address');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                return;
            }
            
            // Validate phone number (exactly 10 digits)
            const phoneRegex = /^[0-9]{10}$/;
            if (!phoneRegex.test(phone)) {
                showToast('Please enter exactly 10 digits for phone number');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                return;
            }
            
            // Data to send
            const data = {
                name: name,
                email: email,
                phone: phone,
                service: service,
                message: message
            };
            
            // Show loading state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;
            
            // Send API request
            fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(async response => {
                const text = await response.text();
                let result;
                try {
                    result = JSON.parse(text);
                } catch (e) {
                    console.error('Raw response:', text);
                    throw new Error('Invalid JSON response');
                }
                if (!response.ok) {
                    throw new Error(result.message || 'Server error');
                }
                return result;
            })
            .then(result => {
                if (result.message && result.message.includes('success')) {
                    showToast(result.preview ? result.message : 'Message sent successfully!');
                    contactForm.reset();
                    submitBtn.innerHTML = '<i class="fas fa-check"></i> Sent';
                    submitBtn.style.background = 'var(--success)';
                } else {
                    showToast(result.message || 'Error occurred.');
                    submitBtn.innerHTML = 'Try Again';
                }
            })
            .catch(error => {
                showToast('Error sending message. Please try again.');
                console.error('Error:', error);
                submitBtn.innerHTML = 'Try Again';
            })
            .finally(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            });
        });
    }
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('input[type="email"]');
            const successMsg = document.querySelector('.newsletter-success');
            
            // Validate email
            if (!emailInput.value || !isValidEmail(emailInput.value)) {
                emailInput.style.borderColor = 'var(--danger)';
                return;
            }
            
            // Show success
            successMsg.classList.add('show');
            emailInput.value = '';
            
            // Hide success after 5 seconds
            setTimeout(() => {
                successMsg.classList.remove('show');
            }, 5000);
        });
    }
    
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
}

// Back to Top Button
function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Animated Counters
function initCounters() {
    const counters = document.querySelectorAll('.stat-number[data-count]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-count'));
                const duration = 2000; // 2 seconds
                const increment = target / (duration / 16); // 60fps
                let current = 0;
                
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        counter.textContent = target;
                        clearInterval(timer);
                    } else {
                        counter.textContent = Math.floor(current);
                    }
                }, 16);
                
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => observer.observe(counter));
}

// Particles Background
function initParticles() {
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: {
                    value: 80,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: "#ffffff"
                },
                shape: {
                    type: "circle",
                    stroke: {
                        width: 0,
                        color: "#000000"
                    }
                },
                opacity: {
                    value: 0.3,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 1,
                        opacity_min: 0.1,
                        sync: false
                    }
                },
                size: {
                    value: 3,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 2,
                        size_min: 0.1,
                        sync: false
                    }
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: "#ffffff",
                    opacity: 0.2,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 1,
                    direction: "none",
                    random: true,
                    straight: false,
                    out_mode: "out",
                    bounce: false,
                    attract: {
                        enable: false,
                        rotateX: 600,
                        rotateY: 1200
                    }
                }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: {
                        enable: true,
                        mode: "grab"
                    },
                    onclick: {
                        enable: true,
                        mode: "push"
                    },
                    resize: true
                },
                modes: {
                    grab: {
                        distance: 140,
                        line_linked: {
                            opacity: 0.4
                        }
                    },
                    push: {
                        particles_nb: 4
                    }
                }
            },
            retina_detect: true
        });
    }
}

// Typing Animation
function initTypingAnimation() {
    const texts = [
        "Content Creation",
        "Book Printing",
        "Thesis & Projects",
        "High Quality Binding"
    ];
    
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typingElement = document.querySelector('.typing-text');
    const cursorElement = document.querySelector('.typing-cursor');
    
    function type() {
        const currentText = texts[textIndex];
        
        if (isDeleting) {
            // Deleting text
            typingElement.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
        } else {
            // Typing text
            typingElement.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
        }
        
        // Determine typing speed
        let typeSpeed = isDeleting ? 50 : 100;
        
        // If word is complete
        if (!isDeleting && charIndex === currentText.length) {
            typeSpeed = 2000; // Pause at end
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            typeSpeed = 500; // Pause before next word
        }
        
        // Blink cursor during pause
        if (typeSpeed > 500) {
            cursorElement.style.opacity = '0';
        } else {
            cursorElement.style.opacity = '1';
        }
        
        setTimeout(type, typeSpeed);
    }
    
    // Start typing animation
    if (typingElement) {
        setTimeout(type, 1000);
    }
}

// File Upload Animation
function initFileUpload() {
    const fileInput = document.querySelector('.file-upload input[type="file"]');
    const progressBar = document.querySelector('.upload-progress');
    
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            if (this.files.length > 0) {
                // Simulate upload progress
                let progress = 0;
                const interval = setInterval(() => {
                    progress += 10;
                    progressBar.style.width = `${progress}%`;
                    
                    if (progress >= 100) {
                        clearInterval(interval);
                        setTimeout(() => {
                            progressBar.style.width = '0%';
                        }, 1000);
                    }
                }, 200);
            }
        });
    }
}

// Toast Notification
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = toast.querySelector('.toast-message');
    
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}




