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