import React, { useState } from 'react';
import './TaskLists.css';

function TaskLists({ 
  tasks, 
  onToggleCompletion, 
  onDeleteTask, 
  onClearCompleted, 
  filter, 
  onEditDueDate, 
  onEditDescription, 
  onEditText,
  onMakeSubtask,
  onRemoveFromParent
}) {
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [newDueDate, setNewDueDate] = useState('');
  const [newDueTime, setNewDueTime] = useState('');
  const [editingDescription, setEditingDescription] = useState(false);
  const [newDescription, setNewDescription] = useState('');
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  
  // For edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTask, setEditTask] = useState({
    id: null,
    text: '',
    description: '',
    dueDate: '',
    dueTime: ''
  });

  // Get filter title for display
  const getFilterTitle = () => {
    switch(filter) {
      case 'active':
        return 'Active Tasks';
      case 'completed':
        return 'Completed Tasks';
      default:
        return 'All Tasks';
    }
  };

  // Check if there are any completed tasks
  const hasCompletedTasks = tasks.some(task => task.completed);

  // Format due date for display
  const formatDueDate = (dueDate) => {
    if (!dueDate) return 'No due date';
    
    const date = new Date(dueDate);
    
    // Format date
    const formattedDate = date.toLocaleDateString();
    
    // Format time (only if not midnight)
    const hasTime = date.getHours() !== 0 || date.getMinutes() !== 0;
    const formattedTime = hasTime ? 
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 
      '';
    
    return formattedTime ? `${formattedDate}, ${formattedTime}` : formattedDate;
  };

  // Get due date status and class
  const getDueDateStatus = (task) => {
    if (!task.dueDate || task.completed) return { className: '', label: '', daysText: '' };
    
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    
    // Calculate the difference in days
    const diffTime = dueDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // For overdue tasks
    if (diffDays < 0) {
      return { 
        className: 'overdue', 
        label: 'Overdue!',
        daysText: `${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? 'day' : 'days'} overdue`
      };
    }
    
    // For today
    if (diffDays === 0) {
      return {
        className: 'due-soon-danger',
        label: '',
        daysText: 'Due today'
      };
    }
    
    // For tomorrow
    if (diffDays === 1) {
      return {
        className: 'due-soon-danger',
        label: '',
        daysText: 'Due tomorrow'
      };
    }
    
    // For upcoming tasks
    if (diffDays <= 5) {
      return { 
        className: 'due-soon-danger', 
        label: '',
        daysText: `${diffDays} days left`
      };
    }
    
    if (diffDays <= 10) {
      return { 
        className: 'due-soon-warning', 
        label: '',
        daysText: `${diffDays} days left`
      };
    }
    
    return { 
      className: '', 
      label: '',
      daysText: `${diffDays} days left`
    };
  };

  // Toggle expanded state for a task
  const toggleTaskExpand = (taskId, e) => {
    // Make sure we're not toggling when clicking on checkbox or date
    if (e && (e.target.type === 'checkbox' || e.target.closest('.due-date-display'))) {
      return;
    }
    
    if (expandedTaskId === taskId) {
      setExpandedTaskId(null);
    } else {
      setExpandedTaskId(taskId);
    }
  };

  // Start editing description
  const startEditDescription = (taskId, currentDescription, e) => {
    e.stopPropagation(); // Prevent task from collapsing when clicking edit button
    setEditingDescription(true);
    setNewDescription(currentDescription || '');
  };

  // Save edited description
  const saveDescription = (taskId, e) => {
    e.stopPropagation(); // Prevent task from collapsing when clicking save button
    onEditDescription(taskId, newDescription);
    setEditingDescription(false);
  };

  // Cancel editing description
  const cancelEditDescription = (e) => {
    e.stopPropagation(); // Prevent task from collapsing when clicking cancel button
    setEditingDescription(false);
  };

  // Check if a task is overdue
  const isTaskOverdue = (task) => {
    return task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
  };

  // Handle due date edit mode
  const startEditDueDate = (taskId, currentDueDate) => {
    setEditingTaskId(taskId);
    
    if (currentDueDate) {
      const date = new Date(currentDueDate);
      
      // Set date in YYYY-MM-DD format
      setNewDueDate(date.toISOString().split('T')[0]);
      
      // Set time in HH:MM format if not midnight
      const hours = date.getHours();
      const minutes = date.getMinutes();
      
      if (hours !== 0 || minutes !== 0) {
        setNewDueTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
      } else {
        setNewDueTime('');
      }
    } else {
      setNewDueDate('');
      setNewDueTime('');
    }
  };

  // Save edited due date
  const saveEditDueDate = (taskId) => {
    let formattedDate = null;
    
    if (newDueDate) {
      // Create date object with date and time (if provided)
      const dateObj = new Date(newDueDate);
      
      // If time is provided, set the hours and minutes
      if (newDueTime) {
        const [hours, minutes] = newDueTime.split(':').map(Number);
        dateObj.setHours(hours, minutes);
      }
      
      formattedDate = dateObj.toISOString();
    }
    
    onEditDueDate(taskId, formattedDate);
    setEditingTaskId(null);
  };

  // Cancel editing
  const cancelEditDueDate = () => {
    setEditingTaskId(null);
    setNewDueDate('');
    setNewDueTime('');
  };

  // Open edit modal for a task
  const openEditModal = (task, e) => {
    e.stopPropagation(); // Prevent task from toggling expansion
    
    let dueDate = '';
    let dueTime = '';
    
    if (task.dueDate) {
      const date = new Date(task.dueDate);
      
      // Set date in YYYY-MM-DD format
      dueDate = date.toISOString().split('T')[0];
      
      // Set time in HH:MM format if not midnight
      const hours = date.getHours();
      const minutes = date.getMinutes();
      
      if (hours !== 0 || minutes !== 0) {
        dueTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }
    }
    
    setEditTask({
      id: task.id,
      text: task.text,
      description: task.description || '',
      dueDate: dueDate,
      dueTime: dueTime
    });
    
    setShowEditModal(true);
  };

  // Handle task text change in edit modal
  const handleTaskTextChange = (e) => {
    setEditTask({
      ...editTask,
      text: e.target.value
    });
  };

  // Handle description change in edit modal
  const handleDescriptionChange = (e) => {
    setEditTask({
      ...editTask,
      description: e.target.value
    });
  };

  // Handle due date change in edit modal
  const handleDueDateChange = (e) => {
    setEditTask({
      ...editTask,
      dueDate: e.target.value
    });
  };

  // Handle due time change in edit modal
  const handleDueTimeChange = (e) => {
    setEditTask({
      ...editTask,
      dueTime: e.target.value
    });
  };

  // Save task changes from edit modal
  const saveTaskChanges = () => {
    if (editTask.text.trim()) {
      // Find task by ID in hierarchical structure
      const findTaskById = (taskArray, id) => {
        for (const task of taskArray) {
          if (task.id === id) {
            return task;
          }
          
          if (task.subtasks && task.subtasks.length > 0) {
            const found = findTaskById(task.subtasks, id);
            if (found) return found;
          }
        }
        return null;
      };
      
      const existingTask = findTaskById(tasks, editTask.id);
      
      // Update task text
      if (existingTask && editTask.text !== existingTask.text) {
        onEditText(editTask.id, editTask.text);
      }
      
      // Update description
      onEditDescription(editTask.id, editTask.description);
      
      // Update due date
      let formattedDate = null;
      
      if (editTask.dueDate) {
        // Create date object with date and time (if provided)
        const dateObj = new Date(editTask.dueDate);
        
        // If time is provided, set the hours and minutes
        if (editTask.dueTime) {
          const [hours, minutes] = editTask.dueTime.split(':').map(Number);
          dateObj.setHours(hours, minutes);
        }
        
        formattedDate = dateObj.toISOString();
      }
      
      onEditDueDate(editTask.id, formattedDate);
      
      setShowEditModal(false);
    }
  };

  // Close edit modal
  const closeEditModal = () => {
    setShowEditModal(false);
  };

  // Drag and drop handlers
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(taskId);

    // Set a dragImage
    const ghostImage = document.createElement('div');
    ghostImage.classList.add('task-drag-ghost');
    ghostImage.textContent = 'Moving Task';
    document.body.appendChild(ghostImage);
    e.dataTransfer.setDragImage(ghostImage, 0, 0);
    
    // Cleanup ghost after drag
    setTimeout(() => {
      document.body.removeChild(ghostImage);
    }, 0);
  };

  const handleDragOver = (e, taskId) => {
    e.preventDefault();
    
    if (draggedTaskId && draggedTaskId !== taskId) {
      e.dataTransfer.dropEffect = 'move';
      e.currentTarget.classList.add('drag-over');
    }
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e, targetTaskId) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    const taskId = e.dataTransfer.getData('taskId');
    
    if (taskId && taskId !== targetTaskId) {
      // Make the dragged task a subtask of the target task
      onMakeSubtask(taskId, targetTaskId);
    }
    
    setDraggedTaskId(null);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    
    // Remove drag-over class from all tasks
    document.querySelectorAll('.task-item').forEach(item => {
      item.classList.remove('drag-over');
    });
  };

  // Render a task along with its subtasks
  const renderTask = (task, level = 0) => {
    const dueDateStatus = getDueDateStatus(task);
    const isExpanded = expandedTaskId === task.id;
    const hasSubtasks = task.subtasks && task.subtasks.length > 0;
    
    return (
      <div key={task.id} className="task-container">
        <div 
          className={`task-item ${task.completed ? 'completed' : ''} ${isExpanded ? 'expanded' : ''} ${level > 0 ? 'subtask' : ''}`}
          onClick={(e) => toggleTaskExpand(task.id, e)}
          draggable="true"
          onDragStart={(e) => handleDragStart(e, task.id)}
          onDragOver={(e) => handleDragOver(e, task.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, task.id)}
          onDragEnd={handleDragEnd}
          style={{ marginLeft: `${level * 20}px` }}
        >
          <div className="task-main">
            <div className='task-checkbox'>
              <input 
                type='checkbox' 
                checked={task.completed} 
                onChange={() => onToggleCompletion(task.id)}
                id={`task-${task.id}`}
              />
              <label htmlFor={`task-${task.id}`}></label>
            </div>
            <div className='task-content'>
              <div className='task-text'>
                {task.text}
                {task.description && <span className="has-description-indicator">•</span>}
                {hasSubtasks && <span className="has-subtasks-indicator">⊞</span>}
                {level > 0 && (
                  <button 
                    className="unmake-subtask-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFromParent(task.id);
                    }}
                    title="Remove from parent"
                  >
                    ↑
                  </button>
                )}
              </div>
              <div className='task-due-date'>
                {editingTaskId === task.id ? (
                  <div className='due-date-edit'>
                    <input 
                      type='date' 
                      value={newDueDate} 
                      onChange={(e) => setNewDueDate(e.target.value)}
                    />
                    <input 
                      type='time' 
                      value={newDueTime} 
                      onChange={(e) => setNewDueTime(e.target.value)}
                    />
                    <div className='due-date-actions'>
                      <button onClick={() => saveEditDueDate(task.id)}>✓</button>
                      <button onClick={cancelEditDueDate}>✕</button>
                    </div>
                  </div>
                ) : (
                  <div className='due-date-container'>
                    <div 
                      className={`due-date-display ${dueDateStatus.className}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditDueDate(task.id, task.dueDate);
                      }}
                    >
                      {formatDueDate(task.dueDate)}
                      {dueDateStatus.label && 
                        <span className="due-date-label">{dueDateStatus.label}</span>
                      }
                    </div>
                    {task.dueDate && !task.completed && dueDateStatus.daysText && 
                      <span className={`due-date-tag ${dueDateStatus.className}`}>
                        {dueDateStatus.daysText}
                      </span>
                    }
                  </div>
                )}
              </div>
            </div>
            <div className='task-actions'>
              <button 
                className='edit-btn' 
                onClick={(e) => openEditModal(task, e)}
                aria-label="Edit task"
              >
                <span>✎</span>
              </button>
              <button 
                className='delete-btn' 
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteTask(task.id);
                }}
                aria-label="Delete task"
              >
                <span>×</span>
              </button>
            </div>
          </div>
          
          {isExpanded && (
            <div className="task-details">
              <div className="task-description">
                {editingDescription ? (
                  <div className="description-edit">
                    <textarea
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      rows={3}
                      placeholder="Add a description..."
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="description-actions">
                      <button onClick={(e) => saveDescription(task.id, e)}>Save</button>
                      <button onClick={(e) => cancelEditDescription(e)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="description-display">
                    {task.description ? (
                      <p><span className="description-icon">&#9776;</span> {task.description}</p>
                    ) : (
                      <p className="empty-description">
                        No description. 
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Render subtasks if any */}
        {hasSubtasks && 
          <div className="subtasks-container">
            {task.subtasks.map(subtask => renderTask(subtask, level + 1))}
          </div>
        }
      </div>
    );
  };

  return (
    <div className='task-lists'>
      <div className='task-lists__header'>
        <h2>{getFilterTitle()}</h2>
        <div className='task-counts'>
          <span>{tasks.filter(task => !task.completed).length} remaining</span>
          <span>{tasks.filter(task => task.completed).length} completed</span>
        </div>
      </div>
      
      <div className='tasks'>
        {tasks.length === 0 ? (
          <div className='no-tasks'>
            {filter === 'all' 
              ? 'No tasks found. Add a task to get started!' 
              : `No ${filter} tasks found.`}
          </div>
        ) : (
          tasks.map(task => renderTask(task))
        )}
      </div>
      
      <div className="drop-instructions">
        <p>Drag and drop tasks to create subtasks</p>
      </div>
      
      {hasCompletedTasks && (
        <div className='task-lists__footer'>
          <button 
            className='clear-completed-btn'
            onClick={onClearCompleted}
          >
            Clear completed
          </button>
        </div>
      )}

      {/* Edit Task Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content edit-task-modal">
            <h2>Edit Task</h2>
            <div className="edit-task-form">
              <div className="form-group">
                <label htmlFor="edit-task-text">Task</label>
                <input 
                  id="edit-task-text"
                  type="text" 
                  value={editTask.text}
                  onChange={handleTaskTextChange}
                  placeholder="Task title"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-task-description">Description</label>
                <textarea
                  id="edit-task-description"
                  value={editTask.description}
                  onChange={handleDescriptionChange}
                  rows={3}
                  placeholder="Add details about this task"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit-task-date">Due Date</label>
                  <input 
                    id="edit-task-date"
                    type="date" 
                    value={editTask.dueDate}
                    onChange={handleDueDateChange}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="edit-task-time">Time</label>
                  <input 
                    id="edit-task-time"
                    type="time" 
                    value={editTask.dueTime}
                    onChange={handleDueTimeChange}
                  />
                </div>
              </div>
            </div>
            
            <div className="modal-buttons">
              <button onClick={saveTaskChanges} className="save-btn">Save Changes</button>
              <button onClick={closeEditModal} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskLists;