// ===== HCI DESIGN PATTERNS JAVASCRIPT =====

// 1. MODAL DIALOG PATTERN
class ModalDialog {
    constructor() {
        this.modals = document.querySelectorAll('.modal-overlay');
        this.init();
    }

    init() {
        // Close modal on overlay click
        this.modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.close(modal);
                }
            });
        });

        // Close modal on close button click
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal-overlay');
                this.close(modal);
            });
        });

        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.modals.forEach(modal => {
                    if (modal.classList.contains('active')) {
                        this.close(modal);
                    }
                });
            }
        });
    }

    open(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            // Focus trap
            const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) firstFocusable.focus();
        }
    }

    close(modal) {
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
}

// 2. SNACKBAR/TOAST MESSAGE PATTERN
class Snackbar {
    static show(message, type = 'info', duration = 3000) {
        const snackbar = document.createElement('div');
        snackbar.className = `snackbar ${type}`;
        snackbar.innerHTML = `
            <span class="snackbar-message">${message}</span>
            <button class="snackbar-close" aria-label="Close">&times;</button>
        `;

        document.body.appendChild(snackbar);

        // Trigger animation
        setTimeout(() => snackbar.classList.add('show'), 10);

        // Close button
        snackbar.querySelector('.snackbar-close').addEventListener('click', () => {
            this.hide(snackbar);
        });

        // Auto hide
        if (duration > 0) {
            setTimeout(() => this.hide(snackbar), duration);
        }

        return snackbar;
    }

    static hide(snackbar) {
        snackbar.classList.remove('show');
        setTimeout(() => snackbar.remove(), 300);
    }

    static success(message, duration = 3000) {
        return this.show(message, 'success', duration);
    }

    static error(message, duration = 3000) {
        return this.show(message, 'error', duration);
    }

    static info(message, duration = 3000) {
        return this.show(message, 'info', duration);
    }
}

// 3. ACCORDION PATTERN
class Accordion {
    constructor(container) {
        this.container = container;
        this.headers = container.querySelectorAll('.accordion-header');
        this.init();
    }

    init() {
        this.headers.forEach(header => {
            header.addEventListener('click', () => {
                const content = header.nextElementSibling;
                const isActive = header.classList.contains('active');

                // Close all accordions in the same container
                this.headers.forEach(h => {
                    h.classList.remove('active');
                    h.nextElementSibling.classList.remove('active');
                });

                // Toggle clicked accordion
                if (!isActive) {
                    header.classList.add('active');
                    content.classList.add('active');
                }
            });
        });
    }
}

// Initialize accordions
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.accordion-container').forEach(container => {
        new Accordion(container);
    });
});

// 4. INLINE VALIDATION PATTERN
class FormValidator {
    constructor(form) {
        this.form = form;
        this.init();
    }

    init() {
        const inputs = this.form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            // Real-time validation on blur
            input.addEventListener('blur', () => this.validateField(input));
            // Clear error on input
            input.addEventListener('input', () => {
                if (input.parentElement.classList.contains('error')) {
                    this.clearError(input);
                }
            });
        });

        // Form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.validateForm()) {
                this.handleSubmit();
            }
        });
    }

    validateField(field) {
        const group = field.parentElement;
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Required validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }

        // Email validation
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        }

        // Update UI
        if (isValid) {
            this.showSuccess(field);
        } else {
            this.showError(field, errorMessage);
        }

        return isValid;
    }

    validateForm() {
        const inputs = this.form.querySelectorAll('input[required], textarea[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

    showError(field, message) {
        const group = field.parentElement;
        group.classList.remove('success');
        group.classList.add('error');
        
        let errorMsg = group.querySelector('.error-message');
        if (!errorMsg) {
            errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            group.appendChild(errorMsg);
        }
        errorMsg.textContent = message;
    }

    showSuccess(field) {
        const group = field.parentElement;
        group.classList.remove('error');
        group.classList.add('success');
        
        const errorMsg = group.querySelector('.error-message');
        if (errorMsg) {
            errorMsg.remove();
        }
    }

    clearError(field) {
        const group = field.parentElement;
        group.classList.remove('error', 'success');
        const errorMsg = group.querySelector('.error-message');
        if (errorMsg) {
            errorMsg.remove();
        }
    }

    handleSubmit() {
        // Show loading state
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        // Simulate form submission
        setTimeout(() => {
            Snackbar.success('Message sent successfully! We will get back to you soon.');
            this.form.reset();
            // Clear all validation states
            this.form.querySelectorAll('.form-group').forEach(group => {
                group.classList.remove('error', 'success');
                const errorMsg = group.querySelector('.error-message');
                if (errorMsg) errorMsg.remove();
            });
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }, 1000);
    }
}

// Initialize form validators
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('form').forEach(form => {
        new FormValidator(form);
    });
});

// Initialize modal
const modal = new ModalDialog();

// Make modal and snackbar globally available
window.ModalDialog = modal;
window.Snackbar = Snackbar;

// ===== USER ASSISTANCE PATTERNS =====

