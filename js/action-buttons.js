/**
 * Action Buttons & Popups Handler
 * Manages tech stack and certifications popups
 */

// Tech Stack Data
const techStackData = [
    {
        name: 'JavaScript',
        icon: '⚡',
        years: 3,
        maxYears: 5,
        category: 'Languages'
    },
    {
        name: 'Python',
        icon: '🐍',
        years: 2.5,
        maxYears: 5,
        category: 'Languages'
    },
    {
        name: 'HTML/CSS',
        icon: '🎨',
        years: 3,
        maxYears: 5,
        category: 'Frontend'
    },
    {
        name: 'React',
        icon: '⚛️',
        years: 2,
        maxYears: 5,
        category: 'Frontend'
    },
    {
        name: 'Node.js',
        icon: '🟢',
        years: 2,
        maxYears: 5,
        category: 'Backend'
    },
    {
        name: 'Git',
        icon: '📦',
        years: 3,
        maxYears: 5,
        category: 'Tools'
    },
    {
        name: 'SQL',
        icon: '🗄️',
        years: 2,
        maxYears: 5,
        category: 'Database'
    },
    {
        name: 'MongoDB',
        icon: '🍃',
        years: 1.5,
        maxYears: 5,
        category: 'Database'
    }
];

// Certifications Data
const certificationsData = [
    {
        title: 'AWS Certified Solutions Architect',
        issuer: 'Amazon Web Services',
        date: '2024',
        icon: '☁️',
        status: 'Active'
    },
    {
        title: 'Google Cloud Professional',
        issuer: 'Google Cloud',
        date: '2023',
        icon: '🌐',
        status: 'Active'
    },
    {
        title: 'Meta Front-End Developer',
        issuer: 'Meta',
        date: '2023',
        icon: '💻',
        status: 'Completed'
    }
];

class ActionButtonsHandler {
    constructor() {
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        // Attach event listeners to buttons
        this.attachButtonListeners();

        // Create popup containers
        this.createPopups();
    }

    attachButtonListeners() {
        // Tech Stack Button
        const techStackBtn = document.getElementById('tech-stack-btn');
        if (techStackBtn) {
            techStackBtn.addEventListener('click', () => this.showTechStackPopup());
        }

        // Certifications Button
        const certificationsBtn = document.getElementById('certifications-btn');
        if (certificationsBtn) {
            certificationsBtn.addEventListener('click', () => this.showCertificationsPopup());
        }
    }

    createPopups() {
        // Create Tech Stack Popup
        this.createTechStackPopup();

        // Create Certifications Popup
        this.createCertificationsPopup();
    }

    createTechStackPopup() {
        const popup = document.createElement('div');
        popup.id = 'tech-stack-popup';
        popup.className = 'popup-overlay';

        const techStackHTML = techStackData.map(tech => {
            const percentage = (tech.years / tech.maxYears) * 100;
            return `
                <div class="tech-item">
                    <div class="tech-header">
                        <span class="tech-icon">${tech.icon}</span>
                        <span class="tech-name">${tech.name}</span>
                    </div>
                    <div class="tech-experience">${tech.years} ${tech.years === 1 ? 'year' : 'years'} of experience</div>
                    <div class="tech-progress-bar">
                        <div class="tech-progress-fill" style="width: ${percentage}%"></div>
                    </div>
                </div>
            `;
        }).join('');

        popup.innerHTML = `
            <div class="popup-content">
                <div class="popup-header">
                    <h2 class="popup-title">
                        <span>💻</span>
                        Tech Stack
                    </h2>
                    <button class="popup-close" aria-label="Close popup">&times;</button>
                </div>
                <div class="popup-body">
                    <div class="tech-stack-grid">
                        ${techStackHTML}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(popup);
        this.attachPopupListeners(popup);
    }

    createCertificationsPopup() {
        const popup = document.createElement('div');
        popup.id = 'certifications-popup';
        popup.className = 'popup-overlay';

        const certificationsHTML = certificationsData.map(cert => `
            <div class="cert-item">
                <div class="cert-icon">${cert.icon}</div>
                <div class="cert-content">
                    <h3 class="cert-title">${cert.title}</h3>
                    <div class="cert-issuer">${cert.issuer}</div>
                    <div class="cert-date">${cert.date}</div>
                    <span class="cert-badge">${cert.status}</span>
                </div>
            </div>
        `).join('');

        popup.innerHTML = `
            <div class="popup-content">
                <div class="popup-header">
                    <h2 class="popup-title">
                        <span>🏆</span>
                        Certifications
                    </h2>
                    <button class="popup-close" aria-label="Close popup">&times;</button>
                </div>
                <div class="popup-body">
                    <div class="certifications-list">
                        ${certificationsHTML}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(popup);
        this.attachPopupListeners(popup);
    }

    attachPopupListeners(popup) {
        // Close button
        const closeBtn = popup.querySelector('.popup-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closePopup(popup));
        }

        // Click outside to close
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                this.closePopup(popup);
            }
        });

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && popup.classList.contains('active')) {
                this.closePopup(popup);
            }
        });
    }

    showTechStackPopup() {
        const popup = document.getElementById('tech-stack-popup');
        if (popup) {
            popup.classList.add('active');
            document.body.style.overflow = 'hidden';

            // Animate progress bars
            setTimeout(() => {
                const progressBars = popup.querySelectorAll('.tech-progress-fill');
                progressBars.forEach(bar => {
                    const width = bar.style.width;
                    bar.style.width = '0%';
                    setTimeout(() => {
                        bar.style.width = width;
                    }, 100);
                });
            }, 300);
        }
    }

    showCertificationsPopup() {
        const popup = document.getElementById('certifications-popup');
        if (popup) {
            popup.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closePopup(popup) {
        popup.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ActionButtonsHandler();
    });
} else {
    new ActionButtonsHandler();
}
