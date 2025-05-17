import React, { useState, useMemo, useEffect } from 'react';
import './App.css';
import Header from './Header';
import TaskLists from './TaskLists';
import { db } from './Firebase';
import firebase from 'firebase';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load tasks from Firebase on component mount
  useEffect(() => {
    const unsubscribe = db.collection('tasks')
      .orderBy('timestamp', 'desc')
      .onSnapshot((snapshot) => {
        const tasksFromDB = snapshot.docs.map((doc) => ({
          id: doc.id,
          parentId: doc.data().parentId || null,
          subtasks: [],
          ...doc.data()
        }));
        
        // Organize into hierarchy
        const taskMap = {};
        const rootTasks = [];
        
        // First, create a map of all tasks by ID
        tasksFromDB.forEach(task => {
          taskMap[task.id] = {...task};
        });
        
        // Then, organize into a hierarchy
        tasksFromDB.forEach(task => {
          if (task.parentId && taskMap[task.parentId]) {
            // This is a subtask, add it to its parent
            if (!taskMap[task.parentId].subtasks) {
              taskMap[task.parentId].subtasks = [];
            }
            taskMap[task.parentId].subtasks.push(taskMap[task.id]);
          } else {
            // This is a root task
            rootTasks.push(taskMap[task.id]);
          }
        });
        
        setTasks(rootTasks);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching tasks: ", error);
        setLoading(false);
      });
      
    // Cleanup function to unsubscribe from the listener when component unmounts
    return () => unsubscribe();
  }, []);

  // Filter state
  const [filter, setFilter] = useState('all');
  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Recursive function to filter tasks and their subtasks
  const filterTasksRecursively = (tasksArray, filterFunc, searchFunc) => {
    return tasksArray
      .filter(filterFunc)
      .filter(searchFunc)
      .map(task => ({
        ...task,
        subtasks: task.subtasks ? 
          filterTasksRecursively(task.subtasks, filterFunc, searchFunc) : 
          []
      }));
  };

  // Filter tasks based on filter and search term
  const filteredTasks = useMemo(() => {
    const filterFunc = task => {
      if (filter === 'all') return true;
      if (filter === 'active') return !task.completed;
      if (filter === 'completed') return task.completed;
      return true;
    };

    const searchFunc = task => 
      task.text.toLowerCase().includes(searchTerm.toLowerCase());

    return filterTasksRecursively(tasks, filterFunc, searchFunc);
  }, [tasks, filter, searchTerm]);

  // Add a new task
  const addTask = async (text, dueDate = null, description = '', parentId = null) => {
    if (text.trim()) {
      try {
        await db.collection('tasks').add({
          text: text,
          description: description,
          completed: false,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          dueDate: dueDate,
          parentId: parentId
        });
      } catch (error) {
        console.error("Error adding task: ", error);
      }
    }
  };

  // Edit task text
  const editTaskText = async (taskId, newText) => {
    if (newText.trim()) {
      try {
        await db.collection('tasks').doc(taskId).update({
          text: newText
        });
      } catch (error) {
        console.error("Error updating task text: ", error);
      }
    }
  };

  // Edit task description
  const editTaskDescription = async (taskId, newDescription) => {
    try {
      await db.collection('tasks').doc(taskId).update({
        description: newDescription
      });
    } catch (error) {
      console.error("Error updating description: ", error);
    }
  };

  // Edit task due date
  const editTaskDueDate = async (taskId, newDueDate) => {
    try {
      await db.collection('tasks').doc(taskId).update({
        dueDate: newDueDate
      });
    } catch (error) {
      console.error("Error updating due date: ", error);
    }
  };

  // Toggle task completion status
  const toggleTaskCompletion = async (taskId) => {
    const taskRef = db.collection('tasks').doc(taskId);
    
    try {
      // Get the current task
      const taskDoc = await taskRef.get();
      if (taskDoc.exists) {
        const currentTask = taskDoc.data();
        // Update with the toggled completed status
        await taskRef.update({
          completed: !currentTask.completed
        });
      }
    } catch (error) {
      console.error("Error toggling task completion: ", error);
    }
  };

  // Delete a task
  const deleteTask = async (taskId) => {
    try {
      // First, recursively delete all subtasks
      const deleteSubtasks = async (parentId) => {
        const subtasksSnapshot = await db.collection('tasks')
          .where('parentId', '==', parentId)
          .get();
        
        const batch = db.batch();
        
        for (const doc of subtasksSnapshot.docs) {
          // Recursively delete this subtask's subtasks
          await deleteSubtasks(doc.id);
          
          // Delete this subtask
          batch.delete(doc.ref);
        }
        
        if (subtasksSnapshot.docs.length > 0) {
          await batch.commit();
        }
      };
      
      // Delete all subtasks first
      await deleteSubtasks(taskId);
      
      // Then delete the task itself
      await db.collection('tasks').doc(taskId).delete();
    } catch (error) {
      console.error("Error deleting task: ", error);
    }
  };

  // Clear completed tasks
  const clearCompleted = async () => {
    try {
      // Get all completed tasks
      const completedTasksSnapshot = await db.collection('tasks')
        .where('completed', '==', true)
        .get();
      
      // Create a batch to perform multiple deletes
      const batch = db.batch();
      completedTasksSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      // Commit the batch
      await batch.commit();
    } catch (error) {
      console.error("Error clearing completed tasks: ", error);
    }
  };

  // Make a task a subtask of another
  const makeSubtask = async (taskId, parentId) => {
    try {
      // Check if trying to make a task a subtask of itself
      if (taskId === parentId) {
        return;
      }
      
      // Check if trying to make a task a subtask of its own descendant
      const checkCycle = async (currentId, targetId) => {
        if (currentId === targetId) return true;
        
        const subtasks = await db.collection('tasks')
          .where('parentId', '==', currentId)
          .get();
        
        for (const doc of subtasks.docs) {
          if (await checkCycle(doc.id, targetId)) {
            return true;
          }
        }
        
        return false;
      };
      
      if (await checkCycle(taskId, parentId)) {
        console.error("Cannot create a cycle in the task hierarchy");
        return;
      }
      
      // Update the task with the new parent
      await db.collection('tasks').doc(taskId).update({
        parentId: parentId
      });
    } catch (error) {
      console.error("Error making subtask: ", error);
    }
  };

  // Remove a task from being a subtask
  const removeFromParent = async (taskId) => {
    try {
      await db.collection('tasks').doc(taskId).update({
        parentId: null
      });
    } catch (error) {
      console.error("Error removing from parent: ", error);
    }
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
      {loading ? (
        <div className="loading">Loading tasks...</div>
      ) : (
        <TaskLists 
          tasks={filteredTasks}
          onToggleCompletion={toggleTaskCompletion}
          onDeleteTask={deleteTask}
          onClearCompleted={clearCompleted}
          filter={filter}
          onEditDueDate={editTaskDueDate}
          onEditDescription={editTaskDescription}
          onEditText={editTaskText}
          onMakeSubtask={makeSubtask}
          onRemoveFromParent={removeFromParent}
        />
      )}
      {/* <Footer/> */}
    </div>
  );
}

export default App;
