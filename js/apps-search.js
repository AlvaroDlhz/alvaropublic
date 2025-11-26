/**
 * Apps Search Functionality
 * Handles search input, filtering, and suggestions
 */

document.addEventListener('DOMContentLoaded', () => {
    initSearch();
});

function initSearch() {
    const searchInput = document.getElementById('app-search');
    const suggestionsContainer = document.getElementById('search-suggestions');
    const projectCards = document.querySelectorAll('.project-card');

    if (!searchInput || !suggestionsContainer) return;

    // Build index of apps
    const apps = Array.from(projectCards).map(card => {
        const title = card.querySelector('h3').innerText;
        const type = card.querySelector('.project-type').innerText;
        const link = card.querySelector('.project-link').getAttribute('href');
        const img = card.querySelector('img').src;

        return {
            element: card,
            title,
            type,
            link,
            img
        };
    });

    // Handle Input
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();

        // Filter Cards
        apps.forEach(app => {
            const isMatch = app.title.toLowerCase().includes(query) ||
                app.type.toLowerCase().includes(query);

            if (isMatch) {
                app.element.style.display = 'grid'; // Restore grid layout
                // Re-trigger animation if needed, or just ensure opacity is 1
                app.element.style.opacity = '1';
                app.element.style.transform = 'translateY(0)';
            } else {
                app.element.style.display = 'none';
            }
        });

        // Show Suggestions
        if (query.length > 0) {
            const matches = apps.filter(app => app.title.toLowerCase().includes(query));
            renderSuggestions(matches, suggestionsContainer);
        } else {
            suggestionsContainer.classList.remove('active');
            suggestionsContainer.innerHTML = '';

            // Show all cards if query is empty
            apps.forEach(app => {
                app.element.style.display = 'grid';
            });
        }
    });

    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
            suggestionsContainer.classList.remove('active');
        }
    });

    // Show suggestions again if input is focused and has text
    searchInput.addEventListener('focus', () => {
        if (searchInput.value.trim().length > 0) {
            suggestionsContainer.classList.add('active');
        }
    });
}

function renderSuggestions(matches, container) {
    container.innerHTML = '';

    if (matches.length === 0) {
        container.classList.remove('active');
        return;
    }

    matches.forEach(match => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';

        item.innerHTML = `
            <img src="${match.img}" alt="${match.title}" class="suggestion-img">
            <div class="suggestion-info">
                <h4>${match.title}</h4>
                <p>${match.type}</p>
            </div>
        `;

        item.addEventListener('click', () => {
            window.location.href = match.link;
        });

        container.appendChild(item);
    });

    container.classList.add('active');
}
