import Review from '../models/Review.js';
import AgentFile from '../models/AgentFile.js';

export async function recalculateAgentRating(agentFileId) {
  const stats = await Review.aggregate([
    { $match: { agentFile: agentFileId } },
    {
      $group: {
        _id: '$agentFile',
        count: { $sum: 1 },
        average: { $avg: '$rating' }
      }
    }
  ]);

  const summary = stats[0];
  const ratingCount = summary?.count ?? 0;
  const ratingAverage = summary ? Number(summary.average.toFixed(2)) : 0;

  await AgentFile.findByIdAndUpdate(agentFileId, {
    ratingAverage,
    ratingCount
  });

  return { ratingAverage, ratingCount };
}