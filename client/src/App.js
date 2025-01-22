import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import TodoList from './components/TodoList';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import { initializeApi, testApiConnection } from './config';

function App() {
  const [connectionStatus, setConnectionStatus] = useState('initializing');

  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeApi();
        const isConnected = await testApiConnection();
        setConnectionStatus(isConnected ? 'connected' : 'failed');
      } catch (error) {
        console.error('Initialization failed:', error);
        setConnectionStatus('failed');
      }
    };
    initialize();
  }, []);

  if (connectionStatus === 'initializing') {
    return <div>Initializing application...</div>;
  }

  if (connectionStatus === 'failed') {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h2>Server Connection Failed</h2>
        <p>Could not connect to the server. Please make sure the server is running.</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <TodoList />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App; 