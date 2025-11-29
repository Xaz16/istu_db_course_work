import express from 'express';
import cors from 'cors';
import tableRoutes from './routes/tableRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import formsRoutes from './routes/formsRoutes.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/tables', tableRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/forms', formsRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
