import React, { useState, useEffect } from 'react';

// Helper to get the correct API URL regardless of how the app is accessed
const getApiUrl = () => {
    const hostname = window.location.hostname;

    // Check if we are running in a local/LAN environment with XAMPP path structure
    // This logic checks if the current URL path contains 'APP-Prueba'
    if (window.location.pathname.includes('/APP-Prueba/') || hostname === 'localhost' && window.location.port !== '') {
        // Local Dev (Vite on port 5173) or LAN access
        // If we are on Vite (port 5173), we need absolute path to Apache (port 80).
        // If we are on Apache (built), we can use absolute path too.
        return `http://${hostname}/APP-Prueba/task-manager/server/public/api/tasks`;
    }

    // Production (Render) - App served at root, API at /api/tasks
    return '/api/tasks';
};

const API_URL = getApiUrl();
const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
};

const getUrgencyClass = (dueDate, completedAt = null) => {
    if (!dueDate) return '';
    const comparisonDate = completedAt ? new Date(completedAt) : new Date();
    comparisonDate.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    // Adjust due date timezone to ensure correct comparison (YYYY-MM-DD is UTC-ish in JS Date usually, but let's be safe by setting hours)
    // Actually, splitting by '-' and resolving local time is safer for "YYYY-MM-DD" inputs
    const [y, m, d] = dueDate.split('-');
    const dueLocal = new Date(y, m - 1, d);

    if (dueLocal < comparisonDate) return 'task-overdue';
    if (dueLocal.getTime() === comparisonDate.getTime()) return 'task-due-today';

    const tomorrow = new Date(comparisonDate);
    tomorrow.setDate(comparisonDate.getDate() + 1);

    if (dueLocal.getTime() === tomorrow.getTime()) return 'task-due-tomorrow';

    return '';
};

