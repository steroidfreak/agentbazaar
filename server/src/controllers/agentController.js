import fs from 'fs/promises';
import path from 'path';
import AgentFile from '../models/AgentFile.js';
import Review from '../models/Review.js';

function normalizeTags(tags) {
  if (!tags) return [];
  if (Array.isArray(tags)) {
    return tags.filter(Boolean).map((tag) => tag.trim().toLowerCase());
  }
  return tags
    .split(',')
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
}

export async function uploadAgentFile(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { title, description, tags } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const filePath = req.file.path;
    const rawContent = await fs.readFile(filePath, 'utf-8');

    const agentFile = await AgentFile.create({
      title,
      description,
      tags: normalizeTags(tags),
      filePath: path.relative(process.cwd(), filePath).replace(/\\/g, '/'),
      content: rawContent,
      owner: req.user._id
    });

    res.status(201).json(agentFile);
  } catch (error) {
    console.error('Upload error:', error.message);
    res.status(500).json({ message: 'Failed to upload agent file' });
  }
}

export async function listAgentFiles(req, res) {
  try {
    const { q, tag, owner, sort = 'recent', limit = 20, skip = 0 } = req.query;
    const query = {};

    if (q) {
      query.$text = { $search: q };
    }

    if (tag) {
      query.tags = tag.toLowerCase();
    }

    if (owner) {
      query.owner = owner;
    }

    const sortOptions = {
      recent: { createdAt: -1 },
      popular: { views: -1 },
      top: { ratingAverage: -1 }
    };

    const agents = await AgentFile.find(query)
      .populate('owner', 'username avatarHue')
      .sort(sortOptions[sort] ?? sortOptions.recent)
      .skip(Number(skip))
      .limit(Math.min(Number(limit), 50));

    const total = await AgentFile.countDocuments(query);

    res.json({ total, agents });
  } catch (error) {
    console.error('List error:', error.message);
    res.status(500).json({ message: 'Failed to load agent files' });
  }
}

export async function getAgentFile(req, res) {
  try {
    const { id } = req.params;
    const agentFile = await AgentFile.findById(id).populate('owner', 'username avatarHue');

    if (!agentFile) {
      return res.status(404).json({ message: 'Agent file not found' });
    }

    const reviews = await Review.find({ agentFile: id })
      .populate('user', 'username avatarHue')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ agentFile, reviews });
  } catch (error) {
    console.error('Get agent file error:', error.message);
    res.status(500).json({ message: 'Failed to fetch agent file' });
  }
}

export async function incrementView(req, res) {
  try {
    const { id } = req.params;
    const agentFile = await AgentFile.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!agentFile) {
      return res.status(404).json({ message: 'Agent file not found' });
    }

    res.json({ views: agentFile.views });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update view count' });
  }
}

export async function incrementCopy(req, res) {
  try {
    const { id } = req.params;
    const agentFile = await AgentFile.findByIdAndUpdate(
      id,
      { $inc: { copyCount: 1 } },
      { new: true }
    );

    if (!agentFile) {
      return res.status(404).json({ message: 'Agent file not found' });
    }

    res.json({ copyCount: agentFile.copyCount });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update copy count' });
  }
}

export async function deleteAgentFile(req, res) {
  try {
    const { id } = req.params;
    const agentFile = await AgentFile.findById(id);

    if (!agentFile) {
      return res.status(404).json({ message: 'Agent file not found' });
    }

    if (agentFile.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own uploads' });
    }

    const absolutePath = path.resolve(process.cwd(), agentFile.filePath);
    await fs.unlink(absolutePath).catch(() => null);
    await agentFile.deleteOne();

    res.json({ message: 'Agent file removed' });
  } catch (error) {
    console.error('Delete agent error:', error.message);
    res.status(500).json({ message: 'Failed to delete agent file' });
  }
}

export async function getUserDashboard(req, res) {
  try {
    const ownerId = req.user._id;
    const files = await AgentFile.find({ owner: ownerId }).sort({ createdAt: -1 });

    const summary = files.reduce(
      (acc, file) => {
        acc.totalFiles += 1;
        acc.totalViews += file.views;
        acc.totalCopies += file.copyCount;
        acc.averageRating += file.ratingAverage;
        return acc;
      },
      { totalFiles: 0, totalViews: 0, totalCopies: 0, averageRating: 0 }
    );

    if (summary.totalFiles > 0) {
      summary.averageRating = Number((summary.averageRating / summary.totalFiles).toFixed(2));
    }

    res.json({ summary, files });
  } catch (error) {
    console.error('Dashboard error:', error.message);
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
}