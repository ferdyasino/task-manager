const titleInput = document.getElementById('modal-title');
const descInput = document.getElementById('modal-desc');
const idInput = document.getElementById('modal-id');
const errorMsg = document.getElementById('error-msg');

const taskTable = document.getElementById('task-table');
const taskTbody = document.getElementById('task-tbody');
const noTasksMsg = document.getElementById('no-tasks-msg');

// Utility
function showError(message) {
  errorMsg.textContent = message;
}

function clearError() {
  errorMsg.textContent = '';
}

// Load tasks
async function loadTasks() {
  clearError();
  try {
    const res = await fetch('/api/tasks', { credentials: 'include' });

    if (!res.ok) {
      document.body.innerHTML = '<p>🔒 Please <a href="/login.html">log in</a>.</p>';
      return;
    }

    const tasks = await res.json();
    taskTbody.innerHTML = '';

    if (!Array.isArray(tasks) || tasks.length === 0) {
      taskTable.style.display = 'none';
      noTasksMsg.style.display = 'block';
    } else {
      taskTable.style.display = 'table';
      noTasksMsg.style.display = 'none';
      tasks.forEach(renderTaskRow);
    }
  } catch (err) {
    showError('⚠️ Failed to load tasks.');
    console.error(err);
  }
}

// Render a single task into the table
function renderTaskRow(task) {
  const tr = document.createElement('tr');

  const titleTd = document.createElement('td');
  titleTd.textContent = task.title;

  const descTd = document.createElement('td');
  descTd.textContent = task.description || '';

  const statusTd = document.createElement('td');
  statusTd.textContent = task.status || 'Pending'; // Display the task's status

  const actionsTd = document.createElement('td');

  const editBtn = document.createElement('button');
  editBtn.textContent = 'Edit';
  editBtn.onclick = () => openEditModal(task);

  const delBtn = document.createElement('button');
  delBtn.textContent = 'Delete';
  delBtn.onclick = () => {
    if (confirm('Delete this task?')) {
      deleteTask(task.id);
    }
  };

  actionsTd.appendChild(editBtn);
  actionsTd.appendChild(delBtn);

  tr.appendChild(titleTd);
  tr.appendChild(descTd);
  tr.appendChild(statusTd);  // Append status to the table row
  tr.appendChild(actionsTd);

  taskTbody.appendChild(tr);
}

// Submit handler for add/edit form
document.getElementById('modal-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  clearError();

  const id = idInput.value;
  const title = titleInput.value.trim();
  const description = descInput.value.trim();
  const status = document.getElementById('modal-status').value; // Get the status from the dropdown

  if (!title) {
    showError('Task title is required');
    return;
  }

  try {
    const payload = { title, description, status }; // Include status in the payload
    const url = id ? `/api/tasks/${id}` : '/api/tasks';
    const method = id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (res.ok) {
      closeModal();
      loadTasks();
    } else {
      showError(data.error || 'Failed to save task');
    }
  } catch (err) {
    showError('⚠️ Failed to save task.');
  }
});


// Delete a task
async function deleteTask(id) {
  clearError();
  try {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (res.ok) {
      loadTasks();
    } else {
      const data = await res.json();
      showError(data.error || 'Failed to delete task');
    }
  } catch (err) {
    showError('⚠️ Failed to delete task.');
  }
}

// Logout
function logout() {
  window.location.href = '/logout';
}

// Open modal for editing task
function openEditModal(task) {
  openModal(true, task); // Pass true for editing and task data
}


// Open modal for new task or edit task
function openModal(isEdit = false, task = null) {
  document.getElementById('task-modal').style.display = 'block';

  if (isEdit && task) {
    // Editing task: Set title, status, and disable input for title
    idInput.value = task.id;
    titleInput.value = task.title;
    titleInput.disabled = true; // Disable title input during edit
    descInput.value = task.description || '';
    descInput.disabled = false; // Allow editing of description

    // Set the status in the dropdown
    const statusSelect = document.getElementById('modal-status');
    statusSelect.value = task.status || 'Pending'; // Default to 'Pending' if no status

  } else {
    // Adding new task: Enable all fields
    idInput.value = ''; // Clear task ID
    titleInput.value = ''; // Clear title
    titleInput.disabled = false; // Enable title input for new task
    descInput.value = ''; // Clear description
    descInput.disabled = false; // Allow description input for new task

    // Set default status to 'Pending'
    const statusSelect = document.getElementById('modal-status');
    statusSelect.value = 'Pending'; // Default to 'Pending' for new task
  }

  setTimeout(() => titleInput.focus(), 100); // Focus on title input when modal is shown
}



// Close modal and reset form
function closeModal() {
  document.getElementById('modal-form').reset();
  idInput.value = '';

  // Reset title input state
  titleInput.disabled = false; // Ensure title input is enabled after modal closes
  descInput.disabled = false;  // Enable description field after modal closes

  document.getElementById('task-modal').style.display = 'none';
  clearError();
}


// Trigger add modal
document.getElementById('add-task-btn').addEventListener('click', () => {
  closeModal(); // clear any existing form data just in case
  openModal(false); // Pass false for new task (no task data)
});


// Cancel button handler
document.getElementById('close-modal').addEventListener('click', closeModal);

// Initial load
loadTasks();
