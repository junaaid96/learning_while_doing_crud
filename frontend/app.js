/**
 * ─────────────────────────────────────────────────────
 *  Todo App — Vanilla JavaScript
 *  Communicates with FastAPI backend via the Fetch API
 * ─────────────────────────────────────────────────────
 */

// ── Config ──────────────────────────────────────────
const API_BASE = "http://127.0.0.1:8000";  // FastAPI server URL

// ── State ───────────────────────────────────────────
let allTodos = [];          // full list fetched from API
let currentFilter = "all";  // "all" | "active" | "completed"
let editingId = null;       // null = adding, number = editing

// ── DOM References ───────────────────────────────────
const todoForm    = document.getElementById("todo-form");
const titleInput  = document.getElementById("title");
const descInput   = document.getElementById("description");
const todoIdInput = document.getElementById("todo-id");
const submitBtn   = document.getElementById("submit-btn");
const cancelBtn   = document.getElementById("cancel-btn");
const formTitle   = document.getElementById("form-title");
const todoList    = document.getElementById("todo-list");
const loadingEl   = document.getElementById("loading");
const emptyState  = document.getElementById("empty-state");
const toastEl     = document.getElementById("toast");
const filterTabs  = document.querySelectorAll(".tab");


// ════════════════════════════════════════════════════
//  API FUNCTIONS  (talk to FastAPI)
// ════════════════════════════════════════════════════

/**
 * Generic fetch wrapper — handles JSON & errors in one place.
 * Every API call goes through here.
 */
async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  // DELETE returns 204 with no body, so skip JSON parsing
  if (response.status === 204) return null;

  const data = await response.json();

  if (!response.ok) {
    // FastAPI error format: { detail: "..." }
    throw new Error(data.detail || "Something went wrong");
  }

  return data;
}

// CREATE — POST /todos
async function createTodo(title, description) {
  return apiFetch("/todos", {
    method: "POST",
    body: JSON.stringify({ title, description }),
  });
}

// READ ALL — GET /todos
async function fetchTodos() {
  return apiFetch("/todos");
}

// UPDATE — PUT /todos/{id}
async function updateTodo(id, fields) {
  return apiFetch(`/todos/${id}`, {
    method: "PUT",
    body: JSON.stringify(fields),
  });
}

// DELETE — DELETE /todos/{id}
async function deleteTodo(id) {
  return apiFetch(`/todos/${id}`, { method: "DELETE" });
}


// ════════════════════════════════════════════════════
//  RENDER FUNCTIONS  (update the UI)
// ════════════════════════════════════════════════════

function getFilteredTodos() {
  if (currentFilter === "active")    return allTodos.filter(t => !t.completed);
  if (currentFilter === "completed") return allTodos.filter(t => t.completed);
  return allTodos;
}

function renderTodos() {
  const filtered = getFilteredTodos();

  todoList.innerHTML = "";

  if (filtered.length === 0) {
    emptyState.classList.remove("hidden");
  } else {
    emptyState.classList.add("hidden");
    filtered.forEach(todo => todoList.appendChild(createTodoElement(todo)));
  }
}

function createTodoElement(todo) {
  const li = document.createElement("li");
  li.className = `todo-item${todo.completed ? " completed" : ""}`;
  li.dataset.id = todo.id;

  // Format the date nicely
  const date = new Date(todo.created_at).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric"
  });

  li.innerHTML = `
    <div class="todo-checkbox${todo.completed ? " checked" : ""}" 
         title="${todo.completed ? "Mark as active" : "Mark as complete"}">
    </div>
    <div class="todo-content">
      <div class="todo-title">${escapeHtml(todo.title)}</div>
      ${todo.description ? `<div class="todo-description">${escapeHtml(todo.description)}</div>` : ""}
      <div class="todo-date">Added ${date}</div>
    </div>
    <div class="todo-actions">
      <button class="icon-btn btn-edit"   title="Edit">✏️</button>
      <button class="icon-btn btn-delete" title="Delete">🗑️</button>
    </div>
  `;

  // Toggle complete
  li.querySelector(".todo-checkbox").addEventListener("click", () => handleToggle(todo));

  // Edit
  li.querySelector(".btn-edit").addEventListener("click", () => startEdit(todo));

  // Delete
  li.querySelector(".btn-delete").addEventListener("click", () => handleDelete(todo.id));

  return li;
}