// 1. ONBOARDING TUTORIALS
class OnboardingTutorial {
    constructor() {
        this.currentStep = 0;
        this.tutorials = [];
        this.init();
    }

    init() {
        const tutorials = document.querySelectorAll('.onboarding-tutorial');
        tutorials.forEach(tutorial => {
            this.tutorials.push(tutorial);
        });

        // Close buttons
        document.querySelectorAll('.onboarding-close').forEach(btn => {
            btn.addEventListener('click', () => this.close());
        });

        // Skip button
        document.querySelectorAll('.onboarding-skip').forEach(btn => {
            btn.addEventListener('click', () => this.close());
        });

        // Next button
        document.querySelectorAll('.onboarding-next').forEach(btn => {
            btn.addEventListener('click', () => this.next());
        });

        // Previous button
        document.querySelectorAll('.onboarding-prev').forEach(btn => {
            btn.addEventListener('click', () => this.prev());
        });

        // Dot indicators
        document.querySelectorAll('.onboarding-dot').forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToStep(index));
        });

        // Check if user has seen tutorial
        if (!localStorage.getItem('onboarding-completed')) {
            setTimeout(() => this.show(), 2000);
        }
    }

    show() {
        const overlay = document.querySelector('.onboarding-overlay');
        if (overlay && this.tutorials.length > 0) {
            overlay.classList.add('active');
            this.updateStep();
        }
    }

    close() {
        const overlay = document.querySelector('.onboarding-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            localStorage.setItem('onboarding-completed', 'true');
        }
    }

    next() {
        if (this.currentStep < this.tutorials.length - 1) {
            this.currentStep++;
            this.updateStep();
        } else {
            this.close();
        }
    }

    prev() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.updateStep();
        }
    }

    goToStep(step) {
        this.currentStep = step;
        this.updateStep();
    }

    updateStep() {
        this.tutorials.forEach((tutorial, index) => {
            tutorial.style.display = index === this.currentStep ? 'block' : 'none';
        });

        // Update dots
        document.querySelectorAll('.onboarding-dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentStep);
        });

        // Update buttons
        const prevBtns = document.querySelectorAll('.onboarding-prev');
        const nextBtns = document.querySelectorAll('.onboarding-next');
        
        prevBtns.forEach(btn => {
            btn.style.display = this.currentStep === 0 ? 'none' : 'inline-block';
        });

        nextBtns.forEach(btn => {
            btn.textContent = this.currentStep === this.tutorials.length - 1 ? 'Get Started' : 'Next';
        });
    }
}

// 2. ENHANCED SEARCH
class EnhancedSearch {
    constructor(container) {
        this.container = container;
        this.input = container.querySelector('.search-bar-enhanced');
        this.suggestions = container.querySelector('.search-suggestions');
        this.init();
    }

    init() {
        if (!this.input) return;

        this.input.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (query.length > 0) {
                this.showSuggestions(query);
            } else {
                this.hideSuggestions();
            }
        });

        this.input.addEventListener('focus', () => {
            if (this.input.value.trim().length > 0) {
                this.showSuggestions(this.input.value.trim());
            }
        });

        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target)) {
                this.hideSuggestions();
            }
        });
    }

    showSuggestions(query) {
        if (!this.suggestions) return;

        const suggestions = this.getSuggestions(query);
        this.suggestions.innerHTML = '';

        if (suggestions.length > 0) {
            suggestions.forEach(suggestion => {
                const item = document.createElement('div');
                item.className = 'search-suggestion-item';
                item.textContent = suggestion;
                item.addEventListener('click', () => {
                    this.input.value = suggestion;
                    this.hideSuggestions();
                    this.performSearch(suggestion);
                });
                this.suggestions.appendChild(item);
            });
            this.suggestions.classList.add('active');
        } else {
            const item = document.createElement('div');
            item.className = 'search-suggestion-item';
            item.textContent = 'No results found';
            item.style.color = '#999';
            this.suggestions.appendChild(item);
            this.suggestions.classList.add('active');
        }
    }

    hideSuggestions() {
        if (this.suggestions) {
            this.suggestions.classList.remove('active');
        }
    }

    getSuggestions(query) {
        // Sample suggestions - in real app, this would come from a database
        const allSuggestions = [
            'AgTech startups in Pakistan',
            'FoodTech innovations',
            'Climate-smart agriculture',
            'Precision irrigation',
            'Vertical farming',
            'Blockchain in agriculture',
            'Sustainable packaging',
            'Agricultural investment',
            'Biomanufacturing',
            'DeepTech in agriculture'
        ];

        return allSuggestions.filter(suggestion =>
            suggestion.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5);
    }

    performSearch(query) {
        Snackbar.info(`Searching for: ${query}`);
        // In real app, this would trigger actual search
    }
}

// 3. CHATBOT
class Chatbot {
    constructor() {
        this.isOpen = false;
        this.init();
    }

