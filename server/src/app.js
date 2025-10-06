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

const parseList = (value = '') =>
  value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

for (const origin of parseList(process.env.CORS_ALLOW_ORIGINS)) {
  allowedOrigins.add(origin);
}

const domainCandidates = new Set([
  process.env.APP_DOMAIN,
  ...parseList(process.env.APP_DOMAINS),
  ...parseList(process.env.APP_ALT_DOMAIN),
  'agentbazaar.net',
  'www.agentbazaar.net'
]);

const normalizeDomain = (value) =>
  value
    ?.replace(/^https?:\/\//, '')
    .replace(/\/+$/, '')
    .trim();

const addDomainVariants = (domain) => {
  const normalized = normalizeDomain(domain);
  if (!normalized) {
    return;
  }

  const variants = new Set([normalized]);

  if (normalized.startsWith('www.')) {
    const apex = normalized.replace(/^www\./, '');
    if (apex) {
      variants.add(apex);
    }
  } else {
    variants.add(`www.${normalized}`);
  }

  for (const variant of variants) {
    allowedOrigins.add(`https://${variant}`);
    allowedOrigins.add(`http://${variant}`);
  }
};

for (const candidate of domainCandidates) {
  addDomainVariants(candidate);
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

