/**
 * Thoughts Blog - JavaScript Functionality
 * Handles blog post loading, search, and suggestions
 */

let allPosts = [];
let filteredPosts = [];

document.addEventListener('DOMContentLoaded', () => {
    loadBlogPosts();
    initSearch();
});

/**
 * Load blog posts from JSON file
 */
async function loadBlogPosts() {
    try {
        const response = await fetch('data/thoughts.json');
        if (!response.ok) {
            throw new Error('Failed to load blog posts');
        }
        allPosts = await response.json();

        // Sort posts by date (newest first)
        allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

        filteredPosts = [...allPosts];
        displayPosts(filteredPosts);
    } catch (error) {
        console.error('Error loading blog posts:', error);
        showError();
    }
}

/**
 * Display blog posts in the grid
 */
function displayPosts(posts) {
    const container = document.getElementById('postsContainer');
    const noResults = document.getElementById('noResults');

    if (!container) return;

    if (posts.length === 0) {
        container.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }

    noResults.style.display = 'none';

    container.innerHTML = posts.map((post, index) => `
        <article class="post-card" style="animation-delay: ${index * 0.1}s">
            <time class="post-date">${formatDate(post.date)}</time>
            <h2 class="post-title">${escapeHtml(post.title)}</h2>
            <p class="post-excerpt">${escapeHtml(post.excerpt)}</p>
            <div class="post-tags">
                ${post.tags.map(tag => `<span class="post-tag">#${escapeHtml(tag)}</span>`).join('')}
            </div>
        </article>
    `).join('');
}

/**
 * Initialize search functionality
 */
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchClear = document.getElementById('searchClear');
    const suggestions = document.getElementById('searchSuggestions');

    if (!searchInput) return;

    let debounceTimer;
    let selectedSuggestionIndex = -1;

    // Search input handler with debouncing
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();

        // Show/hide clear button
        if (query) {
            searchClear.classList.add('visible');
        } else {
            searchClear.classList.remove('visible');
        }

        // Debounce search
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            performSearch(query);
            showSuggestions(query);
        }, 300);
    });

    // Clear button handler
    if (searchClear) {
        searchClear.addEventListener('click', () => {
            searchInput.value = '';
            searchClear.classList.remove('visible');
            performSearch('');
            hideSuggestions();
        });
    }

    // Keyboard navigation for suggestions
    searchInput.addEventListener('keydown', (e) => {
        const suggestionItems = suggestions.querySelectorAll('.suggestion-item');

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedSuggestionIndex = Math.min(selectedSuggestionIndex + 1, suggestionItems.length - 1);
            updateSelectedSuggestion(suggestionItems);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, -1);
            updateSelectedSuggestion(suggestionItems);
        } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
            e.preventDefault();
            suggestionItems[selectedSuggestionIndex].click();
        } else if (e.key === 'Escape') {
            hideSuggestions();
        }
    });

    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            hideSuggestions();
        }
    });
}

/**
 * Perform search and filter posts
 */
function performSearch(query) {
    if (!query) {
        filteredPosts = [...allPosts];
    } else {
        const lowerQuery = query.toLowerCase();
        filteredPosts = allPosts.filter(post => {
            return (
                post.title.toLowerCase().includes(lowerQuery) ||
                post.excerpt.toLowerCase().includes(lowerQuery) ||
                post.content.toLowerCase().includes(lowerQuery) ||
                post.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
            );
        });
    }

    displayPosts(filteredPosts);
}

/**
 * Show search suggestions
 */
function showSuggestions(query) {
    const suggestions = document.getElementById('searchSuggestions');
    if (!suggestions || !query) {
        hideSuggestions();
        return;
    }

    const lowerQuery = query.toLowerCase();
    const matchingPosts = allPosts.filter(post => {
        return (
            post.title.toLowerCase().includes(lowerQuery) ||
            post.excerpt.toLowerCase().includes(lowerQuery) ||
            post.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
    }).slice(0, 5); // Limit to 5 suggestions

    if (matchingPosts.length === 0) {
        hideSuggestions();
        return;
    }

    suggestions.innerHTML = matchingPosts.map(post => `
        <div class="suggestion-item" data-post-id="${post.id}">
            <div class="suggestion-title">${highlightMatch(escapeHtml(post.title), query)}</div>
            <div class="suggestion-excerpt">${highlightMatch(escapeHtml(post.excerpt), query)}</div>
            <div class="suggestion-tags">
                ${post.tags.map(tag => `<span class="suggestion-tag">#${escapeHtml(tag)}</span>`).join('')}
            </div>
        </div>
    `).join('');

    // Add click handlers to suggestions
    suggestions.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
            const postId = parseInt(item.dataset.postId);
            const post = allPosts.find(p => p.id === postId);
            if (post) {
                document.getElementById('searchInput').value = post.title;
                performSearch(post.title);
                hideSuggestions();
            }
        });
    });

    suggestions.classList.add('visible');
}

/**
 * Hide search suggestions
 */
function hideSuggestions() {
    const suggestions = document.getElementById('searchSuggestions');
    if (suggestions) {
        suggestions.classList.remove('visible');
    }
}

/**
 * Update selected suggestion for keyboard navigation
 */
function updateSelectedSuggestion(items) {
    items.forEach((item, index) => {
        if (index === selectedSuggestionIndex) {
            item.classList.add('active');
            item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        } else {
            item.classList.remove('active');
        }
    });
}

/**
 * Highlight matching text in search results
 */
function highlightMatch(text, query) {
    if (!query) return text;

    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<strong>$1</strong>');
}

/**
 * Format date for display
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Escape regex special characters
 */
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Show error message
 */
function showError() {
    const container = document.getElementById('postsContainer');
    if (container) {
        container.innerHTML = `
            <div class="no-results">
                <p>Sorry, there was an error loading the blog posts. Please try again later.</p>
            </div>
        `;
    }
}
