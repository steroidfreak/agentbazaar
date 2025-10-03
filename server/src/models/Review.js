import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    agentFile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AgentFile',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    comment: {
      type: String,
      maxlength: 500
    }
  },
  {
    timestamps: true
  }
);

reviewSchema.index({ agentFile: 1, user: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

export default Review;