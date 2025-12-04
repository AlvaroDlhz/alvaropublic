// =========================================
// MY STORE - JAVASCRIPT
// E-commerce functionality with cart management
// =========================================

// =========================================
// 1. PRODUCT DATA
// =========================================
const products = [
    {
        id: 1,
        title: "Abstract Dreams",
        category: "art",
        price: 149.99,
        description: "Limited edition abstract art print on premium canvas. Each piece is numbered and signed.",
        image: "assets/images/image.png",
        badge: "limited",
        featured: true
    },
    {
        id: 2,
        title: "Suminagashi Flow",
        category: "art",
        price: 199.99,
        description: "Traditional Japanese marbling technique captured in a modern masterpiece.",
        image: "assets/images/suminagashi.jpg",
        badge: "new",
        featured: true
    },
    {
        id: 3,
        title: "Digital Wallpaper Pack",
        category: "digital",
        price: 29.99,
        originalPrice: 49.99,
        description: "Collection of 20 high-resolution wallpapers for desktop and mobile devices.",
        image: "assets/images/image.png",
        badge: "sale",
        featured: false
    },
    {
        id: 4,
        title: "Creative Templates Bundle",
        category: "digital",
        price: 79.99,
        description: "Professional design templates for social media, presentations, and branding.",
        image: "assets/images/suminagashi.jpg",
        badge: null,
        featured: true
    },
    {
        id: 5,
        title: "Artist Signature Hoodie",
        category: "merch",
        price: 59.99,
        description: "Premium quality hoodie with exclusive artist signature design.",
        image: "assets/images/image.png",
        badge: null,
        featured: false
    },
    {
        id: 6,
        title: "Limited Edition Poster",
        category: "art",
        price: 89.99,
        description: "Museum-quality poster print, limited to 100 pieces worldwide.",
        image: "assets/images/suminagashi.jpg",
        badge: "limited",
        featured: true
    },
    {
        id: 7,
        title: "Design Course Access",
        category: "digital",
        price: 299.99,
        description: "Complete online course covering digital art and design fundamentals.",
        image: "assets/images/image.png",
        badge: "new",
        featured: true
    },
    {
        id: 8,
        title: "Artist Tote Bag",
        category: "merch",
        price: 34.99,
        description: "Eco-friendly canvas tote bag featuring original artwork.",
        image: "assets/images/suminagashi.jpg",
        badge: null,
        featured: false
    },
    {
        id: 9,
        title: "Minimalist Collection",
        category: "art",
        price: 249.99,
        description: "Set of 3 minimalist prints perfect for modern interior design.",
        image: "assets/images/image.png",
        badge: "limited",
        featured: true
    }
];

// =========================================
// 2. STATE MANAGEMENT
// =========================================
let cart = JSON.parse(localStorage.getItem('myStoreCart')) || [];
let currentFilter = 'all';
let currentSort = 'featured';
let searchQuery = '';

// =========================================
// 3. INITIALIZATION
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    renderCarousel();
    renderProducts();
    updateCartUI();
    initializeEventListeners();
});

