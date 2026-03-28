import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import { authRouter } from './routes/auth';
import { adminRouter } from './routes/admin';
import { officerRouter } from './routes/officer';
import { managementRouter } from './routes/management';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/officer', officerRouter);
app.use('/api/management', managementRouter);

// Serve Frontend in Production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
  });
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
