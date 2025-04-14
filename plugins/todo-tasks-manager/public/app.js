document.addEventListener('DOMContentLoaded', () => {
  // API base URL
  const API_URL = '/api/plugins/todo-tasks-manager';
  
  // DOM elements
  const todoList = document.getElementById('todo-list');
  const todoForm = document.getElementById('add-todo-form');
  const todoTitle = document.getElementById('todo-title');
  const todoDescription = document.getElementById('todo-description');
  const todoPriority = document.getElementById('todo-priority');
  const todoDueDate = document.getElementById('todo-due-date');
  const filterButtons = document.querySelectorAll('.filter-btn');
  
  // Current filter
  let currentFilter = 'all';
  
  // Fetch and render todos
  const fetchTodos = async () => {
    try {
      todoList.innerHTML = '<div class="loading">Loading tasks...</div>';
      
      const response = await fetch(`${API_URL}/`);
      const result = await response.json();
      
      if (result.success) {
        renderTodos(result.data);
      } else {
        todoList.innerHTML = `<div class="empty-state">
          <i class="fas fa-exclamation-circle"></i>
          <p>Error loading tasks: ${result.message}</p>
        </div>`;
      }
    } catch (error) {
      todoList.innerHTML = `<div class="empty-state">
        <i class="fas fa-exclamation-circle"></i>
        <p>Error loading tasks: ${error.message}</p>
      </div>`;
    }
  };
  
  // Render todos based on current filter
  const renderTodos = (todos) => {
    if (!todos || todos.length === 0) {
      todoList.innerHTML = `<div class="empty-state">
        <i class="fas fa-clipboard-list"></i>
        <p>No tasks found. Add a new task to get started!</p>
      </div>`;
      return;
    }
    
    // Filter todos based on current filter
    const filteredTodos = todos.filter(todo => {
      if (currentFilter === 'all') return true;
      if (currentFilter === 'active') return !todo.completed;
      if (currentFilter === 'completed') return todo.completed;
      return true;
    });
    
    if (filteredTodos.length === 0) {
      todoList.innerHTML = `<div class="empty-state">
        <i class="fas fa-filter"></i>
        <p>No ${currentFilter} tasks found.</p>
      </div>`;
      return;
    }
    
    todoList.innerHTML = '';
    
    filteredTodos.forEach(todo => {
      const todoItem = document.createElement('div');
      todoItem.className = `todo-item ${todo.completed ? 'completed' : ''}`;
      
      const formattedDate = todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : 'No due date';
      const createdDate = new Date(todo.createdAt).toLocaleDateString();
      
      todoItem.innerHTML = `
        <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} data-id="${todo._id}">
        <div class="todo-content">
          <div class="todo-title">${todo.title}</div>
          ${todo.description ? `<div class="todo-description">${todo.description}</div>` : ''}
          <div class="todo-meta">
            <div>
              <span class="priority-badge priority-${todo.priority}">${todo.priority}</span>
              <span>Due: ${formattedDate}</span>
            </div>
            <div>Created: ${createdDate}</div>
          </div>
        </div>
        <div class="todo-actions">
          <button class="edit-btn" data-id="${todo._id}"><i class="fas fa-edit"></i></button>
          <button class="delete-btn" data-id="${todo._id}"><i class="fas fa-trash"></i></button>
        </div>
      `;
      
      todoList.appendChild(todoItem);
      
      // Add event listeners to the new todo item
      const checkbox = todoItem.querySelector('.todo-checkbox');
      checkbox.addEventListener('change', () => toggleTodoStatus(todo._id));
      
      const deleteBtn = todoItem.querySelector('.delete-btn');
      deleteBtn.addEventListener('click', () => deleteTodo(todo._id));
      
      const editBtn = todoItem.querySelector('.edit-btn');
      editBtn.addEventListener('click', () => {
        // Implement edit functionality
        alert('Edit functionality coming soon!');
      });
    });
  };
  
  // Add a new todo
  const addTodo = async (e) => {
    e.preventDefault();
    
    const newTodo = {
      title: todoTitle.value,
      description: todoDescription.value,
      priority: todoPriority.value,
      dueDate: todoDueDate.value || null
    };
    
    try {
      const response = await fetch(`${API_URL}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTodo)
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Clear form
        todoForm.reset();
        // Refresh todos
        fetchTodos();
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };
  
  // Toggle todo status
  const toggleTodoStatus = async (id) => {
    try {
      const response = await fetch(`${API_URL}/toggle/${id}`, {
        method: 'PATCH'
      });
      
      const result = await response.json();
      
      if (result.success) {
        fetchTodos();
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };
  
  // Delete todo
  const deleteTodo = async (id) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        fetchTodos();
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };
  
  // Set up event listeners
  todoForm.addEventListener('submit', addTodo);
  
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Update active filter
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      currentFilter = button.dataset.filter;
      fetchTodos();
    });
  });
  
  // Initial fetch
  fetchTodos();
}); 