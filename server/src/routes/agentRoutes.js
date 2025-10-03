import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuid } from 'uuid';
import {
  uploadAgentFile,
  listAgentFiles,
  getAgentFile,
  incrementView,
  incrementCopy,
  deleteAgentFile,
  getUserDashboard
} from '../controllers/agentController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.resolve(__dirname, '..', '..', 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.md';
    cb(null, `${uuid()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/markdown' || file.originalname.toLowerCase().endsWith('.md')) {
      cb(null, true);
    } else {
      cb(new Error('Only Markdown files are allowed (.md)'));
    }
  }
});

router.get('/', optionalAuth, listAgentFiles);
router.get('/dashboard/me', authenticate, getUserDashboard);
router.post('/', authenticate, upload.single('file'), uploadAgentFile);
router.get('/:id', optionalAuth, getAgentFile);
router.post('/:id/views', optionalAuth, incrementView);
router.post('/:id/copies', optionalAuth, incrementCopy);
router.delete('/:id', authenticate, deleteAgentFile);

export default router;
