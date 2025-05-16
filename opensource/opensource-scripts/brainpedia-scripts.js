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