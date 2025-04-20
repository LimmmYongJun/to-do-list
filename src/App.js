import React, { useState, useMemo } from 'react';
import './App.css';
import Header from './Header';
import TaskLists from './TaskLists';

function App() {
  // Initial task data
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Complete project proposal', completed: false },
    { id: 2, text: 'Buy groceries', completed: true },
    { id: 3, text: 'Schedule dentist appointment', completed: false },
    { id: 4, text: 'Finish React tutorial', completed: false },
    { id: 5, text: 'Pay utility bills', completed: true }
  ]);

  // Filter state
  const [filter, setFilter] = useState('all');
  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Filter tasks based on filter and search term
  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => {
        if (filter === 'all') return true;
        if (filter === 'active') return !task.completed;
        if (filter === 'completed') return task.completed;
        return true;
      })
      .filter(task => 
        task.text.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [tasks, filter, searchTerm]);

  // Add a new task
  const addTask = (text) => {
    if (text.trim()) {
      const newTask = {
        id: Date.now(), // Use timestamp as a simple unique ID
        text: text,
        completed: false
      };
      setTasks([...tasks, newTask]);
    }
  };

  // Toggle task completion status
  const toggleTaskCompletion = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  // Delete a task
  const deleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  // Clear completed tasks
  const clearCompleted = () => {
    setTasks(tasks.filter(task => !task.completed));
  };

  // Handle filter change
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  // Handle search change
  const handleSearchChange = (term) => {
    setSearchTerm(term);
  };

  return (
    <div className="App">
      {/* <Header/> */}
      <Header 
        addTask={addTask} 
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        currentFilter={filter}
      />
      {/* app body */}
      <TaskLists 
        tasks={filteredTasks}
        onToggleCompletion={toggleTaskCompletion}
        onDeleteTask={deleteTask}
        onClearCompleted={clearCompleted}
        filter={filter}
      />
      {/* <Footer/> */}
    </div>
  );
}

export default App;
