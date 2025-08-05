/**
 * To-Do List Application
 * A modern, responsive to-do list with full CRUD functionality
 */

class TodoApp {
    constructor() {
        // In-memory storage for tasks (no localStorage due to sandbox limitations)
        this.tasks = [];
        this.nextId = 1;
        
        // DOM element references
        this.taskInput = document.getElementById('taskInput');
        this.addTaskBtn = document.getElementById('addTaskBtn');
        this.tasksList = document.getElementById('tasksList');
        this.emptyState = document.getElementById('emptyState');
        this.tasksContainer = document.getElementById('tasksContainer');
        this.clearCompletedBtn = document.getElementById('clearCompletedBtn');
        
        // Stats elements
        this.totalTasksEl = document.getElementById('totalTasks');
        this.completedTasksEl = document.getElementById('completedTasks');
        this.remainingTasksEl = document.getElementById('remainingTasks');
        
        // Initialize the app
        this.init();
    }
    
    /**
     * Initialize the application
     */
    init() {
        this.bindEvents();
        this.updateUI();
        this.taskInput.focus();
    }
    
    /**
     * Bind all event listeners
     */
    bindEvents() {
        // Add task button click
        this.addTaskBtn.addEventListener('click', () => this.addTask());
        
        // Enter key to add task
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });
        
        // Clear completed tasks
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompletedTasks());
        
        // Input validation - disable/enable add button
        this.taskInput.addEventListener('input', () => this.validateInput());
    }
    
    /**
     * Validate task input and update UI accordingly
     */
    validateInput() {
        const inputValue = this.taskInput.value.trim();
        const isValid = inputValue.length > 0;
        
        this.addTaskBtn.disabled = !isValid;
        
        if (!isValid) {
            this.addTaskBtn.style.opacity = '0.5';
        } else {
            this.addTaskBtn.style.opacity = '1';
        }
    }
    
    /**
     * Add a new task
     */
    addTask() {
        const taskText = this.taskInput.value.trim();
        
        if (!taskText) {
            this.showInputError();
            return;
        }
        
        // Create new task object
        const newTask = {
            id: this.nextId++,
            text: taskText,
            completed: false,
            createdAt: new Date()
        };
        
        // Add to tasks array
        this.tasks.unshift(newTask); // Add to beginning for newest-first order
        
        // Clear input
        this.taskInput.value = '';
        this.validateInput();
        
        // Update UI
        this.updateUI();
        
        // Focus back to input for better UX
        this.taskInput.focus();
        
        // Show success feedback
        this.showAddTaskFeedback();
    }
    
    /**
     * Toggle task completion status
     */
    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.updateUI();
        }
    }
    
    /**
     * Delete a specific task
     */
    deleteTask(taskId) {
        const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
        
        if (taskElement) {
            // Add removing animation class
            taskElement.classList.add('removing');
            
            // Remove from array after animation
            setTimeout(() => {
                this.tasks = this.tasks.filter(t => t.id !== taskId);
                this.updateUI();
            }, 300);
        }
    }
    
    /**
     * Clear all completed tasks
     */
    clearCompletedTasks() {
        const completedTasks = this.tasks.filter(t => t.completed);
        
        if (completedTasks.length === 0) return;
        
        // Add confirmation for better UX
        if (completedTasks.length > 1) {
            if (!confirm(`Are you sure you want to delete ${completedTasks.length} completed tasks?`)) {
                return;
            }
        }
        
        // Remove completed tasks
        this.tasks = this.tasks.filter(t => !t.completed);
        this.updateUI();
        
        // Show feedback
        this.showClearCompletedFeedback(completedTasks.length);
    }
    
    /**
     * Update the entire UI
     */
    updateUI() {
        this.renderTasks();
        this.updateStats();
        this.updateEmptyState();
        this.updateClearButton();
    }
    
    /**
     * Render all tasks in the list
     */
    renderTasks() {
        this.tasksList.innerHTML = '';
        
        this.tasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            this.tasksList.appendChild(taskElement);
        });
    }
    
    /**
     * Create a single task element
     */
    createTaskElement(task) {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.setAttribute('data-task-id', task.id);
        
        li.innerHTML = `
            <input 
                type="checkbox" 
                class="task-checkbox" 
                ${task.completed ? 'checked' : ''}
                aria-label="Mark task as ${task.completed ? 'incomplete' : 'complete'}"
            >
            <span class="task-text">${this.escapeHtml(task.text)}</span>
            <button 
                type="button" 
                class="task-delete-btn" 
                aria-label="Delete task"
                title="Delete task"
            >
                ×
            </button>
        `;
        
        // Bind task-specific events
        const checkbox = li.querySelector('.task-checkbox');
        const deleteBtn = li.querySelector('.task-delete-btn');
        
        checkbox.addEventListener('change', () => this.toggleTask(task.id));
        deleteBtn.addEventListener('click', () => this.deleteTask(task.id));
        
        return li;
    }
    
    /**
     * Update task statistics
     */
    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const remaining = total - completed;
        
        this.totalTasksEl.textContent = total;
        this.completedTasksEl.textContent = completed;
        this.remainingTasksEl.textContent = remaining;
        
        // Add visual feedback for completion
        if (total > 0 && completed === total) {
            this.showAllTasksCompletedFeedback();
        }
    }
    
    /**
     * Show/hide empty state
     */
    updateEmptyState() {
        if (this.tasks.length === 0) {
            this.emptyState.style.display = 'flex';
            this.tasksList.style.display = 'none';
        } else {
            this.emptyState.style.display = 'none';
            this.tasksList.style.display = 'block';
        }
    }
    
    /**
     * Update clear completed button state
     */
    updateClearButton() {
        const hasCompleted = this.tasks.some(t => t.completed);
        this.clearCompletedBtn.disabled = !hasCompleted;
    }
    
    /**
     * Show input error feedback
     */
    showInputError() {
        this.taskInput.style.borderColor = 'var(--color-error)';
        this.taskInput.placeholder = 'Please enter a task...';
        
        setTimeout(() => {
            this.taskInput.style.borderColor = '';
            this.taskInput.placeholder = 'Add a new task...';
            this.taskInput.focus();
        }, 2000);
    }
    
    /**
     * Show add task success feedback
     */
    showAddTaskFeedback() {
        const originalText = this.addTaskBtn.querySelector('.btn-text').textContent;
        const btnText = this.addTaskBtn.querySelector('.btn-text');
        const btnIcon = this.addTaskBtn.querySelector('.btn-icon');
        
        btnText.textContent = 'Added!';
        btnIcon.textContent = '✓';
        this.addTaskBtn.style.background = 'var(--color-success)';
        
        setTimeout(() => {
            btnText.textContent = originalText;
            btnIcon.textContent = '+';
            this.addTaskBtn.style.background = '';
        }, 1000);
    }
    
    /**
     * Show clear completed feedback
     */
    showClearCompletedFeedback(count) {
        const originalText = this.clearCompletedBtn.querySelector('.btn-text').textContent;
        const btnText = this.clearCompletedBtn.querySelector('.btn-text');
        
        btnText.textContent = `Cleared ${count} task${count > 1 ? 's' : ''}!`;
        
        setTimeout(() => {
            btnText.textContent = originalText;
        }, 2000);
    }
    
    /**
     * Show all tasks completed celebration
     */
    showAllTasksCompletedFeedback() {
        // Only show if there are tasks and user just completed the last one
        if (this.tasks.length > 0) {
            const celebration = document.createElement('div');
            celebration.innerHTML = '🎉 All tasks completed! Great job! 🎉';
            celebration.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: var(--color-success);
                color: white;
                padding: var(--space-16) var(--space-24);
                border-radius: var(--radius-lg);
                font-weight: var(--font-weight-semibold);
                box-shadow: var(--shadow-lg);
                z-index: 1000;
                animation: celebrationPop 0.5s ease-out;
            `;
            
            document.body.appendChild(celebration);
            
            setTimeout(() => {
                document.body.removeChild(celebration);
            }, 3000);
        }
    }
    
    /**
     * Escape HTML to prevent XSS attacks
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Get task statistics for external use
     */
    getStats() {
        return {
            total: this.tasks.length,
            completed: this.tasks.filter(t => t.completed).length,
            remaining: this.tasks.filter(t => !t.completed).length
        };
    }
}

// Add celebration animation CSS
const celebrationStyles = document.createElement('style');
celebrationStyles.textContent = `
    @keyframes celebrationPop {
        0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5);
        }
        50% {
            transform: translate(-50%, -50%) scale(1.1);
        }
        100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
    }
