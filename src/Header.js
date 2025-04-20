import React, { useState } from 'react'
import './Header.css'

function Header({ addTask, onFilterChange, onSearchChange, currentFilter }) {
  const [showAddInput, setShowAddInput] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const handleAddClick = () => {
    setShowAddInput(true);
  };

  const handleAddTask = () => {
    if (newTask.trim()) {
      addTask(newTask);
      setNewTask("");
    }
    setShowAddInput(false);
  };

  const handleCancel = () => {
    setShowAddInput(false);
    setNewTask("");
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAddTask();
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
                    />
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