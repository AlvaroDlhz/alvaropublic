/**
 * Alvaro De la Hoz - Portfolio Interactions
 * Handles animations, navigation, and user interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initMobileMenu();
  initSmoothScroll();
  initParallax();
  initNavbarScroll();
  initScrollProgress();
  initLightbox();
});

/**
 * Initialize Intersection Observer for scroll animations
 */
function initScrollAnimations() {
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Only animate once
      }
    });
  }, observerOptions);

  // Select all elements to animate
  const animatedElements = document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right');
  animatedElements.forEach(el => observer.observe(el));
}

/**
 * Initialize Mobile Menu functionality
 */
function initMobileMenu() {
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const menuOverlay = document.querySelector('.mobile-menu-overlay');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');
  const body = document.body;

  if (!menuBtn || !menuOverlay) return;

  function toggleMenu() {
    const isActive = menuBtn.classList.contains('active');

    menuBtn.classList.toggle('active');
    menuOverlay.classList.toggle('active');

    // Prevent scrolling when menu is open
    body.style.overflow = isActive ? '' : 'hidden';
  }

  menuBtn.addEventListener('click', toggleMenu);

  // Close menu when clicking a link
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (menuBtn.classList.contains('active')) {
        toggleMenu();
      }
    });
  });
}

/**
 * Initialize Smooth Scrolling for anchor links
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();

      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        // Account for fixed header
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/**
 * Initialize Parallax effects
 */
function initParallax() {
  const parallaxElements = document.querySelectorAll('.parallax');

  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;

    parallaxElements.forEach(el => {
      const speed = el.dataset.speed || 0.5;
      const yPos = -(scrolled * speed);
      el.style.transform = `translateY(${yPos}px)`;
    });
  });
}

/**
 * Navbar scroll effect (glassmorphism intensity)
 */
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.style.background = 'rgba(10, 10, 10, 0.95)';
      navbar.style.boxShadow = '0 10px 30px -10px rgba(0, 0, 0, 0.3)';
    } else {
      navbar.style.background = 'rgba(10, 10, 10, 0.8)';
      navbar.style.boxShadow = 'none';
    }
  });
}

/**
 * Initialize Scroll Progress Indicator
 */
function initScrollProgress() {
  // Create progress bar element
  const progressContainer = document.createElement('div');
  progressContainer.className = 'scroll-progress-container';

  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress-bar';

  progressContainer.appendChild(progressBar);
  document.body.appendChild(progressContainer);

  // Update progress on scroll
  window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    progressBar.style.width = scrolled + "%";
  });
}

/**
 * Initialize Gallery Lightbox
 */
function initLightbox() {
  // Create lightbox elements
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'lightbox-close';
  closeBtn.innerHTML = '&times;';

  const content = document.createElement('div');
  content.className = 'lightbox-content';

  const img = document.createElement('img');
  img.className = 'lightbox-img';

  const caption = document.createElement('div');
  caption.className = 'lightbox-caption';

  content.appendChild(img);
  content.appendChild(caption);
  lightbox.appendChild(closeBtn);
  lightbox.appendChild(content);
  document.body.appendChild(lightbox);

  // Open lightbox
  const galleryItems = document.querySelectorAll('.gallery-item');
  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const sourceImg = item.querySelector('img');
      const title = item.querySelector('h3').innerText;
      const subtitle = item.querySelector('p').innerText;

      img.src = sourceImg.src;
      img.alt = sourceImg.alt;
      caption.innerText = `${title} - ${subtitle}`;

      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  // Close lightbox functions
  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });
}

/**
 * Send Email functionality using EmailJS
 */
function sendEmail() {
  const btn = document.querySelector('.submit-btn');
  const originalText = btn.innerText;

  btn.innerText = 'Sending...';
  btn.disabled = true;

  let params = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    message: document.getElementById("message").value
  };

  emailjs.send("service_81xkq0a", "template_45ha295", params)
    .then(() => {
      alert("Message sent successfully! I'll get back to you soon.");
      document.querySelector('.contact-form').reset();
    })
    .catch((err) => {
      console.error('Failed to send email:', err);
      alert("Something went wrong. Please try again later or email me directly.");
    })
    .finally(() => {
      btn.innerText = originalText;
      btn.disabled = false;
    });
}