    init() {
        const button = document.querySelector('.chatbot-button');
        const window = document.querySelector('.chatbot-window');
        const closeBtn = document.querySelector('.chatbot-close');
        const sendBtn = document.querySelector('.chatbot-send');
        const input = document.querySelector('.chatbot-input');

        if (button) {
            button.addEventListener('click', () => this.toggle());
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        if (sendBtn && input) {
            sendBtn.addEventListener('click', () => this.sendMessage());
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }

        // Quick replies
        document.querySelectorAll('.chatbot-quick-reply').forEach(reply => {
            reply.addEventListener('click', () => {
                const text = reply.textContent;
                this.addMessage(text, 'user');
                this.handleQuickReply(text);
            });
        });

        // Initial greeting
        setTimeout(() => {
            if (window && !this.isOpen) {
                this.addMessage('Hello! I\'m here to help you with questions about AgriPulse Pakistan. How can I assist you today?', 'bot');
            }
        }, 1000);
    }

    toggle() {
        this.isOpen = !this.isOpen;
        const button = document.querySelector('.chatbot-button');
        const window = document.querySelector('.chatbot-window');
        const notification = document.querySelector('.chatbot-notification');

        if (button) {
            button.classList.toggle('active', this.isOpen);
        }

        if (window) {
            window.classList.toggle('active', this.isOpen);
        }

        if (notification && this.isOpen) {
            notification.style.display = 'none';
        }

        if (this.isOpen && window) {
            const input = window.querySelector('.chatbot-input');
            if (input) input.focus();
        }
    }

    close() {
        this.isOpen = false;
        const button = document.querySelector('.chatbot-button');
        const window = document.querySelector('.chatbot-window');

        if (button) {
            button.classList.remove('active');
        }

        if (window) {
            window.classList.remove('active');
        }
    }

    sendMessage() {
        const input = document.querySelector('.chatbot-input');
        if (!input) return;

        const message = input.value.trim();
        if (message) {
            this.addMessage(message, 'user');
            input.value = '';
            setTimeout(() => this.handleMessage(message), 500);
        }
    }

    addMessage(text, type) {
        const messages = document.querySelector('.chatbot-messages');
        if (!messages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${type}`;

        const content = document.createElement('div');
        content.className = 'chatbot-message-content';
        content.textContent = text;

        messageDiv.appendChild(content);
        messages.appendChild(messageDiv);
        messages.scrollTop = messages.scrollHeight;
    }

    handleMessage(message) {
        const lowerMessage = message.toLowerCase();
        let response = '';

        if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            response = 'Hello! How can I help you today?';
        } else if (lowerMessage.includes('contact') || lowerMessage.includes('email')) {
            response = 'You can contact us at info@agripulse.pk or use our contact form on the Contact page.';
        } else if (lowerMessage.includes('about') || lowerMessage.includes('who')) {
            response = 'AgriPulse Pakistan is Pakistan\'s premier source for agri-food innovation news and analysis.';
        } else if (lowerMessage.includes('subscribe') || lowerMessage.includes('newsletter')) {
            response = 'You can subscribe to our newsletter using the form on the homepage sidebar.';
        } else if (lowerMessage.includes('article') || lowerMessage.includes('news')) {
            response = 'Click on any article card to read the full article in a modal dialog.';
        } else {
            response = 'I\'m here to help! You can ask me about our content, contact information, or how to use the website.';
        }

        setTimeout(() => {
            this.addMessage(response, 'bot');
        }, 500);
    }

    handleQuickReply(text) {
        setTimeout(() => {
            if (text.includes('Contact')) {
                this.addMessage('You can reach us at info@agripulse.pk or visit our Contact page for more options.', 'bot');
            } else if (text.includes('About')) {
                this.addMessage('AgriPulse Pakistan covers agri-food innovation, startups, and technology in Pakistan. Visit our About page for more details.', 'bot');
            } else if (text.includes('Subscribe')) {
                this.addMessage('Use the newsletter form on the homepage to subscribe and get weekly updates!', 'bot');
            }
        }, 500);
    }
}

// ===== DATA DISPLAY PATTERNS =====

// Enhanced Accordion for Data Display
class DataAccordion {
    constructor(container) {
        this.container = container;
        this.headers = container.querySelectorAll('.data-accordion-header');
        this.init();
    }

    init() {
        this.headers.forEach(header => {
            header.addEventListener('click', () => {
                const content = header.nextElementSibling;
                const isActive = header.classList.contains('active');

                // Close all accordions in the same container
                this.headers.forEach(h => {
                    h.classList.remove('active');
                    h.nextElementSibling.classList.remove('active');
                });

                // Toggle clicked accordion
                if (!isActive) {
                    header.classList.add('active');
                    content.classList.add('active');
                }
            });
        });
    }
}

// Initialize User Assistance Patterns
document.addEventListener('DOMContentLoaded', () => {
    // Onboarding
    const onboarding = new OnboardingTutorial();

    // Enhanced Search
    document.querySelectorAll('.search-bar-container').forEach(container => {
        new EnhancedSearch(container);
    });

    // Chatbot
    const chatbot = new Chatbot();
    window.Chatbot = chatbot;

    // Data Accordions
    document.querySelectorAll('.data-accordion-container').forEach(container => {
        new DataAccordion(container);
    });
});

