import React from 'react';
import './TaskLists.css';

function TaskLists({ tasks, onToggleCompletion, onDeleteTask, onClearCompleted, filter }) {
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
          tasks.map(task => (
            <div 
              key={task.id} 
              className={`task-item ${task.completed ? 'completed' : ''}`}
            >
              <div className='task-checkbox'>
                <input 
                  type='checkbox' 
                  checked={task.completed} 
                  onChange={() => onToggleCompletion(task.id)}
                  id={`task-${task.id}`}
                />
                <label htmlFor={`task-${task.id}`}></label>
              </div>
              <div className='task-text'>{task.text}</div>
              <div className='task-actions'>
                <button 
                  className='delete-btn' 
                  onClick={() => onDeleteTask(task.id)}
                  aria-label="Delete task"
                >
                  <span>×</span>
                </button>
              </div>
            </div>
          ))
        )}
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
    </div>
  );
}

export default TaskLists;