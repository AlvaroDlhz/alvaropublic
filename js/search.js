/**
 * Universal Search Component
 * Provides real-time search functionality across all site content
 */

class UniversalSearch {
    constructor() {
        this.searchData = null;
        this.searchInput = null;
        this.searchResults = null;
        this.searchClear = null;
        this.currentFocus = -1;
        this.debounceTimer = null;

        this.init();
    }

    async init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            await this.setup();
        }
    }

    async setup() {
        // Get DOM elements
        this.searchInput = document.getElementById('universal-search-input');
        this.searchResults = document.getElementById('search-results');
        this.searchClear = document.getElementById('search-clear');

        if (!this.searchInput || !this.searchResults) {
            console.warn('Search elements not found');
            return;
        }

        // Load search data
        await this.loadSearchData();

        // Attach event listeners
        this.attachEventListeners();
    }

    async loadSearchData() {
        try {
            const response = await fetch('data/search-index.json');
            this.searchData = await response.json();
        } catch (error) {
            console.error('Failed to load search data:', error);
            this.searchData = { pages: [], projects: [], artwork: [], social: [], features: [] };
        }
    }

    attachEventListeners() {
        // Input events
        this.searchInput.addEventListener('input', (e) => this.handleInput(e));
        this.searchInput.addEventListener('focus', () => this.handleFocus());
        this.searchInput.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Clear button
        this.searchClear.addEventListener('click', () => this.clearSearch());

        // Click outside to close
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.hideResults();
            }
        });

        // Keyboard shortcut (Ctrl/Cmd + K)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.searchInput.focus();
            }
        });
    }

    handleInput(e) {
        const query = e.target.value.trim();

        // Show/hide clear button
        if (query.length > 0) {
            this.searchClear.classList.add('visible');
            this.searchInput.parentElement.classList.add('active');
        } else {
            this.searchClear.classList.remove('visible');
            this.searchInput.parentElement.classList.remove('active');
        }

        // Debounce search
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.performSearch(query);
        }, 150);
    }

    handleFocus() {
        const query = this.searchInput.value.trim();
        if (query.length > 0) {
            this.performSearch(query);
        }
    }

    handleKeyboard(e) {
        const items = this.searchResults.querySelectorAll('.search-result-item');

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.currentFocus++;
            this.setActiveFocus(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.currentFocus--;
            this.setActiveFocus(items);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (this.currentFocus > -1 && items[this.currentFocus]) {
                items[this.currentFocus].click();
            }
        } else if (e.key === 'Escape') {
            this.hideResults();
            this.searchInput.blur();
        }
    }

    setActiveFocus(items) {
        if (!items.length) return;

        // Remove all active states
        items.forEach(item => item.classList.remove('active'));

        // Wrap around
        if (this.currentFocus >= items.length) this.currentFocus = 0;
        if (this.currentFocus < 0) this.currentFocus = items.length - 1;

        // Add active state and scroll into view
        items[this.currentFocus].classList.add('active');
        items[this.currentFocus].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    performSearch(query) {
        if (!query || query.length < 2) {
            this.hideResults();
            return;
        }

        const results = this.search(query);
        this.displayResults(results, query);
    }

    search(query) {
        const lowerQuery = query.toLowerCase();
        const results = {
            pages: [],
            projects: [],
            artwork: [],
            social: [],
            features: []
        };

        // Search through all categories
        Object.keys(this.searchData).forEach(category => {
            this.searchData[category].forEach(item => {
                const score = this.calculateRelevance(item, lowerQuery);
                if (score > 0) {
                    results[category].push({ ...item, score });
                }
            });
        });

        // Sort by relevance
        Object.keys(results).forEach(category => {
            results[category].sort((a, b) => b.score - a.score);
        });

        return results;
    }

    calculateRelevance(item, query) {
        let score = 0;

        // Title match (highest priority)
        if (item.title.toLowerCase().includes(query)) {
            score += 100;
            if (item.title.toLowerCase().startsWith(query)) {
                score += 50; // Bonus for starting with query
            }
        }

        // Description match
        if (item.description && item.description.toLowerCase().includes(query)) {
            score += 50;
        }

        // Keywords match
        if (item.keywords) {
            item.keywords.forEach(keyword => {
                if (keyword.toLowerCase().includes(query)) {
                    score += 30;
                }
            });
        }

        // Tags match
        if (item.tags) {
            item.tags.forEach(tag => {
                if (tag.toLowerCase().includes(query)) {
                    score += 20;
                }
            });
        }

        // Type match
        if (item.type && item.type.toLowerCase().includes(query)) {
            score += 15;
        }

        return score;
    }

    displayResults(results, query) {
        this.currentFocus = -1;
        let html = '';
        let totalResults = 0;

        // Count total results
        Object.values(results).forEach(category => {
            totalResults += category.length;
        });

        if (totalResults === 0) {
            html = this.getEmptyState(query);
        } else {
            // Add header
            html += `
                <div class="search-results-header">
                    ${totalResults} result${totalResults !== 1 ? 's' : ''} found
                </div>
            `;

            // Add categories
            const categoryOrder = ['pages', 'projects', 'artwork', 'social', 'features'];
            const categoryLabels = {
                pages: 'Pages',
                projects: 'Projects',
                artwork: 'Artwork',
                social: 'Social Media',
                features: 'Features'
            };

            categoryOrder.forEach(category => {
                if (results[category].length > 0) {
                    html += `
                        <div class="search-category">
                            <div class="search-category-title">${categoryLabels[category]}</div>
                            ${results[category].map(item => this.createResultItem(item, query)).join('')}
                        </div>
                    `;
                }
            });

            // Add footer with keyboard hints
            html += `
                <div class="search-footer">
                    <div class="search-keyboard-hint">
                        <span class="search-key">↑↓</span> Navigate
                        <span class="search-key">↵</span> Select
                        <span class="search-key">Esc</span> Close
                    </div>
                </div>
            `;
        }

        this.searchResults.innerHTML = html;
        this.showResults();

        // Attach click handlers to results
        this.searchResults.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const url = item.dataset.url;
                if (url) {
                    window.location.href = url;
                }
            });
        });
    }

    createResultItem(item, query) {
        const highlightedTitle = this.highlightText(item.title, query);
        const highlightedDescription = this.highlightText(item.description, query);

        let metaHtml = '';
        if (item.tags && item.tags.length > 0) {
            metaHtml = `
                <div class="search-result-meta">
                    ${item.tags.slice(0, 3).map(tag =>
                `<span class="search-result-tag">${tag}</span>`
            ).join('')}
                </div>
            `;
        }

        return `
            <div class="search-result-item" data-url="${item.url}">
                <div class="search-result-icon">${item.icon}</div>
                <div class="search-result-content">
                    <div class="search-result-title">${highlightedTitle}</div>
                    <div class="search-result-description">${highlightedDescription}</div>
                    ${metaHtml}
                </div>
            </div>
        `;
    }

    highlightText(text, query) {
        if (!text) return '';

        const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    getEmptyState(query) {
        return `
            <div class="search-empty">
                <div class="search-empty-icon">🔍</div>
                <div class="search-empty-title">No results found</div>
                <div class="search-empty-description">
                    No results for "${query}". Try different keywords.
                </div>
            </div>
        `;
    }

    showResults() {
        this.searchResults.classList.add('visible');
    }

    hideResults() {
        this.searchResults.classList.remove('visible');
        this.currentFocus = -1;
    }

    clearSearch() {
        this.searchInput.value = '';
        this.searchClear.classList.remove('visible');
        this.searchInput.parentElement.classList.remove('active');
        this.hideResults();
        this.searchInput.focus();
    }
}

// Initialize search when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new UniversalSearch();
    });
} else {
    new UniversalSearch();
}
