/**
 * Authentication Module
 * Handles user registration, login, and session management
 */

class AuthManager {
    constructor() {
        this.storageKey = 'thoughts_user';
        this.init();
    }

    init() {
        // Check if user is already logged in
        const user = this.getCurrentUser();
        if (user) {
            this.updateUIForLoggedInUser(user);
        }
    }

    /**
     * Get current logged in user from localStorage
     */
    getCurrentUser() {
        const userJson = localStorage.getItem(this.storageKey);
        return userJson ? JSON.parse(userJson) : null;
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return this.getCurrentUser() !== null;
    }

    /**
     * Register/Login a new user
     */
    register(name, email) {
        // Basic validation
        if (!name || !email) {
            throw new Error('Name and email are required');
        }

        if (!this.isValidEmail(email)) {
            throw new Error('Please enter a valid email address');
        }

        const user = {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            registeredAt: new Date().toISOString()
        };

        // Save to localStorage
        localStorage.setItem(this.storageKey, JSON.stringify(user));

        return user;
    }

    /**
     * Logout current user
     */
    logout() {
        localStorage.removeItem(this.storageKey);
        // Redirect to index instead of reloading
        window.location.href = 'index.html';
    }

    /**
     * Validate email format
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Update UI for logged in user
     */
    updateUIForLoggedInUser(user) {
        // This will be called from individual pages
        const event = new CustomEvent('userLoggedIn', { detail: user });
        document.dispatchEvent(event);
    }
}

// Initialize auth manager
const authManager = new AuthManager();

/**
 * Modal Controller
 */
class AuthModal {
    constructor() {
        this.modal = null;
        this.form = null;
        this.onCloseCallback = null;
        this.redirectOnClose = null;
        this.init();
    }

    init() {
        // Create modal HTML if it doesn't exist
        if (!document.getElementById('authModal')) {
            this.createModal();
        }

        this.modal = document.getElementById('authModal');
        this.form = document.getElementById('authForm');

        // Bind events
        this.bindEvents();
    }

    createModal() {
        const modalHTML = `
            <div id="authModal" class="auth-modal">
                <div class="auth-modal-overlay"></div>
                <div class="auth-modal-content">
                    <button class="auth-modal-close" aria-label="Close">&times;</button>
                    
                    <div class="auth-modal-header">
                        <h2 class="auth-modal-title">Join Thoughts</h2>
                        <p class="auth-modal-subtitle">Exclusive access to my personal blog and insights</p>
                    </div>

                    <form id="authForm" class="auth-form">
                        <div class="auth-form-group">
                            <label for="authName">Full name</label>
                            <input 
                                type="text" 
                                id="authName" 
                                name="name" 
                                required 
                                placeholder="Your name"
                                autocomplete="name"
                            >
                        </div>

                        <div class="auth-form-group">
                            <label for="authEmail">Email</label>
                            <input 
                                type="email" 
                                id="authEmail" 
                                name="email" 
                                required 
                                placeholder="email@example.com"
                                autocomplete="email"
                            >
                        </div>

                        <div class="auth-form-notice">
                            <p>🔒.</p>
                        </div>

                        <button type="submit" class="auth-submit-btn">
                            <span class="btn-text">Get Access</span>
                            <span class="btn-icon">→</span>
                        </button>
                    </form>

                    <div class="auth-features">
                        <div class="auth-feature">
                            <span class="feature-icon">✨</span>
                            <span class="feature-text">Exclusive content</span>
                        </div>
                        <div class="auth-feature">
                            <span class="feature-icon">🎨</span>
                            <span class="feature-text">Creative insights</span>
                        </div>
                        <div class="auth-feature">
                            <span class="feature-icon">💡</span>
                            <span class="feature-text">Tech thoughts</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    bindEvents() {
        // Close button
        const closeBtn = this.modal.querySelector('.auth-modal-close');
        closeBtn.addEventListener('click', () => this.close());

        // Overlay click
        const overlay = this.modal.querySelector('.auth-modal-overlay');
        overlay.addEventListener('click', () => this.close());

        // Form submit
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.close();
            }
        });
    }

    async handleSubmit(e) {
        e.preventDefault();

        const formData = new FormData(this.form);
        const name = formData.get('name');
        const email = formData.get('email');

        try {
            // Show loading state
            const submitBtn = this.form.querySelector('.auth-submit-btn');
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;

            // Simulate a small delay for better UX
            await new Promise(resolve => setTimeout(resolve, 800));

            // Register user
            const user = authManager.register(name, email);

            // Show success
            this.showSuccess(user);

            // Close modal and reload current page after a short delay
            // This keeps the user on thoughts.html if they registered from there
            setTimeout(() => {
                this.close();
                window.location.reload();
            }, 1500);

        } catch (error) {
            this.showError(error.message);
            const submitBtn = this.form.querySelector('.auth-submit-btn');
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    }

    showSuccess(user) {
        const formContainer = this.form.parentElement;
        formContainer.innerHTML = `
            <div class="auth-success">
                <div class="success-icon">✓</div>
                <h3>Welcome, ${user.name.split(' ')[0]}!</h3>
                <p>You now have access to Thoughts</p>
            </div>
        `;
    }

    showError(message) {
        // Remove existing error
        const existingError = this.form.querySelector('.auth-error');
        if (existingError) {
            existingError.remove();
        }

        // Add new error
        const errorHTML = `
            <div class="auth-error">
                <span class="error-icon">⚠</span>
                <span class="error-text">${message}</span>
            </div>
        `;
        this.form.insertAdjacentHTML('afterbegin', errorHTML);

        // Remove error after 5 seconds
        setTimeout(() => {
            const error = this.form.querySelector('.auth-error');
            if (error) {
                error.style.opacity = '0';
                setTimeout(() => error.remove(), 300);
            }
        }, 5000);
    }

    open(options = {}) {
        this.onCloseCallback = options.onClose || null;
        this.redirectOnClose = options.redirectOnClose || null;

        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Focus on first input
        setTimeout(() => {
            const firstInput = this.form.querySelector('input');
            if (firstInput) firstInput.focus();
        }, 300);
    }

    close() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';

        // If user is not authenticated and we have a redirect URL, redirect
        if (!authManager.isAuthenticated() && this.redirectOnClose) {
            window.location.href = this.redirectOnClose;
        }

        // Call the onClose callback if provided
        if (this.onCloseCallback) {
            this.onCloseCallback();
        }
    }
}

// Initialize modal
let authModal;
document.addEventListener('DOMContentLoaded', () => {
    authModal = new AuthModal();
});

/**
 * Helper function to require authentication
 */
function requireAuth(options = {}) {
    if (!authManager.isAuthenticated()) {
        if (options.redirectToHome) {
            window.location.href = 'index.html';
        } else {
            authModal.open(options);
        }
        return false;
    }
    return true;
}

/**
 * Helper function to show auth modal
 */
function showAuthModal() {
    if (authModal) {
        authModal.open();
    }
}

/**
 * Intercept Thoughts link clicks to require authentication
 */
document.addEventListener('DOMContentLoaded', () => {
    // Find all links to thoughts.html
    const thoughtsLinks = document.querySelectorAll('a[href="thoughts.html"]');

    thoughtsLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // If user is not authenticated, prevent navigation and show modal
            if (!authManager.isAuthenticated()) {
                e.preventDefault();
                authModal.open({
                    onClose: () => {
                        // After successful registration, the modal reloads the page
                        // So this callback only runs if user closes without registering
                        // No need to do anything here, user stays on current page
                    }
                });
            }
            // If authenticated, allow normal navigation
        });
    });
});
