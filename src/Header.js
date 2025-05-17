import React, { useState } from 'react'
import './Header.css'

function Header({ addTask, onFilterChange, onSearchChange, currentFilter }) {
  const [showAddInput, setShowAddInput] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const handleAddClick = () => {
    setShowAddInput(true);
    setDueDate("");
    setDueTime("");
    setDescription("");
  };

  const handleAddTask = () => {
    if (newTask.trim()) {
      let formattedDate = null;
      
      if (dueDate) {
        // Create date object with date and time (if provided)
        const dateObj = new Date(dueDate);
        
        // If time is provided, set the hours and minutes
        if (dueTime) {
          const [hours, minutes] = dueTime.split(':').map(Number);
          dateObj.setHours(hours, minutes);
        }
        
        formattedDate = dateObj.toISOString();
      }
      
      addTask(newTask, formattedDate, description);
      setNewTask("");
      setDueDate("");
      setDueTime("");
      setDescription("");
    }
    setShowAddInput(false);
  };

  const handleCancel = () => {
    setShowAddInput(false);
    setNewTask("");
    setDueDate("");
    setDueTime("");
    setDescription("");
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleAddTask();
      e.preventDefault();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };
  
  const handleSearchInput = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearchChange(value);
  };

  const handleFilterSelect = (e) => {
    const value = e.target.value;
    onFilterChange(value);
  };

  return (
    <div className='header'>
        <div className='header__title'>
            <h1>To-Do List</h1>
        </div>
        <div className='header__menu'>
            <div className='add-task'>
                <button className="add-task-btn" onClick={handleAddClick}>Add Task</button>
            </div>
            <div className='search'>
                <input 
                  type='text' 
                  placeholder='Search' 
                  value={searchTerm}
                  onChange={handleSearchInput}
                />
            </div>
            <div className="filter" data-filter={currentFilter}>
                <select value={currentFilter} onChange={handleFilterSelect}>
                    <option value='all'>All</option>
                    <option value='active'>Active</option>
                    <option value='completed'>Completed</option>
                </select>
            </div>
        </div>

        {showAddInput && (
            <div className="modal-overlay">
                <div className="modal-content">
                    <h2>Add New Task</h2>
                    <input 
                        type='text' 
                        placeholder='Enter a task' 
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        className="task-input"
                    />
                    <div className="description-field">
                        <label htmlFor="task-description">Description (optional):</label>
                        <textarea
                            id="task-description"
                            placeholder='Add details about this task'
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                        />
                    </div>
                    <div className="due-date-time-container">
                        <div className="due-date-field">
                            <label htmlFor="task-due-date">Due Date (optional):</label>
                            <input 
                                id="task-due-date"
                                type="date" 
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                        </div>
                        <div className="due-time-field">
                            <label htmlFor="task-due-time">Time (optional):</label>
                            <input 
                                id="task-due-time"
                                type="time" 
                                value={dueTime}
                                onChange={(e) => setDueTime(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="modal-buttons">
                        <button onClick={handleAddTask}>Add</button>
                        <button onClick={handleCancel}>Cancel</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  )
}

export default Header