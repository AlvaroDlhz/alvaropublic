// Format Converter JavaScript

document.addEventListener('DOMContentLoaded', () => {
    initConverterCards();
    initScrollAnimations();
});

// Initialize conversion cards with click handlers
function initConverterCards() {
    const cards = document.querySelectorAll('.conversion-card');

    cards.forEach(card => {
        card.addEventListener('click', () => {
            const conversion = card.dataset.conversion;
            handleConversion(conversion);
        });

        // Add fade-in animation class
        card.classList.add('fade-in-up');
    });
}

// Handle conversion card click
function handleConversion(conversion) {
    // For now, just show an alert
    // In the future, this will navigate to the actual converter page
    const [from, to] = conversion.split('-');

    // Create a temporary notification
    showNotification(`${from.toUpperCase()} → ${to.toUpperCase()} converter coming soon!`);
}

// Show notification
function showNotification(message) {
    // Remove existing notification if any
    const existing = document.querySelector('.converter-notification');
    if (existing) {
        existing.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'converter-notification';
    notification.textContent = message;

    // Add styles
    Object.assign(notification.style, {
        position: 'fixed',
        top: '100px',
        right: '20px',
        background: 'linear-gradient(135deg, hsl(260, 100%, 65%), hsl(200, 100%, 60%))',
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(138, 43, 226, 0.4)',
        zIndex: '10000',
        fontSize: '1rem',
        fontWeight: '500',
        animation: 'slideInRight 0.4s ease, slideOutRight 0.4s ease 2.6s',
        maxWidth: '300px',
        backdropFilter: 'blur(10px)'
    });

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize scroll animations
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe all cards
    const cards = document.querySelectorAll('.conversion-card');
    cards.forEach(card => {
        observer.observe(card);
    });

    // Observe category sections
    const categories = document.querySelectorAll('.category-section');
    categories.forEach(category => {
        observer.observe(category);
    });
}

// Add animation keyframes dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
