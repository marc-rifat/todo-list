import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getApiBaseURL } from '../config';

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [editingTodo, setEditingTodo] = useState(null);
  const [editText, setEditText] = useState('');
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const api = axios.create({
    baseURL: getApiBaseURL(),
    headers: { Authorization: `Bearer ${token}` }
  });

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await api.get('/todos');
      setTodos(response.data);
    } catch (err) {
      console.error('Error fetching todos:', err);
    }
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/todos', { title: newTodo });
      setTodos([...todos, response.data]);
      setNewTodo('');
    } catch (err) {
      console.error('Error adding todo:', err);
    }
  };

  const handleToggleTodo = async (id, completed) => {
    try {
      const response = await api.put(`/todos/${id}`, { completed: !completed });
      setTodos(todos.map(todo => 
        todo.id === id ? response.data : todo
      ));
    } catch (err) {
      console.error('Error updating todo:', err);
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      await api.delete(`/todos/${id}`);
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (err) {
      console.error('Error deleting todo:', err);
    }
  };

  const startEditing = (todo) => {
    setEditingTodo(todo.id);
    setEditText(todo.title);
  };

  const handleUpdateTodo = async (id) => {
    if (!editText.trim()) return;
    try {
      const response = await api.put(`/todos/${id}`, { title: editText });
      setTodos(todos.map(todo => 
        todo.id === id ? response.data : todo
      ));
      setEditingTodo(null);
      setEditText('');
    } catch (err) {
      console.error('Error updating todo:', err);
    }
  };

  const handleKeyPress = (e, id) => {
    if (e.key === 'Enter') {
      handleUpdateTodo(id);
    } else if (e.key === 'Escape') {
      setEditingTodo(null);
      setEditText('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="todo-container">
      <div className="header">
        <h2>My Tasks</h2>
        <button onClick={handleLogout}>Sign Out</button>
      </div>
      
      <form onSubmit={handleAddTodo}>
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="What needs to be done?"
          required
        />
        <button type="submit">Add Task</button>
      </form>

      <ul className="todo-list">
        {todos.map(todo => (
          <li key={todo.id} className={todo.completed ? 'completed' : ''}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleToggleTodo(todo.id, todo.completed)}
            />
            {editingTodo === todo.id ? (
              <div className="edit-container">
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => handleKeyPress(e, todo.id)}
                  onBlur={() => handleUpdateTodo(todo.id)}
                  autoFocus
                />
              </div>
            ) : (
              <span onDoubleClick={() => startEditing(todo)}>{todo.title}</span>
            )}
            <div className="todo-actions">
              {editingTodo !== todo.id && (
                <button 
                  className="edit-btn"
                  onClick={() => startEditing(todo)}
                >
                  Edit
                </button>
              )}
              <button onClick={() => handleDeleteTodo(todo.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodoList; 