document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const modal = document.getElementById('waitlistModal');
    const ctaButtons = document.querySelectorAll('.cta-button');
    const closeModal = document.querySelector('.close-modal');
    const waitlistForm = document.getElementById('waitlistModalForm');

    // Toggle menu when clicking hamburger
    hamburger.addEventListener('click', function(event) {
        event.stopPropagation();
        this.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.nav-container')) {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });

    // Close menu when clicking on a nav link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });

    // Modal functionality
    ctaButtons.forEach(button => {
        button.addEventListener('click', () => {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
        });
    });

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Re-enable scrolling
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Handle form submission
    waitlistForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Here you would typically send the form data to your server
        const formData = {
            name: document.getElementById('name-modal').value,
            email: document.getElementById('email-modal').value,
            role: document.getElementById('role-modal').value
        };
        
        console.log('Form submitted:', formData);
        // Show success message
        alert('Thank you for joining our waitlist! We will contact you soon.');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        waitlistForm.reset();
    });
});


// Add Chart.js CDN to your HTML file first:
// <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

document.addEventListener('DOMContentLoaded', function() {
    // Mathematics Performance Chart
    const mathCtx = document.getElementById('mathChart').getContext('2d');
    new Chart(mathCtx, {
        type: 'bar',
        data: {
            labels: ['OECD Average', 'Chile', 'Uruguay', 'Mexico', 'Colombia', 'Peru'],
            datasets: [{
                label: 'Math Score (PISA 2022)',
                data: [472, 412, 418, 409, 402, 400],
                backgroundColor: ['#4CAF50', '#FFA726', '#FFA726', '#FFA726', '#FFA726', '#FFA726']
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false,
                    min: 350,
                    max: 500
                }
            }
        }
    });

    // Reading Performance Chart
    const readingCtx = document.getElementById('readingChart').getContext('2d');
    new Chart(readingCtx, {
        type: 'bar',
        data: {
            labels: ['OECD Average', 'Chile', 'Mexico', 'Colombia', 'Peru', 'Argentina'],
            datasets: [{
                label: 'Reading Score (PISA 2022)',
                data: [476, 448, 415, 409, 404, 402],
                backgroundColor: ['#4CAF50', '#FFA726', '#FFA726', '#FFA726', '#FFA726', '#FFA726']
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false,
                    min: 350,
                    max: 500
                }
            }
        }
    });
});


// ...existing code...

// Profit Margins Chart
const profitCtx = document.getElementById('profitChart').getContext('2d');
new Chart(profitCtx, {
    type: 'line',
    data: {
        labels: ['2003', '2008', '2013', '2018', '2023'],
        datasets: [{
            label: 'Scientific Publishers',
            data: [36, 37, 39, 38, 40],
            borderColor: '#FF6B6B',
            tension: 0.1
        },
        {
            label: 'Tech Industry',
            data: [15, 18, 21, 22, 25],
            borderColor: '#4CAF50',
            tension: 0.1
        },
        {
            label: 'Global 500 Average',
            data: [10, 11, 10, 12, 11],
            borderColor: '#2196F3',
            tension: 0.1
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Profit Margin (%)'
                }
            }
        }
    }
});

// Alternative Uses Chart
const altUsesCtx = document.getElementById('alternativeUsesChart').getContext('2d');
new Chart(altUsesCtx, {
    type: 'bar',
    data: {
        labels: ['Research Grants', 'Open Labs', 'Scholarships', 'Open Access'],
        datasets: [{
            label: 'Potential Annual Impact (Millions $)',
            data: [5000, 4000, 6000, 4600],
            backgroundColor: [
                '#4CAF50',
                '#2196F3',
                '#FFC107',
                '#9C27B0'
            ]
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Million USD'
                }
            }
        }
    }
});