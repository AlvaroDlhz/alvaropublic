class DashboardUI {
    constructor() {
        this.ws = new WebSocket(`ws://${window.location.host}?token=${localStorage.getItem('token')}`);
        this.setupWebSocket();
        this.loadTasks();
        this.setupEventListeners();
    }

    setupWebSocket() {
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            switch(data.type) {
                case 'NEW_TASK':
                    this.addTaskToUI(data.task);
                    break;
                case 'TASK_UPDATED':
                    this.updateTaskInUI(data.task);
                    break;
                case 'POINTS_UPDATED':
                    this.updatePoints(data.points);
                    break;
            }
        };
    }

    async loadTasks() {
        try {
            const response = await fetch('/api/tasks', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const tasks = await response.json();
            this.renderTasks(tasks);
        } catch (error) {
            console.error('Error al cargar diligencias:', error);
        }
    }

    renderTasks(tasks) {
        const taskList = document.querySelector('.task-list');
        taskList.innerHTML = tasks.map(task => this.createTaskHTML(task)).join('');
    }

    createTaskHTML(task) {
        return `
            <div class="task-item" data-id="${task._id}">
                <div class="task-status ${task.estado}"></div>
                <div class="task-content">
                    <h4>${task.titulo}</h4>
                    <p>${task.descripcion}</p>
                </div>
                <div class="task-actions">
                    ${task.estado !== 'completada' ? `
                        <button class="complete-task" onclick="dashboard.completeTask('${task._id}')">
                            Completar
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    async completeTask(taskId) {
        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ estado: 'completada' })
            });
            
            if (!response.ok) throw new Error('Error al completar la tarea');
            
            // La UI se actualizará a través de WebSocket
        } catch (error) {
            console.error('Error:', error);
        }
    }

    updatePoints(points) {
        const pointsElement = document.querySelector('.points-value');
        pointsElement.textContent = points;
        
        // Animación de puntos
        pointsElement.classList.add('points-updated');
        setTimeout(() => {
            pointsElement.classList.remove('points-updated');
        }, 1000);
    }

    // ... más métodos para otras interacciones ...
}

// Inicializar dashboard
const dashboard = new DashboardUI(); 