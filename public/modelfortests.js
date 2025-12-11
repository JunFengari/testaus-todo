// Minimal in-memory storage used when no browser localStorage is available.
// tässä on funktiot jota testaan modelfortests.js tiedostossa, otettu päätiedostosta testausta varten.
function createMemoryStorage() {
    const store = new Map();
    return {
        getItem: (k) => (store.has(k) ? store.get(k) : null),
        setItem: (k, v) => store.set(k, v),
        removeItem: (k) => store.delete(k),
        clear: () => store.clear(),
    };
}

const defaultStorage =
    typeof localStorage !== 'undefined' ? localStorage : createMemoryStorage();

function resolveStorageAndKey(storageOrKey, maybeKey) {
    let storage = defaultStorage;
    let key = maybeKey ?? 'todo_tasks_v1';
    if (storageOrKey) {
        if (typeof storageOrKey.getItem === 'function') {
            storage = storageOrKey;
        } else if (typeof storageOrKey === 'string') {
            key = storageOrKey;
        }
    }
    return { storage, key };
}

export function loadTasks(storageOrKey, maybeKey) {
    const { storage, key } = resolveStorageAndKey(storageOrKey, maybeKey);
    try {
        const raw = storage.getItem(key);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

// saveTasks should accept either (storage, tasks) or (tasks)
export function saveTasks(storageOrTasks, maybeTasksOrKey, maybeKey) {
    let storage = defaultStorage;
    let tasks = [];
    let key = maybeKey ?? 'todo_tasks_v1';

    if (Array.isArray(storageOrTasks)) {
        tasks = storageOrTasks;
    } else if (storageOrTasks && typeof storageOrTasks.getItem === 'function') {
        storage = storageOrTasks;
        tasks = Array.isArray(maybeTasksOrKey) ? maybeTasksOrKey : [];
        if (typeof maybeTasksOrKey === 'string') key = maybeTasksOrKey;
    } else if (typeof storageOrTasks === 'string') {
        key = storageOrTasks;
        tasks = Array.isArray(maybeTasksOrKey) ? maybeTasksOrKey : [];
    } else {
        tasks = Array.isArray(maybeTasksOrKey) ? maybeTasksOrKey : [];
    }

    storage.setItem(key, JSON.stringify(tasks));
}

export function generateId() {
    return (
        't_' +
        Math.random().toString(36).slice(2, 8) +
        Date.now().toString(36).slice(-4)
    );
}

// More pure logic functions can be added here:
export function addTask(tasks, payload, idFn = generateId) {
    const now = Date.now();
    const newTask = {
        id: idFn(),
        ...payload,
        completed: payload.status === 'done',
        createdAt: now,
        updatedAt: now,
    };
    return [...tasks, newTask];
}

export function toggleTask(tasks, id) {
    return tasks.map((t) =>
        t.id === id
            ? {
                  ...t,
                  completed: !t.completed,
                  status: !t.completed
                      ? 'done'
                      : t.status === 'done'
                      ? 'todo'
                      : t.status,
                  updatedAt: Date.now(),
              }
            : t
    );
}

export function deleteTask(tasks, id) {
    return tasks.filter((t) => t.id !== id);
}