// Prevent XSS by escaping HTML special characters
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}


// ════════════════════════════════════════════════════
//  EVENT HANDLERS  (user interactions)
// ════════════════════════════════════════════════════

// ── Form Submit (Add or Update) ──────────────────────
todoForm.addEventListener("submit", async (e) => {
  e.preventDefault();  // stop page reload

  const title       = titleInput.value.trim();
  const description = descInput.value.trim() || null;

  if (!title) { showToast("Title is required!", "error"); return; }

  submitBtn.disabled = true;

  try {
    if (editingId !== null) {
      // UPDATE mode
      const updated = await updateTodo(editingId, { title, description });
      allTodos = allTodos.map(t => t.id === editingId ? updated : t);
      showToast("Todo updated!", "success");
      resetForm();
    } else {
      // CREATE mode
      const created = await createTodo(title, description);
      allTodos.unshift(created);  // add to top of list
      showToast("Todo added!", "success");
      todoForm.reset();
    }

    renderTodos();
  } catch (err) {
    showToast(err.message, "error");
  } finally {
    submitBtn.disabled = false;
  }
});

// ── Toggle Complete ──────────────────────────────────
async function handleToggle(todo) {
  try {
    const updated = await updateTodo(todo.id, { completed: !todo.completed });
    allTodos = allTodos.map(t => t.id === todo.id ? updated : t);
    renderTodos();
  } catch (err) {
    showToast(err.message, "error");
  }
}

// ── Edit: populate form with todo data ───────────────
function startEdit(todo) {
  editingId          = todo.id;
  titleInput.value   = todo.title;
  descInput.value    = todo.description || "";
  formTitle.textContent = "Edit Todo";
  submitBtn.textContent = "Save Changes";
  cancelBtn.classList.remove("hidden");
  titleInput.focus();

  // scroll to form
  document.querySelector(".form-card").scrollIntoView({ behavior: "smooth" });
}

// ── Cancel Edit ──────────────────────────────────────
cancelBtn.addEventListener("click", resetForm);

function resetForm() {
  editingId = null;
  todoForm.reset();
  todoIdInput.value     = "";
  formTitle.textContent = "Add New Todo";
  submitBtn.textContent = "Add Todo";
  cancelBtn.classList.add("hidden");
}

// ── Delete ───────────────────────────────────────────
async function handleDelete(id) {
  if (!confirm("Delete this todo?")) return;

  try {
    await deleteTodo(id);
    allTodos = allTodos.filter(t => t.id !== id);
    renderTodos();
    showToast("Todo deleted!", "success");
  } catch (err) {
    showToast(err.message, "error");
  }
}

// ── Filter Tabs ──────────────────────────────────────
filterTabs.forEach(tab => {
  tab.addEventListener("click", () => {
    filterTabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    currentFilter = tab.dataset.filter;
    renderTodos();
  });
});


// ════════════════════════════════════════════════════
//  TOAST NOTIFICATION
// ════════════════════════════════════════════════════

let toastTimer = null;

function showToast(message, type = "success") {
  toastEl.textContent = message;
  toastEl.className   = `toast ${type} show`;

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.remove("show");
  }, 3000);
}


// ════════════════════════════════════════════════════
//  INIT  (run on page load)
// ════════════════════════════════════════════════════

async function init() {
  loadingEl.classList.remove("hidden");

  try {
    allTodos = await fetchTodos();
    renderTodos();
  } catch (err) {
    showToast("Cannot connect to API. Is the server running?", "error");
    emptyState.classList.remove("hidden");
  } finally {
    loadingEl.classList.add("hidden");
  }
}

init();
