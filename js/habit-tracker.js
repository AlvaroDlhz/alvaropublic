// ===================================
// Habit Tracker - JavaScript (Fixed & Optimized)
// ===================================

// ===================================
// Date Utility Helper (Fixes Timezone Issues)
// ===================================
const DateUtils = {
    // Returns YYYY-MM-DD string based on LOCAL time, not UTC
    getTodayStr() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    // Format for display
    formatDateFriendly(dateObj) {
        return dateObj.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
};

// ===================================
// Storage Manager
// ===================================
class StorageManager {
    constructor() {
        this.storageKey = 'habitTrackerData';
    }

    getData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : { habits: [] };
        } catch (error) {
            console.error('Error loading data:', error);
            return { habits: [] };
        }
    }

    saveData(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            return false;
        }
    }

    exportData() {
        const data = this.getData();
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `habit-tracker-backup-${DateUtils.getTodayStr()}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }

    importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data.habits && Array.isArray(data.habits)) {
                        this.saveData(data);
                        resolve(data);
                    } else {
                        reject(new Error('Invalid data format'));
                    }
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    clearData() {
        localStorage.removeItem(this.storageKey);
    }
}

// ===================================
// Habit Manager
// ===================================
class HabitManager {
    constructor() {
        this.storage = new StorageManager();
        this.data = this.storage.getData();
    }

    getAllHabits() {
        return this.data.habits;
    }

    getHabitById(id) {
        return this.data.habits.find(h => h.id === id);
    }

    createHabit(habitData) {
        const habit = {
            id: this.generateId(),
            name: habitData.name,
            description: habitData.description || '',
            category: habitData.category || 'Other',
            color: habitData.color || '#6366f1',
            frequency: habitData.frequency || 'daily',
            customDays: habitData.customDays || [],
            createdAt: DateUtils.getTodayStr(), // Fixed: Use local date
            completions: {},
            currentStreak: 0,
            longestStreak: 0
        };

        this.data.habits.push(habit);
        this.storage.saveData(this.data);
        return habit;
    }

    updateHabit(id, updates) {
        const index = this.data.habits.findIndex(h => h.id === id);
        if (index !== -1) {
            this.data.habits[index] = { ...this.data.habits[index], ...updates };
            this.storage.saveData(this.data);
            return this.data.habits[index];
        }
        return null;
    }

    deleteHabit(id) {
        const index = this.data.habits.findIndex(h => h.id === id);
        if (index !== -1) {
            this.data.habits.splice(index, 1);
            this.storage.saveData(this.data);
            return true;
        }
        return false;
    }

    toggleCompletion(habitId) {
        // Use local date string to avoid timezone bugs
        const dateStr = DateUtils.getTodayStr();
        const habit = this.getHabitById(habitId);
        if (!habit) return false;

        if (habit.completions[dateStr]) {
            delete habit.completions[dateStr];
        } else {
            habit.completions[dateStr] = true;
        }

        this.updateStreaks(habit);
        this.storage.saveData(this.data);
        return habit.completions[dateStr] || false;
    }

    isCompletedToday(habitId) {
        const dateStr = DateUtils.getTodayStr();
        const habit = this.getHabitById(habitId);
        return habit ? habit.completions[dateStr] === true : false;
    }

    updateStreaks(habit) {
        const dates = Object.keys(habit.completions).sort().reverse();
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;

        // Use standard JS Date handling for day diff calculation
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < dates.length; i++) {
            const dateParts = dates[i].split('-');
            // Construct date explicitly to avoid UTC shift
            const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);

            if (i === 0) {
                const daysDiff = Math.floor((today - date) / (1000 * 60 * 60 * 24));
                if (daysDiff <= 1) {
                    tempStreak = 1;
                    currentStreak = 1;
                }
            } else {
                const prevParts = dates[i - 1].split('-');
                const prevDate = new Date(prevParts[0], prevParts[1] - 1, prevParts[2]);
                const daysDiff = Math.floor((prevDate - date) / (1000 * 60 * 60 * 24));

                if (daysDiff === 1) {
                    tempStreak++;
                    if (i === 1 || currentStreak > 0) {
                        currentStreak = tempStreak;
                    }
                } else {
                    tempStreak = 1;
                }
            }
            longestStreak = Math.max(longestStreak, tempStreak);
        }

        habit.currentStreak = currentStreak;
        habit.longestStreak = longestStreak;
    }

    getCompletionRate(habitId) {
        const habit = this.getHabitById(habitId);
        if (!habit) return 0;

        // Simple calculation: total completions / total days since creation
        const completions = Object.keys(habit.completions).length;
        if (completions === 0) return 0;

        const createdParts = habit.createdAt.split('-');
        const createdDate = new Date(createdParts[0], createdParts[1] - 1, createdParts[2]);
        const today = new Date();
        const daysSinceCreation = Math.max(1, Math.floor((today - createdDate) / (1000 * 60 * 60 * 24)) + 1);

        return Math.round((completions / daysSinceCreation) * 100);
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}

// ===================================
// UI Controller
// ===================================
class UIController {
    constructor(habitManager) {
        this.habitManager = habitManager;
        this.currentView = 'habits';
        this.currentMonth = new Date();
        this.selectedCalendarHabit = 'all';
        this.editingHabitId = null;

        this.initializeElements();
        this.attachEventListeners();
        this.render();
    }

    initializeElements() {
        // View tabs
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.viewSections = document.querySelectorAll('.view-section');

        // Habits view
        this.habitsList = document.getElementById('habitsList');
        this.emptyState = document.getElementById('emptyState');
        this.todayDate = document.getElementById('todayDate');

        // Calendar view
        this.calendarGrid = document.getElementById('calendarGrid');
        this.currentMonthEl = document.getElementById('currentMonth');
        this.calendarHabitSelect = document.getElementById('calendarHabitSelect');

        // Stats view
        this.totalStreakStat = document.getElementById('totalStreakStat');
        this.completionRateStat = document.getElementById('completionRateStat');
        this.totalHabitsStat = document.getElementById('totalHabitsStat');
        this.bestStreakStat = document.getElementById('bestStreakStat');
        this.habitStatsList = document.getElementById('habitStatsList');

        // Modals
        this.habitModal = document.getElementById('habitModal');
        this.settingsModal = document.getElementById('settingsModal');
        this.confirmModal = document.getElementById('confirmModal');

        // Forms
        this.habitForm = document.getElementById('habitForm');
        this.habitNameInput = document.getElementById('habitName');
        this.habitDescriptionInput = document.getElementById('habitDescription');
        this.habitCategoryInput = document.getElementById('habitCategory');
        this.habitColorInput = document.getElementById('habitColor');
        this.habitFrequencyInput = document.getElementById('habitFrequency');
        this.customDaysGroup = document.getElementById('customDaysGroup');
        this.customDaysInput = document.getElementById('customDays');
        this.habitIdInput = document.getElementById('habitId');

        // Buttons
        this.addHabitFab = document.getElementById('addHabitFab');
        this.addFirstHabitBtn = document.getElementById('addFirstHabitBtn');

        // Nav & Mobile
        this.settingsBtn = document.getElementById('settingsBtn');
        this.navSettingsBtn = document.getElementById('navSettingsBtn');
        this.mobileMenuBtn = document.getElementById('mobileMenuBtn');
        this.mobileMenuOverlay = document.getElementById('mobileMenuOverlay');

        // Toast
        this.toast = document.getElementById('toast');
        this.toastMessage = document.getElementById('toastMessage');
    }

    attachEventListeners() {
        // --- Navigation & View ---
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchView(btn.dataset.view));
        });

        // --- Settings Button (Fixed logic) ---
        // Handle desktop button
        if (this.navSettingsBtn) {
            this.navSettingsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openSettingsModal();
            });
        }
        // Handle mobile icon button
        if (this.settingsBtn) {
            this.settingsBtn.addEventListener('click', () => this.openSettingsModal());
        }

        // --- Mobile Menu Toggle ---
        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.addEventListener('click', () => this.toggleMobileMenu());
        }
        // Close menu when clicking links
        document.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.toggleMobileMenu(false); // close menu
                if (action === 'settings') {
                    this.openSettingsModal();
                } else {
                    this.switchView('habits');
                }
            });
        });

        // --- Habit List (Event Delegation Optimization) ---
        // Instead of adding listeners to every button on render, we add ONE here
        if (this.habitsList) {
            this.habitsList.addEventListener('click', (e) => {
                const target = e.target.closest('[data-action]');
                if (!target) return;

                const habitId = target.dataset.habitId;
                const action = target.dataset.action;

                if (action === 'toggle') {
                    this.toggleHabitCompletion(habitId);
                } else if (action === 'edit') {
                    e.stopPropagation(); // Prevent triggering other clicks
                    this.editHabit(habitId);
                } else if (action === 'delete') {
                    e.stopPropagation();
                    this.deleteHabit(habitId);
                }
            });
        }

        // --- Forms & Modals ---
        this.addHabitFab.addEventListener('click', () => this.openHabitModal());
        if (this.addFirstHabitBtn) {
            this.addFirstHabitBtn.addEventListener('click', () => this.openHabitModal());
        }

        this.habitForm.addEventListener('submit', (e) => this.handleHabitSubmit(e));
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeHabitModal());
        document.getElementById('closeModalBtn').addEventListener('click', () => this.closeHabitModal());
        document.getElementById('closeSettingsBtn').addEventListener('click', () => this.closeSettingsModal());

        // --- Inputs ---
        this.habitFrequencyInput.addEventListener('change', () => this.toggleCustomDays());

        // Custom Days delegation
        const daysContainer = document.querySelector('.days-selector');
        if (daysContainer) {
            daysContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('day-btn')) {
                    this.toggleDay(e.target);
                }
            });
        }

        this.habitColorInput.addEventListener('input', (e) => {
            document.getElementById('colorPreview').style.background = e.target.value;
        });

        // --- Calendar ---
        document.getElementById('prevMonthBtn').addEventListener('click', () => this.changeMonth(-1));
        document.getElementById('nextMonthBtn').addEventListener('click', () => this.changeMonth(1));
        this.calendarHabitSelect.addEventListener('change', (e) => {
            this.selectedCalendarHabit = e.target.value;
            this.renderCalendar();
        });

        // --- Data Management (Fixed IDs) ---
        // Only attach if elements exist
        const exportBtn = document.getElementById('exportDataBtn');
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportData());

        const importBtn = document.getElementById('importDataBtn');
        if (importBtn) importBtn.addEventListener('click', () => this.triggerImport());

        document.getElementById('importFileInput').addEventListener('change', (e) => this.importData(e));
        document.getElementById('clearAllDataBtn').addEventListener('click', () => this.confirmClearData());

        // Modal overlays
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeAllModals();
                }
            });
        });
    }

    // --- UI Logic ---

    toggleMobileMenu(forceState = null) {
        const isOpen = forceState !== null ? forceState : !this.mobileMenuOverlay.classList.contains('active');

        if (isOpen) {
            this.mobileMenuOverlay.classList.add('active');
            // Optional: Animate hamburger to X
        } else {
            this.mobileMenuOverlay.classList.remove('active');
        }
    }

    render() {
        this.updateTodayDate();
        this.renderHabits();
        this.renderCalendar();
        this.renderStats();
        this.updateCalendarHabitSelect();
    }

    updateTodayDate() {
        const today = new Date();
        this.todayDate.textContent = DateUtils.formatDateFriendly(today);
    }

    renderHabits() {
        const habits = this.habitManager.getAllHabits();

        if (habits.length === 0) {
            this.habitsList.style.display = 'none';
            this.emptyState.classList.add('show');
            return;
        }

        this.habitsList.style.display = 'grid';
        this.emptyState.classList.remove('show');

        // Note: Event listeners are handled via delegation in attachEventListeners
        this.habitsList.innerHTML = habits.map(habit => {
            const isCompleted = this.habitManager.isCompletedToday(habit.id);
            return `
                <div class="habit-card" style="--habit-color: ${habit.color}">
                    <div class="habit-checkbox ${isCompleted ? 'checked' : ''}" 
                         data-habit-id="${habit.id}" data-action="toggle" role="button" aria-label="Toggle habit">
                    </div>
                    <div class="habit-info">
                        <div class="habit-name">${this.escapeHtml(habit.name)}</div>
                        ${habit.description ? `<div class="habit-description">${this.escapeHtml(habit.description)}</div>` : ''}
                        <div class="habit-meta">
                            <span class="habit-category">${habit.category}</span>
                            <span class="habit-streak">
                                <span class="streak-icon">🔥</span>
                                ${habit.currentStreak} day streak
                            </span>
                        </div>
                    </div>
                    <div class="habit-actions">
                        <button class="habit-btn" data-habit-id="${habit.id}" data-action="edit" title="Edit">
                            ✏️
                        </button>
                        <button class="habit-btn delete" data-habit-id="${habit.id}" data-action="delete" title="Delete">
                            🗑️
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderCalendar() {
        const year = this.currentMonth.getFullYear();
        const month = this.currentMonth.getMonth();

        this.currentMonthEl.textContent = this.currentMonth.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        });

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let html = '';

        // Headers
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayHeaders.forEach(day => html += `<div class="calendar-day header">${day}</div>`);

        // Empty cells for previous month
        for (let i = 0; i < firstDay; i++) {
            html += `<div class="calendar-day other-month"></div>`;
        }

        // Days
        for (let day = 1; day <= daysInMonth; day++) {
            // Construct YYYY-MM-DD manually to match storage keys
            const currentMonthStr = String(month + 1).padStart(2, '0');
            const currentDayStr = String(day).padStart(2, '0');
            const dateStr = `${year}-${currentMonthStr}-${currentDayStr}`;

            let status = '';
            if (this.selectedCalendarHabit === 'all') {
                const habits = this.habitManager.getAllHabits();
                if (habits.length > 0) {
                    const completedCount = habits.filter(h => h.completions[dateStr]).length;
                    // Simple logic: if any habit done, show green (or logic for all)
                    if (completedCount > 0) status = 'completed';
                }
            } else {
                const habit = this.habitManager.getHabitById(this.selectedCalendarHabit);
                if (habit && habit.completions[dateStr]) {
                    status = 'completed';
                }
            }

            // Highlight today
            const todayStr = DateUtils.getTodayStr();
            const isToday = dateStr === todayStr ? 'today' : '';

            html += `<div class="calendar-day ${status} ${isToday}">${day}</div>`;
        }

        this.calendarGrid.innerHTML = html;
    }

    renderStats() {
        const habits = this.habitManager.getAllHabits();

        const totalStreaks = habits.reduce((sum, h) => sum + h.currentStreak, 0);
        const bestStreak = habits.length > 0 ? Math.max(...habits.map(h => h.longestStreak)) : 0;
        const avgCompletionRate = habits.length > 0
            ? Math.round(habits.reduce((sum, h) => sum + this.habitManager.getCompletionRate(h.id), 0) / habits.length)
            : 0;

        this.totalStreakStat.textContent = totalStreaks;
        this.completionRateStat.textContent = `${avgCompletionRate}%`;
        this.totalHabitsStat.textContent = habits.length;
        this.bestStreakStat.textContent = bestStreak;

        this.habitStatsList.innerHTML = habits.map(habit => {
            const completionRate = this.habitManager.getCompletionRate(habit.id);
            const totalCompletions = Object.keys(habit.completions).length;

            return `
                <div class="habit-stat-item" style="--habit-color: ${habit.color}">
                    <div class="habit-stat-header">
                        <span class="habit-stat-name">${this.escapeHtml(habit.name)}</span>
                    </div>
                    <div class="habit-stat-metrics">
                        <div class="metric">
                            <div class="metric-value">${habit.currentStreak}</div>
                            <div class="metric-label">Current Streak</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value">${habit.longestStreak}</div>
                            <div class="metric-label">Best Streak</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value">${totalCompletions}</div>
                            <div class="metric-label">Total Days</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value">${completionRate}%</div>
                            <div class="metric-label">Completion Rate</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateCalendarHabitSelect() {
        const habits = this.habitManager.getAllHabits();
        const currentSelection = this.selectedCalendarHabit;

        const options = habits.map(h =>
            `<option value="${h.id}">${this.escapeHtml(h.name)}</option>`
        ).join('');

        this.calendarHabitSelect.innerHTML = `
            <option value="all">All Habits</option>
            ${options}
        `;

        // Restore selection if possible
        if (currentSelection && (currentSelection === 'all' || habits.find(h => h.id === currentSelection))) {
            this.calendarHabitSelect.value = currentSelection;
        }
    }

    switchView(view) {
        this.currentView = view;

        // Close mobile menu if open
        this.toggleMobileMenu(false);

        this.tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        this.viewSections.forEach(section => {
            section.classList.toggle('active', section.id === `${view}View`);
        });

        if (view === 'calendar') this.renderCalendar();
        if (view === 'stats') this.renderStats();
    }

    toggleHabitCompletion(habitId) {
        const isCompleted = this.habitManager.toggleCompletion(habitId);
        this.renderHabits();

        // No need to re-render everything unless specific view active
        if (this.currentView === 'stats') this.renderStats();
        if (this.currentView === 'calendar') this.renderCalendar();

        const habit = this.habitManager.getHabitById(habitId);
        if (isCompleted) {
            this.showToast(`✓ ${habit.name} completed! 🎉`);
            // Add simple animation class to card if desired
        }
    }

    openHabitModal(habitId = null) {
        this.editingHabitId = habitId;

        if (habitId) {
            const habit = this.habitManager.getHabitById(habitId);
            if (habit) {
                document.getElementById('modalTitle').textContent = 'Edit Habit';
                this.habitNameInput.value = habit.name;
                this.habitDescriptionInput.value = habit.description;
                this.habitCategoryInput.value = habit.category;
                this.habitColorInput.value = habit.color;
                this.habitFrequencyInput.value = habit.frequency;
                this.habitIdInput.value = habit.id;

                if (habit.frequency === 'custom') {
                    this.customDaysInput.value = JSON.stringify(habit.customDays);
                    this.showCustomDays(habit.customDays);
                } else {
                    this.customDaysInput.value = '[]';
                    this.showCustomDays([]);
                }
            }
        } else {
            document.getElementById('modalTitle').textContent = 'Add New Habit';
            this.habitForm.reset();
            this.habitColorInput.value = '#6366f1';
            this.habitIdInput.value = '';
            this.customDaysInput.value = '[]';
            this.showCustomDays([]);
        }

        document.getElementById('colorPreview').style.background = this.habitColorInput.value;
        this.toggleCustomDays();
        this.habitModal.classList.add('show');
    }

    closeHabitModal() {
        this.habitModal.classList.remove('show');
        this.editingHabitId = null;
    }

    handleHabitSubmit(e) {
        e.preventDefault();

        const habitData = {
            name: this.habitNameInput.value.trim(),
            description: this.habitDescriptionInput.value.trim(),
            category: this.habitCategoryInput.value,
            color: this.habitColorInput.value,
            frequency: this.habitFrequencyInput.value,
            customDays: JSON.parse(this.customDaysInput.value || '[]')
        };

        if (this.editingHabitId) {
            this.habitManager.updateHabit(this.editingHabitId, habitData);
            this.showToast('Habit updated successfully!');
        } else {
            this.habitManager.createHabit(habitData);
            this.showToast('Habit created successfully! 🎉');
        }

        this.closeHabitModal();
        this.render();
    }

    toggleCustomDays() {
        const isCustom = this.habitFrequencyInput.value === 'custom';
        this.customDaysGroup.classList.toggle('hidden', !isCustom);
    }

    showCustomDays(selectedDays) {
        document.querySelectorAll('.day-btn').forEach(btn => {
            const day = parseInt(btn.dataset.day);
            btn.classList.toggle('active', selectedDays.includes(day));
        });
    }

    toggleDay(btn) {
        btn.classList.toggle('active');
        const selectedDays = Array.from(document.querySelectorAll('.day-btn.active'))
            .map(b => parseInt(b.dataset.day));
        this.customDaysInput.value = JSON.stringify(selectedDays);
    }

    editHabit(habitId) {
        this.openHabitModal(habitId);
    }

    deleteHabit(habitId) {
        const habit = this.habitManager.getHabitById(habitId);
        if (!habit) return;

        this.showConfirmDialog(
            'Delete Habit',
            `Are you sure you want to delete "${habit.name}"?`,
            () => {
                this.habitManager.deleteHabit(habitId);
                this.render();
                this.showToast('Habit deleted');
            }
        );
    }

    changeMonth(direction) {
        this.currentMonth.setMonth(this.currentMonth.getMonth() + direction);
        this.renderCalendar();
    }

    openSettingsModal() {
        this.settingsModal.classList.add('show');
    }

    closeSettingsModal() {
        this.settingsModal.classList.remove('show');
    }

    exportData() {
        this.habitManager.storage.exportData();
        this.showToast('Data exported successfully! 📥');
    }

    triggerImport() {
        document.getElementById('importFileInput').click();
    }

    async importData(e) {
        const file = e.target.files[0];
        if (!file) return;

        try {
            await this.habitManager.storage.importData(file);
            this.habitManager.data = this.habitManager.storage.getData();
            this.render();
            this.showToast('Data imported successfully! 📤');
            this.closeSettingsModal();
        } catch (error) {
            this.showToast('Error: Invalid file format');
        }

        e.target.value = '';
    }

    confirmClearData() {
        this.showConfirmDialog(
            'Clear All Data',
            'Delete all habits and data? This cannot be undone!',
            () => {
                this.habitManager.storage.clearData();
                this.habitManager.data = { habits: [] };
                this.render();
                this.closeSettingsModal();
                this.showToast('All data cleared');
            }
        );
    }

    showConfirmDialog(title, message, onConfirm) {
        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmMessage').textContent = message;

        const confirmBtn = document.getElementById('confirmActionBtn');
        const cancelBtn = document.getElementById('confirmCancelBtn');

        // Clean up previous listeners if any (simple cloning approach)
        const newConfirmBtn = confirmBtn.cloneNode(true);
        const newCancelBtn = cancelBtn.cloneNode(true);

        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

        newConfirmBtn.addEventListener('click', () => {
            onConfirm();
            this.confirmModal.classList.remove('show');
        });

        newCancelBtn.addEventListener('click', () => {
            this.confirmModal.classList.remove('show');
        });

        this.confirmModal.classList.add('show');
    }

    closeAllModals() {
        this.habitModal.classList.remove('show');
        this.settingsModal.classList.remove('show');
        this.confirmModal.classList.remove('show');
    }

    showToast(message) {
        this.toastMessage.textContent = message;
        this.toast.classList.add('show');

        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 3000);
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// ===================================
// Initialize App
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    const habitManager = new HabitManager();
    const app = new UIController(habitManager);
});