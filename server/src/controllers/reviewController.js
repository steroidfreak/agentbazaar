import { validationResult } from 'express-validator';
import Review from '../models/Review.js';
import { recalculateAgentRating } from '../services/ratingService.js';

export async function upsertReview(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  try {
    const { agentId, rating, comment } = req.body;

    let review = await Review.findOne({ agentFile: agentId, user: req.user._id });

    if (review) {
      review.rating = rating;
      review.comment = comment;
      await review.save();
    } else {
      review = await Review.create({
        agentFile: agentId,
        user: req.user._id,
        rating,
        comment
      });
    }

    review = await review.populate('user', 'username avatarHue');

    const ratingStats = await recalculateAgentRating(agentId);

    res.json({ review, rating: ratingStats });
  } catch (error) {
    console.error('Review error:', error.message);
    res.status(500).json({ message: 'Failed to submit review' });
  }
}

export async function deleteReview(req, res) {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only remove your own feedback' });
    }

    await review.deleteOne();
    const ratingStats = await recalculateAgentRating(review.agentFile);

    res.json({ message: 'Review removed', rating: ratingStats });
  } catch (error) {
    console.error('Delete review error:', error.message);
    res.status(500).json({ message: 'Failed to remove review' });
  }
}