function App() {
    const [tasks, setTasks] = useState([]);
    const [statusFilters, setStatusFilters] = useState(['Pendiente', 'Demorada']); // Array of active status filters
    const [priorityFilters, setPriorityFilters] = useState([]); // Array of active priority filters
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [newTask, setNewTask] = useState({ title: '', notes: '', dueDate: getTomorrowDate(), importance: 'Baja', responsible: 'Cache' });
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentTaskId, setCurrentTaskId] = useState(null);
    const [view, setView] = useState('list');
    const [viewDate, setViewDate] = useState(new Date()); // State for calendar navigation
    const [sortOrder, setSortOrder] = useState('asc'); // 'none', 'desc', 'asc'
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch tasks from API
    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Error al cargar tareas');
            const data = await response.json();
            // Transform API data to frontend format
            const transformedTasks = data.map(task => ({
                id: task.id,
                title: task.titulo,
                notes: task.descripcion || '',
                dueDate: task.fecha_limite || '',
                importance: task.prioridad === 'Alta' ? 'High' : 'Low',
                completed: task.estado === 'Completada',
                status: task.estado, // Map status from backend
                createdAt: task.fecha_creacion,
                responsible: task.responsable || 'Cache',
                completedAt: task.fecha_completada
            }));
            setTasks(transformedTasks);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching tasks:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();

        if (isEditing && currentTaskId) {
            // Update existing task
            try {
                // Convert frontend importance 'High'/'Low' back to API 'Alta'/'Baja'
                const apiPriority = newTask.importance === 'High' ? 'Alta' : 'Baja';

                const response = await fetch(`${API_URL}/${currentTaskId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        titulo: newTask.title,
                        descripcion: newTask.notes,
                        fecha_limite: newTask.dueDate,
                        prioridad: apiPriority,
                        responsable: newTask.responsible
                    })
                });

                if (!response.ok) throw new Error('Error al actualizar tarea');

                const updated = await response.json();

                setTasks(tasks.map(t =>
                    t.id === currentTaskId ? {
                        ...t,
                        title: updated.titulo,
                        notes: updated.descripcion || '',
                        dueDate: updated.fecha_limite || '',
                        importance: updated.prioridad === 'Alta' ? 'High' : 'Low',
                        responsible: updated.responsable || 'Cache',
                        completedAt: updated.fecha_completada,
                        createdAt: t.createdAt, // Keep original
                        completed: t.completed // Keep original based on state... actually updated has state?
                        // Wait, if we complete via checkbox it's different. If we edit, we get fresh data.
                        // Let's rely on map update being correct if backend returns everything.
                    } : t
                ));

                resetForm();
            } catch (err) {
                alert('Error al actualizar la tarea: ' + err.message);
            }
        } else {
            // Create new task
            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        titulo: newTask.title,
                        descripcion: newTask.notes,
                        fecha_limite: newTask.dueDate,
                        prioridad: newTask.importance === 'High' ? 'Alta' : 'Baja',
                        estado: 'Pendiente'
                    })
                });

                if (!response.ok) throw new Error('Error al crear tarea');

                const created = await response.json();
                const transformedTask = {
                    id: created.id,
                    title: created.titulo,
                    notes: created.descripcion || '',
                    dueDate: created.fecha_limite || '',
                    importance: created.prioridad === 'Alta' ? 'High' : 'Low',
                    completed: created.estado === 'Completada',
                    status: created.estado, // Add explicit status tracking
                    createdAt: created.fecha_creacion,
                    responsible: created.responsable || 'Cache',
                    completedAt: created.fecha_completada
                };

                setTasks([transformedTask, ...tasks]);
                resetForm();
            } catch (err) {
                alert('Error al crear la tarea: ' + err.message);
            }
        }
    };

    const resetForm = () => {
        setNewTask({ title: '', notes: '', dueDate: getTomorrowDate(), importance: 'Baja', responsible: 'Cache' });
        setShowModal(false);
        setIsEditing(false);
        setCurrentTaskId(null);
    };

    const openEditModal = (task) => {
        setNewTask({
            title: task.title,
            notes: task.notes,
            dueDate: task.dueDate,
            importance: task.importance,
            responsible: task.responsible
        });
        setCurrentTaskId(task.id);
        setIsEditing(true);
        setShowModal(true);
    };

    const toggleComplete = async (id) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        const newState = task.completed ? 'Pendiente' : 'Completada';

        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: newState })
            });

            if (!response.ok) throw new Error('Error al actualizar tarea');

            setTasks(tasks.map(t =>
                t.id === id ? {
                    ...t,
                    completed: !t.completed,
                    completedAt: !t.completed ? new Date().toISOString() : null
                    // Optimistic update for completedAt, ideally we get from backend response if we returned full object
                } : t
            ));
        } catch (err) {
            alert('Error al actualizar la tarea: ' + err.message);
        }
    };

    const handleCancelOrDelete = async (task) => {
        if (task.status !== 'Cancelada') {
            // Step 1: Cancel Task
            const reason = prompt('¿Deseas cancelar esta tarea? (Opcional: Ingresa el motivo)');
            if (reason === null) return; // User clicked Cancel

            let newNotes = task.notes || '';
            if (reason.trim()) {
                const dateStr = new Date().toLocaleDateString();
                newNotes = newNotes ? `${newNotes}\n\n[Cancelada ${dateStr}]: ${reason}` : `[Cancelada ${dateStr}]: ${reason}`;
            }

            try {
                const response = await fetch(`${API_URL}/${task.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        estado: 'Cancelada',
                        descripcion: newNotes
                    })
                });

                if (!response.ok) throw new Error('Error al cancelar tarea');

                setTasks(tasks.map(t =>
                    t.id === task.id ? {
                        ...t,
                        status: 'Cancelada',
                        completed: false,
                        notes: newNotes
                    } : t
                ));
            } catch (err) {
                alert('Error al cancelar la tarea: ' + err.message);
            }
        } else {
            // Step 2: Delete Task
            if (!confirm('Esta tarea ya está cancelada. ¿Deseas eliminarla definitivamente?')) return;
            try {
                const response = await fetch(`${API_URL}/${task.id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) throw new Error('Error al eliminar tarea');

                setTasks(tasks.filter(t => t.id !== task.id));
            } catch (err) {
                alert('Error al eliminar la tarea: ' + err.message);
            }
        }
    };

    const restoreTask = async (id) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: 'Pendiente' })
            });

            if (!response.ok) throw new Error('Error al restaurar tarea');

            setTasks(tasks.map(t =>
                t.id === id ? { ...t, status: 'Pendiente', completed: false } : t
            ));
        } catch (err) {
            alert('Error al restaurar la tarea: ' + err.message);
        }
    };

    const toggleStatusFilter = (status) => {
        setStatusFilters(prev =>
            prev.includes(status)
                ? prev.filter(s => s !== status)
                : [...prev, status]
        );
    };

    const togglePriorityFilter = (priority) => {
        setPriorityFilters(prev =>
            prev.includes(priority)
                ? prev.filter(p => p !== priority)
                : [...prev, priority]
        );
    };

    const purgeTasks = async () => {
        const password = prompt('🔐 AREA RESTRINGIDA\n\nEsta acción eliminará PERMANENTEMENTE tareas y descargará un respaldo.\n\nIngresa la contraseña para confirmar:');

        if (password !== '1234') {
            if (password !== null) alert('⛔ Contraseña incorrecta.');
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        const cutoffDate = prompt('📅 Fecha de corte:\nSe eliminarán las tareas COMPLETADAS y CANCELADAS con fecha límite hasta esta fecha (inclusive).', today);

        if (!cutoffDate) return;

        if (!confirm(`⚠️ ¿Confirmar eliminación de tareas hasta ${cutoffDate}?\n\nSe generará un archivo CSV antes de borrar. esta acción NO se puede deshacer.`)) return;

        try {
            const response = await fetch(`${API_URL.replace('/tasks', '/purge_tasks.php')}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: cutoffDate })
            });

            if (!response.ok) throw new Error('Error al purgar tareas');

            const result = await response.json();

            if (result.deleted_count > 0 && result.csv_data) {
                // Download CSV
                const csvContent = atob(result.csv_data);
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `backup_tareas_${cutoffDate}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url); // Clean up

                alert(`✅ Limpieza completada.\n\n🗑️ Se eliminaron ${result.deleted_count} tareas.\n📥 Respaldo descargado: backup_tareas_${cutoffDate}.csv`);
            } else {
                alert('⚠️ No se encontraron tareas para eliminar en ese rango de fechas.');
            }

            fetchTasks(); // Reload list
        } catch (err) {
            alert('Error al purgar: ' + err.message);
        }
    };

    const toggleSortOrder = () => {
        setSortOrder(prev => {
            if (prev === 'none') return 'desc';
            if (prev === 'desc') return 'asc';
            return 'none';
        });
    };

    const clearFilters = () => {
        setStatusFilters([]);
        setPriorityFilters([]);
        setSearchTerm('');
        setDateFrom('');
        setDateTo('');
        setSortOrder('none');
    };

    const filteredTasks = tasks.filter(t => {
        // Status Filter Logic
        if (statusFilters.length > 0) {
            const matchesStatus = statusFilters.some(filter => {
                if (filter === 'Pendiente') return !t.completed && t.status !== 'Cancelada';
                if (filter === 'Completada') return t.completed;
                if (filter === 'Cancelada') return t.status === 'Cancelada';
                if (filter === 'Demorada') {
                    // Check if overdue AND not completed/cancelled
                    return !t.completed && t.status !== 'Cancelada' && getUrgencyClass(t.dueDate) === 'task-overdue';
                }
                return false;
            });
            if (!matchesStatus) return false;
        }

        // Priority Filter Logic
        if (priorityFilters.length > 0) {
            const matchesPriority = priorityFilters.some(filter => {
                if (filter === 'High') return t.importance === 'High';
                if (filter === 'Low') return t.importance === 'Low';
                return false;
            });
            if (!matchesPriority) return false;
        }

        // Search Filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const matchesTitle = t.title.toLowerCase().includes(term);
            const matchesNotes = t.notes && t.notes.toLowerCase().includes(term);
            const matchesResponsible = t.responsible && t.responsible.toLowerCase().includes(term); // Also search responsible
            if (!matchesTitle && !matchesNotes && !matchesResponsible) return false;
        }

        // Date Range Filter
        if (dateFrom && t.dueDate && t.dueDate < dateFrom) return false;
        if (dateTo && t.dueDate && t.dueDate > dateTo) return false;

        return true;
    }).sort((a, b) => {
        if (sortOrder === 'none') return 0;

        const dateA = a.dueDate || '';
        const dateB = b.dueDate || '';

        // Push tasks without due date to the end
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;

        if (sortOrder === 'asc') {
            return dateA.localeCompare(dateB);
        } else {
            return dateB.localeCompare(dateA);
        }
    });

    // Calendar Utils
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const currentYear = viewDate.getFullYear();
    const currentMonth = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);

    const changeMonth = (increment) => {
        const newDate = new Date(viewDate);
        newDate.setMonth(newDate.getMonth() + increment);
        setViewDate(newDate);
    };

    return (
        <div className="container">
            <h1>Task Manager</h1>

            <div className="tabs">
                <button onClick={() => setView('list')} disabled={view === 'list'}>List View</button>
                <button onClick={() => setView('calendar')} disabled={view === 'calendar'}>Calendar View</button>
            </div>

            {view === 'list' && (
                <>
                    <div className="filters-container">
                        <div className="filters">
                            <div className="filter-group">
                                <span className="filter-label">Estado:</span>
                                <button onClick={() => toggleStatusFilter('Pendiente')} className={statusFilters.includes('Pendiente') ? 'active' : ''}>Pendientes</button>
                                <button onClick={() => toggleStatusFilter('Demorada')} className={statusFilters.includes('Demorada') ? 'active' : ''}>Demoradas</button>
                                <button onClick={() => toggleStatusFilter('Completada')} className={statusFilters.includes('Completada') ? 'active' : ''}>Completadas</button>
                                <button onClick={() => toggleStatusFilter('Cancelada')} className={statusFilters.includes('Cancelada') ? 'active' : ''}>Canceladas</button>
                            </div>
                            <div className="filter-divider"></div>
                            <div className="filter-group">
                                <span className="filter-label">Importancia:</span>
                                <button onClick={() => togglePriorityFilter('High')} className={priorityFilters.includes('High') ? 'active' : ''}>Alta</button>
                                <button onClick={() => togglePriorityFilter('Low')} className={priorityFilters.includes('Low') ? 'active' : ''}>Baja</button>
                            </div>
                        </div>

                        <div className="search-filters">
                            <input
                                type="text"
                                placeholder="🔍 Buscar..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                            <div className="date-filters">
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    title="Desde"
                                    className="date-filter-input"
                                />
                                <span>hasta</span>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    title="Hasta"
                                    className="date-filter-input"
                                />
                                <button onClick={clearFilters} className="btn-clear-filters" title="Limpiar todos los filtros">
                                    ✖️ Desfiltrar
                                </button>
                                <button onClick={toggleSortOrder} className="btn-sort" style={{ marginLeft: '10px', padding: '5px 10px', fontSize: '0.9em', cursor: 'pointer' }} title="Ordenar por fecha de caducidad">
                                    {sortOrder === 'none' ? '📅 Ordenar' : sortOrder === 'desc' ? '📅⬇️' : '📅⬆️'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Cargando tareas...</p>
                        </div>
                    ) : error ? (
                        <div className="error-state">
                            <p>⚠️ {error}</p>
                            <button onClick={fetchTasks} className="btn-primary">Reintentar</button>
                        </div>
                    ) : (
                        <div className="task-list">
                            {filteredTasks.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">📋</div>
                                    <h3>No hay tareas</h3>
                                    <p>Hacé clic en el botón + para agregar tu primera tarea</p>
                                </div>
                            ) : (
                                filteredTasks.map(task => (
                                    <div key={task.id} className={`task-card importance-${task.importance} ${task.completed ? 'completed' : ''} ${task.status === 'Cancelada' ? 'cancelled' : ''} ${getUrgencyClass(task.dueDate, task.completed ? task.completedAt : null)}`}>
                                        <div className="task-checkbox" onClick={() => toggleComplete(task.id)}>
                                            {task.completed ? '✓' : ''}
                                        </div>
                                        <div className="task-content">
                                            <div className="task-main-info">
                                                <h3>{task.title}</h3>
                                                {task.notes && <p className="task-notes">{task.notes}</p>}
                                            </div>
                                            <div className="task-meta-info">
                                                <div className="meta-row">
                                                    <span className={`task-priority priority-${task.importance}`}>
                                                        {task.importance === 'High' ? 'Alta' : 'Baja'}
                                                    </span>
                                                    <span className="task-responsible" title="Responsable">👤 {task.responsible}</span>
                                                </div>
                                                <div className="meta-row">
                                                    {task.dueDate && <span className="task-date" title="Fecha límite">📅 {formatDate(task.dueDate)}</span>}
                                                </div>
                                                <div className="meta-row secondary-meta">
                                                    <span title="Fecha de creación">✨ {formatDate(task.createdAt)}</span>
                                                    {task.completed && task.completedAt && (
                                                        <span className="completion-date" title="Fecha de finalización">✅ {formatDate(task.completedAt)}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="task-actions">
                                            {task.status === 'Cancelada' && (
                                                <button className="task-restore" onClick={() => restoreTask(task.id)} title="Descancelar / Restaurar">
                                                    ↩️
                                                </button>
                                            )}
                                            <button className="task-edit" onClick={() => openEditModal(task)} title="Editar" disabled={task.status === 'Cancelada'}>
                                                ✏️
                                            </button>
                                            <button
                                                className={`task-delete ${task.status === 'Cancelada' ? 'ready-to-delete' : ''}`}
                                                onClick={() => handleCancelOrDelete(task)}
                                                title={task.status === 'Cancelada' ? "Eliminar definitivamente" : "Cancelar tarea"}
                                            >
                                                {task.status === 'Cancelada' ? '🗑️' : '🚫'}
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Floating Action Button */}
                    <button className="fab" onClick={() => setShowModal(true)} aria-label="Agregar tarea">
                        +
                    </button>

                    {/* Modal */}
                    {showModal && (
                        <div className="modal-overlay" onClick={resetForm}>
                            <div className="modal" onClick={(e) => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h2>{isEditing ? 'Editar Tarea' : 'Nueva Tarea'}</h2>
                                    <button className="modal-close" onClick={resetForm}>×</button>
                                </div>
                                <form onSubmit={handleSave}>
                                    <input
                                        type="text"
                                        placeholder="Título de la tarea"
                                        value={newTask.title}
                                        onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                        required
                                        autoFocus
                                    />
                                    <input
                                        type="date"
                                        value={newTask.dueDate}
                                        onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                                        required
                                    />
                                    <select value={newTask.importance} onChange={e => setNewTask({ ...newTask, importance: e.target.value })}>
                                        <option value="Low">Baja Prioridad</option>
                                        <option value="High">Alta Prioridad</option>
                                    </select>
                                    <input
                                        type="text"
                                        placeholder="Responsable"
                                        value={newTask.responsible}
                                        onChange={e => setNewTask({ ...newTask, responsible: e.target.value })}
                                        required
                                    />
                                    <textarea
                                        placeholder="Notas (opcional)"
                                        value={newTask.notes}
                                        onChange={e => setNewTask({ ...newTask, notes: e.target.value })}
                                        rows="3"
                                    />
                                    <button type="submit" className="btn-primary">
                                        {isEditing ? 'Guardar Cambios' : 'Agregar Tarea'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </>
            )}

            {view === 'calendar' && (
                <div className="calendar-view">
                    <div className="calendar-header">
                        <button onClick={() => changeMonth(-1)}>◀ Prev</button>
                        <h2>{new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                        <button onClick={() => changeMonth(1)}>Next ▶</button>
                    </div>
                    <div className="calendar-days-header">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                            <div key={day} className="calendar-day-name">{day}</div>
                        ))}
                    </div>
                    <div className="calendar-grid">
                        {/* Empty cells for previous month's days */}
                        {Array.from({ length: (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7 }).map((_, i) => (
                            <div key={`empty-${i}`} className="calendar-day empty"></div>
                        ))}

                        {/* Days of the month */}
                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const dayTasks = tasks.filter(t => t.dueDate === dateStr);
                            const isToday = day === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();

                            return (
                                <div key={day} className={`calendar-day ${isToday ? 'today' : ''}`}>
                                    <strong>{day}</strong>
                                    {dayTasks.map(t => {
                                        const isOverdue = !t.completed && t.status !== 'Cancelada' && t.dueDate && getUrgencyClass(t.dueDate) === 'task-overdue';
                                        return (
                                            <div key={t.id} className={`calendar-task priority-${t.importance} ${t.completed ? 'completed' : ''} ${t.status === 'Cancelada' ? 'cancelled' : ''} ${isOverdue ? 'overdue' : ''}`}>
                                                <span className="calendar-task-status">{t.completed ? '✅' : t.status === 'Cancelada' ? '🚫' : isOverdue && t.importance === 'High' ? '🔥' : '⏳'}</span> {t.title}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <button className="btn-purge-hidden" onClick={purgeTasks} title="Limpieza Avanzada">⚙️</button>
        </div>
    );
}

export default App;
