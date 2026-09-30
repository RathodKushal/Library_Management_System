import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { initializeDatabase } from './src/config/database.js';
import { errorHandler, notFoundHandler } from './src/middleware/errorHandler.js';

import authRoutes from './src/routes/auth.js';
import bookRoutes from './src/routes/books.js';
import categoryRoutes from './src/routes/categories.js';
import memberRoutes from './src/routes/members.js';
import transactionRoutes from './src/routes/transactions.js';
import reportRoutes from './src/routes/reports.js';
import settingRoutes from './src/routes/settings.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'LJKU Library API is running.', timestamp: new Date().toISOString() });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize DB then start server
async function start() {
  await initializeDatabase();
  app.listen(PORT, () => {
    console.log(`\n📚 LJKU Library Server running on http://localhost:${PORT}`);
    console.log(`📋 API Health: http://localhost:${PORT}/api/health\n`);
  });
}

start().catch(err => { console.error('Failed to start server:', err); process.exit(1); });

export default app;
