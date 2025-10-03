import AgentFile from '../models/AgentFile.js';

let cachedFeatured = null;

function getConfiguredVideoIds() {
  const csv = process.env.YOUTUBE_VIDEO_IDS || '';
  return csv
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
}

export async function getFeaturedContent() {
  const refreshHours = Number(process.env.FEATURED_REFRESH_HOURS || 168);
  const now = new Date();

  if (cachedFeatured) {
    const ageHours = (now - cachedFeatured.generatedAt) / (1000 * 60 * 60);
    if (ageHours < refreshHours) {
      return cachedFeatured;
    }
  }

  const agent = await AgentFile.aggregate([{ $sample: { size: 1 } }]);
  const selectedAgent = agent[0] ? await AgentFile.findById(agent[0]._id).populate('owner', 'username avatarHue') : null;

  const videoIds = getConfiguredVideoIds();
  const videoId = videoIds.length ? videoIds[Math.floor(Math.random() * videoIds.length)] : null;

  cachedFeatured = {
    agent: selectedAgent,
    video: videoId
      ? {
          videoId,
          embedUrl: `https://www.youtube.com/embed/${videoId}`
        }
      : null,
    generatedAt: now
  };

  return cachedFeatured;
}