`;
document.head.appendChild(celebrationStyles);

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create global app instance
    window.todoApp = new TodoApp();
    
    // Add some sample tasks for demonstration (optional - can be removed)
    // Uncomment the lines below to start with sample tasks
    /*
    setTimeout(() => {
        window.todoApp.tasks = [
            { id: 1, text: "Welcome to your To-Do List!", completed: false, createdAt: new Date() },
            { id: 2, text: "Click the checkbox to mark tasks complete", completed: false, createdAt: new Date() },
            { id: 3, text: "Use the × button to delete tasks", completed: true, createdAt: new Date() }
        ];
        window.todoApp.nextId = 4;
        window.todoApp.updateUI();
    }, 500);
    */
});

// Add keyboard shortcuts for power users
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Shift + C to clear completed tasks
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        if (window.todoApp) {
            window.todoApp.clearCompletedTasks();
        }
    }
    
    // Escape key to clear input
    if (e.key === 'Escape') {
        const taskInput = document.getElementById('taskInput');
        if (taskInput && document.activeElement === taskInput) {
            taskInput.value = '';
            taskInput.blur();
            if (window.todoApp) {
                window.todoApp.validateInput();
            }
        }
    }
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TodoApp;
}
class TodoApp {
    constructor() {
        this.tasks = this.loadTasks(); // Load from localStorage
        // ...rest of your code...
    }

    // Load tasks from localStorage
    loadTasks() {
        const tasksJSON = localStorage.getItem('tasks');
        return tasksJSON ? JSON.parse(tasksJSON) : [];
    }

    // Save tasks to localStorage
    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    addTask() {
        // ...existing code to add a task...
        this.saveTasks(); // Save after adding
        this.updateUI();
    }

    toggleTaskCompletion(taskId) {
        // ...toggle completion logic...
        this.saveTasks(); // Save after toggling
        this.updateUI();
    }

    deleteTask(taskId) {
        // ...deletion logic...
        this.saveTasks(); // Save after deleting
        this.updateUI();
    }

    clearCompletedTasks() {
        // ...clearing logic...
        this.saveTasks(); // Save after clearing completed
        this.updateUI();
    }

    // ...rest of your methods...
}
window.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});

