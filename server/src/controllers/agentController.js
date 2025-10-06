import fs from 'fs/promises';

import path from 'path';

import AgentFile from '../models/AgentFile.js';

import Review from '../models/Review.js';

import { generateMetadataFromAgent } from '../services/metadataService.js';



function normalizeTags(tags) {

  if (!tags) return [];



  const values = Array.isArray(tags)

    ? tags

    : String(tags)

        .split(/[\,\r\n]/);



  const normalized = values

    .map((tag) => (tag == null ? '' : String(tag).trim().toLowerCase()))

    .filter(Boolean);



  return Array.from(new Set(normalized));

}



export async function uploadAgentFile(req, res) {

  try {

    if (!req.file) {

      return res.status(400).json({ message: 'No file uploaded' });

    }

    const filePath = req.file.path;

    const rawContent = await fs.readFile(filePath, 'utf-8');

    const { description: requestedDescription, tags: requestedTags } = req.body;



    let metadata;

    try {

      metadata = await generateMetadataFromAgent(rawContent);

    } catch (metadataError) {

      console.error('Metadata agent error:', metadataError.message);

      metadata = null;

    }



    const originalFilename = path.basename(req.file.originalname);

    const sanitizedOriginal = originalFilename.replace(/[\r\n\t]+/g, '').trim();

    const storedFilename = path.basename(req.file.filename);

    const filenameForDisplay = sanitizedOriginal || storedFilename;

    const originalNameForStorage = filenameForDisplay.slice(0, 255);

    const finalTitle = originalNameForStorage;



    let finalDescription = (metadata?.description ?? requestedDescription ?? '').trim();

    if (finalDescription.length > 400) {

      finalDescription = finalDescription.slice(0, 400).trim();

    }



    const finalTags = normalizeTags(metadata?.tags ?? requestedTags);



    const agentFile = await AgentFile.create({

      title: finalTitle,

      description: finalDescription || undefined,

      tags: finalTags,

      originalFilename: originalNameForStorage,

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





export async function adminListAgentFiles(req, res) {

  try {

    const { q, tag, owner, limit = 50, skip = 0 } = req.query;

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



    const perPage = Math.min(Number(limit) || 50, 100);

    const adminAgents = await AgentFile.find(query)

      .populate('owner', 'username email avatarHue')

      .sort({ createdAt: -1 })

      .skip(Number(skip) || 0)

      .limit(perPage);



    const total = await AgentFile.countDocuments(query);



    res.json({ total, agents: adminAgents });

  } catch (error) {

    console.error('Admin list error:', error.message);

    res.status(500).json({ message: 'Failed to load agent files for admin' });

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



export async function downloadAgentFile(req, res) {

  try {

    const { id } = req.params;

    const agentFile = await AgentFile.findById(id);



    if (!agentFile) {

      return res.status(404).json({ message: 'Agent file not found' });

    }



    const absolutePath = path.resolve(process.cwd(), agentFile.filePath);

    const downloadName = agentFile.originalFilename || path.basename(agentFile.filePath);



    return res.download(absolutePath, downloadName, (error) => {

      if (error) {

        console.error('Download error:', error.message);

        if (!res.headersSent) {

          res.status(500).json({ message: 'Failed to download agent file' });

        }

      }

    });

  } catch (error) {

    console.error('Download error:', error.message);

    res.status(500).json({ message: 'Failed to download agent file' });

  }

}







export async function updateAgentFile(req, res) {

  try {

    const { id } = req.params;

    const agentFile = await AgentFile.findById(id);



    if (!agentFile) {

      return res.status(404).json({ message: 'Agent file not found' });

    }



    const requesterId = req.user?._id?.toString?.() ?? req.user?.id;

    const ownerId = agentFile.owner?.toString?.();

    const isOwner = ownerId && requesterId && ownerId === requesterId;

    const isAdmin = req.user?.role === 'admin';



    if (!isOwner && !isAdmin) {

      return res.status(403).json({ message: 'You can only modify your own uploads' });

    }



    const updates = {};

    let previousFilePath = null;



    if (req.file) {

      const newAbsolutePath = req.file.path;

      const rawContent = await fs.readFile(newAbsolutePath, 'utf-8');

      const originalFilename = path.basename(req.file.originalname);

      const sanitizedOriginal = originalFilename.replace(/[\r\n\t]+/g, '').trim();

      const storedFilename = path.basename(req.file.filename);

      const filenameForDisplay = sanitizedOriginal || storedFilename;

      const normalizedFilename = filenameForDisplay.slice(0, 255);



      updates.content = rawContent;

      updates.filePath = path.relative(process.cwd(), newAbsolutePath).replace(/\\/g, '/');

      updates.originalFilename = normalizedFilename;

      updates.title = normalizedFilename;



      previousFilePath = path.resolve(process.cwd(), agentFile.filePath);

    }



    if (Object.prototype.hasOwnProperty.call(req.body, 'description')) {

      const requestedDescription = String(req.body.description ?? '').trim();

      updates.description = requestedDescription ? requestedDescription.slice(0, 400).trim() : undefined;

    }



    if (Object.prototype.hasOwnProperty.call(req.body, 'tags')) {

      updates.tags = normalizeTags(req.body.tags);

    }



    if (!agentFile.originalFilename && !updates.originalFilename) {

      updates.originalFilename = agentFile.title.slice(0, 255);

    }



    Object.assign(agentFile, updates);

    agentFile.originalFilename ??= agentFile.title.slice(0, 255);



    await agentFile.save();

    const populatedAgent = await agentFile.populate('owner', 'username avatarHue');



    if (previousFilePath && path.resolve(process.cwd(), populatedAgent.filePath) !== previousFilePath) {

      await fs.unlink(previousFilePath).catch(() => null);

    }



    res.json(populatedAgent);

  } catch (error) {

    console.error('Update agent error:', error.message);

    res.status(500).json({ message: 'Failed to update agent file' });

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



    const requesterId = req.user?._id?.toString?.() ?? req.user?.id;

    const ownerId = agentFile.owner?.toString?.();

    const isOwner = ownerId && requesterId && ownerId === requesterId;

    const isAdmin = req.user?.role === 'admin';



    if (!isOwner && !isAdmin) {

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















