/* eslint-env browser */
/* global document, window, localStorage */

/* Käytin tekoälyä lopputyön tekemiseen sillä tavalla, että kysyin siltä step
by step ohjeita, eli miten voidaan tehdä priority filtering taskeille. 
Toimin ohjeiden mukaisesti, lisäsin ne koodiin (html, css, sekä päätiedostoon) yksitellen, 
ja ymmärsin mitä jokainen vaihe suunnilleen tekee.*/

/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} topic
 * @property {string} priority
 * @property {string} status
 * @property {string} description
 * @property {boolean} completed
 * @property {number} createdAt
 * @property {number} updatedAt
 */

'use strict';

(function () {
    // Storage key and helpers
    const STORAGE_KEY = 'todo_tasks_v1';
    /** @returns {Array} */
    function loadTasks() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }
    function saveTasks(tasks) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
    function generateId() {
        return (
            't_' +
            Math.random().toString(36).slice(2, 8) +
            Date.now().toString(36).slice(-4)
        );
    }

    // DOM refs
    const form = /** @type {HTMLFormElement} */ (
        document.getElementById('task-form')
    );
    const formTitle = /** @type {HTMLElement} */ (
        document.getElementById('form-title')
    );
    const inputId = /** @type {HTMLInputElement} */ (
        document.getElementById('task-id')
    );
    const inputTopic = /** @type {HTMLInputElement} */ (
        document.getElementById('topic')
    );
    const inputPriority = /** @type {HTMLSelectElement} */ (
        document.getElementById('priority')
    );
    const inputStatus = /** @type {HTMLSelectElement} */ (
        document.getElementById('status')
    );
    const inputDescription = /** @type {HTMLTextAreaElement} */ (
        document.getElementById('description')
    );
    const saveBtn = /** @type {HTMLButtonElement} */ (
        document.getElementById('save-btn')
    );
    const resetBtn = /** @type {HTMLButtonElement} */ (
        document.getElementById('reset-btn')
    );
    const list = /** @type {HTMLUListElement} */ (
        document.getElementById('task-list')
    );
    const emptyState = /** @type {HTMLElement} */ (
        document.getElementById('empty-state')
    );
    // priority filter legend
    const priorityLegend = /** @type {HTMLElement} */ (
        document.getElementById('priority-filter')
    );

    // 'kuuntelee' priority filter napautuksia.
    priorityLegend.addEventListener('click', (e) => {
        const target = /** @type {HTMLElement} */ (e.target);
        if (!target.matches('[data-priority]')) return;

        // Update filter state
        currentPriorityFilter = target.dataset.priority;

        // Optional: add active styling later
        priorityLegend
            .querySelectorAll('.pill')
            .forEach((b) => b.classList.remove('active'));
        target.classList.add('active');

        render();
    });

    // State, aloitetaan currentPriorityFilter with 'all'
    let tasks = loadTasks();
    let currentPriorityFilter = 'all'; // all =  high | medium | low

    // Render
    /* Tähän tehtiin muutoksen missä ei näytetä suoraan kaikki taskit, 
    vain lisätään priority filter with visible tasks, joka jatkuu alkuperäiseen
    koodiin kanssa. */
    function render() {
        list.innerHTML = '';

        // --------- Apply priority filter ----------
        let visibleTasks = tasks;
        if (currentPriorityFilter !== 'all') {
            visibleTasks = tasks.filter(
                (t) => t.priority === currentPriorityFilter
            );
        }
        // ----------------------------------------

        if (!visibleTasks.length) {
            emptyState.style.display = 'block';
            return;
        }
        emptyState.style.display = 'none';

        visibleTasks.forEach((t) => {
            const li = document.createElement('li');
            li.className = 'task' + (t.completed ? ' done' : '');
            li.dataset.id = t.id;
            li.innerHTML = `
          <div>
            <div class="title">${escapeHtml(t.topic)}</div>
            <div class="desc">${escapeHtml(t.description || '')}</div>
          </div>
          <div class="meta">
            <span class="badge prio-${t.priority}">
              <span class="dot"></span>
              ${t.priority.charAt(0).toUpperCase() + t.priority.slice(1)}
            </span>
          </div>
          <div class="meta">
            ${badgeForStatus(t.status)}
          </div>
          <div class="controls">
            <button data-action="edit" class="secondary">Edit</button>
            <button data-action="complete" class="${
                t.completed ? 'secondary' : ''
            }">
              ${t.completed ? 'Undo' : 'Complete'}
            </button>
            <button data-action="delete" class="danger">Delete</button>
          </div>
        `;
            list.appendChild(li);
        });
    }

    function badgeForStatus(status) {
        const label =
            {
                todo: 'To do',
                'in-progress': 'In progress',
                blocked: 'Blocked',
                done: 'Done',
            }[status] || status;
        return `<span class="badge">${label}</span>`;
    }

    function escapeHtml(str) {
        return String(str)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    // Form handling
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const now = Date.now();
        const payload = {
            topic: inputTopic.value.trim(),
            priority: inputPriority.value,
            status: inputStatus.value,
            description: inputDescription.value.trim(),
        };
        if (!payload.topic) {
            inputTopic.focus();
            return;
        }

        if (inputId.value) {
            const idx = tasks.findIndex((t) => t.id === inputId.value);
            if (idx !== -1) {
                tasks[idx] = {
                    ...tasks[idx],
                    ...payload,
                    completed:
                        payload.status === 'done' ? true : tasks[idx].completed,
                    updatedAt: now,
                };
            }
        } else {
            const newTask = {
                id: generateId(),
                ...payload,
                completed: payload.status === 'done',
                createdAt: now,
                updatedAt: now,
            };
            tasks.push(newTask);
        }
        saveTasks(tasks);
        resetForm();
        render();
    });

    resetBtn.addEventListener('click', () => {
        resetForm();
    });

    function resetForm() {
        formTitle.textContent = 'Create Task';
        inputId.value = '';
        form.reset();
        inputPriority.value = 'medium';
        inputStatus.value = 'todo';
        saveBtn.textContent = 'Save Task';
    }

    // List actions (event delegation)
    list.addEventListener('click', (e) => {
        const target = /** @type {HTMLElement} */ (e.target);
        if (target.tagName !== 'BUTTON') return;
        const action = target.dataset.action;
        /** @type {HTMLElement | null} */
        const li = target.closest('.task');
        if (!li) return;
        const id = li.dataset.id;
        const idx = tasks.findIndex((t) => t.id === id);
        if (idx === -1) return;

        if (action === 'edit') {
            const t = tasks[idx];
            formTitle.textContent = 'Edit Task';
            inputId.value = t.id;
            inputTopic.value = t.topic;
            inputPriority.value = t.priority;
            inputStatus.value = t.status;
            inputDescription.value = t.description || '';
            saveBtn.textContent = 'Update Task';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        if (action === 'complete') {
            const t = tasks[idx];
            const nextCompleted = !t.completed;
            tasks[idx] = {
                ...t,
                completed: nextCompleted,
                status: nextCompleted
                    ? 'done'
                    : t.status === 'done'
                    ? 'todo'
                    : t.status,
                updatedAt: Date.now(),
            };
            saveTasks(tasks);
            render();
        }
        if (action === 'delete') {
            const confirmDelete = window.confirm('Delete this task?');
            if (!confirmDelete) return;
            tasks.splice(idx, 1);
            saveTasks(tasks);
            render();
        }
    });

    // Initial paint
    render();
})();
