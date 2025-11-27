/**
 * Roulette App Logic - Enhanced Version
 * Handles wheel drawing, spinning, tabs, options, history, and custom modals.
 */

document.addEventListener('DOMContentLoaded', () => {
    initRoulette();
});

function initRoulette() {
    // --- Constants ---
    const MAX_TABS = 10;
    const MAX_OPTIONS = 50;
    const SPIN_DURATION = 4000; // 4 seconds
    const HISTORY_LIMIT = 20;

    // --- State ---
    let tabs = loadData() || [
        { id: 'tab-1', name: 'Lunch', options: ['Pizza', 'Burger', 'Salad', 'Sushi', 'Tacos'] }
    ];
    let currentTabId = loadCurrentTab() || tabs[0].id;
    let history = loadHistory() || [];
    let isSpinning = false;
    let currentRotation = 0;

    // --- DOM Elements ---
    const canvas = document.getElementById('roulette-wheel');
    const ctx = canvas ? canvas.getContext('2d') : null;
    const spinBtn = document.getElementById('spin-btn');
    const tabsList = document.getElementById('tabs-list');
    const addTabBtn = document.getElementById('add-tab-btn');
    const optionsList = document.getElementById('options-list');
    const optionInput = document.getElementById('option-input');
    const addOptionBtn = document.getElementById('add-option-btn');
    const resultDisplay = document.getElementById('result-display');
    const contextMenu = document.getElementById('context-menu');
    const renameTabAction = document.getElementById('rename-tab-action');
    const deleteTabAction = document.getElementById('delete-tab-action');

    // History Elements
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history-btn');

    // Winner Modal Elements
    const winnerModal = document.getElementById('winner-modal');
    const winnerResult = document.getElementById('winner-result');
    const closeModalBtn = document.querySelector('.close-modal-btn');
    const claimBtn = document.querySelector('.claim-btn');
    const confettiCanvas = document.getElementById('confetti-canvas');

    // Custom Modal Elements
    const alertModal = document.getElementById('alert-modal');
    const alertTitle = document.getElementById('alert-title');
    const alertMessage = document.getElementById('alert-message');
    const alertOkBtn = document.getElementById('alert-ok-btn');

    const confirmModal = document.getElementById('confirm-modal');
    const confirmTitle = document.getElementById('confirm-title');
    const confirmMessage = document.getElementById('confirm-message');
    const confirmOkBtn = document.getElementById('confirm-ok-btn');
    const confirmCancelBtn = document.getElementById('confirm-cancel-btn');

    const promptModal = document.getElementById('prompt-modal');
    const promptTitle = document.getElementById('prompt-title');
    const promptMessage = document.getElementById('prompt-message');
    const promptInput = document.getElementById('prompt-input');
    const promptOkBtn = document.getElementById('prompt-ok-btn');
    const promptCancelBtn = document.getElementById('prompt-cancel-btn');

    let contextMenuTargetId = null;

    // --- Initialization ---
    try {
        renderTabs();
        renderOptions();
        renderHistory();
        drawWheel();
        setupEventListeners();
    } catch (error) {
        console.error('Initialization error:', error);
        showAlert('Error', 'Failed to initialize the app. Please refresh the page.');
    }

    // --- Core Functions ---

    function getCurrentTab() {
        return tabs.find(t => t.id === currentTabId) || tabs[0];
    }

    function saveData() {
        try {
            localStorage.setItem('rouletteData', JSON.stringify(tabs));
        } catch (error) {
            console.error('Failed to save data:', error);
        }
    }

    function loadData() {
        try {
            const data = localStorage.getItem('rouletteData');
            if (!data) return null;

            const parsed = JSON.parse(data);
            // Validate data structure
            if (!Array.isArray(parsed)) return null;
            if (parsed.length === 0) return null;

            // Validate each tab
            for (const tab of parsed) {
                if (!tab.id || !tab.name || !Array.isArray(tab.options)) {
                    return null;
                }
            }

            return parsed;
        } catch (error) {
            console.error('Failed to load data:', error);
            return null;
        }
    }

    function saveCurrentTab() {
        try {
            localStorage.setItem('rouletteCurrentTab', currentTabId);
        } catch (error) {
            console.error('Failed to save current tab:', error);
        }
    }

    function loadCurrentTab() {
        try {
            return localStorage.getItem('rouletteCurrentTab');
        } catch (error) {
            console.error('Failed to load current tab:', error);
            return null;
        }
    }

    function saveHistory() {
        try {
            localStorage.setItem('rouletteHistory', JSON.stringify(history));
        } catch (error) {
            console.error('Failed to save history:', error);
        }
    }

    function loadHistory() {
        try {
            const data = localStorage.getItem('rouletteHistory');
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Failed to load history:', error);
            return [];
        }
    }

    function addToHistory(winner, tabName) {
        const entry = {
            winner,
            tabName,
            timestamp: new Date().toISOString()
        };
        history.unshift(entry);
        if (history.length > HISTORY_LIMIT) {
            history = history.slice(0, HISTORY_LIMIT);
        }
        saveHistory();
        renderHistory();
    }

    function renderHistory() {
        if (!historyList) return;

        historyList.innerHTML = '';

        if (history.length === 0) {
            historyList.innerHTML = '<li class="history-empty">No history yet</li>';
            return;
        }

        history.forEach((entry, index) => {
            const li = document.createElement('li');
            li.className = 'history-item';
            const date = new Date(entry.timestamp);
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            li.innerHTML = `
                <span class="history-winner">${entry.winner}</span>
                <span class="history-meta">
                    <span class="history-tab">${entry.tabName}</span>
                    <span class="history-time">${timeStr}</span>
                </span>
            `;
            historyList.appendChild(li);
        });
    }

    // --- Wheel Logic ---

    function drawWheel() {
        if (!canvas || !ctx) return;

        const tab = getCurrentTab();
        const options = tab.options;
        const numOptions = options.length;
        const arcSize = (2 * Math.PI) / (numOptions || 1);
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = canvas.width / 2 - 10;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (numOptions === 0) {
            // Draw empty wheel
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.fillStyle = '#333';
            ctx.fill();
            ctx.strokeStyle = '#555';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Add text
            ctx.fillStyle = '#888';
            ctx.font = '20px Inter';
            ctx.textAlign = 'center';
            ctx.fillText('Add options to spin', centerX, centerY);
            return;
        }

        // Colors
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB'];

        // Save context for rotation
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(currentRotation);

        for (let i = 0; i < numOptions; i++) {
            const angle = i * arcSize;

            // Slice
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, radius, angle, angle + arcSize);
            ctx.fillStyle = colors[i % colors.length];
            ctx.fill();
            ctx.strokeStyle = '#222';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Text - dynamic sizing based on number of options
            ctx.save();
            ctx.rotate(angle + arcSize / 2);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#fff';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 3;

            // Dynamic font size
            let fontSize = 16;
            if (numOptions > 20) fontSize = 12;
            if (numOptions > 30) fontSize = 10;
            if (numOptions > 40) fontSize = 8;

            ctx.font = `bold ${fontSize}px Inter`;

            // Truncate text if too long
            let text = options[i];
            if (text.length > 15) {
                text = text.substring(0, 12) + '...';
            }

            ctx.fillText(text, radius - 20, 5);
            ctx.restore();
        }

        ctx.restore();
    }

    function spin() {
        if (isSpinning) return;

        const tab = getCurrentTab();
        if (tab.options.length < 2) {
            showAlert('Not Enough Options', 'Add at least 2 options to spin!');
            return;
        }

        isSpinning = true;
        if (spinBtn) {
            spinBtn.disabled = true;
            spinBtn.classList.add('spinning');
        }
        if (resultDisplay) resultDisplay.textContent = 'Spinning...';

        // Random spin duration and rotation
        const extraSpins = 5 + Math.random() * 5; // 5-10 full spins
        const randomAngle = Math.random() * 2 * Math.PI;

        // Calculate total rotation needed
        const deltaRotation = (extraSpins * 2 * Math.PI) + randomAngle;
        const startRotation = currentRotation;
        const targetRotation = startRotation + deltaRotation;

        let startTime = null;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / SPIN_DURATION, 1);

            // Easing function (easeOutCubic)
            const ease = 1 - Math.pow(1 - progress, 3);

            currentRotation = startRotation + (targetRotation - startRotation) * ease;
            drawWheel();

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                isSpinning = false;
                if (spinBtn) {
                    spinBtn.disabled = false;
                    spinBtn.classList.remove('spinning');
                }
                determineWinner();
            }
        }

        requestAnimationFrame(step);
    }

    function determineWinner() {
        const tab = getCurrentTab();
        const numOptions = tab.options.length;
        const arcSize = (2 * Math.PI) / numOptions;

        // Normalize rotation to 0-2PI
        let normalizedRotation = currentRotation % (2 * Math.PI);

        // The pointer is fixed at the top (-PI/2)
        const pointerAngle = -Math.PI / 2;
        let relativeAngle = pointerAngle - normalizedRotation;

        // Normalize relative angle to 0-2PI
        while (relativeAngle < 0) relativeAngle += 2 * Math.PI;
        while (relativeAngle >= 2 * Math.PI) relativeAngle -= 2 * Math.PI;

        const index = Math.floor(relativeAngle / arcSize);
        const winner = tab.options[index];

        if (resultDisplay) resultDisplay.textContent = `Winner: ${winner}`;
        addToHistory(winner, tab.name);
        showWinnerModal(winner);
    }

    // --- Modal Logic ---

    function showWinnerModal(winner) {
        if (winnerResult) winnerResult.textContent = winner;
        if (winnerModal) winnerModal.classList.add('active');
        launchConfetti();
    }

    function hideWinnerModal() {
        if (winnerModal) winnerModal.classList.remove('active');
    }

    function launchConfetti() {
        if (!confettiCanvas) return;

        const ctx = confettiCanvas.getContext('2d');
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;

        const particles = [];
        const particleCount = 150;
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB'];

        // Create particles
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * confettiCanvas.width,
                y: Math.random() * confettiCanvas.height - confettiCanvas.height,
                r: Math.random() * 6 + 2,
                d: Math.random() * particleCount,
                color: colors[Math.floor(Math.random() * colors.length)],
                tilt: Math.floor(Math.random() * 10) - 10,
                tiltAngleIncremental: Math.random() * 0.07 + 0.05,
                tiltAngle: 0
            });
        }

        let animationFrame;
        function draw() {
            ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

            particles.forEach((p, i) => {
                ctx.beginPath();
                ctx.lineWidth = p.r / 2;
                ctx.strokeStyle = p.color;
                ctx.moveTo(p.x + p.tilt + p.r, p.y);
                ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r);
                ctx.stroke();

                // Update
                p.tiltAngle += p.tiltAngleIncremental;
                p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
                p.tilt = Math.sin(p.tiltAngle - i / 3) * 15;

                // Reset if out of view
                if (p.y > confettiCanvas.height) {
                    particles[i] = {
                        ...p,
                        x: Math.random() * confettiCanvas.width,
                        y: -10,
                        tilt: Math.floor(Math.random() * 10) - 10
                    };
                }
            });

            animationFrame = requestAnimationFrame(draw);
        }

        draw();

        // Stop after 5 seconds
        setTimeout(() => {
            cancelAnimationFrame(animationFrame);
            ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        }, 5000);
    }

    // --- Custom Modals ---

    function showAlert(title, message) {
        return new Promise((resolve) => {
            if (!alertModal) {
                alert(message);
                resolve();
                return;
            }

            if (alertTitle) alertTitle.textContent = title;
            if (alertMessage) alertMessage.textContent = message;
            alertModal.classList.add('active');

            const handleOk = () => {
                alertModal.classList.remove('active');
                if (alertOkBtn) alertOkBtn.removeEventListener('click', handleOk);
                resolve();
            };

            if (alertOkBtn) alertOkBtn.addEventListener('click', handleOk);
        });
    }

    function showConfirm(title, message) {
        return new Promise((resolve) => {
            if (!confirmModal) {
                resolve(confirm(message));
                return;
            }

            if (confirmTitle) confirmTitle.textContent = title;
            if (confirmMessage) confirmMessage.textContent = message;
            confirmModal.classList.add('active');

            const handleOk = () => {
                confirmModal.classList.remove('active');
                cleanup();
                resolve(true);
            };

            const handleCancel = () => {
                confirmModal.classList.remove('active');
                cleanup();
                resolve(false);
            };

            const cleanup = () => {
                if (confirmOkBtn) confirmOkBtn.removeEventListener('click', handleOk);
                if (confirmCancelBtn) confirmCancelBtn.removeEventListener('click', handleCancel);
            };

            if (confirmOkBtn) confirmOkBtn.addEventListener('click', handleOk);
            if (confirmCancelBtn) confirmCancelBtn.addEventListener('click', handleCancel);
        });
    }

    function showPrompt(title, message, defaultValue = '') {
        return new Promise((resolve) => {
            if (!promptModal) {
                resolve(prompt(message, defaultValue));
                return;
            }

            if (promptTitle) promptTitle.textContent = title;
            if (promptMessage) promptMessage.textContent = message;
            if (promptInput) {
                promptInput.value = defaultValue;
                setTimeout(() => promptInput.focus(), 100);
            }
            promptModal.classList.add('active');

            const handleOk = () => {
                const value = promptInput ? promptInput.value.trim() : null;
                promptModal.classList.remove('active');
                cleanup();
                resolve(value || null);
            };

            const handleCancel = () => {
                promptModal.classList.remove('active');
                cleanup();
                resolve(null);
            };

            const handleEnter = (e) => {
                if (e.key === 'Enter') handleOk();
            };

            const cleanup = () => {
                if (promptOkBtn) promptOkBtn.removeEventListener('click', handleOk);
                if (promptCancelBtn) promptCancelBtn.removeEventListener('click', handleCancel);
                if (promptInput) promptInput.removeEventListener('keydown', handleEnter);
            };

            if (promptOkBtn) promptOkBtn.addEventListener('click', handleOk);
            if (promptCancelBtn) promptCancelBtn.addEventListener('click', handleCancel);
            if (promptInput) promptInput.addEventListener('keydown', handleEnter);
        });
    }

    // --- Tab Logic ---

    function renderTabs() {
        if (!tabsList) return;

        tabsList.innerHTML = '';
        tabs.forEach(tab => {
            const btn = document.createElement('button');
            btn.className = `tab-btn ${tab.id === currentTabId ? 'active' : ''}`;
            btn.textContent = tab.name;
            btn.dataset.id = tab.id;
            btn.setAttribute('role', 'tab');
            btn.setAttribute('aria-selected', tab.id === currentTabId);

            btn.addEventListener('click', () => {
                currentTabId = tab.id;
                saveCurrentTab();
                renderTabs();
                renderOptions();
                drawWheel();
            });

            btn.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                showContextMenu(e, tab.id);
            });

            tabsList.appendChild(btn);
        });
        saveData();
    }

    async function addTab() {
        if (tabs.length >= MAX_TABS) {
            await showAlert('Maximum Tabs Reached', `You can only have ${MAX_TABS} tabs.`);
            return;
        }
        const newId = 'tab-' + Date.now();
        tabs.push({ id: newId, name: `Tab ${tabs.length + 1}`, options: [] });
        currentTabId = newId;
        saveCurrentTab();
        renderTabs();
        renderOptions();
        drawWheel();
    }

    function showContextMenu(e, tabId) {
        if (!contextMenu) return;
        contextMenuTargetId = tabId;
        contextMenu.style.left = `${e.clientX}px`;
        contextMenu.style.top = `${e.clientY}px`;
        contextMenu.classList.add('active');
    }

    function hideContextMenu() {
        if (contextMenu) contextMenu.classList.remove('active');
        contextMenuTargetId = null;
    }

    // --- Option Logic ---

    function renderOptions() {
        if (!optionsList) return;

        const tab = getCurrentTab();
        optionsList.innerHTML = '';

        if (tab.options.length === 0) {
            optionsList.innerHTML = '<li class="options-empty">No options yet. Add some!</li>';
            return;
        }

        tab.options.forEach((opt, index) => {
            const li = document.createElement('li');
            li.className = 'option-item';
            li.setAttribute('role', 'listitem');
            li.innerHTML = `
                <span class="option-text">${opt}</span>
                <button class="delete-option-btn" data-index="${index}" aria-label="Delete ${opt}">&times;</button>
            `;

            li.querySelector('.delete-option-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                removeOption(index);
            });

            optionsList.appendChild(li);
        });
    }

    async function addOption() {
        if (!optionInput) return;

        const text = optionInput.value.trim();
        if (!text) return;

        const tab = getCurrentTab();

        // Check for duplicates
        if (tab.options.includes(text)) {
            await showAlert('Duplicate Option', 'This option already exists!');
            optionInput.focus();
            return;
        }

        // Check limit
        if (tab.options.length >= MAX_OPTIONS) {
            await showAlert('Maximum Options Reached', `You can only have ${MAX_OPTIONS} options per tab.`);
            return;
        }

        tab.options.push(text);
        optionInput.value = '';

        renderOptions();
        drawWheel();
        saveData();
        optionInput.focus();
    }

    function removeOption(index) {
        const tab = getCurrentTab();
        tab.options.splice(index, 1);
        renderOptions();
        drawWheel();
        saveData();
    }

    // --- Event Listeners ---

    function setupEventListeners() {
        if (spinBtn) spinBtn.addEventListener('click', spin);

        if (addTabBtn) addTabBtn.addEventListener('click', addTab);

        if (addOptionBtn) addOptionBtn.addEventListener('click', addOption);

        if (optionInput) {
            optionInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    addOption();
                }
            });
        }

        // Context Menu Actions
        document.addEventListener('click', hideContextMenu);

        if (renameTabAction) {
            renameTabAction.addEventListener('click', async () => {
                if (!contextMenuTargetId) return;
                const tab = tabs.find(t => t.id === contextMenuTargetId);
                const newName = await showPrompt('Rename Tab', 'Enter new name:', tab.name);
                if (newName && newName.trim()) {
                    tab.name = newName.trim();
                    renderTabs();
                }
            });
        }

        if (deleteTabAction) {
            deleteTabAction.addEventListener('click', async () => {
                if (!contextMenuTargetId) return;
                if (tabs.length <= 1) {
                    await showAlert('Cannot Delete', 'Cannot delete the last tab.');
                    return;
                }
                const confirmed = await showConfirm('Delete Tab', 'Are you sure you want to delete this tab?');
                if (confirmed) {
                    tabs = tabs.filter(t => t.id !== contextMenuTargetId);
                    if (currentTabId === contextMenuTargetId) {
                        currentTabId = tabs[0].id;
                        saveCurrentTab();
                    }
                    renderTabs();
                    renderOptions();
                    drawWheel();
                }
            });
        }

        // Modal Listeners
        if (closeModalBtn) closeModalBtn.addEventListener('click', hideWinnerModal);
        if (claimBtn) claimBtn.addEventListener('click', hideWinnerModal);

        window.addEventListener('click', (e) => {
            if (e.target === winnerModal) {
                hideWinnerModal();
            }
        });

        // History
        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener('click', async () => {
                if (history.length === 0) return;
                const confirmed = await showConfirm('Clear History', 'Are you sure you want to clear all history?');
                if (confirmed) {
                    history = [];
                    saveHistory();
                    renderHistory();
                }
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Don't trigger if user is typing in an input
            if (e.target.tagName === 'INPUT') return;

            if (e.key === ' ' || e.key === 'Spacebar') {
                e.preventDefault();
                spin();
            }
        });

        // Resize canvas on window resize
        window.addEventListener('resize', () => {
            if (confettiCanvas) {
                confettiCanvas.width = window.innerWidth;
                confettiCanvas.height = window.innerHeight;
            }
        });
    }
}
