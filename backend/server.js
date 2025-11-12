const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const authRoutes = require('./src/routes/auth');
const projectRoutes = require('./src/routes/projects');
const datasetRoutes = require('./src/routes/datasets');
const aiRoutes = require('./src/routes/ai');
// Removi analyticsRoutes pois não temos esse arquivo ainda

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    // Permite requests de qualquer origem em desenvolvimento
    if (!origin || process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // Em produção, permite apenas origens específicas
    const allowedOrigins = [
      "https://marketing-simulator-frontend.netlify.app",
      "https://marketing-simulator-backend.onrender.com",
      /\.netlify\.app$/,
      /\.render\.com$/
    ];
    
    if (allowedOrigins.some(pattern => {
      if (typeof pattern === 'string') return origin === pattern;
      return pattern.test(origin);
    })) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/datasets', datasetRoutes);
app.use('/api/ai', aiRoutes);
// app.use('/api/analytics', analyticsRoutes); // Comentado até criar o arquivo

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API info
app.get('/api', (req, res) => {
  res.json({
    name: 'Marketing Simulator API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      projects: '/api/projects',
      datasets: '/api/datasets', 
      ai: '/api/ai',
      health: '/api/health'
    },
    ai_capabilities: [
      'Project analysis',
      'Campaign predictions',
      'Marketing insights',
      'Chat with AI agent',
      'Optimization recommendations'
    ]
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `Route ${req.originalUrl} does not exist`,
    available_endpoints: [
      'GET /api',
      'GET /api/health',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/projects',
      'POST /api/projects',
      'GET /api/ai/analyze/project/:id',
      'POST /api/ai/chat/:id'
    ]
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('🚀 Marketing Simulator Server started successfully!');
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
  console.log('✅ Available endpoints:');
  console.log('   - GET  /api/health');
  console.log('   - GET  /api');
  console.log('   - POST /api/auth/register');
  console.log('   - POST /api/auth/login');
  console.log('   - GET  /api/ai/analyze/project/:id');
  console.log('   - POST /api/ai/chat/:id');
  console.log('📊 AI Features: Analysis, Predictions, Insights, Chat Agent');
});