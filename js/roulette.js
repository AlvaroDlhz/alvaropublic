/**
 * Roulette App Logic
 * Handles wheel drawing, spinning, tabs, and options.
 */

document.addEventListener('DOMContentLoaded', () => {
    initRoulette();
});

function initRoulette() {
    // --- State ---
    const MAX_TABS = 10;
    let tabs = loadData() || [
        { id: 'tab-1', name: 'Lunch', options: ['Pizza', 'Burger', 'Salad', 'Sushi', 'Tacos'] }
    ];
    let currentTabId = tabs[0].id;
    let isSpinning = false;
    let currentRotation = 0;

    // --- DOM Elements ---
    const canvas = document.getElementById('roulette-wheel');
    const ctx = canvas.getContext('2d');
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

    // Modal Elements
    const winnerModal = document.getElementById('winner-modal');
    const winnerResult = document.getElementById('winner-result');
    const closeModalBtn = document.querySelector('.close-modal-btn');
    const claimBtn = document.querySelector('.claim-btn');

    let contextMenuTargetId = null;

    // --- Initialization ---
    renderTabs();
    renderOptions();
    drawWheel();
    setupEventListeners();

    // --- Core Functions ---

    function getCurrentTab() {
        return tabs.find(t => t.id === currentTabId);
    }

    function saveData() {
        localStorage.setItem('rouletteData', JSON.stringify(tabs));
    }

    function loadData() {
        const data = localStorage.getItem('rouletteData');
        return data ? JSON.parse(data) : null;
    }

    // --- Wheel Logic ---

    function drawWheel() {
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
            ctx.stroke();
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

            // Text
            ctx.save();
            ctx.rotate(angle + arcSize / 2);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 16px Inter';
            ctx.fillText(options[i], radius - 20, 5);
            ctx.restore();
        }

        ctx.restore();
    }

    function spin() {
        if (isSpinning) return;

        const tab = getCurrentTab();
        if (tab.options.length < 2) {
            alert('Add at least 2 options to spin!');
            return;
        }

        isSpinning = true;
        resultDisplay.textContent = 'Spinning...';

        // Random spin duration and rotation
        const spinDuration = 4000; // 4 seconds
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
            const progress = Math.min(elapsed / spinDuration, 1);

            // Easing function (easeOutCubic)
            const ease = 1 - Math.pow(1 - progress, 3);

            currentRotation = startRotation + (targetRotation - startRotation) * ease;
            drawWheel();

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                isSpinning = false;
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
        // Angle of the pointer in the wheel's coordinate system
        // pointerAngleInWheel = pointerAngle - wheelRotation
        const pointerAngle = -Math.PI / 2;
        let relativeAngle = pointerAngle - normalizedRotation;

        // Normalize relative angle to 0-2PI
        while (relativeAngle < 0) relativeAngle += 2 * Math.PI;
        while (relativeAngle >= 2 * Math.PI) relativeAngle -= 2 * Math.PI;

        const index = Math.floor(relativeAngle / arcSize);
        const winner = tab.options[index];

        resultDisplay.textContent = `Winner: ${winner}`;
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
        // Placeholder for confetti
        console.log("Confetti!");
    }

    // --- Tab Logic ---

    function renderTabs() {
        tabsList.innerHTML = '';
        tabs.forEach(tab => {
            const btn = document.createElement('button');
            btn.className = `tab-btn ${tab.id === currentTabId ? 'active' : ''}`;
            btn.textContent = tab.name;
            btn.dataset.id = tab.id;

            btn.addEventListener('click', () => {
                currentTabId = tab.id;
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

    function addTab() {
        if (tabs.length >= MAX_TABS) {
            alert('Maximum 10 tabs allowed.');
            return;
        }
        const newId = 'tab-' + Date.now();
        tabs.push({ id: newId, name: `Tab ${tabs.length + 1}`, options: [] });
        currentTabId = newId;
        renderTabs();
        renderOptions();
        drawWheel();
    }

    function showContextMenu(e, tabId) {
        contextMenuTargetId = tabId;
        contextMenu.style.left = `${e.clientX}px`;
        contextMenu.style.top = `${e.clientY}px`;
        contextMenu.classList.add('active');
    }

    function hideContextMenu() {
        contextMenu.classList.remove('active');
        contextMenuTargetId = null;
    }

    // --- Option Logic ---

    function renderOptions() {
        const tab = getCurrentTab();
        optionsList.innerHTML = '';

        tab.options.forEach((opt, index) => {
            const li = document.createElement('li');
            li.className = 'option-item';
            li.innerHTML = `
                <span class="option-text">${opt}</span>
                <button class="delete-option-btn" data-index="${index}">&times;</button>
            `;

            li.querySelector('.delete-option-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                removeOption(index);
            });

            optionsList.appendChild(li);
        });
    }

    function addOption() {
        const text = optionInput.value.trim();
        if (!text) return;

        const tab = getCurrentTab();
        tab.options.push(text);
        optionInput.value = '';

        renderOptions();
        drawWheel();
        saveData();
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
            renameTabAction.addEventListener('click', () => {
                if (!contextMenuTargetId) return;
                const tab = tabs.find(t => t.id === contextMenuTargetId);
                const newName = prompt('Enter new name:', tab.name);
                if (newName) {
                    tab.name = newName;
                    renderTabs();
                }
            });
        }

        if (deleteTabAction) {
            deleteTabAction.addEventListener('click', () => {
                if (!contextMenuTargetId) return;
                if (tabs.length <= 1) {
                    alert('Cannot delete the last tab.');
                    return;
                }
                if (confirm('Delete this tab?')) {
                    tabs = tabs.filter(t => t.id !== contextMenuTargetId);
                    if (currentTabId === contextMenuTargetId) {
                        currentTabId = tabs[0].id;
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
    }
}
