import mongoose from 'mongoose';

const SuspectSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  role: { type: String, required: true, trim: true },
  background: { type: String, required: true },
  motive: { type: String, required: true },
  alibi: { type: String, required: true },
}, { _id: false });

const ClueSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  hintText: { type: String },
}, { _id: false });

const HintSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
}, { _id: false });

const EvidenceMappingSchema = new mongoose.Schema({
  clueId: { type: String, required: true },
  supports: { type: String, required: true },
}, { _id: false });

const InterrogationSchema = new mongoose.Schema({
  interactionId: { type: String, required: true },
  suspectId: { type: String, required: true },
  category: { type: String, default: 'general' },
  question: { type: String, required: true, trim: true },
  answer: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const CaseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  premise: { type: String, required: true, trim: true, maxlength: 500 },
  story: { type: String, required: true },
  difficulty: {
    type: String,
    required: true,
    enum: ['easy', 'medium', 'hard'],
  },
  suspects: { type: [SuspectSchema], required: true },
  clues: { type: [ClueSchema], required: true },
  hints: { type: [HintSchema], required: true },

  // Protected Server-Only Fields (Never leak in active case DTO)
  culpritId: { type: String, required: true },
  solution: { type: String, required: true },
  evidenceMapping: { type: [EvidenceMappingSchema], default: [] },

  // Player Progress & State Tracking
  discoveredClueIds: { type: [String], default: [] },
  hintsUsed: { type: Number, default: 0 },
  interrogations: { type: [InterrogationSchema], default: [] },
  accusationSuspectId: { type: String, default: null },
  isCorrect: { type: Boolean, default: null },
  score: { type: Number, default: 0 },
  status: {
    type: String,
    required: true,
    enum: ['active', 'completed'],
    default: 'active',
  },
  scoreBreakdown: { type: mongoose.Schema.Types.Mixed, default: null },
}, {
  timestamps: true,
});

// Compound indexes for query optimization
CaseSchema.index({ status: 1, createdAt: -1 });

export const Case = mongoose.models.Case || mongoose.model('Case', CaseSchema);
