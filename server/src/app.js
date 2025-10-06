import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import agentRoutes from './routes/agentRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import featuredRoutes from './routes/featuredRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(helmet());
const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173'
]);

const envOrigins = (process.env.CORS_ALLOW_ORIGINS ?? '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

for (const origin of envOrigins) {
  allowedOrigins.add(origin);
}

const normalizedDomain = process.env.APP_DOMAIN
  ? process.env.APP_DOMAIN.replace(/^https?:\/\/, '').trim()
  : '';

if (normalizedDomain) {
  allowedOrigins.add(`https://${normalizedDomain}`);
  allowedOrigins.add(`http://${normalizedDomain}`);
  if (normalizedDomain.startsWith('www.')) {
    const apexDomain = normalizedDomain.replace(/^www\./, '');
    if (apexDomain) {
      allowedOrigins.add(`https://${apexDomain}`);
      allowedOrigins.add(`http://${apexDomain}`);
    }
  }
}

allowedOrigins.add('https://agentbazaar.net');
allowedOrigins.add('http://agentbazaar.net');

const extraAltOrigins = (process.env.APP_ALT_DOMAIN ?? '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

for (const origin of extraAltOrigins) {
  allowedOrigins.add(origin);
}

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed`));
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/agent-files', agentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/featured', featuredRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(notFound);
app.use(errorHandler);

export default app;