// =========================================
// 3.5. CAROUSEL FUNCTIONALITY
// =========================================
function renderCarousel() {
    const carouselTrack = document.getElementById('carouselTrack');
    if (!carouselTrack) return;

    // Get products with discounts/sales
    const featuredProducts = products.filter(p => p.originalPrice || p.badge === 'sale' || p.badge === 'limited');

    // Duplicate products for infinite scroll effect (3x for seamless loop)
    const carouselProducts = [...featuredProducts, ...featuredProducts, ...featuredProducts];

    carouselTrack.innerHTML = carouselProducts.map(product => {
        const discount = product.originalPrice
            ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
            : 0;

        return `
            <div class="carousel-item" data-product-id="${product.id}">
                <div class="carousel-item-image-wrapper">
                    <img src="${product.image}" alt="${product.title}" class="carousel-item-image">
                    ${product.badge ? `<span class="carousel-item-badge">${product.badge}</span>` : ''}
                    ${discount > 0 ? `<span class="carousel-item-discount">-${discount}%</span>` : ''}
                </div>
                <div class="carousel-item-info">
                    <p class="carousel-item-category">${product.category}</p>
                    <h3 class="carousel-item-title">${product.title}</h3>
                    <p class="carousel-item-description">${product.description}</p>
                    <div class="carousel-item-footer">
                        <div class="carousel-item-prices">
                            <span class="carousel-item-price">$${product.price.toFixed(2)}</span>
                            ${product.originalPrice ? `<span class="carousel-item-original-price">$${product.originalPrice.toFixed(2)}</span>` : ''}
                        </div>
                        <button class="carousel-item-btn" onclick="addToCart(${product.id})">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                            Add
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Add click event to carousel items
    document.querySelectorAll('.carousel-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.carousel-item-btn')) {
                const productId = parseInt(item.dataset.productId);
                openProductModal(productId);
            }
        });
    });
}

function initializeCarouselControls() {
    const carouselTrack = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');

    if (!carouselTrack) return;

    let currentScroll = 0;
    const scrollAmount = 250; // Item width + gap (compact)

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentScroll -= scrollAmount;
            carouselTrack.style.transform = `translateX(${currentScroll}px)`;
            carouselTrack.style.animation = 'none';

            setTimeout(() => {
                carouselTrack.style.animation = 'infiniteScroll 25s linear infinite';
            }, 500);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentScroll += scrollAmount;
            carouselTrack.style.transform = `translateX(${currentScroll}px)`;
            carouselTrack.style.animation = 'none';

            setTimeout(() => {
                carouselTrack.style.animation = 'infiniteScroll 30s linear infinite';
            }, 500);
        });
    }
}

// =========================================
// 4. EVENT LISTENERS
// =========================================
function initializeEventListeners() {
    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.category;
            renderProducts();
        });
    });

    // Sort dropdown
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            renderProducts();
        });
    }

    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase();
            renderProducts();
        });
    }

    // Cart button
    const cartBtn = document.getElementById('cartBtn');
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartClose = document.getElementById('cartClose');

    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            cartSidebar.classList.add('active');
            cartOverlay.classList.add('active');
        });
    }

    if (cartClose) {
        cartClose.addEventListener('click', closeCart);
    }

    if (cartOverlay) {
        cartOverlay.addEventListener('click', closeCart);
    }

    // Checkout button
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', handleCheckout);
    }

    // Mobile menu
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuOverlay.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking a link
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuOverlay.classList.remove('active');
        });
    });
}

// =========================================
// 5. PRODUCT RENDERING
// =========================================
function renderProducts() {
    const productsGrid = document.getElementById('productsGrid');
    const noResults = document.getElementById('noResults');

    if (!productsGrid) return;

    // Filter products
    let filteredProducts = products.filter(product => {
        const matchesCategory = currentFilter === 'all' || product.category === currentFilter;
        const matchesSearch = product.title.toLowerCase().includes(searchQuery) ||
            product.description.toLowerCase().includes(searchQuery);
        return matchesCategory && matchesSearch;
    });

    // Sort products
    filteredProducts = sortProducts(filteredProducts);

    // Show/hide no results message
    if (filteredProducts.length === 0) {
        noResults.style.display = 'block';
        productsGrid.style.display = 'none';
        return;
    } else {
        noResults.style.display = 'none';
        productsGrid.style.display = 'grid';
    }

    // Render products
    productsGrid.innerHTML = filteredProducts.map(product => `
        <article class="product-card" data-product-id="${product.id}">
            <div class="product-image-wrapper">
                <img src="${product.image}" alt="${product.title}" class="product-image">
                ${product.badge ? `<span class="product-badge ${product.badge}">${product.badge}</span>` : ''}
            </div>
            <div class="product-info">
                <p class="product-category">${product.category}</p>
                <h3 class="product-title">${product.title}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-footer">
                    <div class="product-price ${product.originalPrice ? 'sale' : ''}">
                        <span>$${product.price.toFixed(2)}</span>
                        ${product.originalPrice ? `<span class="original-price">$${product.originalPrice.toFixed(2)}</span>` : ''}
                    </div>
                    <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        Add
                    </button>
                </div>
            </div>
        </article>
    `).join('');

    // Add click event to product cards for modal
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.add-to-cart-btn')) {
                const productId = parseInt(card.dataset.productId);
                openProductModal(productId);
            }
        });
    });
}

function sortProducts(products) {
    switch (currentSort) {
        case 'price-low':
            return [...products].sort((a, b) => a.price - b.price);
        case 'price-high':
            return [...products].sort((a, b) => b.price - a.price);
        case 'newest':
            return [...products].reverse();
        case 'featured':
        default:
            return [...products].sort((a, b) => b.featured - a.featured);
    }
}

// =========================================
// 6. CART MANAGEMENT
// =========================================
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    saveCart();
    updateCartUI();
    showAddedToCartFeedback();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        saveCart();
        updateCartUI();
    }
}

function saveCart() {
    localStorage.setItem('myStoreCart', JSON.stringify(cart));
}

function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartEmpty = document.getElementById('cartEmpty');
    const cartFooter = document.getElementById('cartFooter');
    const totalAmount = document.getElementById('totalAmount');

    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) {
        cartCount.textContent = totalItems;
    }

    // Update cart items
    if (cart.length === 0) {
        if (cartEmpty) cartEmpty.classList.add('active');
        if (cartItems) cartItems.style.display = 'none';
        if (cartFooter) cartFooter.style.display = 'none';
    } else {
        if (cartEmpty) cartEmpty.classList.remove('active');
        if (cartItems) cartItems.style.display = 'block';
        if (cartFooter) cartFooter.style.display = 'block';

        if (cartItems) {
            cartItems.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.title}" class="cart-item-image">
                    <div class="cart-item-info">
                        <h4 class="cart-item-title">${item.title}</h4>
                        <p class="cart-item-category">${item.category}</p>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                            <span class="quantity-value">${item.quantity}</span>
                            <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                        </div>
                    </div>
                    <div class="cart-item-actions">
                        <p class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</p>
                        <button class="remove-item-btn" onclick="removeFromCart(${item.id})">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        </button>
                    </div>
                </div>
            `).join('');
        }

        // Update total
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (totalAmount) {
            totalAmount.textContent = `$${total.toFixed(2)}`;
        }
    }
}

function closeCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');

    if (cartSidebar) cartSidebar.classList.remove('active');
    if (cartOverlay) cartOverlay.classList.remove('active');
}

function handleCheckout() {
    if (cart.length === 0) return;

    alert('🎉 Thank you for your purchase!\n\nThis is a demo store. In a real implementation, this would redirect to a secure checkout page.');

    // Clear cart after "checkout"
    // cart = [];
    // saveCart();
    // updateCartUI();
    // closeCart();
}

function showAddedToCartFeedback() {
    // You could add a toast notification here
    console.log('Product added to cart!');
}

// =========================================
// 7. PRODUCT MODAL
// =========================================
function openProductModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const modal = document.getElementById('productModal');
    const modalBody = document.getElementById('modalBody');

    if (!modal || !modalBody) return;

    modalBody.innerHTML = `
        <div class="modal-product-grid">
            <div>
                <img src="${product.image}" alt="${product.title}" class="modal-product-image">
            </div>
            <div class="modal-product-info">
                <p class="modal-product-category">${product.category}</p>
                <h2>${product.title}</h2>
                <div class="modal-product-price">
                    $${product.price.toFixed(2)}
                    ${product.originalPrice ? `<span class="original-price" style="font-size: 1.2rem; margin-left: 0.5rem;">$${product.originalPrice.toFixed(2)}</span>` : ''}
                </div>
                ${product.badge ? `<span class="product-badge ${product.badge}" style="position: static; display: inline-block; margin-bottom: 1rem;">${product.badge}</span>` : ''}
                <p class="modal-product-description">${product.description}</p>
                <button class="btn btn-primary modal-add-to-cart" onclick="addToCart(${product.id}); closeProductModal();">
                    Add to Cart - $${product.price.toFixed(2)}
                </button>
            </div>
        </div>
    `;

    modal.classList.add('active');

    // Close modal handlers
    const modalClose = document.getElementById('modalClose');
    const modalOverlay = document.getElementById('modalOverlay');

    if (modalClose) {
        modalClose.onclick = closeProductModal;
    }

    if (modalOverlay) {
        modalOverlay.onclick = closeProductModal;
    }
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// =========================================
// 8. MAKE FUNCTIONS GLOBALLY AVAILABLE
// =========================================
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.openProductModal = openProductModal;
window.closeProductModal = closeProductModal;
