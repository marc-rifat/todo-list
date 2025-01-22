const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'your-secret-key';

// Middleware
app.use(cors({
  origin: '*', // Allow all origins during development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Add OPTIONS handling for preflight requests
app.options('*', cors());

// In-memory database
const db = {
  users: [],
  todos: []
};

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Access denied' });

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

// Auth Routes
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  if (db.users.find(user => user.username === username)) {
    return res.status(400).json({ message: 'Username already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = {
    id: Date.now().toString(),
    username,
    password: hashedPassword
  };

  db.users.push(user);
  res.status(201).json({ message: 'User created successfully' });
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = db.users.find(user => user.username === username);

  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(400).json({ message: 'Invalid password' });
  }

  const token = jwt.sign({ id: user.id }, JWT_SECRET);
  res.json({ token });
});

// Todo Routes
app.get('/api/todos', authenticateToken, (req, res) => {
  const userTodos = db.todos.filter(todo => todo.userId === req.user.id);
  res.json(userTodos);
});

app.post('/api/todos', authenticateToken, (req, res) => {
  const { title } = req.body;
  const todo = {
    id: Date.now().toString(),
    userId: req.user.id,
    title,
    completed: false
  };

  db.todos.push(todo);
  res.status(201).json(todo);
});

app.put('/api/todos/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body;
  const todoIndex = db.todos.findIndex(todo => todo.id === id && todo.userId === req.user.id);

  if (todoIndex === -1) {
    return res.status(404).json({ message: 'Todo not found' });
  }

  db.todos[todoIndex] = {
    ...db.todos[todoIndex],
    title: title || db.todos[todoIndex].title,
    completed: completed !== undefined ? completed : db.todos[todoIndex].completed
  };

  res.json(db.todos[todoIndex]);
});

app.delete('/api/todos/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const todoIndex = db.todos.findIndex(todo => todo.id === id && todo.userId === req.user.id);

  if (todoIndex === -1) {
    return res.status(404).json({ message: 'Todo not found' });
  }

  db.todos.splice(todoIndex, 1);
  res.status(204).send();
});

// Add a more basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Add this function to find an available port
const findAvailablePort = async (startPort) => {
  let port = startPort;
  while (true) {
    try {
      await new Promise((resolve, reject) => {
        const server = app.listen(port, () => {
          server.close();
          resolve();
        });
        server.on('error', reject);
      });
      return port;
    } catch (err) {
      if (err.code === 'EADDRINUSE') {
        port++;
        continue;
      }
      throw err;
    }
  }
};

// Replace the existing app.listen with this
(async () => {
  try {
    const availablePort = await findAvailablePort(PORT);
    const server = app.listen(availablePort, () => {
      console.log('=================================');
      console.log(`Server running on port ${availablePort}`);
      console.log(`CORS enabled for origin: http://localhost:3000`);
      console.log('Server endpoints:');
      console.log('POST /api/register - Register new user');
      console.log('POST /api/login - Login user');
      console.log('GET /api/todos - Get todos (protected)');
      console.log('POST /api/todos - Create todo (protected)');
      console.log('PUT /api/todos/:id - Update todo (protected)');
      console.log('DELETE /api/todos/:id - Delete todo (protected)');
      console.log('=================================');
    });

    server.on('error', (error) => {
      console.error('Server error:', error);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    console.error('Error details:', {
      name: err.name,
      message: err.message,
      code: err.code,
      stack: err.stack
    });
    process.exit(1);
  }
})();

// Add global error handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
}); 