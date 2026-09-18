import mongoose from 'mongoose';

const quoteRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  service: { type: String, required: true },
  message: { type: String, default: '' },
  source: { type: String, default: 'Quote Modal' },
  status: { type: String, enum: ['new', 'contacted', 'closed'], default: 'new' },
  createdAt: { type: Number, default: () => Date.now() },
}, { timestamps: false });

export default mongoose.model('QuoteRequest', quoteRequestSchema);
