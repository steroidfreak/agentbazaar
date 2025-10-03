import mongoose from 'mongoose';

const agentFileSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    description: {
      type: String,
      maxlength: 400
    },
    tags: {
      type: [String],
      default: []
    },
    filePath: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    views: {
      type: Number,
      default: 0
    },
    copyCount: {
      type: Number,
      default: 0
    },
    ratingAverage: {
      type: Number,
      default: 0
    },
    ratingCount: {
      type: Number,
      default: 0
    },
    featuredAt: Date
  },
  {
    timestamps: true
  }
);

agentFileSchema.index({ title: 'text', description: 'text', content: 'text', tags: 'text' });
agentFileSchema.index({ tags: 1 });

const AgentFile = mongoose.model('AgentFile', agentFileSchema);

export default AgentFile;
